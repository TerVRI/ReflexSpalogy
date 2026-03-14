import { useCallback, useEffect, useRef, useState } from "react";

export interface AudioState {
  speaking: boolean;
  paused: boolean;
  supported: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
}

export function useAudio() {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [state, setState] = useState<AudioState>({
    speaking: false,
    paused: false,
    supported: typeof window !== "undefined" && "speechSynthesis" in window,
    voices: [],
    selectedVoice: null,
    rate: 0.92,
    pitch: 1.0,
  });

  useEffect(() => {
    if (!state.supported) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        // Prefer natural English voices
        const preferred =
          available.find((v) => v.lang.startsWith("en") && v.localService && v.name.toLowerCase().includes("samantha")) ||
          available.find((v) => v.lang.startsWith("en") && v.localService) ||
          available.find((v) => v.lang.startsWith("en")) ||
          available[0];
        setState((s) => ({ ...s, voices: available, selectedVoice: preferred || null }));
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [state.supported]);

  const speak = useCallback(
    (text: string) => {
      if (!state.supported) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (state.selectedVoice) utterance.voice = state.selectedVoice;
      utterance.rate = state.rate;
      utterance.pitch = state.pitch;
      utterance.onstart = () => setState((s) => ({ ...s, speaking: true, paused: false }));
      utterance.onend = () => setState((s) => ({ ...s, speaking: false, paused: false }));
      utterance.onerror = () => setState((s) => ({ ...s, speaking: false, paused: false }));
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [state.supported, state.selectedVoice, state.rate, state.pitch]
  );

  const pause = useCallback(() => {
    if (!state.supported) return;
    window.speechSynthesis.pause();
    setState((s) => ({ ...s, paused: true }));
  }, [state.supported]);

  const resume = useCallback(() => {
    if (!state.supported) return;
    window.speechSynthesis.resume();
    setState((s) => ({ ...s, paused: false }));
  }, [state.supported]);

  const stop = useCallback(() => {
    if (!state.supported) return;
    window.speechSynthesis.cancel();
    setState((s) => ({ ...s, speaking: false, paused: false }));
  }, [state.supported]);

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setState((s) => ({ ...s, selectedVoice: voice }));
  }, []);

  const setRate = useCallback((rate: number) => {
    setState((s) => ({ ...s, rate }));
  }, []);

  return { ...state, speak, pause, resume, stop, setVoice, setRate };
}
