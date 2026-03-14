
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
const getEnv = (key) => {
  const line = lines.find(l => l.startsWith(key + '='));
  return line ? line.split('=')[1].trim().replace(/^"|"$/g, '') : null;
};

const supabase = createClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'));

async function hardCleanup() {
  const email = 'admin@resenhateste.com';
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const targetUser = users?.find(u => u.email === email);
  
  if (!targetUser) {
    console.error("User not found.");
    return;
  }

  console.log(`User ID: ${targetUser.id}`);

  // DELETA TUDO QUE NÃO É A PRINCIPAL
  // Vamos manter a de ID 6f103373-c378-49dc-a2ce-61ef21996160 que sabemos ser a correta
  const idToKeep = '6f103373-c378-49dc-a2ce-61ef21996160';
  
  console.log(`Deleting all barbearias for owner ${targetUser.id} EXCEPT ${idToKeep}...`);
  
  const { data, error } = await supabase
    .from('barbearias')
    .delete()
    .eq('owner_id', targetUser.id)
    .neq('id', idToKeep);
    
  if (error) {
    console.error("Delete error:", error.message);
  } else {
    console.log("Delete successful.");
  }

  // Ensure the kept one is PRO
  await supabase.from('barbearias')
    .update({ plano: 'PRO', plano_ativo: 'PRO', status_pagamento: 'Ativo', nome: 'Resenha Barber PRO' })
    .eq('id', idToKeep);
    
  console.log("Final record updated.");
}

hardCleanup();
