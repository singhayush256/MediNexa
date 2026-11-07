'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { uploadProfilePhoto, deleteProfilePhoto } from '@/lib/auth-session';

interface ProfilePhotoUploaderProps {
  currentPhotoUrl?: string;
  initials?: string;
  onSuccess?: (avatarUrl: string | undefined) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProfilePhotoUploader({
  currentPhotoUrl,
  initials = 'MN',
  onSuccess,
  size = 'md',
  className = '',
}: ProfilePhotoUploaderProps) {
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(currentPhotoUrl);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setPhotoUrl(currentPhotoUrl);
  }, [currentPhotoUrl]);

  // Clean up camera stream tracks
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  }, []);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // Handle file selection from gallery / file browser
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type: JPG, JPEG, PNG, WebP
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      setErrorMsg('Invalid file type. Supported formats: JPG, JPEG, PNG, and WebP.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg('Image size exceeds 5MB limit. Please choose a smaller image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setPendingFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Start Live Camera
  const startCamera = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setCameraError(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera is not supported or accessible on this browser/device.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setIsCameraActive(true);

      // Delay assigning to video element to let DOM modal render
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err: any) {
      console.warn('Camera error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access permission was denied. Please allow camera permissions in your browser or use File Upload.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. Please use File Upload.');
      } else {
        setCameraError('Unable to access camera: ' + (err.message || 'Unknown error'));
      }
    }
  };

  // Capture frame from live camera
  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 640;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          setPendingFile(file);
          const objectUrl = URL.createObjectURL(blob);
          setPreviewUrl(objectUrl);
          stopCameraStream();
        },
        'image/jpeg',
        0.92,
      );
    } catch (e: any) {
      setErrorMsg('Failed to capture photo from video feed.');
      stopCameraStream();
    }
  };

  // Confirm and upload photo to backend
  const confirmSavePhoto = async () => {
    if (!pendingFile) return;
    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await uploadProfilePhoto(pendingFile);
    setUploading(false);

    if (res.ok && res.avatarUrl) {
      setPhotoUrl(res.avatarUrl);
      setPreviewUrl(null);
      setPendingFile(null);
      setSuccessMsg('Profile photo updated and saved successfully! ✓');
      setTimeout(() => setSuccessMsg(null), 4000);
      if (onSuccess) onSuccess(res.avatarUrl);
    } else {
      setErrorMsg(res.message || 'Failed to upload profile photo to server.');
    }
  };

  // Discard preview
  const discardPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPendingFile(null);
  };

  // Remove photo
  const handleRemovePhoto = async () => {
    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await deleteProfilePhoto();
    setUploading(false);

    if (res.ok) {
      setPhotoUrl(undefined);
      discardPreview();
      setSuccessMsg('Profile photo removed successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
      if (onSuccess) onSuccess(undefined);
    } else {
      setErrorMsg(res.message || 'Failed to remove photo.');
    }
  };

  const sizeClasses = {
    sm: 'w-16 h-16 text-sm',
    md: 'w-24 h-24 text-xl',
    lg: 'w-32 h-32 text-2xl',
  };

  const displayImage = previewUrl || photoUrl;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Main Avatar & Actions Container */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        {/* Photo Display Avatar */}
        <div className="relative shrink-0">
          <div
            className={`${sizeClasses[size]} rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 shadow-md transition-all`}
          >
            {displayImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayImage}
                alt="Profile Photograph"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="tracking-wider">{initials.slice(0, 2).toUpperCase()}</span>
            )}
          </div>

          {previewUrl && (
            <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500 text-white shadow-sm animate-pulse">
              Preview
            </span>
          )}
        </div>

        {/* Buttons & Information */}
        <div className="space-y-2 flex-1">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Profile Photograph
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            JPG, PNG, or WebP (max 5MB). Photo updates across all authorized workstations and header.
          </p>

          {/* Action Row */}
          {previewUrl ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={confirmSavePhoto}
                disabled={uploading}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm & Save</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={discardPreview}
                disabled={uploading}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Discard / Retake
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Option A: Gallery / File Upload */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                title="Select from device photo gallery or files"
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Gallery / Files</span>
              </button>

              {/* Option C: Live Camera */}
              <button
                type="button"
                onClick={startCamera}
                disabled={uploading}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                title="Open live camera to capture a photograph"
              >
                <Camera className="w-3.5 h-3.5 text-purple-600" />
                <span>Take Photo</span>
              </button>

              {/* Delete Photo */}
              {photoUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={uploading}
                  className="px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  title="Remove current profile photograph"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {cameraError && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Live Camera Modal */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Live Camera Capture
                </h3>
              </div>
              <button
                type="button"
                onClick={stopCameraStream}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-black aspect-square flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={stopCameraStream}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                className="px-5 py-2 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 shadow-md shadow-purple-600/30 transition cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

