import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "../components/Footer";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Spottive - Smart Technology Solutions",
  description:
    "Cutting-edge security and networking solutions for homes, businesses, and smart cities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical hero image to improve LCP */}
        <link
          rel="preload"
          href="/hero1.png"
          as="image"
          type="image/png"
          fetchPriority="high"
        />
      </head>
      <body className="antialiased" cz-shortcut-listen="true">
        <AuthProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}