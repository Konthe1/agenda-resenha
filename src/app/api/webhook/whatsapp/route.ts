import { NextResponse } from 'next/server';
import { sendWhatsAppMessage, buildConfirmationMessage } from '@/lib/whatsapp';
import { createClient } from '@supabase/supabase-js';

// Este Webhook será chamado via HTTP POST pelo Banco de Dados (Supabase Database Webhooks)
// Toda vez que um novo INSERT acontecer na tabela 'agendamentos'
export async function POST(req: Request) {
  // Supabase client bypassing RLS (Service Role) 
  // Only for server-side onde precisamos buscar info ignorando regras de usuário
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  try {
    const body = await req.json();
    
    // O payload do Supabase vem dentro do objeto "record" (a linha inserida)
    const { record } = body; 

    if (!record || !record.id) {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
    }

    // 1. Precisamos buscar os dados completos do Cliente e do Serviço para montar a mensagem
    // Já que o trigger de insert só manda os UUIDs
    const { data: agendamentoCompleto, error } = await supabase
      .from('agendamentos')
      .select(`
        data_hora_inicio,
        clientes ( nome, telefone ),
        servicos ( nome ),
        barbearias ( nome )
      `)
      .eq('id', record.id)
      .single();

    if (error || !agendamentoCompleto) {
      console.error("Erro ao buscar detalhes:", error);
      return NextResponse.json({ error: 'Não foi possível buscar os detalhes do agendamento' }, { status: 500 });
    }

    const { clientes, servicos, barbearias, data_hora_inicio } = agendamentoCompleto;
    
    // Tratamento de tipos devido ao left join do Postgrest
    const cliente = Array.isArray(clientes) ? clientes[0] : clientes;
    const servico = Array.isArray(servicos) ? servicos[0] : servicos;
    const barbearia = Array.isArray(barbearias) ? barbearias[0] : barbearias;

    if (!cliente || !cliente.telefone) {
      return NextResponse.json({ error: 'Cliente sem telefone cadastrado' }, { status: 400 });
    }

    // 2. Formatando os dados
    const dataHoraStr = new Date(data_hora_inicio).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    // 3. Montar a mensagem e disparar
    const mensagemFinal = buildConfirmationMessage(
      cliente.nome, 
      servico.nome, 
      dataHoraStr, 
      barbearia.nome
    );

    const whatsappResult = await sendWhatsAppMessage(cliente.telefone, mensagemFinal);

    if (whatsappResult.success) {
      // Opcional: Marcar no banco que a mensagem foi enviada
      await supabase.from('agendamentos').update({ mensagem_wpp_enviada: true }).eq('id', record.id);
      return NextResponse.json({ success: true, message: 'WhatsApp Enviado!' });
    } else {
      return NextResponse.json({ success: false, error: whatsappResult.error }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Exceção fatal no Webhook:", error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
