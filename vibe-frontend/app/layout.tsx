import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/Toast";
import { AuthProvider } from "@/hooks/useAuth";

// Geist Mono се ползва от font-mono (часовникът в Navbar, 2FA кода).
// Sans шрифтът на сайта е системен (виж globals.css) — Geist Sans беше зареждан, но неизползван.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VibeCoding",
  description: "VibeCoding платформа",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bg"
      suppressHydrationWarning
      className={`${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Прилага темата преди render — иначе тъмната тема "мига" в бяло при зареждане */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var t = localStorage.getItem('theme');
              if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              }
            } catch (e) {}
          })();
        ` }} />
      </head>
      <body className="min-h-full flex flex-col">
          <AuthProvider>
            <ToastProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
            </ToastProvider>
          </AuthProvider>
        </body>
    </html>
  );
}
