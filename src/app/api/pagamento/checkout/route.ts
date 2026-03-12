import { NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

// Requer o token de acesso de produção (ou teste) do Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '', 
  options: { timeout: 5000 } 
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { barberiaId, email, name, planId } = body;

    if (!barberiaId || !email) {
      return NextResponse.json({ error: 'Faltam dados da barbearia' }, { status: 400 });
    }

    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.warn("Mercado Pago Access Token não encontrado no servidor.");
      // Se não tiver token, simulamos o sucesso para o frontend não quebrar,
      // retornando a URL do próprio site
      return NextResponse.json({ 
        init_point: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000' 
      });
    }

    const preApproval = new PreApproval(client);

    // Cria as opções do plano de assinatura (Recorrente)
    const result = await preApproval.create({
      body: {
        reason: 'Agenda Resenha PRO - Mensalidade',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: Number(process.env.MONTHLY_PRICE) || 149.90, 
          currency_id: 'BRL',
        },
        payer_email: email,
        back_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/financeiro`,
        status: 'pending',
        external_reference: String(barberiaId), // Super importante pra saber QUEM pagou no Webhook
      }
    });

    // Retorna o link de checkout gerado pelo MP para redirecionarmos o usuário
    return NextResponse.json({ init_point: result.init_point });

  } catch (error: any) {
    console.error('Erro ao gerar checkout MP:', error);
    return NextResponse.json({ error: 'Erro ao conectar com Mercado Pago' }, { status: 500 });
  }
}
