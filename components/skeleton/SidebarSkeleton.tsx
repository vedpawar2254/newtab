export function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-[8px]">
      <div
        className="rounded h-[16px] w-[120px]"
        style={{
          background: 'linear-gradient(90deg, #252525 25%, #2F2F2F 50%, #252525 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s linear infinite',
        }}
      />
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="rounded h-[12px] w-[180px]"
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
