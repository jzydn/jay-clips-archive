
import { useState } from "react";
import { Play, Eye, Calendar, Share2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  uploadDate: string;
  views: number;
  game: string;
}

interface VideoCardProps {
  video: Video;
}

export const VideoCard = ({ video }: VideoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const navigate = useNavigate();

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
    const url = `${window.location.origin}/video/${video.id}`;
    const text = `Check out this clip: ${video.title}`;
    
    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(url);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'discord':
        navigator.clipboard.writeText(`${text} ${url}`);
        break;
    }
    setShowShareMenu(false);
  };

  return (
    <div 
      className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-slate-600 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="relative aspect-video bg-slate-700 cursor-pointer"
        onClick={() => navigate(`/video/${video.id}`)}
      >
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300" />
        
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>
        
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 transform transition-all duration-300 hover:scale-110">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 
            className="font-semibold text-white line-clamp-2 cursor-pointer hover:text-blue-400 transition-colors"
            onClick={() => navigate(`/video/${video.id}`)}
          >
            {video.title}
          </h3>
          
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-1 hover:bg-slate-700 rounded transition-colors"
            >
              <Share2 className="w-4 h-4 text-slate-400 hover:text-white" />
            </button>
            
            {showShareMenu && (
              <div className="absolute right-0 top-8 bg-slate-700 border border-slate-600 rounded-lg py-2 z-10 min-w-[120px]">
                <button
                  onClick={() => handleShare('copy')}
                  className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-600 hover:text-white"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-600 hover:text-white"
                >
                  Share on X
                </button>
                <button
                  onClick={() => handleShare('discord')}
                  className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-600 hover:text-white"
                >
                  Copy for Discord
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-400">
          <span className="bg-slate-700 px-2 py-1 rounded text-xs">{video.game}</span>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{formatViews(video.views)}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(video.uploadDate)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
