import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VectorVerify",
  description: "Role-aware web app for monthly data quality control of mosquito-surveillance data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
