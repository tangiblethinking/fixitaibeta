'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Camera } from 'lucide-react';
import { Button } from '@/components/ui';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export default function CameraCapture({
  onCapture,
  onClose,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup stream on unmount
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setStream(mediaStream);
      setPermissionGranted(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      setError(
        'Camera access denied. Please allow camera access in your browser settings.'
      );
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });
          // Stop camera
          stream?.getTracks().forEach((track) => track.stop());
          onCapture(file);
        }
      },
      'image/jpeg',
      0.9
    );
  };

  // Consent screen
  if (!permissionGranted && !error) {
    return (
      <div className="fixed inset-0 bg-ink-900/95 z-50 flex flex-col items-center justify-center p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <X className="w-6 h-6" />
        </button>

        <Camera className="w-12 h-12 text-white/60 mb-6" />
        <h2 className="text-title text-white mb-2 text-center">
          Camera access needed
        </h2>
        <p className="text-body-sm text-white/60 text-center max-w-xs mb-8">
          FixIt AI needs your camera to take photos of repair issues. Photos are
          only used for diagnosis and are never shared.
        </p>
        <Button size="lg" onClick={startCamera}>
          Allow camera access
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-ink-900/95 z-50 flex flex-col items-center justify-center p-6">
        <p className="text-body text-white/80 text-center mb-4">{error}</p>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <button
        onClick={() => {
          stream?.getTracks().forEach((track) => track.stop());
          onClose();
        }}
        className="absolute top-4 right-4 z-10 text-white/70 hover:text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="flex-1 flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="max-w-full max-h-full object-contain"
        />
      </div>

      <div className="flex justify-center py-6">
        <button
          onClick={capturePhoto}
          className="w-16 h-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/40 transition-colors active:scale-95"
        />
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
