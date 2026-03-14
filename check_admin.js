
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env.local manually
const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
const getEnv = (key) => {
  const line = lines.find(l => l.startsWith(key + '='));
  return line ? line.split('=')[1].trim().replace(/^"|"$/g, '') : null;
};

const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(url, serviceKey);

async function checkUser() {
  const email = 'admin@resenhateste.com';
  console.log(`Checking user: ${email}`);

  // 1. Get User from Auth
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    console.log("CRITICAL: User not found in auth.users");
    // List some users to see what's there
    console.log("First 5 users in Auth:");
    users.slice(0, 5).forEach(u => console.log(`- ${u.email} (${u.id})`));
    return;
  }

  console.log(`User ID (Auth): ${user.id}`);

  // 2. Check Barbearia record with this owner_id
  const { data: barbearias, error: dbError } = await supabase
    .from('barbearias')
    .select('*')
    .eq('owner_id', user.id);

  if (dbError) {
    console.error("Error fetching barbearias:", dbError);
    return;
  }

  console.log(`\nFound ${barbearias.length} barbearias for this UID:`);
  barbearias.forEach(b => {
    console.log(`- ID: ${b.id}, Name: ${b.nome}, Plan: ${b.plano}, Slug: ${b.slug}`);
  });

  // 3. Search for ANY barbearia named "Mundo Resenha" or with "admin" in owner_id (if mismatched)
  const { data: allBarbearias } = await supabase.from('barbearias').select('*').limit(20);
  console.log("\nLast 20 barbearias in DB:");
  allBarbearias.forEach(b => {
    console.log(`- ID: ${b.id}, Owner: ${b.owner_id}, Name: ${b.nome}, Plan: ${b.plano}`);
  });

  // 4. Check 'plano' and 'plano_ativo' columns specifically
  if (barbearias.length > 0) {
      const b = barbearias[0];
      console.log(`\nDetailed Check Plan for ${b.nome}:`);
      console.log(`- plano: "${b.plano}"`);
      console.log(`- plano_ativo: "${b.plano_ativo}"`);
      console.log(`- status_pagamento: "${b.status_pagamento}"`);
  }
}

checkUser();
