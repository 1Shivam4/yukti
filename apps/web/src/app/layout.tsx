import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yukti - AI Resume Builder",
  description: "Create professional resumes with AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
