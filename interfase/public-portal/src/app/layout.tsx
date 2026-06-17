import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Citizens Portal | Federal Police Service",
  description: "Official public portal for citizens to access police services and information.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
