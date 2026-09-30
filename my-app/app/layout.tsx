import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "fileshare - v2",
  description: "Helping underserved communities manage health with guidance, care access, and community support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Intentional runtime crash for CARF automated rollback verification
  // Skip during build phase so npm run build succeeds, but crash at runtime on load
  if (process.env.NEXT_PHASE !== "phase-production-build" && process.env.npm_lifecycle_event !== "build") {
    throw new Error("Intentional runtime crash: CARF automated rollback test");
  }

  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased bg-background text-foreground`}
      >
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
