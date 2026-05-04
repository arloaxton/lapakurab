import {
  DM_Sans,
  Space_Grotesk,
  Fraunces,
  JetBrains_Mono,
} from "next/font/google";

export const fontBody = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const fontEditorial = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-editorial",
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const fontVariables = [
  fontBody.variable,
  fontDisplay.variable,
  fontEditorial.variable,
  fontMono.variable,
].join(" ");
