import { supabase } from '@/lib/supabase/client'

export const supabaseClient = supabase

export async function fetchDashboardData(barbeariaId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // 1. Agendamentos de Hoje
  const { data: agendamentosHoje, error: errHoje } = await supabaseClient
    .from('agendamentos')
    .select('id, valor_total, servico_id')
    .eq('barbearia_id', barbeariaId)
    .gte('data_hora_inicio', today.toISOString())
    .lt('data_hora_inicio', tomorrow.toISOString())
    .neq('status', 'cancelado')

  // 2. Novos Clientes (Criados nos últimos 7 dias)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const { count: novosClientes } = await supabaseClient
    .from('clientes')
    .select('*', { count: 'exact', head: true })
    .eq('barbearia_id', barbeariaId)
    .gte('criado_em', sevenDaysAgo.toISOString())

  // 3. Próximos Atendimentos (Lista)
  const { data: proximosAtendimentos } = await supabaseClient
    .from('agendamentos')
    .select(`
      id,
      data_hora_inicio,
      status,
      clientes ( nome, criado_em ),
      servicos ( nome )
    `)
    .eq('barbearia_id', barbeariaId)
    .gte('data_hora_inicio', new Date().toISOString())
    .order('data_hora_inicio', { ascending: true })
    .limit(5)

  const faturamentoHoje = agendamentosHoje?.reduce((acc: number, curr: any) => acc + Number(curr.valor_total), 0) || 0

  return {
    agendamentosHoje: agendamentosHoje?.length || 0,
    faturamentoHoje,
    novosClientes: novosClientes || 0,
    proximosAtendimentos: proximosAtendimentos || []
  }
}
