import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { telefone, nomeCliente, dataHora, servico, barbeiro, barbeariaNome } = await req.json();

    if (!telefone) {
      return NextResponse.json({ error: 'Telefone é obrigatório' }, { status: 400 });
    }

    // evolution API environment configuration
    const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'https://sua-evolution-api.com';
    const INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'minhainstancia';
    const API_KEY = process.env.EVOLUTION_API_KEY || 'sua_apikey';

    // Se a API_KEY for 'sua_apikey', sabemos que é uma simulação (sem credenciais inseridas pelo usuário ainda)
    if (API_KEY === 'sua_apikey') {
      console.log(`[SIMULAÇÃO WHATSAPP] Simulando disparo para ${telefone}...`);
      console.log(`Mensagem: Olá ${nomeCliente}! Seu agendamento de ${servico} com ${barbeiro} em ${barbeariaNome} está confirmado para ${dataHora}.`);
      
      // Retornar sucesso simulado
      return NextResponse.json({ 
        success: true, 
        simulated: true,
        message: 'Credenciais da Evolution API não encontradas no .env.local. Mensagem simulada no console com sucesso.' 
      });
    }

    // Formata telefone (remove não números e garante DDI 55 se brasileiro)
    let numeroLimpo = telefone.replace(/\D/g, '');
    if (numeroLimpo.length === 11 || numeroLimpo.length === 10) {
      numeroLimpo = `55${numeroLimpo}`;
    }

    const mensagemText = `Olá *${nomeCliente}*! 👋\n\nSeu agendamento em *${barbeariaNome}* está confirmado!\n\n✂️ *Serviço:* ${servico}\n🧔 *Profissional:* ${barbeiro}\n📅 *Data:* ${dataHora}\n\nTe esperamos lá!`;

    // Disparo real via Evolution API (Send Text Message endpoint)
    const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${INSTANCE_NAME}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY
      },
      body: JSON.stringify({
        number: numeroLimpo,
        text: mensagemText
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao enviar WhatsApp na Evolution API');
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Erro na API de WhatsApp:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
