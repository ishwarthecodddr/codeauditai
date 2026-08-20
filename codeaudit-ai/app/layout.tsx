import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeAudit AI - Autonomous Code Review",
  description: "Autonomous multi-agent code analysis & refactoring engine powered by LangGraph and Gemini.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
