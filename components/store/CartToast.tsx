"use client";

import { useStore } from "./StoreProvider";

/** Bottom-center pill toast, mint check icon — match design lama. */
export function CartToast() {
  const { cartToast } = useStore();
  if (!cartToast) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--ink)",
        color: "white",
        padding: "12px 20px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
        zIndex: 200,
        boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
        animation: "tk-toast 0.3s cubic-bezier(.3,1.4,.5,1)",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "var(--mint)",
          color: "var(--ink)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 800,
        }}
      >
        ✓
      </span>
      {cartToast.msg}
    </div>
  );
}
