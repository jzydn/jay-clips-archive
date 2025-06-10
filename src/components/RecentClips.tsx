
import { useState, useEffect } from "react";
import { VideoCard } from "./VideoCard";
import { Video, Clock } from "lucide-react";

const API_BASE_URL = "https://data.extracted.lol/api";

export const RecentClips = () => {
  const [recentVideos, setRecentVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentVideos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/videos/recent`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch recent videos');
        }
        
        const data = await response.json();
        setRecentVideos(data.videos || []);
        console.log("Fetched recent videos:", data.videos);
      } catch (error) {
        console.error("Error fetching recent videos:", error);
        setRecentVideos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentVideos();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <Clock className="w-6 h-6 text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Recent Clips</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-xl aspect-video animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (recentVideos.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <Clock className="w-6 h-6 text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Recent Clips</h2>
        </div>
        <div className="text-center py-8">
          <Video className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">No public clips available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-orange-500/20 rounded-lg">
          <Clock className="w-6 h-6 text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Recent Clips</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recentVideos.map((video) => (
          <VideoCard 
            key={video.id} 
            video={video} 
            isAuthenticated={false}
          />
        ))}
      </div>
    </div>
  );
};
