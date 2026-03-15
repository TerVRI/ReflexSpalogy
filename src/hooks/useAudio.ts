import { useCallback, useRef, useState } from "react";

export const ELEVENLABS_VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (calm, female)" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella (warm, female)" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni (male)" },
  { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli (young, female)" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh (deep, male)" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam (deep, male)" },
];

const VOICE_STORAGE_KEY = "reflexspalogy_elevenlabs_voice";
const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;

function loadStoredVoice(): string {
  try {
    const v = localStorage.getItem(VOICE_STORAGE_KEY);
    return v ? JSON.parse(v) : ELEVENLABS_VOICES[0].id;
  } catch {
    return ELEVENLABS_VOICES[0].id;
  }
}

export interface AudioState {
  speaking: boolean;
  paused: boolean;
  loading: boolean;
  elevenlabsVoice: string;
  rate: number;
  error?: string;
  usingFallback: boolean;
}

function speakBrowser(text: string, rate: number): SpeechSynthesisUtterance {
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = rate;
  utter.pitch = 1.0;
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("samantha"),
  ) ?? voices.find((v) => v.lang.startsWith("en-") && !v.localService) ?? voices.find((v) => v.lang.startsWith("en"));
  if (preferred) utter.voice = preferred;
  window.speechSynthesis.speak(utter);
  return utter;
}

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [state, setState] = useState<AudioState>({
    speaking: false,
    paused: false,
    loading: false,
    elevenlabsVoice: loadStoredVoice(),
    rate: 1.0,
    usingFallback: false,
  });

  const stopAll = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (utterRef.current) {
      window.speechSynthesis.cancel();
      utterRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setState((s) => ({ ...s, speaking: false, paused: false, loading: false }));
  }, []);

  const fallbackSpeak = useCallback(
    (text: string) => {
      stopAll();
      const utter = speakBrowser(text, state.rate);
      utterRef.current = utter;
      utter.onstart = () =>
        setState((s) => ({ ...s, speaking: true, paused: false, loading: false, usingFallback: true, error: undefined }));
      utter.onend = () =>
        setState((s) => ({ ...s, speaking: false, paused: false }));
      utter.onerror = () =>
        setState((s) => ({ ...s, speaking: false, paused: false, loading: false, error: "Browser speech failed" }));
    },
    [state.rate, stopAll],
  );

  const speak = useCallback(
    async (text: string) => {
      stopAll();

      if (!API_KEY) {
        fallbackSpeak(text);
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      setState((s) => ({ ...s, loading: true, error: undefined }));

      try {
        const res = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${state.elevenlabsVoice}`,
          {
            method: "POST",
            headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({
              text,
              model_id: "eleven_multilingual_v2",
              voice_settings: { stability: 0.5, similarity_boost: 0.75 },
            }),
            signal: controller.signal,
          },
        );

        if (!res.ok) {
          const body = await res.text().catch(() => "");
          let msg = `ElevenLabs error (${res.status})`;
          try {
            const parsed = JSON.parse(body);
            if (parsed?.detail?.message) msg = parsed.detail.message;
          } catch { /* use default msg */ }
          console.warn("ElevenLabs TTS failed, falling back to browser voice:", msg);
          setState((s) => ({ ...s, error: msg }));
          fallbackSpeak(text);
          return;
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.playbackRate = state.rate;
        audioRef.current = audio;

        audio.onplay = () =>
          setState((s) => ({ ...s, speaking: true, paused: false, loading: false, error: undefined, usingFallback: false }));
        audio.onended = () => {
          setState((s) => ({ ...s, speaking: false, paused: false }));
          URL.revokeObjectURL(url);
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          console.warn("Audio element failed, falling back to browser voice");
          fallbackSpeak(text);
        };
        await audio.play();
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.warn("ElevenLabs TTS error, falling back:", err);
          fallbackSpeak(text);
        }
      }
    },
    [state.elevenlabsVoice, state.rate, stopAll, fallbackSpeak],
  );

  const pause = useCallback(() => {
    if (utterRef.current) {
      window.speechSynthesis.pause();
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
    setState((s) => ({ ...s, paused: true }));
  }, []);

  const resume = useCallback(() => {
    if (utterRef.current) {
      window.speechSynthesis.resume();
    } else if (audioRef.current) {
      audioRef.current.play();
    }
    setState((s) => ({ ...s, paused: false }));
  }, []);

  const stop = useCallback(() => stopAll(), [stopAll]);

  const setRate = useCallback((rate: number) => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
    setState((s) => ({ ...s, rate }));
  }, []);

  const setElevenLabsVoice = useCallback((voice: string) => {
    try { localStorage.setItem(VOICE_STORAGE_KEY, JSON.stringify(voice)); } catch { /* noop */ }
    setState((s) => ({ ...s, elevenlabsVoice: voice }));
  }, []);

  return {
    ...state,
    hasKey: true,
    speak, pause, resume, stop,
    setRate, setElevenLabsVoice,
  };
}
