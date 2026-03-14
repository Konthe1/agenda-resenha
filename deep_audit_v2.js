
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
const getEnv = (key) => {
  const line = lines.find(l => l.startsWith(key + '='));
  return line ? line.split('=')[1].trim().replace(/^"|"$/g, '') : null;
};

const supabase = createClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'));

async function fullAudit() {
  console.log("--- STARTING DEEP AUDIT ---");
  const email = 'admin@resenhateste.com';
  
  try {
    // 1. Check Auth User
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    const targetUser = users?.find(u => u.email === email);
    
    if (!targetUser) {
      console.log("❌ USER NOT FOUND IN AUTH:", email);
      return;
    }
    
    console.log("✅ AUTH USER FOUND:", { id: targetUser.id, email: targetUser.email });
    
    // 2. Check Barbearias Table for this user
    const { data: barbearias, error: dbError } = await supabase
      .from('barbearias')
      .select('*')
      .eq('owner_id', targetUser.id);
      
    if (dbError) {
      console.log("❌ ERROR FETCHING BARBEARIAS:", dbError);
    } else {
      console.log(`✅ FOUND ${barbearias.length} BARBEARIA RECORD(S) FOR THIS USER.`);
      barbearias.forEach((b, i) => {
        console.log(`RECORD #${i+1}:`, {
          id: b.id,
          nome: b.nome,
          plano: b.plano,
          plano_ativo: b.plano_ativo,
          status_pagamento: b.status_pagamento,
          slug: b.slug,
          owner_id: b.owner_id
        });
      });
    }

    // 3. Check for specific slug conflict
    const slugToSearch = 'mundo-resenha';
    const { data: slugMatch } = await supabase.from('barbearias').select('*').eq('slug', slugToSearch);
    console.log(`\nChecking slug '${slugToSearch}':`, slugMatch?.map(s => ({ id: s.id, owner: s.owner_id, plano: s.plano })));

  } catch (err) {
    console.log("❌ CRITICAL SCRIPT ERROR:", err.message);
  }
  console.log("--- AUDIT COMPLETE ---");
}

fullAudit();
