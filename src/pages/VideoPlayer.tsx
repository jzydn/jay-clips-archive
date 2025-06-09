
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Download, Eye, Calendar, Copy, ExternalLink } from "lucide-react";
import { Header } from "@/components/Header";

// Mock video data - replace with real data later
const mockVideo = {
  id: "1",
  title: "Epic Clutch 1v4",
  videoUrl: "/placeholder.svg", // This would be the actual video file
  thumbnail: "/placeholder.svg",
  description: "Insane 1v4 clutch in Valorant ranked game. Had to make some crazy plays to secure this round!",
  duration: "0:45",
  uploadDate: "2024-06-08",
  views: 1234,
  game: "Valorant",
  map: "Bind",
  rank: "Immortal 2"
};

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isSignedIn] = useState(true); // For this demo

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out this clip: ${mockVideo.title}`;
    
    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'discord':
        navigator.clipboard.writeText(`${text} ${url}`);
        alert('Link copied for Discord!');
        break;
    }
    setShowShareMenu(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header isSignedIn={isSignedIn} onSignIn={() => {}} />
      
      <main className="container mx-auto px-6 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to clips</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {/* Video Player */}
            <div className="aspect-video bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
              <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-slate-600 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <p className="text-slate-400">Video Player Placeholder</p>
                  <p className="text-sm text-slate-500">In production, this would show the actual video</p>
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-bold text-white">{mockVideo.title}</h1>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                    
                    {showShareMenu && (
                      <div className="absolute right-0 top-12 bg-slate-700 border border-slate-600 rounded-lg py-2 z-10 min-w-[150px]">
                        <button
                          onClick={() => handleShare('copy')}
                          className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-600 hover:text-white flex items-center space-x-2"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Copy Link</span>
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-600 hover:text-white flex items-center space-x-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Share on X</span>
                        </button>
                        <button
                          onClick={() => handleShare('discord')}
                          className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-600 hover:text-white flex items-center space-x-2"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Copy for Discord</span>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm text-slate-400 mb-4">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{formatViews(mockVideo.views)} views</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(mockVideo.uploadDate)}</span>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed">{mockVideo.description}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="font-semibold text-white mb-4">Clip Details</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Game</span>
                  <span className="text-white">{mockVideo.game}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-400">Map</span>
                  <span className="text-white">{mockVideo.map}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-400">Rank</span>
                  <span className="text-white">{mockVideo.rank}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration</span>
                  <span className="text-white">{mockVideo.duration}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
              
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded transition-colors">
                  Edit Title
                </button>
                <button className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded transition-colors">
                  Update Description
                </button>
                <button className="w-full text-left px-3 py-2 text-red-400 hover:bg-slate-700 hover:text-red-300 rounded transition-colors">
                  Delete Clip
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VideoPlayer;
