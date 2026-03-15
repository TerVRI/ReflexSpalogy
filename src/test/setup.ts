import "@testing-library/jest-dom/vitest";

// Mock speechSynthesis API
const mockUtterance = {
  rate: 1,
  pitch: 1,
  voice: null,
  text: "",
  onstart: null as (() => void) | null,
  onend: null as (() => void) | null,
  onerror: null as (() => void) | null,
};

Object.defineProperty(window, "speechSynthesis", {
  value: {
    speak: vi.fn((utter: SpeechSynthesisUtterance) => {
      Object.assign(mockUtterance, utter);
      setTimeout(() => utter.onstart?.call(utter, {} as SpeechSynthesisEvent), 0);
    }),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => [
      { lang: "en-US", name: "Samantha", localService: true } as SpeechSynthesisVoice,
    ]),
  },
  writable: true,
});

class MockUtterance {
  text: string;
  rate = 1;
  pitch = 1;
  voice: SpeechSynthesisVoice | null = null;
  onstart: ((ev: SpeechSynthesisEvent) => void) | null = null;
  onend: ((ev: SpeechSynthesisEvent) => void) | null = null;
  onerror: ((ev: SpeechSynthesisErrorEvent) => void) | null = null;
  constructor(text: string) { this.text = text; }
}
global.SpeechSynthesisUtterance = MockUtterance as unknown as typeof SpeechSynthesisUtterance;

// Mock Audio
global.Audio = vi.fn().mockImplementation(() => ({
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  src: "",
  playbackRate: 1,
  onplay: null,
  onended: null,
  onerror: null,
})) as unknown as typeof Audio;

// Mock URL.createObjectURL/revokeObjectURL
global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = vi.fn();
