
import { useState } from "react";
import { Header } from "@/components/Header";
import { VideoCard } from "@/components/VideoCard";

// Mock data for demonstration - replace with real data later
const mockVideos = [
  {
    id: "1",
    title: "Epic Clutch 1v4",
    thumbnail: "/placeholder.svg",
    duration: "0:45",
    uploadDate: "2024-06-08",
    views: 1234,
    game: "Valorant"
  },
  {
    id: "2", 
    title: "Insane Sniper Shot",
    thumbnail: "/placeholder.svg",
    duration: "0:12",
    uploadDate: "2024-06-07",
    views: 856,
    game: "Call of Duty"
  },
  {
    id: "3",
    title: "Perfect Team Coordination",
    thumbnail: "/placeholder.svg", 
    duration: "1:23",
    uploadDate: "2024-06-06",
    views: 2103,
    game: "Overwatch 2"
  }
];

const Index = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Header isSignedIn={isSignedIn} onSignIn={() => setIsSignedIn(true)} />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Jay's Clips
              </h1>
              <p className="text-xl text-slate-300 max-w-md mx-auto">
                Your personal gaming highlight collection
              </p>
            </div>
            <button
              onClick={() => setIsSignedIn(true)}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              View Clips
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header isSignedIn={isSignedIn} onSignIn={() => setIsSignedIn(true)} />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Jay's Clips</h1>
          <p className="text-slate-400">Your epic gaming moments</p>
        </div>

        {mockVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-300">No videos found</h3>
              <p className="text-slate-500">Upload your first clip to get started!</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
