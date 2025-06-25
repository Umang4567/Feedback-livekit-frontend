import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-provider";
import "./globals.css";
import ThemeToggleButton from "@/lib/ThemeToggle";
import Header from "@/components/header";
// import ThemeToggleButton from '@/components/ThemeToggleButton'; // adjust path as needed

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "BuildFast Feedback - Share Your Thoughts.",
  description: "Share your feedback on BuildFast with AI workshops and events",
  keywords: [
    "AI",
    "feedback",
    "BuildFast",
    "AI workshops",
    "events",
    "artificial intelligence",
  ],
  icons: {
    icon: "/images/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <meta name="theme-color" content="#0c1217" />
      </head>
      <body className={`${poppins.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <Header />
          <main className="min-h-screen">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
