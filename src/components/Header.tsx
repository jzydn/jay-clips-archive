
import { useState } from "react";
import { Upload, User, Share2 } from "lucide-react";

interface HeaderProps {
  isSignedIn: boolean;
  onSignIn: () => void;
}

export const Header = ({ isSignedIn, onSignIn }: HeaderProps) => {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <header className="border-b border-white/20 bg-black/20 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              netsink's personal gallery
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {isSignedIn && (
              <>
                <button
                  onClick={() => setShowUpload(!showUpload)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-lg transition-all duration-300 transform hover:scale-105 border border-white/30"
                >
                  <Upload size={18} />
                  <span>Upload</span>
                </button>
                
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                  <User size={18} className="text-gray-300" />
                  <span className="text-gray-300">Jay</span>
                </div>
              </>
            )}
          </div>
        </div>

        {showUpload && isSignedIn && (
          <div className="mt-4 p-4 bg-black/30 backdrop-blur-md rounded-lg border border-white/20">
            <div className="text-center space-y-4">
              <div className="border-2 border-dashed border-white/40 rounded-lg p-8 hover:border-white transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 mb-2">Drop your video files here or click to browse</p>
                <p className="text-sm text-gray-500">Supports MP4, MOV, AVI (Max 100MB)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
