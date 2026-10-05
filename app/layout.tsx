import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Euloges",
  description: "Honoring lives. Preserving memories.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
