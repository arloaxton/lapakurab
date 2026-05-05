import type { CSSProperties, ReactNode } from "react";

interface SkeletonProps {
  w?: number | string;
  h?: number | string;
  rounded?: number;
  style?: CSSProperties;
}

export function Skeleton({ w = "100%", h = 14, rounded = 4, style = {} }: SkeletonProps) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: rounded,
        background:
          "linear-gradient(90deg, var(--surface-2, #f0eee9) 0%, var(--border, #e5e5e5) 50%, var(--surface-2, #f0eee9) 100%)",
        backgroundSize: "200px 100%",
        animation: "lkSkeleton 1.4s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        padding: "14px 16px",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton
          key={i}
          h={14}
          w={i === 0 ? "40%" : "15%"}
          rounded={4}
          style={{ flex: i === 0 ? 2 : 1 }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ h = 120 }: { h?: number }) {
  return (
    <div
      style={{
        padding: 18,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
      }}
    >
      <Skeleton h={14} w="55%" />
      <div style={{ height: 8 }} />
      <Skeleton h={28} w="40%" />
      <div style={{ height: 14 }} />
      <Skeleton h={10} w="80%" />
      {h > 120 && <div style={{ height: h - 120 }} />}
    </div>
  );
}

interface SkeletonContainerProps {
  height?: number;
  children?: ReactNode;
}
export function SkeletonContainer({ height = 0, children }: SkeletonContainerProps) {
  return <div style={{ minHeight: height }}>{children}</div>;
}

/** Skeleton card mimicking ProductCard shape (image + name + price). */
export function SkeletonProductCard() {
  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: 18,
        border: "1.5px solid var(--border)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: 10, paddingBottom: 0 }}>
        <Skeleton w="100%" h={0} rounded={12} style={{ aspectRatio: "16 / 10" }} />
      </div>
      <div style={{ padding: 14 }}>
        <Skeleton w="70%" h={14} />
        <div style={{ height: 8 }} />
        <Skeleton w="90%" h={10} />
        <div style={{ height: 14 }} />
        <Skeleton w="40%" h={20} />
      </div>
    </div>
  );
}

/** Grid of skeleton product cards. */
export function SkeletonProductGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="lk-products-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
}
