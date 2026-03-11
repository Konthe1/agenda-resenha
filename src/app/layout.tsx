import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agenda Resenha PRO | Sistema de Gestão para Barbearias",
  description: "A única plataforma focada no lucro do dono. Agendamento 24h, disparo automático de WhatsApp, controle de equipe e fidelidade de clientes. Especialize-se na tesoura e deixe a tecnologia lotar sua agenda.",
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
