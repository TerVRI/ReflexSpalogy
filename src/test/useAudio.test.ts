import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudio, ELEVENLABS_VOICES } from "../hooks/useAudio";

describe("useAudio hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    try { localStorage.clear(); } catch { /* jsdom storage may not support clear */ }
    vi.stubGlobal("fetch", vi.fn());
  });

  it("initialises with correct defaults", () => {
    const { result } = renderHook(() => useAudio());
    expect(result.current.speaking).toBe(false);
    expect(result.current.paused).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.rate).toBe(1.0);
    expect(result.current.hasKey).toBe(true);
    expect(result.current.usingFallback).toBe(false);
  });

  it("defaults to first ElevenLabs voice", () => {
    const { result } = renderHook(() => useAudio());
    expect(result.current.elevenlabsVoice).toBe(ELEVENLABS_VOICES[0].id);
  });

  it("updates voice selection", () => {
    const { result } = renderHook(() => useAudio());
    const newVoice = ELEVENLABS_VOICES[2].id;

    act(() => {
      result.current.setElevenLabsVoice(newVoice);
    });

    expect(result.current.elevenlabsVoice).toBe(newVoice);
  });

  it("updates rate", () => {
    const { result } = renderHook(() => useAudio());

    act(() => {
      result.current.setRate(1.5);
    });

    expect(result.current.rate).toBe(1.5);
  });

  it("falls back to browser TTS when no API key", async () => {
    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await result.current.speak("Test text");
    });

    // Without a valid API key in test env, should attempt browser fallback
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });

  it("stopAll resets all state", () => {
    const { result } = renderHook(() => useAudio());

    act(() => {
      result.current.stop();
    });

    expect(result.current.speaking).toBe(false);
    expect(result.current.paused).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it("ElevenLabs voices list has at least 5 entries", () => {
    expect(ELEVENLABS_VOICES.length).toBeGreaterThanOrEqual(5);
    for (const v of ELEVENLABS_VOICES) {
      expect(v.id).toBeTruthy();
      expect(v.name).toBeTruthy();
    }
  });
});
