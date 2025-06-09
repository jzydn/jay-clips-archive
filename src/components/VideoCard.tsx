
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

  return (
    <div 
      className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-orange-500/50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/10 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="relative aspect-video bg-slate-800 cursor-pointer"
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
              <span>{formatDate(video.uploadDate)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
