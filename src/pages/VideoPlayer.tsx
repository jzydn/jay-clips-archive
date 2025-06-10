import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { Clock } from "lucide-react";

interface Video {
  id: string | number;
  title: string;
  file_path: string;
  game: string;
  upload_date: string;
  views: number;
  duration: string;
  video_hash?: string;
}

const API_BASE_URL = "https://data.extracted.lol/api";

const VideoPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const videoId = id;
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Enhanced meta tag setup for Discord embedding
  useEffect(() => {
    if (video) {
      const videoUrl = `https://data.extracted.lol${video.file_path}`;
      const pageUrl = window.location.href;
      const embedUrl = `${window.location.origin}/embed/${videoId}`;
      
      // Set page title
      document.title = `${video.title} - netsink's clips`;
      
      // Update meta tags for better Discord embedding
      const metaTags = [
        { property: 'og:title', content: video.title },
        { property: 'og:description', content: `${video.game} clip by netsink` },
        { property: 'og:type', content: 'video.other' },
        { property: 'og:url', content: pageUrl },
        { property: 'og:video', content: videoUrl },
        { property: 'og:video:secure_url', content: videoUrl },
        { property: 'og:video:type', content: 'video/mp4' },
        { property: 'og:video:width', content: '1280' },
        { property: 'og:video:height', content: '720' },
        { property: 'og:image', content: videoUrl },
        { name: 'twitter:card', content: 'player' },
        { name: 'twitter:title', content: video.title },
        { name: 'twitter:description', content: `${video.game} clip by netsink` },
        { name: 'twitter:image', content: videoUrl },
        { name: 'twitter:player', content: embedUrl },
        { name: 'twitter:player:width', content: '1280' },
        { name: 'twitter:player:height', content: '720' },
      ];

      // Remove existing meta tags and add new ones
      metaTags.forEach(tag => {
        const existing = document.querySelector(`meta[${tag.property ? 'property' : 'name'}="${tag.property || tag.name}"]`);
        if (existing) {
          existing.remove();
        }
        
        const meta = document.createElement('meta');
        if (tag.property) {
          meta.setAttribute('property', tag.property);
        } else {
          meta.setAttribute('name', tag.name);
        }
        meta.setAttribute('content', tag.content);
        document.head.appendChild(meta);
      });
    }

    return () => {
      // Cleanup meta tags when component unmounts
      const metaSelectors = [
        'meta[property^="og:"]',
        'meta[name^="twitter:"]'
      ];
      
      metaSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => el.remove());
      });
    };
  }, [video, videoId]);

  // Enhanced fetch with Jay authentication
  useEffect(() => {
    const fetchVideo = async () => {
      if (!videoId) return;

      try {
        setIsLoading(true);
        const isJayAuthenticated = localStorage.getItem('loggedInUser') === 'Jay';
        const headers: Record<string, string> = {};
        
        if (isJayAuthenticated) {
          headers['X-User-Type'] = 'jay';
        }

        const response = await fetch(`${API_BASE_URL}/videos/hash/${videoId}`, {
          headers
        });
        
        if (!response.ok) {
          if (response.status === 403) {
            setError('This video is private and you do not have permission to view it.');
          } else if (response.status === 404) {
            setError('Video not found. It may have been deleted or the link is incorrect.');
          } else {
            setError('Failed to load video. Please try again later.');
          }
          return;
        }

        const data = await response.json();
        setVideo(data.video);
        setError(null);
      } catch (error) {
        console.error('Error fetching video:', error);
        setError('Network error. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full flex items-center justify-center animate-pulse">
            <Clock className="w-12 h-12 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-300">Loading video...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-red-400">{error}</h3>
          <p className="text-gray-500">Please check the URL or try again later.</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-gray-300">Video not found</h3>
          <p className="text-gray-500">Please check the URL or try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 font-inter">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-white mb-4">{video.title}</h1>
        
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
          <ReactPlayer
            url={`https://data.extracted.lol${video.file_path}`}
            controls
            width="100%"
            height="100%"
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-gray-400">
            <span className="mr-2">{video.game}</span>
            <span>Uploaded {formatDate(video.upload_date)}</span>
          </div>
          <div className="text-gray-400">
            <span>{formatViews(video.views)} views</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
