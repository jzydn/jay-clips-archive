
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { Clock, Eye, Calendar, Share2, Copy, Twitter, MessageCircle, ExternalLink } from "lucide-react";

interface Video {
  id: string | number;
  title: string;
  file_path: string;
  game: string;
  upload_date: string;
  views: number;
  duration: string;
  video_hash?: string;
  subtitle?: string;
}

const API_BASE_URL = "https://data.extracted.lol/api";

const VideoPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const videoId = id;
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);

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
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleShare = (platform: string) => {
    const videoPath = video?.video_hash ? `/video/${video.video_hash}` : `/video/${video?.id}`;
    const url = `${window.location.origin}${videoPath}`;
    const embedUrl = `${window.location.origin}/embed/${video?.video_hash || video?.id}`;
    const text = `Check out this clip: ${video?.title}`;
    
    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        break;
      case 'embed':
        navigator.clipboard.writeText(`<iframe src="${embedUrl}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`);
        alert('Embed code copied to clipboard!');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'discord':
        navigator.clipboard.writeText(`${text} ${url}`);
        alert('Message copied for Discord!');
        break;
    }
    setShowShareMenu(false);
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
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Video Player */}
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-6">
          <ReactPlayer
            url={`https://data.extracted.lol${video.file_path}`}
            controls
            width="100%"
            height="100%"
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
        </div>

        {/* Video Info Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">{video.title}</h1>
          {video.subtitle && (
            <p className="text-lg text-gray-400 mb-4">{video.subtitle}</p>
          )}
          
          {/* Action Bar */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-6">
              <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-medium">
                {video.game}
              </span>
              <span className="text-gray-400 text-sm">
                by netsink
              </span>
            </div>
            
            {/* Share Button */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              
              {showShareMenu && (
                <div className="absolute right-0 top-12 bg-slate-800 border border-slate-700 rounded-lg py-2 z-10 min-w-[180px] shadow-xl">
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </button>
                  <button
                    onClick={() => handleShare('embed')}
                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Copy Embed Code</span>
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center space-x-2"
                  >
                    <Twitter className="w-4 h-4" />
                    <span>Share on X</span>
                  </button>
                  <button
                    onClick={() => handleShare('discord')}
                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Copy for Discord</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Information Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Views Tile */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{formatViews(video.views)}</p>
                <p className="text-gray-400 text-sm">Views</p>
              </div>
            </div>
          </div>

          {/* Upload Date Tile */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{formatDate(video.upload_date)}</p>
                <p className="text-gray-400 text-sm">Upload Date</p>
              </div>
            </div>
          </div>

          {/* Duration Tile */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{video.duration}</p>
                <p className="text-gray-400 text-sm">Duration</p>
              </div>
            </div>
          </div>
        </div>

        {/* Video Details Section */}
        <div className="mt-8 bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">Video Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Game:</span>
              <span className="text-white ml-2">{video.game}</span>
            </div>
            <div>
              <span className="text-gray-400">Creator:</span>
              <span className="text-white ml-2">netsink</span>
            </div>
            <div>
              <span className="text-gray-400">Video ID:</span>
              <span className="text-white ml-2">{video.video_hash || video.id}</span>
            </div>
            <div>
              <span className="text-gray-400">Format:</span>
              <span className="text-white ml-2">MP4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
