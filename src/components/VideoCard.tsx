
import { useState, useRef, useEffect } from "react";
import { Play, Eye, Calendar, Share2, ExternalLink, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
}

interface VideoCardProps {
  video: Video;
}

export const VideoCard = ({ video }: VideoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState("/placeholder.svg");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  // Check if current user is jay (authenticated)
  const currentUser = localStorage.getItem('currentUser');
  const isJay = currentUser === 'jay';

  // Generate thumbnail from video
  useEffect(() => {
    if (video.file_path) {
      const videoUrl = `https://data.extracted.lol${video.file_path}`;
      
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
  }, [video.file_path]);

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

  const handleShare = (platform: string) => {
    // Only allow sharing if user is jay
    if (!isJay) {
      alert('Only authenticated users can share videos.');
      return;
    }

    const url = `${window.location.origin}/video/${video.id}`;
    const embedUrl = `${window.location.origin}/embed/${video.id}`;
    const text = `Check out this clip: ${video.title}`;
    
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

  const handleDelete = async () => {
    if (!isJay) {
      alert('Only jay can delete videos.');
      return;
    }

    try {
      const response = await fetch(`https://data.extracted.lol/api/videos/${video.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Video deleted successfully!');
        window.location.reload(); // Refresh the page to update the video list
      } else {
        alert('Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Error deleting video');
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div 
      className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-orange-500/50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/10 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="relative aspect-video bg-slate-800 cursor-pointer overflow-hidden"
        onClick={() => navigate(`/video/${video.id}`)}
      >
        <img 
          src={thumbnailSrc} 
          alt={video.title}
          className="w-full h-full object-cover"
          onError={() => setThumbnailSrc("/placeholder.svg")}
        />
        
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300" />
        
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {video.duration}
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
            onClick={() => navigate(`/video/${video.id}`)}
          >
            {video.title}
          </h3>
          
          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                disabled={!isJay}
                className={`p-1 rounded transition-colors ${isJay ? 'hover:bg-slate-800' : 'opacity-50 cursor-not-allowed'}`}
              >
                <Share2 className={`w-4 h-4 ${isJay ? 'text-slate-400 hover:text-orange-400' : 'text-slate-600'}`} />
              </button>
              
              {showShareMenu && isJay && (
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

            {isJay && (
              <div className="relative">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1 hover:bg-slate-800 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                </button>
                
                {showDeleteConfirm && (
                  <div className="absolute right-0 top-8 bg-slate-800 border border-slate-700 rounded-lg p-3 z-10 min-w-[200px]">
                    <p className="text-sm text-slate-300 mb-3">Delete this video?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDelete}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-3 py-1 bg-slate-600 text-white text-sm rounded hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-400">
          <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs">{video.game}</span>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{formatViews(video.views)}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(video.upload_date)}</span>
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
