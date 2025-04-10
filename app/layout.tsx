import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "@/components/auth-provider";
import { UserFooter } from "@/components/user-footer";
import { ImageSlideshow } from "@/components/image-slideshow";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Layla & Kondwani Celebration",
  description: "A special celebration for Layla & Kondwani",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{
        border: "10px solid green",
      }}
    >
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <UserFooter />
            {children}
            <ToastContainer position="bottom-right" autoClose={5000} />
          </AuthProvider>
        </ThemeProvider>
      </body>
      <ImageSlideshow />
    </html>
  );
}
