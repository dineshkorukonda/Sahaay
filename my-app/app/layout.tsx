import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Sahaay - Simple chronic care support for everyday life",
  description: "Helping underserved communities manage health with guidance, care access, and community support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased bg-background text-foreground flex min-h-screen`}
      >
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen transition-all duration-300 ease-in-out">
          {children}
        </main>
      </body>
    </html>
  );
}
