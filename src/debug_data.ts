import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debug() {
  console.log("--- DEBUG START ---")
  
  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser()
  console.log("User:", user?.id || "NO USER")
  
  if (!user) return;

  // 2. Check barbearias for this owner
  const { data: barbs } = await supabase
    .from('barbearias')
    .select('*')
    .eq('owner_id', user.id)
  
  console.log("Barbearias for owner:", barbs?.length || 0)
  barbs?.forEach(b => console.log(`- ID: ${b.id}, Nome: ${b.nome}`))

  // 3. If no barbearia for owner, check all barbearias (to see if data exists at all)
  if (barbs?.length === 0) {
    const { data: allBarbs } = await supabase.from('barbearias').select('id, nome, owner_id').limit(5)
    console.log("All barbearias (limit 5):", allBarbs?.length || 0)
    allBarbs?.forEach(b => console.log(`- ID: ${b.id}, Nome: ${b.nome}, Owner: ${b.owner_id}`))
  }

  // 4. Check services
  const targetId = barbs?.[0]?.id 
  if (targetId) {
    const { data: servs } = await supabase
      .from('servicos')
      .select('id, nome, barbearia_id')
      .eq('barbearia_id', targetId)
    console.log(`Services for Barbearia ${targetId}:`, servs?.length || 0)
    servs?.forEach(s => console.log(`- ID: ${s.id}, Nome: ${s.nome}`))
  } else {
    const { data: anyServs } = await supabase.from('servicos').select('id, nome, barbearia_id').limit(5)
    console.log("Any services (limit 5):", anyServs?.length || 0)
    anyServs?.forEach(s => console.log(`- ID: ${s.id}, Nome: ${s.nome}, BarbeyID: ${s.barbearia_id}`))
  }

  console.log("--- DEBUG END ---")
}

debug()
