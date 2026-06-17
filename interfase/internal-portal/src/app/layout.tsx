import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Internal Operations | Federal Police",
  description: "Restricted access portal for authorized personnel only.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50">
        {children}
      </body>
    </html>
  );
}
