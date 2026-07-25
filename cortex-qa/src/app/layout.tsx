import type { Metadata } from "next";
import "./globals.css";
import { RootProvider } from "@/providers/RootProvider";

export const metadata: Metadata = {
  title: "CORTEX-QA | Factory Quality Management Platform",
  description: "Enterprise Offline-First Quality Control & Compliance System for Panel Manufacturing.",
  icons: {
    icon: "/favicon.svg",
  },
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
      <body className="min-h-full flex flex-col">
        <RootProvider>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
