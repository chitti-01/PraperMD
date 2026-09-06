'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Subject, ExamType, QuestionPaper } from '@/lib/types';
import {
  Camera,
  RotateCcw,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Zap,
  ZapOff,
  SwitchCamera,
  Eye,
  FileText,
  Upload,
  ArrowRight,
} from 'lucide-react';

interface ScannedPage {
  id: string;
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
}

export default function ScanPage() {
  // Navigation & Step state: 'prompt' | 'camera' | 'review' | 'details' | 'success'
  const [step, setStep] = useState<'prompt' | 'camera' | 'review' | 'details' | 'success'>('prompt');

  // Metadata dropdowns
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);

  // Camera stream & configuration
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  // Scanned pages state
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);
  const [previewPage, setPreviewPage] = useState<ScannedPage | null>(null);

  // Form Metadata state
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [examTypeId, setExamTypeId] = useState('');
  const [mbbsYear, setMbbsYear] = useState('1st MBBS');
  const [semester, setSemester] = useState('');
  const [examYear, setExamYear] = useState('2026');
  const [academicYear] = useState('2025-2026');
  const [description, setDescription] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [duplicateAlert, setDuplicateAlert] = useState<{ message: string; existingPaperId?: string } | null>(null);
  const [publishedPaper, setPublishedPaper] = useState<QuestionPaper | null>(null);

  // Load subject & exam type metadata on mount
  useEffect(() => {
    async function loadMetadata() {
      try {
        const res = await fetch('/api/metadata');
        const data = await res.json();
        setSubjects(data.subjects || []);
        setExamTypes(data.examTypes || []);
        if (data.subjects && data.subjects.length > 0) setSubjectId(data.subjects[0].id);
        if (data.examTypes && data.examTypes.length > 0) setExamTypeId(data.examTypes[0].id);
      } catch (err) {
        console.error('Failed to load metadata', err);
      }
    }
    loadMetadata();
  }, []);

  // MANDATORY: Stream track cleanup when component unmounts or leaves camera step
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const [videoStalled, setVideoStalled] = useState(false);

  // Automatically attach media stream when step becomes 'camera' and video DOM ref mounts
  useEffect(() => {
    if (step === 'camera') {
      if (streamRef.current && videoRef.current) {
        const video = videoRef.current;
        video.srcObject = streamRef.current;
        video.play().catch((err) => console.error('Camera video play error:', err));
      }

      // 3-second black screen detector
      const timer = setTimeout(() => {
        if (videoRef.current) {
          if (videoRef.current.videoWidth === 0 || videoRef.current.readyState < 2) {
            setVideoStalled(true);
          }
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [step]);

  // Start camera explicitly after user interaction
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    stopCameraStream();
    setCameraError(null);
    setVideoStalled(false);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Your browser does not support camera scanning. Please use a modern mobile browser or upload existing files.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Check torch capabilities
      const track = stream.getVideoTracks()[0];
      if (track && 'getCapabilities' in track) {
        const caps = (track as unknown as { getCapabilities: () => { torch?: boolean } }).getCapabilities();
        setTorchSupported(Boolean(caps && caps.torch));
      }

      setStep('camera');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: unknown) {
      console.error('Camera permission or stream error:', err);
      const errName = err && typeof err === 'object' && 'name' in err ? String(err.name) : '';
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser settings to scan question papers.');
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setCameraError('No active camera device was found on this device.');
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        setCameraError('Camera is currently in use by another application.');
      } else {
        setCameraError('Unable to access camera. Please check browser permissions or upload existing files.');
      }
    }
  };

  // Toggle torch/flash light if supported
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && 'applyConstraints' in track) {
      try {
        const nextState = !torchOn;
        await (track as unknown as { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({ advanced: [{ torch: nextState }] });
        setTorchOn(nextState);
      } catch (err) {
        console.error('Failed to toggle torch', err);
      }
    }
  };

  // Switch between rear & front facing cameras
  const switchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture video frame to HTML5 Canvas with orientation & size normalization
  const capturePage = async () => {
    if (!videoRef.current || capturing) return;
    setCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');

      // Cap maximum canvas dimension to 2000px to maintain high readability while preserving mobile memory
      const maxDim = 2000;
      let width = video.videoWidth || 1280;
      let height = video.videoHeight || 720;

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
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
      }

      // Convert canvas to compressed JPEG Blob (q=0.82)
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.82);
      });

      if (blob) {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        const newPage: ScannedPage = {
          id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          blob,
          dataUrl,
          width,
          height,
        };

        if (retakeIndex !== null) {
          // Retake existing page
          setPages((prev) => {
            const copy = [...prev];
            copy[retakeIndex] = newPage;
            return copy;
          });
          setRetakeIndex(null);
          stopCameraStream();
          setStep('review');
        } else {
          // Append new page
          setPages((prev) => [...prev, newPage]);
        }
      }
    } catch (err) {
      console.error('Failed to capture canvas frame', err);
    } finally {
      setCapturing(false);
    }
  };

  // Page reordering, deletion & retake handlers
  const handleDeletePage = (index: number) => {
    setPages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMovePage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pages.length) return;

    setPages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleRetakePage = (index: number) => {
    setRetakeIndex(index);
    startCamera();
  };

  // Submit scanned pages directly to the existing /api/upload endpoint
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setDuplicateAlert(null);

    if (pages.length === 0) {
      setSubmitError('Please scan at least one page of the question paper.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('subject_id', subjectId);
      formData.append('exam_type_id', examTypeId);
      formData.append('mbbs_year', mbbsYear);
      formData.append('semester', semester);
      formData.append('exam_year', examYear);
      formData.append('academic_year', academicYear);
      formData.append('description', description);

      // Convert scanned blobs into File objects
      pages.forEach((page, idx) => {
        const file = new File([page.blob], `scanned_page_${idx + 1}.jpg`, {
          type: 'image/jpeg',
        });
        formData.append('files', file);
      });

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      let data;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const textText = await res.text();
        if (res.status === 413) {
          throw new Error('Scanned images total size exceeds server limit (413 Request Entity Too Large). Please reduce number of pages or retake.');
        }
        throw new Error(`Upload server error (${res.status}). ${textText.substring(0, 100) || 'Please try again.'}`);
      }

      if (res.status === 409) {
        setDuplicateAlert({
          message: data.error,
          existingPaperId: data.existingPaperId,
        });
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish question paper');
      }

      setPublishedPaper(data.paper);
      setStep('success');
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  // STEP 1: Educational Permission Prompt
  if (step === 'prompt') {
    return (
      <div className="container max-w-xl py-8">
        <div className="card text-center p-8">
          <div className="scan-icon-bubble-lg mx-auto mb-5">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="h1-hero text-2xl mb-2">Scan Question Paper</h1>
          <p className="subtext mb-6">
            PaperMD will access your phone camera to scan physical paper pages step-by-step.
          </p>

          {cameraError && (
            <div className="card error-alert-card mb-6 text-left">
              <AlertTriangle className="w-5 h-5 text-rose flex-shrink-0" />
              <div>
                <h4 className="font-bold text-rose-900 mb-1">Camera Access Issue</h4>
                <p className="text-sm text-rose-800">{cameraError}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => startCamera()}
              className="btn btn-primary btn-lg w-full touch-target"
            >
              <Camera className="w-5 h-5" />
              <span>Allow Camera & Start Scan</span>
            </button>

            <Link href="/upload" className="btn btn-secondary btn-lg w-full touch-target">
              <Upload className="w-5 h-5 text-teal" />
              <span>Upload Existing PDF / File</span>
            </Link>
          </div>
        </div>

        <style jsx>{`
          .scan-icon-bubble-lg {
            width: 72px;
            height: 72px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--accent-highlight) 0%, #2563EB 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
          }
          .mx-auto { margin-left: auto; margin-right: auto; }
          .error-alert-card {
            background-color: #FFF1F2;
            border: 1px solid #FECDD3;
            display: flex;
            gap: 0.75rem;
            padding: 1rem;
          }
          .w-full { width: 100%; }
        `}</style>
      </div>
    );
  }

  // STEP 2: Active Camera Viewfinder
  if (step === 'camera') {
    return (
      <div className="camera-fullscreen-container">
        {/* Top Header Controls */}
        <div className="camera-header-bar">
          <button
            onClick={() => {
              stopCameraStream();
              setStep(pages.length > 0 ? 'review' : 'prompt');
            }}
            className="camera-bar-btn"
            aria-label="Cancel Scanning"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="page-counter-badge">
            {retakeIndex !== null ? `Retaking Page ${retakeIndex + 1}` : `${pages.length} Page${pages.length === 1 ? '' : 's'} Captured`}
          </div>

          <div className="flex gap-2">
            {torchSupported && (
              <button onClick={toggleTorch} className="camera-bar-btn" aria-label="Toggle Flash">
                {torchOn ? <Zap className="w-5 h-5 text-amber" /> : <ZapOff className="w-5 h-5" />}
              </button>
            )}
            <button onClick={switchCamera} className="camera-bar-btn" aria-label="Switch Camera">
              <SwitchCamera className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Camera Live Video Feed */}
        <div className="camera-video-frame">
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className="camera-video"
          />

          {videoStalled && (
            <div className="camera-stalled-overlay card text-center p-6 mx-4">
              <AlertTriangle className="w-8 h-8 text-amber mx-auto mb-2" />
              <h4 className="font-bold text-lg text-white mb-1">Camera Stream Stalled</h4>
              <p className="text-xs text-slate-300 mb-4 max-w-xs mx-auto">
                Camera access was granted but video frames are not rendering. Tap below to retry or upload a file.
              </p>
              <div className="flex flex-col gap-2 w-full max-w-xs mx-auto">
                <button onClick={() => startCamera()} className="btn btn-primary btn-sm w-full touch-target">
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry Camera Stream</span>
                </button>
                <Link href="/upload" className="btn btn-secondary btn-sm w-full touch-target text-slate-900">
                  <Upload className="w-4 h-4" />
                  <span>Upload Document File</span>
                </Link>
              </div>
            </div>
          )}

          {/* Framing Guide Overlay */}
          {!videoStalled && (
            <div className="document-frame-guide">
              <div className="frame-corner top-left"></div>
              <div className="frame-corner top-right"></div>
              <div className="frame-corner bottom-left"></div>
              <div className="frame-corner bottom-right"></div>
              <p className="frame-guide-text">Position paper inside frame</p>
            </div>
          )}
        </div>

        {/* Bottom Shutter Controls */}
        <div className="camera-bottom-bar">
          {pages.length > 0 && retakeIndex === null ? (
            <button
              onClick={() => {
                stopCameraStream();
                setStep('review');
              }}
              className="btn btn-secondary btn-sm"
            >
              Done ({pages.length})
            </button>
          ) : (
            <div className="w-20"></div>
          )}

          {/* Shutter Capture Button */}
          <button
            onClick={capturePage}
            disabled={capturing}
            className="shutter-btn touch-target"
            aria-label="Capture Page Photo"
          >
            <div className="shutter-inner"></div>
          </button>

          <div className="w-20 text-right">
            {pages.length > 0 && (
              <span className="text-xs text-white opacity-80 font-mono">
                {pages.length} Page{pages.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <style jsx>{`
          .camera-fullscreen-container {
            position: fixed;
            inset: 0;
            z-index: 1000;
            background-color: #000000;
            display: flex;
            flex-direction: column;
          }

          .camera-header-bar {
            height: 60px;
            padding: 0 1rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: rgba(0, 0, 0, 0.8);
            color: #FFFFFF;
          }

          .camera-bar-btn {
            background: none;
            border: none;
            color: #FFFFFF;
            display: flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
          }

          .page-counter-badge {
            background-color: rgba(255, 255, 255, 0.2);
            padding: 0.25rem 0.75rem;
            border-radius: 999px;
            font-size: 0.8125rem;
            font-weight: 700;
            font-family: var(--font-mono);
          }

          .camera-video-frame {
            flex: 1;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .camera-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .camera-stalled-overlay {
            position: absolute;
            z-index: 20;
            background-color: rgba(15, 23, 42, 0.95);
            border: 1px solid #334155;
          }

          .document-frame-guide {
            position: absolute;
            inset: 8%;
            border: 2px dashed rgba(255, 255, 255, 0.5);
            border-radius: 12px;
            pointer-events: none;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            padding-bottom: 1.5rem;
          }

          .frame-guide-text {
            color: #FFFFFF;
            background-color: rgba(0, 0, 0, 0.6);
            padding: 0.35rem 0.875rem;
            border-radius: 999px;
            font-size: 0.8125rem;
            font-weight: 600;
          }

          .camera-bottom-bar {
            height: 100px;
            background-color: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 1.5rem;
          }

          .shutter-btn {
            width: 68px;
            height: 68px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.3);
            border: 4px solid #FFFFFF;
            padding: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .shutter-inner {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #FFFFFF;
            transition: transform 0.1s ease;
          }

          .shutter-btn:active .shutter-inner {
            transform: scale(0.85);
          }

          .w-20 { width: 80px; }
        `}</style>
      </div>
    );
  }

  // STEP 3: Multi-Page Scan Review Screen
  if (step === 'review') {
    return (
      <div className="container max-w-3xl">
        <div className="flex-between mb-6">
          <div>
            <div className="eyebrow">REVIEW PAGES</div>
            <h1 className="h1-hero text-2xl">Scanned Pages ({pages.length})</h1>
          </div>

          <button
            onClick={() => startCamera()}
            className="btn btn-secondary btn-sm touch-target"
          >
            <Plus className="w-4 h-4 text-teal" />
            <span>Scan Another Page</span>
          </button>
        </div>

        {pages.length === 0 ? (
          <div className="card p-8 text-center mb-8">
            <p className="subtext mb-4">No pages scanned yet.</p>
            <button onClick={() => startCamera()} className="btn btn-primary">
              <Camera className="w-4 h-4" />
              Scan First Page
            </button>
          </div>
        ) : (
          <div className="pages-review-grid mb-8">
            {pages.map((page, idx) => (
              <div key={page.id} className="card page-review-card">
                <div className="page-thumbnail-box" onClick={() => setPreviewPage(page)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={page.dataUrl} alt={`Scanned page ${idx + 1}`} className="page-thumbnail-img" />
                  <span className="page-number-pill">Page {idx + 1}</span>
                  <div className="thumbnail-hover-overlay">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="page-card-actions">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleMovePage(idx, 'up')}
                      disabled={idx === 0}
                      className="btn-icon touch-target"
                      title="Move Up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMovePage(idx, 'down')}
                      disabled={idx === pages.length - 1}
                      className="btn-icon touch-target"
                      title="Move Down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleRetakePage(idx)}
                      className="btn-icon touch-target text-teal"
                      title="Retake Page"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePage(idx)}
                      className="btn-icon touch-target text-rose"
                      title="Delete Page"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center gap-4">
          <button
            onClick={() => startCamera()}
            className="btn btn-secondary btn-lg"
          >
            <Plus className="w-4 h-4" />
            Scan Another Page
          </button>

          <button
            onClick={() => setStep('details')}
            disabled={pages.length === 0}
            className="btn btn-primary btn-lg"
          >
            <span>Continue to Paper Details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Fullscreen Page Preview Modal */}
        {previewPage && (
          <div className="modal-overlay" onClick={() => setPreviewPage(null)}>
            <div className="modal-card max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex-between mb-4">
                <h3 className="h2-title text-lg">Page Preview</h3>
                <button onClick={() => setPreviewPage(null)} className="btn btn-secondary btn-sm">
                  Close
                </button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewPage.dataUrl} alt="Preview" className="w-full h-auto rounded" />
            </div>
          </div>
        )}

        <style jsx>{`
          .flex-between { display: flex; align-items: center; justify-content: space-between; }
          .pages-review-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 1.25rem;
          }
          .page-review-card {
            padding: 0.875rem;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
          .page-thumbnail-box {
            position: relative;
            height: 240px;
            background-color: var(--bg-surface-subtle);
            border-radius: var(--radius-md);
            overflow: hidden;
            cursor: pointer;
          }
          .page-thumbnail-img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          .page-number-pill {
            position: absolute;
            top: 0.5rem;
            left: 0.5rem;
            background-color: rgba(17, 24, 39, 0.85);
            color: #FFFFFF;
            padding: 0.2rem 0.5rem;
            border-radius: var(--radius-sm);
            font-size: 0.75rem;
            font-weight: 700;
          }
          .thumbnail-hover-overlay {
            position: absolute;
            inset: 0;
            background-color: rgba(0, 0, 0, 0.4);
            opacity: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.15s ease;
          }
          .page-thumbnail-box:hover .thumbnail-hover-overlay {
            opacity: 1;
          }
          .page-card-actions {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .btn-icon {
            background: none;
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-sm);
            width: 34px;
            height: 34px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--text-secondary);
          }
          .btn-icon:disabled {
            opacity: 0.3;
            cursor: not-allowed;
          }
          @media (max-width: 639px) {
            .pages-review-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 0.75rem;
            }
            .page-thumbnail-box {
              height: 180px;
            }
            .btn-icon {
              width: 38px;
              height: 38px;
            }
          }
          @media (max-width: 380px) {
            .pages-review-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    );
  }

  // STEP 4: Paper Metadata Form
  if (step === 'details') {
    return (
      <div className="container max-w-2xl">
        <div className="mb-6">
          <button onClick={() => setStep('review')} className="back-link mb-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Scanned Pages ({pages.length})</span>
          </button>
          <div className="eyebrow">FINAL DETAILS</div>
          <h1 className="h1-hero text-2xl">Paper Information</h1>
        </div>

        {duplicateAlert && (
          <div className="card duplicate-alert-card mb-6">
            <AlertTriangle className="w-6 h-6 text-amber flex-shrink-0" />
            <div>
              <h4 className="font-bold text-amber-900">Duplicate File Warning</h4>
              <p className="text-sm text-amber-800 mb-3">{duplicateAlert.message}</p>
              {duplicateAlert.existingPaperId && (
                <Link href={`/papers/${duplicateAlert.existingPaperId}`} className="btn btn-secondary btn-sm">
                  View Existing Paper <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}

        {submitError && (
          <div className="error-box mb-6">
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="upload-form-editorial">
          <div className="form-group mb-4">
            <label className="form-label">Paper Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Anatomy Paper I — Upper Limb & Thorax"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="grid-form-2 mb-4">
            <div className="form-group">
              <label className="form-label">Medical Subject *</label>
              <select
                required
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="input-field"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Exam Type *</label>
              <select
                required
                value={examTypeId}
                onChange={(e) => setExamTypeId(e.target.value)}
                className="input-field"
              >
                {examTypes.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-form-3 mb-4">
            <div className="form-group">
              <label className="form-label">MBBS Stage *</label>
              <select
                value={mbbsYear}
                onChange={(e) => setMbbsYear(e.target.value)}
                className="input-field"
              >
                <option value="1st MBBS">1st MBBS</option>
                <option value="2nd MBBS">2nd MBBS</option>
                <option value="3rd MBBS">3rd MBBS</option>
                <option value="Final MBBS">Final MBBS</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Exam Year *</label>
              <select
                value={examYear}
                onChange={(e) => setExamYear(e.target.value)}
                className="input-field"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Semester (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Semester 1"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="form-group mb-6">
            <label className="form-label">Topics / Notes (Optional)</label>
            <textarea
              rows={3}
              placeholder="e.g. Scanned theory paper covering Brachial Plexus injury..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg w-full touch-target"
          >
            <Upload className="w-5 h-5" />
            {submitting ? 'Publishing Scanned Paper...' : `Publish Scanned Paper (${pages.length} Pages)`}
          </button>
        </form>

        <style jsx>{`
          .back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-muted);
            background: none;
            border: none;
            cursor: pointer;
          }
          .duplicate-alert-card {
            background-color: #FFFBEB;
            border: 1px solid #FDE68A;
            display: flex;
            gap: 1rem;
            padding: 1.25rem;
          }
          .error-box {
            background-color: var(--accent-rose-light);
            color: #9F1239;
            padding: 0.875rem 1.25rem;
            border-radius: var(--radius-md);
            font-weight: 600;
          }
          .w-full { width: 100%; }
        `}</style>
      </div>
    );
  }

  // STEP 5: Success State Confirmation
  if (step === 'success' && publishedPaper) {
    return (
      <div className="container max-w-2xl py-12">
        <div className="card text-center p-8 bg-success-card">
          <CheckCircle2 className="w-16 h-16 text-emerald mx-auto mb-4" />
          <h1 className="h1-hero text-2xl mb-2">Question Paper Published!</h1>
          <p className="subtext mb-6">
            Your scanned paper <strong>&quot;{publishedPaper.title}&quot;</strong> ({pages.length} pages) is now live in the PaperMD archive.
          </p>

          <div className="flex justify-center gap-4">
            <Link href={`/papers/${publishedPaper.id}`} className="btn btn-primary btn-lg">
              <FileText className="w-5 h-5" />
              View Published Paper
            </Link>
            <button
              onClick={() => {
                setPages([]);
                setTitle('');
                setDescription('');
                setPublishedPaper(null);
                setStep('prompt');
              }}
              className="btn btn-secondary btn-lg"
            >
              Scan Another Paper
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
