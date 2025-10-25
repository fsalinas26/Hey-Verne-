'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface PhotoUploadProps {
  onPhotoSelected: (file: File) => void;
  loading?: boolean;
}

export default function PhotoUpload({ onPhotoSelected, loading = false }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [captureMode, setCaptureMode] = useState<'choose' | 'camera' | 'upload'>('choose');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCaptureMode('camera');
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please upload a photo instead.');
      setCaptureMode('upload');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
            setPreview(canvas.toDataURL('image/jpeg'));
            stopCamera();
            onPhotoSelected(file);
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        onPhotoSelected(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const reset = () => {
    setPreview(null);
    setCaptureMode('choose');
    stopCamera();
  };

  if (preview) {
    return (
      <div className="space-y-6">
        <div className="relative w-64 h-64 mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <div className="relative rounded-full overflow-hidden border-4 border-yellow-400 shadow-2xl glow-yellow">
            <Image
              src={preview}
              alt="Your photo"
              fill
              className="object-cover"
            />
          </div>
        </div>
        <div className="text-center space-y-3">
          <p className="text-2xl font-bold text-yellow-300 animate-float">Looking great! 🌟</p>
          <button
            onClick={reset}
            className="glass px-6 py-2 rounded-full hover:bg-white/20 transition-all duration-300 text-blue-200"
            disabled={loading}
          >
            📸 Take another photo
          </button>
        </div>
      </div>
    );
  }

  if (captureMode === 'camera') {
    return (
      <div className="space-y-6">
        <div className="relative w-full max-w-md mx-auto rounded-3xl overflow-hidden border-4 border-yellow-400 shadow-2xl glow-yellow">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full"
          />
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex gap-4 justify-center">
          <button
            onClick={capturePhoto}
            className="bg-gradient-to-r from-yellow-400 to-orange-400 text-blue-900 font-bold py-3 px-8 rounded-full hover:from-yellow-300 hover:to-orange-300 transition-all duration-300 text-lg shadow-lg transform hover:scale-105"
          >
            📸 Take Photo
          </button>
          <button
            onClick={() => {
              stopCamera();
              setCaptureMode('choose');
            }}
            className="glass text-white font-bold py-3 px-8 rounded-full hover:bg-white/20 transition-all duration-300 text-lg"
          >
            ✖️ Cancel
          </button>
        </div>
      </div>
    );
  }

  if (captureMode === 'upload') {
    return (
      <div className="space-y-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group w-64 h-64 mx-auto border-4 border-dashed border-yellow-400 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-800/30 transition-all duration-300 hover:scale-105 hover:border-yellow-300"
        >
          <div className="text-7xl mb-4 group-hover:animate-float">📁</div>
          <p className="text-xl font-bold text-yellow-300">Choose a photo</p>
          <p className="text-gray-300 text-sm mt-2">Tap to browse</p>
        </div>
        <button
          onClick={() => setCaptureMode('choose')}
          className="block mx-auto glass px-6 py-2 rounded-full hover:bg-white/20 transition-all duration-300"
        >
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative w-64 h-64 mx-auto">
        <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="relative w-64 h-64 border-4 border-dashed border-yellow-400 rounded-full flex items-center justify-center animate-float">
          <div className="text-8xl">👤</div>
        </div>
      </div>
      
      <div className="text-center space-y-4">
        <p className="text-2xl font-bold text-yellow-300">Let's take a picture of you!</p>
        <p className="text-gray-200 text-lg">You'll be the hero of this adventure ⭐</p>
      </div>

      <div className="flex flex-col gap-4 max-w-sm mx-auto">
        <button
          onClick={startCamera}
          className="group bg-gradient-to-r from-yellow-400 to-orange-400 text-blue-900 font-bold py-4 px-8 rounded-full hover:from-yellow-300 hover:to-orange-300 transition-all duration-300 text-lg flex items-center justify-center gap-2 shadow-lg transform hover:scale-105"
        >
          <span className="group-hover:animate-bounce">📷</span>
          <span>Use Camera</span>
        </button>
        <button
          onClick={() => setCaptureMode('upload')}
          className="group glass text-white font-bold py-4 px-8 rounded-full hover:bg-white/20 transition-all duration-300 text-lg flex items-center justify-center gap-2 transform hover:scale-105"
        >
          <span className="group-hover:animate-bounce">📁</span>
          <span>Upload Photo</span>
        </button>
      </div>
    </div>
  );
}

