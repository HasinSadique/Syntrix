import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata = {
  title: "Syntrix Platform",
  description: "Production-style SaaS for NDIS providers"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-zinc-50 text-zinc-950 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
