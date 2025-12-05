import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import config from "@/config";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { ClerkProvider } from "@clerk/nextjs";

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
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`}>
        <Script
          id="suppress-clerk-errors"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                if (e.message && (e.message.includes('Clerk') || e.message.includes('failed_to_load_clerk'))) {
                  e.preventDefault();
                  return false;
                }
              }, true);
              if (typeof window !== 'undefined' && window.console) {
                const originalWarn = console.warn;
                console.warn = function(...args) {
                  if (args[0] && typeof args[0] === 'string' && args[0].includes('Clerk')) {
                    if (args[0].includes('development keys') || args[0].includes('afterSignInUrl') || args[0].includes('deprecated')) {
                      return;
                    }
                  }
                  originalWarn.apply(console, args);
                };
              }
            `,
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {clerkKey ? (
            <ClerkProvider publishableKey={clerkKey}>
              {children}
            </ClerkProvider>
          ) : (
            children
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
