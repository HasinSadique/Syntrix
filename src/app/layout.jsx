import "./globals.css";

export const metadata = {
  title: "Syntrix",
  description: "Multi-tenant NDIS operations management prototype",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-[#0F172A] antialiased">
        {children}
      </body>
    </html>
  );
}
