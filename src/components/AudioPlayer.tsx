import { useState } from "react";
import type { AudioState } from "../hooks/useAudio";
import { ELEVENLABS_VOICES } from "../hooks/useAudio";

interface AudioPlayerProps {
  audio: AudioState & {
    hasKey: boolean;
    error?: string;
    speak: (text: string) => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    setRate: (rate: number) => void;
    setElevenLabsVoice: (v: string) => void;
  };
  script: string;
  label?: string;
}

export function AudioPlayer({ audio, script, label = "Listen" }: AudioPlayerProps) {
  const [showVoices, setShowVoices] = useState(false);

  const handleToggle = () => {
    if (audio.loading) return;
    if (audio.speaking && !audio.paused) {
      audio.pause();
    } else if (audio.paused) {
      audio.resume();
    } else {
      audio.speak(script);
    }
  };

  if (!audio.hasKey) return null;

  const currentVoice = ELEVENLABS_VOICES.find((v) => v.id === audio.elevenlabsVoice);

  return (
    <div className="audio-player">
      <div className="audio-player__row">
        <button
          className={`audio-btn ${audio.speaking ? "audio-btn--playing" : ""} ${audio.loading ? "audio-btn--loading" : ""}`}
          onClick={handleToggle}
          title={audio.loading ? "Loading..." : audio.speaking ? (audio.paused ? "Resume" : "Pause") : label}
        >
          {audio.loading ? (
            <LoadingIcon />
          ) : audio.speaking && !audio.paused ? (
            <PauseIcon />
          ) : audio.paused ? (
            <PlayIcon />
          ) : (
            <SpeakerIcon />
          )}
          <span>
            {audio.loading ? "Loading..." : audio.speaking && !audio.paused ? "Pause" : audio.paused ? "Resume" : label}
          </span>
          {audio.speaking && !audio.loading && <SoundWave />}
        </button>

        {audio.speaking && (
          <button className="audio-stop-btn" onClick={audio.stop} title="Stop">
            <StopIcon />
          </button>
        )}

        <button
          className={`audio-settings-btn ${showVoices ? "audio-settings-btn--active" : ""}`}
          onClick={() => setShowVoices(!showVoices)}
          title="Choose voice"
        >
          <VoiceIcon />
          <span className="audio-provider-badge">{currentVoice?.name.split(" (")[0] ?? "Voice"}</span>
        </button>
      </div>

      <div className="audio-rate">
        <label htmlFor="rate-slider">Speed</label>
        <input
          id="rate-slider"
          type="range"
          min="0.5"
          max="1.5"
          step="0.1"
          value={audio.rate}
          onChange={(e) => audio.setRate(parseFloat(e.target.value))}
        />
        <span>{audio.rate.toFixed(1)}x</span>
      </div>

      {audio.error && (
        <div className="audio-error">{audio.error}</div>
      )}

      {showVoices && (
        <div className="tts-settings">
          <h4 className="tts-settings__title">Choose Voice</h4>
          <div className="tts-voice-list">
            {ELEVENLABS_VOICES.map((v) => (
              <button
                key={v.id}
                className={`tts-voice-btn ${audio.elevenlabsVoice === v.id ? "tts-voice-btn--active" : ""}`}
                onClick={() => audio.setElevenLabsVoice(v.id)}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <polygon points="3,2 13,8 3,14" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="3" y="2" width="4" height="12" rx="1" />
      <rect x="9" y="2" width="4" height="12" rx="1" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <rect x="3" y="3" width="10" height="10" rx="1.5" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 5.5h2.5l4-3v11l-4-3H2zM11 5.5a3.5 3.5 0 0 1 0 5M12.5 4a6 6 0 0 1 0 8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function VoiceIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM4 7a4 4 0 0 0 8 0" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <line x1="8" y1="12" x2="8" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5.5" y1="15" x2="10.5" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function LoadingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="audio-loading-spinner">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SoundWave() {
  return (
    <span className="sound-wave">
      <span />
      <span />
      <span />
    </span>
  );
}
