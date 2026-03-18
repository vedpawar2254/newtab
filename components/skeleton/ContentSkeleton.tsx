export function ContentSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center gap-[8px] min-h-[60vh]">
      <div
        className="rounded h-[24px] w-[280px]"
        style={{
          background: 'linear-gradient(90deg, #252525 25%, #2F2F2F 50%, #252525 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s linear infinite',
        }}
      />
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="rounded h-[14px] w-[400px]"
          style={{
            background: 'linear-gradient(90deg, #252525 25%, #2F2F2F 50%, #252525 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s linear infinite',
          }}
        />
      ))}
    </div>
  );
}
