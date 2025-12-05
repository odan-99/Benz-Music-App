'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Grid3X3,
  Volume2,
  Plus,
  Video,
  Users,
  PhoneOff,
  User
} from 'lucide-react';

export default function Home() {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [songTitle, setSongTitle] = useState("Unknown Name");
  const [isPlaying, setIsPlaying] = useState(false);

  // Refs for Audio and File Input
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize Audio object on mount
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = false;

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  // Timer logic - sync with audio if playing, or just increment if "calling"
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && audioRef.current) {
      // Sync with actual audio time
      interval = setInterval(() => {
        setCallDuration(Math.floor(audioRef.current?.currentTime || 0));
      }, 500);
    } else if (songTitle === "Unknown Name") {
      // Default counting for "call" simulation before song is picked
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, songTitle]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && audioRef.current) {
      // Unconditional Playback: System is trusted to handle the file
      const objectUrl = URL.createObjectURL(file);
      audioRef.current.src = objectUrl;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setSongTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
      }).catch(e => console.error("Playback failed:", e));
    }
  };

  const handleContactsClick = () => {
    fileInputRef.current?.click();
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleEndCall = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = ""; // Stop buffering
    }
    setIsPlaying(false);
    setSongTitle("Unknown Name");
    setCallDuration(0);
    setIsMuted(false);
    setIsSpeaker(false);
  };

  const ActionButton = ({
    icon: Icon,
    label,
    isActive = false,
    onClick
  }: {
    icon: any,
    label: string,
    isActive?: boolean,
    onClick?: () => void
  }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group`}
    >
      <div
        className={`
          flex items-center justify-center w-[72px] h-[72px] rounded-full text-3xl transition-colors duration-300
          ${isActive
            ? 'bg-white text-black'
            : 'bg-[#1C1C1E] text-white group-hover:bg-[#2C2C2E]'
          }
        `}
      >
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <span className="text-white text-[13px] font-medium tracking-wide">
        {label}
      </span>
    </button>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-black font-sans text-white overflow-hidden">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="*/*"
        className="hidden"
      />

      <main className="flex h-[100dvh] w-full max-w-sm flex-col items-center justify-between py-6 px-6 relative">

        {/* Top Status Area */}
        <div className="w-full h-12 flex justify-between items-center opacity-0 pointer-events-none">
          <span>9:41</span>
        </div>

        {/* Main Content Info */}
        <div className="flex-1 flex flex-col items-center justify-center w-full -mt-20">
          {/* Animated Profile / Album Art Placeholder */}
          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center shadow-2xl">
              <User size={64} className="text-gray-400" />
            </div>
          </div>

          {/* Name and State */}
          <div className="flex flex-col items-center gap-1.5 px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight break-all line-clamp-2">
              {songTitle}
            </h1>
            <p className="text-gray-400 text-lg tracking-wide animate-pulse">
              {formatTime(callDuration)}
            </p>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="w-full max-w-[320px] mb-8">
          <div className="grid grid-cols-3 gap-y-8 gap-x-6 mb-[60px]">
            <ActionButton
              icon={isMuted ? MicOff : Mic}
              label="mute"
              isActive={isMuted}
              onClick={toggleMute}
            />
            <ActionButton
              icon={Grid3X3}
              label="keypad"
            />
            <ActionButton
              icon={Volume2}
              label="audio"
              isActive={isSpeaker}
              onClick={() => setIsSpeaker(!isSpeaker)}
            />
            <ActionButton
              icon={Plus}
              label="add call"
            />
            <ActionButton
              icon={Video}
              label="FaceTime"
            />
            <ActionButton
              icon={Users}
              label="contacts"
              onClick={handleContactsClick}
            />
          </div>

          {/* End Call Button */}
          <div className="flex items-center justify-center">
            <button
              onClick={handleEndCall}
              className="flex items-center justify-center w-[72px] h-[72px] rounded-full bg-[#FF3B30] text-white hover:bg-[#D73329] active:scale-95 transition-all shadow-lg shadow-red-900/20"
            >
              <PhoneOff size={34} fill="currentColor" strokeWidth={0} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
