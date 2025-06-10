
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8086;

// Trust proxy for rate limiting (required when behind a proxy)
app.set('trust proxy', 1);

// Create MySQL connection
const dbConfig = {
  host: 'localhost',
  user: 'jayapp',
  password: 'jayapp123',
  database: 'jay_clips',
  port: 3306
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads/videos');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|mov|avi|mkv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'));
    }
  }
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enhanced CORS configuration with proper headers
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'http://localhost:8080',
    'http://localhost:8081', 
    'http://46.244.96.25:8081',
    'https://vids.extracted.lol',
    /^https:\/\/.*\.lovable\.app$/,
    /^https:\/\/.*\.lovableproject\.com$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range', 'X-User-Type'],
  exposedHeaders: ['Content-Range', 'Content-Length', 'Accept-Ranges']
}));

// Fixed rate limiting configuration
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 1000, // requests per window
  skip: (request, response) => {
    // Skip rate limiting for your own domain and localhost
    const origin = request.get('origin') || request.get('referer') || '';
    return origin.includes('vids.extracted.lol') || 
           origin.includes('localhost') || 
           origin.includes('127.0.0.1') ||
           origin.includes('46.244.96.25');
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '5 minutes'
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced static file serving with proper video streaming headers
app.use('/uploads', (req, res, next) => {
  // Set CORS headers for video files
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Range');
  res.header('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
}, express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.mp4') || path.endsWith('.mov') || path.endsWith('.avi') || path.endsWith('.webm')) {
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Type', 'video/mp4');
    }
  }
}));

// NEW ENDPOINT: Get recent videos (public videos only)
app.get('/api/videos/recent', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(
      'SELECT * FROM videos WHERE is_private = FALSE ORDER BY upload_date DESC LIMIT 20'
    );

    await connection.end();

    res.json({
      success: true,
      videos: rows
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent videos: ' + error.message
    });
  }
});

// Video upload endpoint
app.post('/api/videos/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file uploaded' });
    }

    const { title, subtitle, game, duration, userId } = req.body;
    const filename = req.file.filename;
    const filePath = `/uploads/videos/${filename}`;
    
    // Generate random hash for the video URL
    const videoHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Insert into database with hash and default private status
    const connection = await mysql.createConnection(dbConfig);
    
    const [result] = await connection.execute(
      'INSERT INTO videos (title, subtitle, game, duration, file_path, user_id, upload_date, video_hash, is_private) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?)',
      [title, subtitle || '', game, duration, filePath, userId || 1, videoHash, true] // Default to private
    );

    await connection.end();

    res.json({
      success: true,
      message: 'Video uploaded successfully',
      video: {
        id: result.insertId,
        title,
        subtitle,
        game,
        duration,
        file_path: filePath,
        upload_date: new Date().toISOString(),
        video_hash: videoHash,
        is_private: true
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Upload failed: ' + error.message
    });
  }
});

// Get video by hash endpoint
app.get('/api/videos/hash/:hash', async (req, res) => {
  try {
    const videoHash = req.params.hash;
    const connection = await mysql.createConnection(dbConfig);
    
    const [videos] = await connection.execute(
      'SELECT * FROM videos WHERE video_hash = ?',
      [videoHash]
    );

    await connection.end();

    if (videos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const video = videos[0];

    res.json({
      success: true,
      video: video
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch video: ' + error.message
    });
  }
});

// Toggle video privacy endpoint
app.patch('/api/videos/:videoId/privacy', async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const { isPrivate } = req.body;
    const connection = await mysql.createConnection(dbConfig);
    
    const [result] = await connection.execute(
      'UPDATE videos SET is_private = ? WHERE id = ?',
      [isPrivate, videoId]
    );

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.json({
      success: true,
      message: 'Video privacy updated successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update privacy: ' + error.message
    });
  }
});

// Delete video endpoint
app.delete('/api/videos/:videoId', async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const connection = await mysql.createConnection(dbConfig);
    
    // First get the video file path
    const [videos] = await connection.execute(
      'SELECT file_path FROM videos WHERE id = ?',
      [videoId]
    );

    if (videos.length === 0) {
      await connection.end();
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const video = videos[0];
    
    // Delete from database
    const [result] = await connection.execute(
      'DELETE FROM videos WHERE id = ?',
      [videoId]
    );

    await connection.end();

    // Delete physical file
    if (video.file_path) {
      const fullPath = path.join(__dirname, video.file_path);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Delete failed: ' + error.message
    });
  }
});

// Get user videos
app.get('/api/videos/user/:userId', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(
      'SELECT * FROM videos WHERE user_id = ? ORDER BY upload_date DESC',
      [req.params.userId]
    );

    await connection.end();

    res.json({
      success: true,
      videos: rows
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch videos: ' + error.message
    });
  }
});

// FIXED ENDPOINT: Increment video views
app.post('/api/videos/:videoId/view', async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const connection = await mysql.createConnection(dbConfig);
    
    // Check if videoId is a hash (contains letters) or numeric ID
    const isHash = /[a-zA-Z]/.test(videoId);
    
    let result;
    if (isHash) {
      // If it's a hash, update by video_hash only
      [result] = await connection.execute(
        'UPDATE videos SET views = COALESCE(views, 0) + 1 WHERE video_hash = ?',
        [videoId]
      );
    } else {
      // If it's numeric, update by id only
      [result] = await connection.execute(
        'UPDATE videos SET views = COALESCE(views, 0) + 1 WHERE id = ?',
        [videoId]
      );
    }

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.json({
      success: true,
      message: 'View count incremented'
    });

  } catch (error) {
    console.error('View increment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to increment view count: ' + error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  // Server start message removed for cleaner logs
});
