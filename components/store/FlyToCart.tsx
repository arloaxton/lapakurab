"use client";

import { useStore } from "./StoreProvider";

export function FlyToCart() {
  const { flyAnim } = useStore();
  if (!flyAnim) return null;

  return (
    <div
      key={flyAnim.ts}
      ref={(el) => {
        if (!el) return;
        const cartBtn = document.querySelector("[data-cart-target]");
        const target = cartBtn
          ? cartBtn.getBoundingClientRect()
          : ({
              left: window.innerWidth - 200,
              top: 30,
              width: 0,
              height: 0,
            } as DOMRect);
        const dx = target.left + 20 - flyAnim.rect.left;
        const dy = target.top + 20 - flyAnim.rect.top;
        el.animate(
          [
            { transform: "translate(0,0) scale(1)", opacity: 1 },
            {
              transform: `translate(${dx * 0.5}px, ${dy * 0.3}px) scale(0.8)`,
              opacity: 0.9,
              offset: 0.5,
            },
            {
              transform: `translate(${dx}px, ${dy}px) scale(0.2)`,
              opacity: 0,
            },
          ],
          { duration: 700, easing: "cubic-bezier(.5,0,.7,1)" }
        );
      }}
      style={{
        position: "fixed",
        left: flyAnim.rect.left,
        top: flyAnim.rect.top,
        width: 38,
        height: 38,
        borderRadius: "50%",
        background: `oklch(0.85 0.15 ${flyAnim.hue})`,
        zIndex: 300,
        pointerEvents: "none",
      }}
    />
  );
}
