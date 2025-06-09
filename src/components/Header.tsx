
import { useState } from "react";
import { Upload, User, Share2 } from "lucide-react";

interface HeaderProps {
  isSignedIn: boolean;
  onSignIn: () => void;
}

export const Header = ({ isSignedIn, onSignIn }: HeaderProps) => {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
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
                  className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  <Upload size={18} />
                  <span>Upload</span>
                </button>
                
                <div className="flex items-center space-x-2 px-4 py-2 bg-slate-800 rounded-lg">
                  <User size={18} className="text-gray-300" />
                  <span className="text-gray-300">Jay</span>
                </div>
              </>
            )}
          </div>
        </div>

        {showUpload && isSignedIn && (
          <div className="mt-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
            <div className="text-center space-y-4">
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 hover:border-white transition-colors cursor-pointer">
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
