import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resenha - Agenda para Barbearias",
  description: "O sistema de agendamento que fala a língua da barbearia nordestina.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}
