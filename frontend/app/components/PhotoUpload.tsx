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
      <div className="space-y-4">
        <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-yellow-400 shadow-2xl">
          <Image
            src={preview}
            alt="Your photo"
            fill
            className="object-cover"
          />
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-semibold">Looking great! 🌟</p>
          <button
            onClick={reset}
            className="text-blue-300 underline hover:text-blue-200"
            disabled={loading}
          >
            Take another photo
          </button>
        </div>
      </div>
    );
  }

  if (captureMode === 'camera') {
    return (
      <div className="space-y-4">
        <div className="relative w-full max-w-md mx-auto rounded-2xl overflow-hidden border-4 border-yellow-400">
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
            className="bg-yellow-400 text-blue-900 font-bold py-3 px-8 rounded-full hover:bg-yellow-300 transition-colors text-lg"
          >
            📸 Take Photo
          </button>
          <button
            onClick={() => {
              stopCamera();
              setCaptureMode('choose');
            }}
            className="bg-gray-600 text-white font-bold py-3 px-8 rounded-full hover:bg-gray-500 transition-colors text-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (captureMode === 'upload') {
    return (
      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-64 h-64 mx-auto border-4 border-dashed border-yellow-400 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-800/20 transition-colors"
        >
          <div className="text-6xl mb-4">📁</div>
          <p className="text-xl font-semibold">Choose a photo</p>
          <p className="text-gray-300 text-sm mt-2">Tap to browse</p>
        </div>
        <button
          onClick={() => setCaptureMode('choose')}
          className="block mx-auto text-blue-300 underline hover:text-blue-200"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="w-64 h-64 mx-auto border-4 border-dashed border-yellow-400 rounded-full flex items-center justify-center">
        <div className="text-8xl">👤</div>
      </div>
      
      <div className="text-center space-y-4">
        <p className="text-2xl font-semibold">Let's take a picture of you!</p>
        <p className="text-gray-300">You'll be the hero of this adventure</p>
      </div>

      <div className="flex flex-col gap-4 max-w-sm mx-auto">
        <button
          onClick={startCamera}
          className="bg-yellow-400 text-blue-900 font-bold py-4 px-8 rounded-full hover:bg-yellow-300 transition-colors text-lg flex items-center justify-center gap-2"
        >
          📷 Use Camera
        </button>
        <button
          onClick={() => setCaptureMode('upload')}
          className="bg-purple-600 text-white font-bold py-4 px-8 rounded-full hover:bg-purple-500 transition-colors text-lg flex items-center justify-center gap-2"
        >
          📁 Upload Photo
        </button>
      </div>
    </div>
  );
}

