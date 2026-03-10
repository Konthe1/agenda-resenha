import { redirect } from "next/navigation";

export default function DemoPage() {
  // Redireciona o usuário para o mini-site configurado como Demonstração base
  redirect("/resenhabarber");
}
