import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Procura SP - Serviços Públicos de São Paulo",
  description: "Encontre serviços públicos próximos a você em São Paulo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased font-roboto">
        <div className="min-h-screen main-gradient">
          {children}
        </div>
      </body>
    </html>
  );
}