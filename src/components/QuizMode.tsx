import { useState, useCallback } from "react";
import type { ReflexPoint } from "../data/points";
import { SYSTEM_MAP } from "../data/systems";

interface QuizModeProps {
  points: ReflexPoint[];
  activeSystems: Set<string>;
  onExit: () => void;
}

interface QuizQuestion {
  point: ReflexPoint;
  options: string[];
  correctIndex: number;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildQuestion(point: ReflexPoint, allPoints: ReflexPoint[]): QuizQuestion {
  const distractors = shuffle(allPoints.filter((p) => p.id !== point.id))
    .slice(0, 3)
    .map((p) => p.name);
  const options = shuffle([point.name, ...distractors]);
  return { point, options, correctIndex: options.indexOf(point.name) };
}

export function QuizMode({ points, activeSystems, onExit }: QuizModeProps) {
  const filteredPoints = points.filter((p) => p.systemIds.some((id) => activeSystems.has(id)));
  const [questions] = useState<QuizQuestion[]>(() =>
    shuffle(filteredPoints).slice(0, Math.min(10, filteredPoints.length)).map((p) => buildQuestion(p, filteredPoints))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = questions[currentIndex];
  const primarySystem = current ? SYSTEM_MAP[current.point.systemIds[0]] : null;

  const handleAnswer = useCallback(
    (optionIndex: number) => {
      if (selected !== null) return;
      setSelected(optionIndex);
      if (optionIndex === current.correctIndex) {
        setScore((s) => s + 1);
      }
    },
    [selected, current]
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
    }
  }, [currentIndex, questions.length]);

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  if (filteredPoints.length < 2) {
    return (
      <div className="quiz-container">
        <div className="quiz-empty">
          <p>Enable more body systems to start the quiz!</p>
          <button className="btn-primary" onClick={onExit}>Back to Explorer</button>
        </div>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="quiz-container">
        <div className="quiz-result">
          <div className="quiz-result__score">
            <span>{score}</span>
            <small>/ {questions.length}</small>
          </div>
          <h2>{pct >= 80 ? "Excellent! 🎉" : pct >= 60 ? "Good work! 💪" : "Keep practising! 📚"}</h2>
          <p className="quiz-result__pct">{pct}% correct</p>
          <div className="quiz-result__actions">
            <button className="btn-primary" onClick={handleRestart}>Try Again</button>
            <button className="btn-secondary" onClick={onExit}>Back to Explorer</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <span className="quiz-progress">
          Question {currentIndex + 1} / {questions.length}
        </span>
        <span className="quiz-score">Score: {score}</span>
        <button className="btn-text-sm" onClick={onExit}>Exit Quiz</button>
      </div>

      <div className="quiz-progress-bar">
        <div
          className="quiz-progress-bar__fill"
          style={{
            width: `${((currentIndex) / questions.length) * 100}%`,
            background: primarySystem?.color,
          }}
        />
      </div>

      <div className="quiz-question">
        <div className="quiz-system-tag" style={{ background: primarySystem?.color }}>
          {primarySystem?.icon} {primarySystem?.name}
        </div>
        <h2 className="quiz-question__text">What is this structure?</h2>
        <p className="quiz-question__hint">{current.point.biology.role}</p>
      </div>

      <div className="quiz-options">
        {current.options.map((option, i) => {
          let cls = "quiz-option";
          if (selected !== null) {
            if (i === current.correctIndex) cls += " quiz-option--correct";
            else if (i === selected && selected !== current.correctIndex) cls += " quiz-option--wrong";
          }
          return (
            <button key={option} className={cls} onClick={() => handleAnswer(i)}>
              <span className="quiz-option__letter">{["A", "B", "C", "D"][i]}</span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="quiz-feedback">
          <p className={selected === current.correctIndex ? "quiz-feedback--correct" : "quiz-feedback--wrong"}>
            {selected === current.correctIndex
              ? "✓ Correct!"
              : `✗ Correct answer: ${current.options[current.correctIndex]}`}
          </p>
          <p className="quiz-feedback__detail">{current.point.biology.detail.split(".")[0]}.</p>
          <button className="btn-primary" onClick={handleNext}>
            {currentIndex + 1 >= questions.length ? "See Results" : "Next Question →"}
          </button>
        </div>
      )}
    </div>
  );
}
