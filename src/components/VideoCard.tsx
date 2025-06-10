
import { useState, useRef, useEffect } from "react";
import { Play, Eye, Calendar, Share2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PrivacyToggle } from "./PrivacyToggle";

interface Video {
  id: string | number;
  title: string;
  thumbnail_path?: string;
  duration: string;
  upload_date: string;
  views: number;
  game: string;
  file_path?: string;
  share_token?: string;
  video_hash?: string;
  is_private?: boolean;
}

interface VideoCardProps {
  video: Video;
  isAuthenticated?: boolean;
  username?: string;
  onVideoUpdate?: (videoId: string | number, updates: Partial<Video>) => void;
}

export const VideoCard = ({ video, isAuthenticated = false, username, onVideoUpdate }: VideoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState("/placeholder.svg");
  const [currentVideo, setCurrentVideo] = useState(video);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  // Update local state when video prop changes
  useEffect(() => {
    setCurrentVideo(video);
  }, [video]);

  // Generate thumbnail from video
  useEffect(() => {
    if (currentVideo.file_path) {
      const videoUrl = `https://data.extracted.lol${currentVideo.file_path}`;
      
      // Create a temporary video element to capture thumbnail
      const tempVideo = document.createElement('video');
      tempVideo.src = videoUrl;
      tempVideo.crossOrigin = 'anonymous';
      tempVideo.currentTime = 1; // Capture frame at 1 second

      tempVideo.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          canvas.width = tempVideo.videoWidth;
          canvas.height = tempVideo.videoHeight;
          
          ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
          
          // Convert canvas to blob and create URL
          canvas.toBlob((blob) => {
            if (blob) {
              const thumbnailUrl = URL.createObjectURL(blob);
              setThumbnailSrc(thumbnailUrl);
            }
          }, 'image/jpeg', 0.8);
        }
      };

      tempVideo.onerror = () => {
        // Fallback to placeholder if video can't be loaded
        setThumbnailSrc("/placeholder.svg");
      };

      // Clean up function
      return () => {
        if (thumbnailSrc.startsWith('blob:')) {
          URL.revokeObjectURL(thumbnailSrc);
        }
      };
    }
  }, [currentVideo.file_path]);

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

  const handleVideoClick = () => {
    // Use hash-based URL if available, otherwise fall back to ID
    const videoPath = currentVideo.video_hash ? `/video/${currentVideo.video_hash}` : `/video/${currentVideo.id}`;
    navigate(videoPath);
  };

  const handleShare = (platform: string) => {
    const videoPath = currentVideo.video_hash ? `/video/${currentVideo.video_hash}` : `/video/${currentVideo.id}`;
    const url = `${window.location.origin}${videoPath}`;
    const embedUrl = `${window.location.origin}/embed/${currentVideo.video_hash || currentVideo.id}`;
    const text = `Check out this clip: ${currentVideo.title}`;
    
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

  const handlePrivacyChange = (isPrivate: boolean) => {
    const updatedVideo = { ...currentVideo, is_private: isPrivate };
    setCurrentVideo(updatedVideo);
    
    // Notify parent component of the update
    if (onVideoUpdate) {
      onVideoUpdate(currentVideo.id, { is_private: isPrivate });
    }
  };

  return (
    <div 
      className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-orange-500/50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/10 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="relative aspect-video bg-slate-800 cursor-pointer overflow-hidden"
        onClick={handleVideoClick}
      >
        <img 
          src={thumbnailSrc} 
          alt={currentVideo.title}
          className="w-full h-full object-cover"
          onError={() => setThumbnailSrc("/placeholder.svg")}
        />
        
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300" />
        
        {/* Privacy indicator */}
        {currentVideo.is_private && (
          <div className="absolute top-2 left-2 bg-red-500/80 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
            <span>Private</span>
          </div>
        )}
        
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {currentVideo.duration}
        </div>
        
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-orange-500/20 backdrop-blur-sm rounded-full p-4 transform transition-all duration-300 hover:scale-110">
              <Play className="w-8 h-8 text-orange-400 fill-orange-400" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 
            className="font-semibold text-white line-clamp-2 cursor-pointer hover:text-orange-400 transition-colors"
            onClick={handleVideoClick}
          >
            {currentVideo.title}
          </h3>
          
          {/* Only show share button for authenticated users */}
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-1 hover:bg-slate-800 rounded transition-colors"
              >
                <Share2 className="w-4 h-4 text-slate-400 hover:text-orange-400" />
              </button>
              
              {showShareMenu && (
                <div className="absolute right-0 top-8 bg-slate-800 border border-slate-700 rounded-lg py-2 z-10 min-w-[140px]">
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    Copy Link
                  </button>
                  <button
                    onClick={() => handleShare('embed')}
                    className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    Copy Embed Code
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    Share on X
                  </button>
                  <button
                    onClick={() => handleShare('discord')}
                    className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    Copy for Discord
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Privacy toggle for authenticated users */}
        {isAuthenticated && username === "Jay" && (
          <div className="flex justify-start">
            <PrivacyToggle
              videoId={currentVideo.id}
              isPrivate={currentVideo.is_private || false}
              onPrivacyChange={handlePrivacyChange}
            />
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-slate-400">
          <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs">{currentVideo.game}</span>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{formatViews(currentVideo.views)}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(currentVideo.upload_date)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden elements for thumbnail generation */}
      <video ref={videoRef} style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};
