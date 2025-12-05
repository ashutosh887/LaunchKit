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
            <ClerkProvider
              publishableKey={clerkKey}
              afterSignInUrl="/dashboard"
              afterSignUpUrl="/dashboard"
            >
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
