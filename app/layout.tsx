import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { WashingMachineProvider } from "./contexts/WashingMachineContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AxoWash — ระบบจัดการเครื่องซักผ้า",
  description: "ระบบดูสถานะและจัดการเครื่องซักผ้า",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${inter.variable} antialiased`}>
        <LanguageProvider>
          <AuthProvider>
            <WashingMachineProvider>
              {children}
            </WashingMachineProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
