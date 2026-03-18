interface DurationConfigProps {
  workDuration: number;
  breakDuration: number;
  onWorkChange: (mins: number) => void;
  onBreakChange: (mins: number) => void;
}

export function DurationConfig({
  workDuration,
  breakDuration,
  onWorkChange,
  onBreakChange,
}: DurationConfigProps) {
  function handleChange(value: string, setter: (mins: number) => void) {
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) return;
    setter(Math.max(1, Math.min(120, parsed)));
  }

  return (
    <div className="flex flex-col gap-[8px] pt-[8px] overflow-hidden transition-all duration-200 ease-in-out">
      <div className="flex items-center justify-between">
        <label className="text-[12px] text-text-secondary">Work (min)</label>
        <input
          type="number"
          min={1}
          max={120}
          value={workDuration}
          onChange={(e) => handleChange(e.target.value, onWorkChange)}
          className="w-[48px] h-[28px] bg-surface-elevated border border-border text-text-primary text-[14px] text-center rounded-[4px] outline-none focus:border-accent"
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="text-[12px] text-text-secondary">Break (min)</label>
        <input
          type="number"
          min={1}
          max={120}
          value={breakDuration}
          onChange={(e) => handleChange(e.target.value, onBreakChange)}
          className="w-[48px] h-[28px] bg-surface-elevated border border-border text-text-primary text-[14px] text-center rounded-[4px] outline-none focus:border-accent"
        />
      </div>
    </div>
  );
}
