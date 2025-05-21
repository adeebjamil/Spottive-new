import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "../components/Footer";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Spottive",
  description: "Your modern web application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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