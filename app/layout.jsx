import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Raleway } from "next/font/google";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const raleway = Raleway({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-raleway',
});

export const metadata = {
  title: "Sporium",
  description: "Sporium",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${raleway.variable} ${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
