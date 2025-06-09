
import { useState, useEffect } from "react";
import { Upload, Video, Home, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadPage } from "./UploadPage";
import { VideoCard } from "./VideoCard";

interface DashboardProps {
  username: string;
}

// Your VPS API endpoint
const API_BASE_URL = "http://46.244.96.25:3001/api";

export const Dashboard = ({ username }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState<"clips" | "upload">("clips");
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch videos from MySQL database
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/videos/user/1`); // Hardcoded for Jay for now
        
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }
        
        const data = await response.json();
        setVideos(data.videos || []);
        console.log("Fetched videos from MySQL:", data.videos);
      } catch (error) {
        console.error("Error fetching videos:", error);
        setVideos([]); // Fall back to empty array
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === "clips") {
      fetchVideos();
    }
  }, [activeTab]);

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent drop-shadow-lg mb-2">
          Welcome back, {username}
        </h1>
        <p className="bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">
          Manage your gaming clips
        </p>
      </div>

      <div className="flex space-x-4 mb-8">
        <Button
          onClick={() => setActiveTab("clips")}
          variant={activeTab === "clips" ? "default" : "outline"}
          className={activeTab === "clips" 
            ? "bg-white/20 hover:bg-white/30 text-white border border-white/30" 
            : "bg-transparent hover:bg-white/10 text-white border border-white/30"
          }
        >
          <Video className="w-4 h-4 mr-2" />
          Your Clips
        </Button>
        <Button
          onClick={() => setActiveTab("upload")}
          variant={activeTab === "upload" ? "default" : "outline"}
          className={activeTab === "upload" 
            ? "bg-white/20 hover:bg-white/30 text-white border border-white/30" 
            : "bg-transparent hover:bg-white/10 text-white border border-white/30"
          }
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Clip
        </Button>
      </div>

      {activeTab === "clips" ? (
        <div>
          <h2 className="text-2xl font-semibold text-white mb-6">Your Clips</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full flex items-center justify-center animate-pulse">
                  <Video className="w-12 h-12 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300">Loading clips from MySQL...</h3>
              </div>
            </div>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full flex items-center justify-center">
                  <Video className="w-12 h-12 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300">No clips yet</h3>
                <p className="text-gray-500">Upload your first gaming clip to get started!</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <UploadPage />
      )}
    </div>
  );
};
