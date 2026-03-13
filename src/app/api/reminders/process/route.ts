import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(req: Request) {
  try {
    // 1. Definir janela de 30 minutos (agora + 30m até agora + 45m para pegar uma margem)
    const now = new Date();
    const rangeStart = new Date(now.getTime() + 25 * 60000); // 25 min dps
    const rangeEnd = new Date(now.getTime() + 45 * 60000);   // 45 min dps

    console.log(`[REMINDERS] Verificando agendamentos entre ${rangeStart.toISOString()} e ${rangeEnd.toISOString()}`);

    // 2. Buscar agendamentos que ainda não tiveram o lembrete enviado
    const { data: agendamentos, error } = await supabase
      .from('agendamentos')
      .select(`
        id, 
        data_hora_inicio, 
        barbeiro_id, 
        cliente_id, 
        barbearia_id,
        barbearias(nome),
        clientes(nome, telefone),
        barbeiros(nome),
        servicos(nome)
      `)
      .eq('status', 'confirmado')
      .eq('lembrete_30min_enviado', false)
      .gte('data_hora_inicio', rangeStart.toISOString())
      .lte('data_hora_inicio', rangeEnd.toISOString());

    if (error) throw error;

    if (!agendamentos || agendamentos.length === 0) {
      return NextResponse.json({ message: 'Nenhum lembrete para processar agora.' });
    }

    const results = [];

    // 3. Processar cada agendamento
    for (const app of (agendamentos as any)) {
      try {
        const cliente = Array.isArray(app.clientes) ? app.clientes[0] : app.clientes;
        const barbearia = Array.isArray(app.barbearias) ? app.barbearias[0] : app.barbearias;
        const barbeiro = Array.isArray(app.barbeiros) ? app.barbeiros[0] : app.barbeiros;
        const servico = Array.isArray(app.servicos) ? app.servicos[0] : app.servicos;

        if (!cliente?.telefone) continue;

        console.log(`[REMINDERS] Enviando lembrete para ${cliente.nome} (${cliente.telefone})`);

        // Disparar via nossa própria API de WhatsApp (que já cuida de áudios personalizados)
        const response = await fetch(`${new URL(req.url).origin}/api/whatsapp/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telefone: cliente.telefone,
            nomeCliente: cliente.nome?.split(' ')[0] || 'Cliente',
            dataHora: new Date(app.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            servico: servico?.nome || 'Serviço',
            barbeiro: barbeiro?.nome || 'Barbeiro',
            barbeariaNome: barbearia?.nome || 'Barbearia',
            agendamentoId: app.id,
            trigger: 'lembrete_30min'
          })
        });

        if (response.ok) {
          // Marcar como enviado no banco
          await supabase
            .from('agendamentos')
            .update({ lembrete_30min_enviado: true })
            .eq('id', app.id);
          
          results.push({ id: app.id, status: 'success' });
        } else {
          results.push({ id: app.id, status: 'failed', error: await response.text() });
        }
      } catch (e: any) {
        console.error(`Erro ao processar lembrete ${app.id}:`, e);
        results.push({ id: app.id, status: 'error', message: e.message });
      }
    }

    return NextResponse.json({ 
      processed: agendamentos.length,
      details: results 
    });

  } catch (error: any) {
    console.error('[REMINDERS ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
