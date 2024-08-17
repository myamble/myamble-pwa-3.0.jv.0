import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { useEffect, useState } from "react";
import { TRPCReactProvider } from "~/trpc/react";
import { Providers } from "~/_Theme/Providers";
import Header from "~/components/shadcn/Header";
import Footer from "~/components/shadcn/Footer";
import { ServiceWorkerRegistration } from "~/components/ServiceWorkerRegistration";
import { cn } from "~/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "MyAmble",
  description: "Social work research and survey platform",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
        )}
      >
        <TRPCReactProvider cookies={cookies().toString()}>
          <Providers>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
            <ServiceWorkerRegistration />
          </Providers>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
