import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OnzeMETs — Gestão de Clínica Cardíaca",
  description: "Sistema de Gestão de Clínica de Reabilitação Cardíaca",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
