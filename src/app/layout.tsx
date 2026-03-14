import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swish Deutschland",
  description: "Professionelle Reinigungslösungen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
