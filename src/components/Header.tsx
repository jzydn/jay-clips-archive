
import { useState } from "react";
import { Upload, User, LogIn, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface HeaderProps {
  isSignedIn: boolean;
  onSignIn: (username: string) => void;
  username?: string;
}

export const Header = ({ isSignedIn, onSignIn, username }: HeaderProps) => {
  const [showUpload, setShowUpload] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === "Jay" && loginForm.password === "WWDC25Jayden") {
      onSignIn(loginForm.username);
      setShowLogin(false);
      setLoginForm({ username: "", password: "" });
      setLoginError("");
    } else {
      setLoginError("Invalid credentials");
    }
  };

  return (
    <header className="border-b border-white/20 bg-black/20 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent drop-shadow-lg">
              netsink's personal gallery
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {isSignedIn ? (
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
                  <span className="text-gray-300">{username}</span>
                </div>
              </>
            ) : (
              <Dialog open={showLogin} onOpenChange={setShowLogin}>
                <DialogTrigger asChild>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-lg transition-all duration-300 transform hover:scale-105 border border-white/30">
                    <LogIn size={18} />
                    <span>Login</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900/95 backdrop-blur-md border border-white/20 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                      Login to Gallery
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="username" className="text-gray-300">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        value={loginForm.username}
                        onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                        className="bg-slate-800/50 border-white/20 text-white placeholder:text-gray-500 focus:border-cyan-300"
                        placeholder="Enter username"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password" className="text-gray-300">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="bg-slate-800/50 border-white/20 text-white placeholder:text-gray-500 focus:border-cyan-300"
                        placeholder="Enter password"
                        required
                      />
                    </div>
                    {loginError && (
                      <p className="text-red-400 text-sm">{loginError}</p>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30"
                    >
                      Login
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
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
