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
      <body className={inter.className + "h-min-screen"}>
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
      <footer>
        <div className="container mx-auto py-6 text-center">
          <a
            href="https://maravian.com"
            target="_blank"
            className="text-center text-gray-500"
          >
            &copy; {new Date().getFullYear()} Maravian
          </a>
        </div>
        {/* <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4">
          <p className="text-center">
            This is a private event. Unauthorized access is prohibited.
          </p>
        </div> */}
      </footer>
    </html>
  );
}
