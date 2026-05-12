import type { ReactNode } from "react";
import { StoreProvider } from "@/components/store/StoreProvider";
import { TopBar } from "@/components/store/TopBar";
import { Footer } from "@/components/store/Footer";
import { FlyToCart } from "@/components/store/FlyToCart";
import { CartToast } from "@/components/store/CartToast";
import { CompareBar } from "@/components/store/CompareBar";
import { CompareModal } from "@/components/store/CompareModal";
import { ToastProvider } from "@/components/shared/ToastProvider";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <StoreProvider>
        <a href="#main" className="lk-skip-link">
          Lompat ke konten utama
        </a>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <TopBar />
          <main id="main" style={{ flex: 1 }}>
            {children}
          </main>
          <Footer />
        </div>
        <FlyToCart />
        <CartToast />
        <CompareBar />
        <CompareModal />
      </StoreProvider>
    </ToastProvider>
  );
}
