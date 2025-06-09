import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Download, Eye, Calendar, Copy, ExternalLink, Trash2 } from "lucide-react";
import { Header } from "@/components/Header";
import { buildApiUrl } from "@/config/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Video {
  id: string | number;
  title: string;
  subtitle?: string;
  game: string;
  duration: string;
  file_path: string;
  thumbnail_path?: string;
  upload_date: string;
  views: number;
  share_token?: string;
}

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check authentication status
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setIsSignedIn(true);
      setUsername(storedUser);
    }
  }, []);

  // Update meta tags for video embedding
  useEffect(() => {
    if (video) {
      const videoUrl = `https://data.extracted.lol${video.file_path}`;
      const thumbnailUrl = video.thumbnail_path ? `https://data.extracted.lol${video.thumbnail_path}` : '';
      const pageUrl = window.location.href;

      // Update document title
      document.title = `${video.title} - Gaming Clips`;

      // Remove existing meta tags
      const existingMetas = document.querySelectorAll('meta[property^="og:"], meta[name="twitter:"], meta[property="video:"]');
      existingMetas.forEach(meta => meta.remove());

      // Create and append new meta tags
      const metaTags = [
        // Open Graph tags
        { property: 'og:title', content: video.title },
        { property: 'og:description', content: video.subtitle || `${video.game} gameplay clip - ${video.duration}` },
        { property: 'og:type', content: 'video.other' },
        { property: 'og:url', content: pageUrl },
        { property: 'og:video', content: videoUrl },
        { property: 'og:video:secure_url', content: videoUrl },
        { property: 'og:video:type', content: 'video/mp4' },
        { property: 'og:video:width', content: '1280' },
        { property: 'og:video:height', content: '720' },
        ...(thumbnailUrl ? [
          { property: 'og:image', content: thumbnailUrl },
          { property: 'og:image:width', content: '1280' },
          { property: 'og:image:height', content: '720' }
        ] : []),
        
        // Twitter Card tags
        { name: 'twitter:card', content: 'player' },
        { name: 'twitter:title', content: video.title },
        { name: 'twitter:description', content: video.subtitle || `${video.game} gameplay clip` },
        { name: 'twitter:player', content: videoUrl },
        { name: 'twitter:player:width', content: '1280' },
        { name: 'twitter:player:height', content: '720' },
        ...(thumbnailUrl ? [{ name: 'twitter:image', content: thumbnailUrl }] : []),

        // Video-specific meta tags
        { property: 'video:duration', content: video.duration },
        { property: 'video:tag', content: video.game }
      ];

      metaTags.forEach(({ property, name, content }) => {
        const meta = document.createElement('meta');
        if (property) meta.setAttribute('property', property);
        if (name) meta.setAttribute('name', name);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      });
    }

    // Cleanup function to restore default title
    return () => {
      document.title = 'Gaming Clips';
    };
  }, [video]);

  // Fetch video data from MySQL database
  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        // Fetch all user videos and find the specific one
        const response = await fetch(buildApiUrl('/videos/user/1'));
        
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }
        
        const data = await response.json();
        const foundVideo = data.videos.find((v: Video) => v.id.toString() === id);
        
        if (!foundVideo) {
          throw new Error('Video not found');
        }
        
        setVideo(foundVideo);
        console.log("Fetched video from MySQL:", foundVideo);

        // Increment view count (you can create this endpoint later)
        // await fetch(buildApiUrl('/videos/views', id), {
        //   method: 'POST',
        // });
      } catch (error) {
        console.error("Error fetching video:", error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

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
    const text = `Check out this clip: ${video?.title}`;
    
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

  const handleDownload = () => {
    if (video?.file_path) {
      const videoUrl = `https://data.extracted.lol${video.file_path}`;
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `${video.title}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = async () => {
    if (!video) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(buildApiUrl('/videos', video.id.toString()), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      const result = await response.json();
      console.log('Video deleted:', result);
      
      // Navigate back to home after successful deletion
      navigate('/');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete video. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSignIn = (user: string) => {
    setIsSignedIn(true);
    setUsername(user);
    localStorage.setItem('loggedInUser', user);
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    setUsername("");
    localStorage.removeItem('loggedInUser');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Header isSignedIn={isSignedIn} onSignIn={handleSignIn} username={username} onSignOut={handleSignOut} />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full flex items-center justify-center animate-pulse">
                <Eye className="w-12 h-12 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300">Loading video...</h3>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Header isSignedIn={isSignedIn} onSignIn={handleSignIn} username={username} onSignOut={handleSignOut} />
        <main className="container mx-auto px-6 py-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-slate-400 hover:text-orange-400 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to clips</span>
          </button>
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-red-400">Video not found</h3>
              <p className="text-gray-500">{error || 'The video you\'re looking for doesn\'t exist.'}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const videoUrl = `https://data.extracted.lol${video.file_path}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header isSignedIn={isSignedIn} onSignIn={handleSignIn} username={username} onSignOut={handleSignOut} />
      
      <main className="container mx-auto px-6 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-slate-400 hover:text-orange-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to clips</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {/* Video Player */}
            <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
              <video 
                controls 
                className="w-full h-full"
                poster={video.thumbnail_path ? `https://data.extracted.lol${video.thumbnail_path}` : undefined}
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Video Info */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-bold text-white">{video.title}</h1>
                
                {/* Only show action buttons for authenticated users */}
                {isSignedIn && (
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <button
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                      
                      {showShareMenu && (
                        <div className="absolute right-0 top-12 bg-slate-800 border border-slate-700 rounded-lg py-2 z-10 min-w-[150px]">
                          <button
                            onClick={() => handleShare('copy')}
                            className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center space-x-2"
                          >
                            <Copy className="w-4 h-4" />
                            <span>Copy Link</span>
                          </button>
                          <button
                            onClick={() => handleShare('twitter')}
                            className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center space-x-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Share on X</span>
                          </button>
                          <button
                            onClick={() => handleShare('discord')}
                            className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center space-x-2"
                          >
                            <Copy className="w-4 h-4" />
                            <span>Copy for Discord</span>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={handleDownload}
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-6 text-sm text-slate-400 mb-4">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{formatViews(video.views)} views</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(video.upload_date)}</span>
                </div>
              </div>

              {video.subtitle && (
                <p className="text-slate-300 leading-relaxed">{video.subtitle}</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="font-semibold text-white mb-4">Clip Details</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Game</span>
                  <span className="text-white">{video.game}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration</span>
                  <span className="text-white">{video.duration}</span>
                </div>
              </div>
            </div>

            {/* Only show quick actions for Jay (authenticated user) */}
            {isSignedIn && username === "Jay" && (
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
                
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded transition-colors">
                    Edit Title
                  </button>
                  <button className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded transition-colors">
                    Update Description
                  </button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="w-full text-left px-3 py-2 text-red-400 hover:bg-slate-800 hover:text-red-300 rounded transition-colors">
                        Delete Clip
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-slate-800 border-slate-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-300">
                          This action cannot be undone. This will permanently delete your clip
                          and remove the video file from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          {isDeleting ? (
                            <>
                              <Trash2 className="w-4 h-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </>
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VideoPlayer;
