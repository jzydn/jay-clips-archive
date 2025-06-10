
import { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrivacyToggleProps {
  videoId: string | number;
  isPrivate: boolean;
  onPrivacyChange: (isPrivate: boolean) => void;
}

const API_BASE_URL = "https://data.extracted.lol/api";

export const PrivacyToggle = ({ videoId, isPrivate, onPrivacyChange }: PrivacyToggleProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleTogglePrivacy = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/videos/${videoId}/privacy`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPrivate: !isPrivate }),
      });

      if (!response.ok) {
        throw new Error('Failed to update privacy');
      }

      onPrivacyChange(!isPrivate);
      console.log('Privacy updated:', { videoId, newPrivacy: !isPrivate });
    } catch (error) {
      console.error('Error updating privacy:', error);
      alert('Failed to update privacy. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Button
      onClick={handleTogglePrivacy}
      disabled={isUpdating}
      variant="outline"
      size="sm"
      className={`flex items-center space-x-2 ${
        isPrivate 
          ? 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30' 
          : 'bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30'
      }`}
    >
      {isPrivate ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
      <span>{isPrivate ? 'Private' : 'Public'}</span>
    </Button>
  );
};
