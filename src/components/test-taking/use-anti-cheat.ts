"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import hark from "hark";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";
import { communityApi } from "@/lib/api-modules";
import { MAX_STRIKES, RETURN_COUNTDOWN_SEC, STRIKE_MESSAGES, StrikeMessage } from "./constants";

// ------------------------------------------------------------
// Return value shape
// ------------------------------------------------------------
export interface AntiCheatState {
  sessionStarted: boolean;
  strikes: number;
  showWarningModal: boolean;
  currentWarning: StrikeMessage;
  sessionTerminated: boolean;
  violationLog: string[];
  returnCountdown: number | null;
  countdownReason: string;
  mediaStream: MediaStream | null;
  proctoringWarning: string | null;
}

export interface AntiCheatActions {
  handleStartSession: () => void;
  cancelReturnCountdown: () => void;
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => void;
  setShowWarningModal: (v: boolean) => void;
}

export interface UseAntiCheatOptions {
  communityId: string;
  testId: string;
  initialStrikes?: number;
  initialViolationLog?: string[];
  isSubmittingRef: React.MutableRefObject<boolean>;
  onForceSubmit: () => void;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  hasSubmitted?: boolean;
}

// ------------------------------------------------------------
// Hook
// ------------------------------------------------------------
export function useAntiCheat({
  communityId,
  testId,
  initialStrikes = 0,
  initialViolationLog = [],
  isSubmittingRef,
  onForceSubmit,
  videoRef,
  hasSubmitted = false,
}: UseAntiCheatOptions): AntiCheatState & AntiCheatActions {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [strikes, setStrikes] = useState(initialStrikes);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [currentWarning, setCurrentWarning] = useState<StrikeMessage>(
    STRIKE_MESSAGES[initialStrikes > 0 ? Math.min(initialStrikes - 1, 1) : 0]
  );
  const [sessionTerminated, setSessionTerminated] = useState(initialStrikes >= MAX_STRIKES);
  const [violationLog, setViolationLog] = useState<string[]>(initialViolationLog);
  const [returnCountdown, setReturnCountdown] = useState<number | null>(null);
  const [countdownReason, setCountdownReason] = useState("");
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [proctoringWarning, setProctoringWarning] = useState<string | null>(null);

  // Refs
  const strikesRef = useRef(initialStrikes);
  const sessionTerminatedRef = useRef(initialStrikes >= MAX_STRIKES);
  const sessionStartedRef = useRef(false);
  const lastStrikeTimeRef = useRef(0);
  const returnCountdownRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioViolationCountRef = useRef(0);
  const faceViolationCountRef = useRef(0);
  const sessionStartTimeRef = useRef(0);
  const detectorRef = useRef<FaceDetector | null>(null);
  const speechRef = useRef<any>(null);
  const speakingStartRef = useRef<number | null>(null);

  const onForceSubmitRef = useRef(onForceSubmit);
  useEffect(() => {
    onForceSubmitRef.current = onForceSubmit;
  }, [onForceSubmit]);

  // ------------------------------------------------------------
  // Sync state with initial values
  // ------------------------------------------------------------
  useEffect(() => {
    if (hasSubmitted) return;

    if (initialStrikes > strikesRef.current) {
      setStrikes(initialStrikes);
      strikesRef.current = initialStrikes;
      if (initialStrikes >= MAX_STRIKES) {
        setSessionTerminated(true);
        sessionTerminatedRef.current = true;
        setCurrentWarning(STRIKE_MESSAGES[2]);
        setTimeout(() => onForceSubmitRef.current(), 500);
      } else {
        const warningIdx = Math.max(0, initialStrikes - 1);
        setCurrentWarning(STRIKE_MESSAGES[Math.min(warningIdx, 1)]);
      }
    }
    if (initialViolationLog.length > violationLog.length) {
      setViolationLog(initialViolationLog);
    }
  }, [initialStrikes, initialViolationLog, hasSubmitted, violationLog.length]);

  // ------------------------------------------------------------
  // MediaPipe initial loader
  // ------------------------------------------------------------
  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          minDetectionConfidence: 0.4,
          minSuppressionThreshold: 0.4,
        });
        detectorRef.current = detector;
      } catch (err) {
        console.error("MediaPipe failed to load.", err);
      }
    };
    initMediaPipe();

    return () => {
      detectorRef.current?.close();
    };
  }, []);

  // ------------------------------------------------------------
  // Fullscreen helpers
  // ------------------------------------------------------------
  const enterFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
        if ("keyboard" in navigator && (navigator as any).keyboard?.lock) {
          try {
            await (navigator as any).keyboard.lock(["Escape"]);
          } catch {
            // Ignore keyboard lock failures.
          }
        }
      }
    } catch (err) {
      console.warn("Fullscreen error", err);
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, []);

  // ------------------------------------------------------------
  // Start session
  // ------------------------------------------------------------
  const handleStartSession = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;
      setMediaStream(stream);
      if (videoRef?.current) videoRef.current.srcObject = stream;

      const speech = hark(stream, {
        interval: 300,
        threshold: -52,
      });

      speechRef.current = speech;

      speech.on("speaking", () => {
        if (!speakingStartRef.current) {
          speakingStartRef.current = Date.now();
        }
      });

      speech.on("stopped_speaking", () => {
        speakingStartRef.current = null;
      });

      sessionStartedRef.current = true;
      sessionStartTimeRef.current = Date.now();
      setSessionStarted(true);
      enterFullscreen();
    } catch (err) {
      toast.error("Camera and Microphone access are required.");
      console.error(err);
    }
  }, [enterFullscreen, videoRef]);

  // ------------------------------------------------------------
  // Countdown helpers
  // ------------------------------------------------------------
  const cancelReturnCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    returnCountdownRef.current = null;
    setReturnCountdown(null);
    window.focus();
    lastStrikeTimeRef.current = 0;
  }, []);

  // ------------------------------------------------------------
  // Core violation handler
  // ------------------------------------------------------------
  const handleViolation = useCallback(
    async (reason: string) => {
      if (isSubmittingRef.current || hasSubmitted) return;
      if (sessionTerminatedRef.current || !sessionStartedRef.current) return;

      const now = Date.now();
      if (now - lastStrikeTimeRef.current < 1500) return;
      lastStrikeTimeRef.current = now;

      const newStrikeCount = strikesRef.current + 1;
      strikesRef.current = newStrikeCount;
      setStrikes(newStrikeCount);
      const timestamp = new Date().toLocaleTimeString();
      setViolationLog((prev) => [
        ...prev,
        `Strike ${newStrikeCount}: ${reason} at ${timestamp}`,
      ]);

      try {
        await communityApi.logViolation(communityId, testId, reason, newStrikeCount);
      } catch (err) {
        console.error("Violation logging failed", err);
      }

      if (newStrikeCount >= MAX_STRIKES) {
        sessionTerminatedRef.current = true;
        setSessionTerminated(true);
        setCurrentWarning(STRIKE_MESSAGES[2]);
        setShowWarningModal(true);
        onForceSubmitRef.current();
        return;
      }

      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }

      setCountdownReason(reason);
      setCurrentWarning(STRIKE_MESSAGES[newStrikeCount - 1]);
      returnCountdownRef.current = RETURN_COUNTDOWN_SEC;
      setReturnCountdown(RETURN_COUNTDOWN_SEC);

      countdownIntervalRef.current = setInterval(() => {
        const next = (returnCountdownRef.current ?? 1) - 1;
        returnCountdownRef.current = next;
        setReturnCountdown(next);
        if (next <= 0) {
          clearInterval(countdownIntervalRef.current!);
          countdownIntervalRef.current = null;
          sessionTerminatedRef.current = true;
          setSessionTerminated(true);
          setCurrentWarning(STRIKE_MESSAGES[2]);
          setShowWarningModal(false);
          setTimeout(() => onForceSubmitRef.current(), 100);
        }
      }, 1000);

      toast.warning(`Violation ${newStrikeCount}/${MAX_STRIKES}: ${reason}`);
    },
    [communityId, testId, isSubmittingRef, hasSubmitted]
  );

  // ------------------------------------------------------------
  // Detection loop
  // ------------------------------------------------------------
  useEffect(() => {
    if (!sessionStarted || hasSubmitted) return;

    const detectionInterval = setInterval(async () => {
      if (isSubmittingRef.current || sessionTerminatedRef.current || hasSubmitted) return;
      if (Date.now() - sessionStartTimeRef.current < 5000) return;

      let currentFaceIssue: string | null = null;
      let currentAudioIssue: string | null = null;

      // 1. Face (MediaPipe)
      const video = videoRef?.current;
      const detector = detectorRef.current;
      if (video && video.readyState >= 2 && detector && !hasSubmitted) {
        try {
          const results = detector.detectForVideo(video, Date.now());
          const detections = results.detections;
          const faceCount = detections.length;

          if (faceCount === 0 || faceCount > 1) {
            faceViolationCountRef.current++;
            currentFaceIssue =
              faceCount === 0
                ? "Face missing from camera feed"
                : "Multiple people detected in feed";

            if (faceViolationCountRef.current >= 12) {
              handleViolation(currentFaceIssue);
              faceViolationCountRef.current = 0;
            }
          } else {
            faceViolationCountRef.current = 0;
          }
        } catch {
          // AI errors handled silently
        }
      }

      // 2. Audio (Hark)
      if (speakingStartRef.current && !hasSubmitted) {
        const duration = Date.now() - speakingStartRef.current;

        if (duration > 6000) {
          currentAudioIssue = "Continuous speech detected";
          handleViolation(currentAudioIssue);
          speakingStartRef.current = Date.now();
        } else {
          currentAudioIssue = "Voice activity detected...";
        }
      }

      setProctoringWarning(currentFaceIssue || currentAudioIssue);
    }, 1500);

    return () => clearInterval(detectionInterval);
  }, [sessionStarted, handleViolation, videoRef, isSubmittingRef, hasSubmitted]);

  // ------------------------------------------------------------
  // Interaction listeners
  // ------------------------------------------------------------
  useEffect(() => {
    if (!sessionStarted || hasSubmitted) return;

    const onVisibility = () => {
      if (document.hidden) handleViolation("Tab switched / window hidden");
      else cancelReturnCountdown();
    };

    const onBlur = () => {
      setTimeout(() => {
        if (!document.hasFocus()) handleViolation("Window focus lost");
      }, 200);
    };

    const onFocus = () => cancelReturnCountdown();
    const onFullscreenChange = () => {
      if (
        !document.fullscreenElement &&
        sessionStartedRef.current &&
        !sessionTerminatedRef.current &&
        !isSubmittingRef.current
      ) {
        handleViolation("Fullscreen exited");
      }
    };

    const stopEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && ["t", "n", "w", "r", "u", "c", "v", "x", "a"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopImmediatePropagation();
        handleViolation(`Prohibited Shortcut: Ctrl+${e.key.toUpperCase()}`);
      } else if (e.key === "F5" || e.key === "F12") {
        e.preventDefault();
        handleViolation(`Prohibited Key: ${e.key}`);
      } else if (e.altKey && e.key === "Tab") {
        handleViolation("Alt+Tab detected");
      }
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      handleViolation("Right-click attempted");
    };
    const preventAction = (e: Event) => {
      e.preventDefault();
      handleViolation(`${e.type} attempted`);
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("keyup", stopEsc, true);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("copy", preventAction);
    document.addEventListener("paste", preventAction);
    document.addEventListener("cut", preventAction);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("keyup", stopEsc, true);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("copy", preventAction);
      document.removeEventListener("paste", preventAction);
      document.removeEventListener("cut", preventAction);
    };
  }, [sessionStarted, handleViolation, cancelReturnCountdown, isSubmittingRef, hasSubmitted]);

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    };
  }, []);

  return {
    sessionStarted,
    strikes,
    showWarningModal,
    currentWarning,
    sessionTerminated,
    violationLog,
    returnCountdown,
    countdownReason,
    mediaStream,
    proctoringWarning,
    handleStartSession,
    cancelReturnCountdown,
    enterFullscreen,
    exitFullscreen,
    setShowWarningModal,
  };
}
