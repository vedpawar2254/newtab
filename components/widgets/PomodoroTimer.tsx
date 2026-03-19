import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { usePomodoroStore } from '../../lib/stores/pomodoro-store';
import { CollapsibleSection } from './CollapsibleSection';
import { DurationConfig } from './DurationConfig';

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function PomodoroTimer() {
  const [showConfig, setShowConfig] = useState(false);

  const {
    workDuration,
    breakDuration,
    sessionsCompleted,
    isRunning,
    isBreak,
    timeRemaining,
    start,
    pause,
    reset,
    setWorkDuration,
    setBreakDuration,
  } = usePomodoroStore();

  useEffect(() => {
    usePomodoroStore.getState().loadFromStorage();
  }, []);

  const totalSeconds = isBreak ? breakDuration * 60 : workDuration * 60;
  const progress = totalSeconds > 0 ? timeRemaining / totalSeconds : 0;

  return (
    <CollapsibleSection id="pomodoro" title="POMODORO">
      <div className="flex flex-col items-center gap-[8px]">
        {/* SVG Ring */}
        <svg width={96} height={96} className="mx-auto">
          <circle
            cx={48}
            cy={48}
            r={RADIUS}
            fill="none"
            stroke="var(--color-timer-ring-bg)"
            strokeWidth={6}
          />
          <circle
            cx={48}
            cy={48}
            r={RADIUS}
            fill="none"
            stroke={isBreak ? 'var(--color-timer-ring-break)' : 'var(--color-timer-ring-active)'}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            transform="rotate(-90 48 48)"
            className="transition-[stroke] duration-300 ease-in-out"
          />
          <text
            x={48}
            y={48}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-text-primary text-[28px] font-semibold"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {formatTime(timeRemaining)}
          </text>
        </svg>

        {/* Control buttons */}
        <div className="flex items-center justify-center gap-[8px]">
          {!isRunning ? (
            <button
              type="button"
              onClick={start}
              className="h-[32px] px-[12px] text-[14px] rounded-[4px] text-accent border border-accent/30 bg-transparent hover:bg-white/5 transition-colors duration-150 cursor-pointer active:opacity-80 transition-all duration-100"
            >
              Start
            </button>
          ) : (
            <button
              type="button"
              onClick={pause}
              className="h-[32px] px-[12px] text-[14px] rounded-[4px] text-warning border border-warning/30 bg-transparent hover:bg-white/5 transition-colors duration-150 cursor-pointer active:opacity-80 transition-all duration-100"
            >
              Pause
            </button>
          )}
          <button
            type="button"
            onClick={reset}
            className="h-[32px] px-[12px] text-[14px] rounded-[4px] text-text-secondary border border-border bg-transparent hover:bg-white/5 transition-colors duration-150 cursor-pointer active:opacity-80 transition-all duration-100"
          >
            Reset
          </button>
        </div>

        {/* Session count + settings row */}
        <div className="flex w-full items-center justify-between pt-[8px]">
          <span className="text-[12px] text-text-secondary">
            {sessionsCompleted === 0 ? 'No sessions yet' : `Sessions: ${sessionsCompleted}`}
          </span>
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-[4px]"
          >
            <Settings
              size={16}
              className="text-text-secondary hover:text-text-primary transition-colors duration-150"
            />
          </button>
        </div>

        {/* Duration config */}
        {showConfig && (
          <div className="w-full">
            <DurationConfig
              workDuration={workDuration}
              breakDuration={breakDuration}
              onWorkChange={setWorkDuration}
              onBreakChange={setBreakDuration}
            />
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}
