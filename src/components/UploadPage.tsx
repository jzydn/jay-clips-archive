import { useState, useRef } from "react";
import { Upload, Video, Clock, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const gameOptions = [
  "Valorant",
  "Call of Duty",
  "Overwatch 2",
  "Apex Legends",
  "CS2",
  "Fortnite",
  "League of Legends",
  "Rocket League",
  "Other"
];

// Your VPS API endpoint
const API_BASE_URL = "http://46.244.96.25:8086/api";

export const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [game, setGame] = useState("");
  const [duration, setDuration] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Get video duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const minutes = Math.floor(video.duration / 60);
        const seconds = Math.floor(video.duration % 60);
        setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      };
      video.src = URL.createObjectURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title || !game) {
      alert("Please fill in all required fields and select a video file");
      return;
    }

    setIsUploading(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('title', title);
      formData.append('subtitle', subtitle);
      formData.append('game', game);
      formData.append('duration', duration);
      formData.append('userId', '1'); // Hardcoded for Jay for now

      console.log("Uploading to MySQL backend:", {
        file: selectedFile.name,
        title,
        subtitle,
        game,
        duration,
        apiUrl: `${API_BASE_URL}/videos/upload`
      });

      // Upload to your MySQL backend
      const response = await fetch(`${API_BASE_URL}/videos/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Upload successful:", result);
      
      alert("Video uploaded successfully to MySQL database!");
      
      // Reset form
      setSelectedFile(null);
      setTitle("");
      setSubtitle("");
      setGame("");
      setDuration("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent mb-6">
        Upload New Clip
      </h2>
      
      <div className="space-y-6 bg-slate-900/50 backdrop-blur-md rounded-xl border border-white/20 p-6">
        {/* File Upload Area */}
        <div>
          <Label className="text-gray-300 mb-2 block">Video File</Label>
          <div 
            className="border-2 border-dashed border-white/40 rounded-lg p-8 hover:border-white transition-colors cursor-pointer bg-slate-800/30"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="text-center">
              {selectedFile ? (
                <div className="space-y-2">
                  <Video className="w-12 h-12 text-green-400 mx-auto" />
                  <p className="text-green-400">{selectedFile.name}</p>
                  <p className="text-sm text-gray-400">Click to change file</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <p className="text-gray-300">Drop your video file here or click to browse</p>
                  <p className="text-sm text-gray-500">Supports MP4, MOV, AVI (Max 100MB)</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Video Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title" className="text-gray-300">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter clip title"
              className="bg-slate-800/50 border-white/20 text-white placeholder:text-gray-500 focus:border-cyan-300"
              required
            />
          </div>

          <div>
            <Label htmlFor="game" className="text-gray-300">Game *</Label>
            <Select value={game} onValueChange={setGame}>
              <SelectTrigger className="bg-slate-800/50 border-white/20 text-white focus:border-cyan-300">
                <SelectValue placeholder="Select game" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/20">
                {gameOptions.map((gameOption) => (
                  <SelectItem key={gameOption} value={gameOption} className="text-white hover:bg-slate-700">
                    {gameOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="subtitle" className="text-gray-300">Subtitle</Label>
          <Textarea
            id="subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Add a description or subtitle for your clip"
            className="bg-slate-800/50 border-white/20 text-white placeholder:text-gray-500 focus:border-cyan-300"
            rows={3}
          />
        </div>

        {duration && (
          <div className="flex items-center space-x-2 text-gray-300">
            <Clock className="w-4 h-4" />
            <span>Duration: {duration}</span>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !title || !game || isUploading}
          className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Upload className="w-4 h-4 mr-2 animate-spin" />
              Uploading to MySQL...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Clip
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
