import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import config from "@/config";
import { ThemeProvider } from "@/components/common/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${config.projectName} - ${config.projectDescription}`,
  description: `${config.projectDescription} - ${config.projectName}`,
  keywords: [`${config.projectName}`, `${config.projectDescription}`],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
