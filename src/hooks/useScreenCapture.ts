import { useState, useRef, useCallback, useEffect } from 'react';
import { ScreenCaptureSource, ScreenCaptureState } from '../types';

export function useScreenCapture() {
  const [state, setState] = useState<ScreenCaptureState>({
    isCapturing: false,
    source: 'screen',
    previewUrl: null,
    lastCaptureTime: null,
    permissionGranted: false,
    error: null,
    isMonitoring: false,
    monitoringInterval: 3,
    autoAnalysis: 'manual',
  });

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const monitoringTimerRef = useRef<number | null>(null);
  const lastImageDataRef = useRef<ImageData | null>(null);

  // Initialize hidden video element
  useEffect(() => {
    const video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    videoRef.current = video;

    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;

    return () => {
      stopCapture();
    };
  }, []);

  const compressAndExtractFrame = useCallback((videoEl: HTMLVideoElement): string | null => {
    if (!videoEl.videoWidth || !videoEl.videoHeight) return null;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvasRef.current = canvas;

    // Max dimension 1280px to optimize bandwidth while preserving clear UI text
    const maxDim = 1280;
    let width = videoEl.videoWidth;
    let height = videoEl.videoHeight;

    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(videoEl, 0, 0, width, height);

    // Return compressed JPEG base64 data URL
    return canvas.toDataURL('image/jpeg', 0.85);
  }, []);

  const captureFrameNow = useCallback((): string | null => {
    if (videoRef.current && mediaStreamRef.current && mediaStreamRef.current.active) {
      const dataUrl = compressAndExtractFrame(videoRef.current);
      if (dataUrl) {
        setState((prev) => ({
          ...prev,
          previewUrl: dataUrl,
          lastCaptureTime: Date.now(),
        }));
        return dataUrl;
      }
    }
    return state.previewUrl;
  }, [compressAndExtractFrame, state.previewUrl]);

  const startCapture = useCallback(
    async (preferredSource: ScreenCaptureSource = 'screen') => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          throw new Error('Screen capture API is not supported in this browser. Please use Chrome, Edge, or Firefox.');
        }

        stopCapture(); // Clean up existing stream if any

        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: preferredSource === 'tab' ? 'browser' : preferredSource === 'window' ? 'window' : 'monitor',
          } as any,
          audio: false,
        });

        mediaStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        // Handle user stopping stream via browser native UI bar
        stream.getVideoTracks()[0].onended = () => {
          stopCapture();
        };

        // Wait brief moment for video dimensions to load
        setTimeout(() => {
          if (videoRef.current) {
            const initialFrame = compressAndExtractFrame(videoRef.current);
            setState({
              isCapturing: true,
              source: preferredSource,
              previewUrl: initialFrame,
              lastCaptureTime: Date.now(),
              permissionGranted: true,
              error: null,
              isMonitoring: false,
              monitoringInterval: 3,
              autoAnalysis: 'manual',
            });
          }
        }, 500);
      } catch (err: any) {
        console.warn('Screen capture permission error or user canceled:', err);
        const userFriendlyMessage =
          err.name === 'NotAllowedError'
            ? 'Screen access was denied or canceled. Click Start Screen Sharing to grant permission.'
            : err.message || 'Failed to start screen capture.';

        setState((prev) => ({
          ...prev,
          isCapturing: false,
          permissionGranted: false,
          error: userFriendlyMessage,
        }));
      }
    },
    [compressAndExtractFrame]
  );

  const stopCapture = useCallback(() => {
    if (monitoringTimerRef.current) {
      clearInterval(monitoringTimerRef.current);
      monitoringTimerRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setState((prev) => ({
      ...prev,
      isCapturing: false,
      permissionGranted: false,
      isMonitoring: false,
      error: null,
    }));
  }, []);

  const handleManualUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setState((prev) => ({
          ...prev,
          previewUrl: dataUrl,
          lastCaptureTime: Date.now(),
          source: 'manual',
          permissionGranted: true,
          error: null,
        }));
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const setPreviewUrlDirectly = useCallback((dataUrl: string) => {
    setState((prev) => ({
      ...prev,
      previewUrl: dataUrl,
      lastCaptureTime: Date.now(),
      permissionGranted: true,
      error: null,
    }));
  }, []);

  const detectSignificantChange = useCallback((): boolean => {
    if (!videoRef.current || !canvasRef.current) return false;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return false;

    try {
      const currentData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      if (!lastImageDataRef.current) {
        lastImageDataRef.current = currentData;
        return true;
      }

      // Sample pixel differences
      let diffPixels = 0;
      const data1 = lastImageDataRef.current.data;
      const data2 = currentData.data;
      const step = 20; // Check every 20th pixel for performance

      for (let i = 0; i < data1.length; i += step * 4) {
        const rDiff = Math.abs(data1[i] - data2[i]);
        const gDiff = Math.abs(data1[i + 1] - data2[i + 1]);
        const bDiff = Math.abs(data1[i + 2] - data2[i + 2]);
        if (rDiff + gDiff + bDiff > 60) {
          diffPixels++;
        }
      }

      lastImageDataRef.current = currentData;
      return diffPixels > 50; // threshold
    } catch (e) {
      return true;
    }
  }, []);

  const toggleMonitoring = useCallback((enabled: boolean, intervalSeconds: number = 3) => {
    if (monitoringTimerRef.current) {
      clearInterval(monitoringTimerRef.current);
      monitoringTimerRef.current = null;
    }

    if (enabled && mediaStreamRef.current) {
      monitoringTimerRef.current = window.setInterval(() => {
        captureFrameNow();
      }, intervalSeconds * 1000);
    }

    setState((prev) => ({
      ...prev,
      isMonitoring: enabled,
      monitoringInterval: intervalSeconds,
    }));
  }, [captureFrameNow]);

  return {
    state,
    startCapture,
    stopCapture,
    captureFrameNow,
    handleManualUpload,
    setPreviewUrlDirectly,
    toggleMonitoring,
    detectSignificantChange,
  };
}
