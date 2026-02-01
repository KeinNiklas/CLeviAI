import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/LanguageContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CLeviAI - Document to Knowledge",
  description: "Transform your documents into interactive learning journeys with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 sticky top-0">
              <div className="container flex h-14 max-w-screen-2xl items-center px-4">
                <div className="mr-4 hidden md:flex">
                  <a className="mr-6 flex items-center space-x-2 font-bold" href="/">CLeviAI</a>
                  <nav className="flex items-center gap-6 text-sm">
                    <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="/plan">New Journey</a>
                    <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="/dashboard">Profile & Dashboard</a>
                  </nav>
                </div>
              </div>
            </nav>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
