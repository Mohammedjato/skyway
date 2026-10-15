import type { Metadata } from "next";
import Nav from "@/components/Nav";
import SkyBackground from "@/components/SkyBackground";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skyway — book flights, track arrivals",
  description: "Search and book flights, then follow real-time arrivals and delays.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: browser extensions (Grammarly, password managers...)
    // add attributes to <html>/<body> before React loads. That is harmless, and this
    // flag tells React not to complain about attributes it didn't render itself.
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SkyBackground />
        <Nav />
        <main className="wrap-page">{children}</main>
        <footer className="wrap-page muted small foot">
          Skyway demo · Fares are simulated. Flight status is live when an AviationStack key is configured.
        </footer>
      </body>
    </html>
  );
}
