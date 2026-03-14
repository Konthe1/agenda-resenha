
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
const getEnv = (key) => {
  const line = lines.find(l => l.startsWith(key + '='));
  return line ? line.split('=')[1].trim().replace(/^"|"$/g, '') : null;
};

const supabase = createClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'));

async function cleanupDuplicates() {
  const email = 'admin@resenhateste.com';
  console.log(`Starting cleanup for ${email}...`);
  
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const targetUser = users?.find(u => u.email === email);
  
  if (!targetUser) {
    console.error("User not found.");
    return;
  }

  const { data: barbearias } = await supabase.from('barbearias').select('*').eq('owner_id', targetUser.id);
  
  if (barbearias.length > 1) {
    console.log(`Found ${barbearias.length} barbearias for this user. Cleaning up...`);
    
    // Keep the one that is PRO and has the most filled data
    const sorted = barbearias.sort((a, b) => {
      if (a.plano === 'PRO' && b.plano !== 'PRO') return -1;
      if (a.plano !== 'PRO' && b.plano === 'PRO') return 1;
      return (b.nome?.length || 0) - (a.nome?.length || 0);
    });
    
    const toKeep = sorted[0];
    const toDelete = sorted.slice(1);
    
    console.log("Keeping:", { id: toKeep.id, nome: toKeep.nome, plano: toKeep.plano });
    
    for (const b of toDelete) {
      console.log("Deleting duplicate:", { id: b.id, nome: b.nome, plano: b.plano });
      const { error } = await supabase.from('barbearias').delete().eq('id', b.id);
      if (error) console.error("Error deleting:", error.message);
    }
  } else {
    console.log("No duplicates found to delete.");
  }
  
  // Final update to ensure the kept one is absolutely PRO
  const { data: final } = await supabase.from('barbearias').select('*').eq('owner_id', targetUser.id).single();
  if (final) {
    await supabase.from('barbearias').update({ plano: 'PRO', plano_ativo: 'PRO', status_pagamento: 'Ativo' }).eq('id', final.id);
    console.log("Record strictly updated to PRO.");
  }
}

cleanupDuplicates();
