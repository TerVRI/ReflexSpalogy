import type { AudioState } from "../hooks/useAudio";

interface AudioPlayerProps {
  audio: AudioState & {
    speak: (text: string) => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    setVoice: (voice: SpeechSynthesisVoice) => void;
    setRate: (rate: number) => void;
  };
  script: string;
  label?: string;
}

export function AudioPlayer({ audio, script, label = "Listen" }: AudioPlayerProps) {
  if (!audio.supported) return null;

  const handleToggle = () => {
    if (audio.speaking && !audio.paused) {
      audio.pause();
    } else if (audio.paused) {
      audio.resume();
    } else {
      audio.speak(script);
    }
  };

  return (
    <div className="audio-player">
      <button
        className={`audio-btn ${audio.speaking ? "audio-btn--playing" : ""}`}
        onClick={handleToggle}
        title={audio.speaking ? (audio.paused ? "Resume" : "Pause") : label}
      >
        {audio.speaking && !audio.paused ? (
          <PauseIcon />
        ) : audio.paused ? (
          <PlayIcon />
        ) : (
          <SpeakerIcon />
        )}
        <span>{audio.speaking && !audio.paused ? "Pause" : audio.paused ? "Resume" : label}</span>
        {audio.speaking && <SoundWave />}
      </button>

      {audio.speaking && (
        <button className="audio-stop-btn" onClick={audio.stop} title="Stop">
          <StopIcon />
        </button>
      )}

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
        <span>{audio.rate.toFixed(1)}×</span>
      </div>
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

function SoundWave() {
  return (
    <span className="sound-wave">
      <span />
      <span />
      <span />
    </span>
  );
}
