import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(req: Request) {
  try {
    const { 
      telefone, 
      nomeCliente, 
      dataHora, 
      servico, 
      barbeiro, 
      barbeariaNome, 
      agendamentoId,
      trigger = 'confirmacao' // 'confirmacao' ou 'lembrete_30min'
    } = await req.json();

    if (!telefone) {
      return NextResponse.json({ error: 'Telefone é obrigatório' }, { status: 400 });
    }

    // Evolution API configuration
    const EVOLUTION_API_URL = process.env.WHATSAPP_API_URL || 'https://resenha-api.onrender.com';
    const INSTANCE_NAME = process.env.WHATSAPP_INSTANCE_NAME || 'resenha';
    const API_KEY = process.env.WHATSAPP_API_KEY || 'sua_apikey';

    // 1. Verificar se existe ÁUDIO PERSONALIZADO para este agendamento/trigger
    let audioUrl = null;
    if (agendamentoId) {
      // Buscar detalhes do agendamento para identificar barbeiro e cliente
      const { data: agendamento } = await supabase
        .from('agendamentos')
        .select('barbeiro_id, cliente_id, barbearia_id')
        .eq('id', agendamentoId)
        .single();

      if (agendamento) {
        // Tentar buscar áudio específico para este CLIENTE
        const { data: audioCliente } = await supabase
          .from('audios_personalizados')
          .select('audio_url')
          .eq('barbeiro_id', agendamento.barbeiro_id)
          .eq('cliente_id', agendamento.cliente_id)
          .eq('gatilho', trigger)
          .limit(1)
          .single();

        if (audioCliente) {
          audioUrl = audioCliente.audio_url;
        } else {
          // Se não tiver para o cliente, buscar áudio GERAL do barbeiro para este gatilho
          const { data: audioGeral } = await supabase
            .from('audios_personalizados')
            .select('audio_url')
            .eq('barbeiro_id', agendamento.barbeiro_id)
            .is('cliente_id', null)
            .eq('gatilho', trigger)
            .limit(1)
            .single();
          
          if (audioGeral) audioUrl = audioGeral.audio_url;
        }
      }
    }

    // Formata telefone
    let numeroLimpo = telefone.replace(/\D/g, '');
    if (numeroLimpo.length === 11 || numeroLimpo.length === 10) {
      numeroLimpo = `55${numeroLimpo}`;
    }

    // 2. DISPARO DE ÁUDIO (se existir)
    if (audioUrl && API_KEY !== 'sua_apikey') {
      try {
        await fetch(`${EVOLUTION_API_URL}/message/sendWhatsAppAudio/${INSTANCE_NAME}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': API_KEY },
          body: JSON.stringify({
            number: numeroLimpo,
            audio: audioUrl,
            delay: 1000,
            encoding: true
          })
        });
        console.log(`[WHATSAPP] Áudio de ${trigger} enviado para ${telefone}`);
      } catch (e) {
        console.error("Erro ao enviar áudio:", e);
      }
    }

    // 3. DISPARO DE TEXTO (Padrão)
    const mensagens: Record<string, string> = {
      confirmacao: `Olá *${nomeCliente}*! 👋\n\nSeu agendamento em *${barbeariaNome}* está confirmado!\n\n✂️ *Serviço:* ${servico}\n🧔 *Profissional:* ${barbeiro}\n📅 *Data:* ${dataHora}\n\nTe esperamos lá!`,
      lembrete_30min: `Olá *${nomeCliente}*! ⏰\n\nPassando para lembrar do seu agendamento em *30 minutos* em *${barbeariaNome}*.\n\n*${dataHora}*\n\nAté logo! ✂️`
    };

    const mensagemText = mensagens[trigger] || mensagens.confirmacao;

    if (API_KEY === 'sua_apikey') {
      console.log(`[SIMULAÇÃO WHATSAPP] (${trigger}) disparando para ${telefone}...`);
      if (audioUrl) console.log(`Áudio vinculado: ${audioUrl}`);
      console.log(`Mensagem: ${mensagemText}`);
      
      return NextResponse.json({ success: true, simulated: true });
    }

    const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${INSTANCE_NAME}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': API_KEY },
      body: JSON.stringify({
        number: numeroLimpo,
        text: mensagemText
      })
    });

    const data = await response.json();
    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error('Erro na API de WhatsApp:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
