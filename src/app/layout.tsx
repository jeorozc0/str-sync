import type React from "react"
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "StrengthSync",
  description: "Track and organize your workouts",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Prevent auto-zoom on input focus in mobile browsers */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Toaster richColors theme="dark" />
        </ThemeProvider>
      </body>
    </html>
  )
}




