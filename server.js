
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

// Allowed domains for API access
const allowedDomains = [
  'http://localhost:5173', 
  'http://localhost:3000', 
  'http://localhost:8080', 
  'http://46.244.96.25:8080',
  'https://vids.extracted.lol',
  /^https:\/\/.*\.lovable\.app$/,
  /^https:\/\/.*\.lovableproject\.com$/
];

// Enhanced CORS configuration - apply globally first
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedDomains.some(domain => {
      if (typeof domain === 'string') {
        return origin === domain;
      }
      return domain.test(origin);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range', 'X-User-Type'],
  exposedHeaders: ['Content-Range', 'Content-Length', 'Accept-Ranges']
}));

// Handle preflight requests
app.options('*', cors());

// Domain restriction middleware - simplified since CORS handles it
app.use('/api', (req, res, next) => {
  next();
});

// Rate limiting with exemption for your domain
const createRateLimiter = (windowMs, max) => rateLimit({
  windowMs,
  max,
  skip: (req) => {
    const origin = req.get('Origin') || req.get('Referer');
    return origin && origin.includes('vids.extracted.lol');
  }
});

app.use('/api', createRateLimiter(15 * 60 * 1000, 1000)); // Higher limit, bypass for your domain

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced static file serving with proper video streaming headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Range');
  res.header('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
  
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

// Video upload endpoint
app.post('/api/videos/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file uploaded' });
    }

    const { title, subtitle, game, duration, userId } = req.body;
    const filename = req.file.filename;
    const filePath = `/uploads/videos/${filename}`;
    
    const videoHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const connection = await mysql.createConnection(dbConfig);
    
    const [result] = await connection.execute(
      'INSERT INTO videos (title, subtitle, game, duration, file_path, user_id, upload_date, video_hash, is_private) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?)',
      [title, subtitle || '', game, duration, filePath, userId || 1, videoHash, true]
    );

    await connection.end();

    console.log('Video uploaded successfully:', {
      id: result.insertId,
      title,
      filename,
      filePath,
      hash: videoHash
    });

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
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed: ' + error.message
    });
  }
});

// Get video by hash endpoint - updated for Jay's access to private videos
app.get('/api/videos/hash/:hash', async (req, res) => {
  try {
    const videoHash = req.params.hash;
    const isJay = req.get('X-User-Type') === 'jay' || req.get('Origin')?.includes('vids.extracted.lol');
    
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

    // Check if video is private and user is not Jay
    if (video.is_private && !isJay) {
      return res.status(403).json({
        success: false,
        message: 'This video is private'
      });
    }

    res.json({
      success: true,
      video: video
    });

  } catch (error) {
    console.error('Database error:', error);
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

    console.log('Video privacy updated:', { videoId, isPrivate });

    res.json({
      success: true,
      message: 'Video privacy updated successfully'
    });

  } catch (error) {
    console.error('Privacy update error:', error);
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
    
    const [result] = await connection.execute(
      'DELETE FROM videos WHERE id = ?',
      [videoId]
    );

    await connection.end();

    if (video.file_path) {
      const fullPath = path.join(__dirname, video.file_path);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log('Deleted file:', fullPath);
      }
    }

    console.log('Video deleted successfully:', videoId);

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Delete failed: ' + error.message
    });
  }
});

// Get user videos - updated for Jay's access
app.get('/api/videos/user/:userId', async (req, res) => {
  try {
    const isJay = req.get('X-User-Type') === 'jay' || req.get('Origin')?.includes('vids.extracted.lol');
    const connection = await mysql.createConnection(dbConfig);
    
    let query = 'SELECT * FROM videos WHERE user_id = ?';
    const params = [req.params.userId];
    
    // If not Jay, only show public videos
    if (!isJay) {
      query += ' AND is_private = FALSE';
    }
    
    query += ' ORDER BY upload_date DESC';
    
    const [rows] = await connection.execute(query, params);

    await connection.end();

    res.json({
      success: true,
      videos: rows
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch videos: ' + error.message
    });
  }
});

// Get recent public videos for homepage
app.get('/api/videos/recent', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(
      'SELECT * FROM videos WHERE is_private = FALSE ORDER BY upload_date DESC LIMIT 4'
    );

    await connection.end();

    res.json({
      success: true,
      videos: rows
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent videos: ' + error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
