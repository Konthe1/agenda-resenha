
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
  
  // 1. Check Auth User
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  const targetUser = users?.find(u => u.email === email);
  
  if (!targetUser) {
    console.error("❌ USER NOT FOUND IN AUTH:", email);
  } else {
    console.log("✅ AUTH USER FOUND:", { id: targetUser.id, email: targetUser.email });
    
    // 2. Check Barbearias Table for this user
    const { data: barbearias, error: dbError } = await supabase
      .from('barbearias')
      .select('*')
      .eq('owner_id', targetUser.id);
      
    if (dbError) {
      console.error("❌ ERROR FETCHING BARBEARIAS:", dbError);
    } else if (barbearias.length === 0) {
      console.error("❌ NO BARBEARIA RECORD FOUND FOR THIS USER ID.");
      
      // Look for any barbearias at all
      const { data: allBarbearias } = await supabase.from('barbearias').select('*').limit(10);
      console.log("Existing barbearias in DB:", allBarbearias.map(b => ({ id: b.id, name: b.nome, owner: b.owner_id, plano: b.plano })));
    } else {
      console.log("✅ BARBEARIA RECORDS FOUND:", barbearias.map(b => ({ id: b.id, name: b.nome, plano: b.plano, slug: b.slug })));
    }
  }

  // 3. Check for duplicates (Multiple users or same slug)
  const { data: allUsers } = await supabase.from('barbearias').select('slug, count()').group('slug');
  // Note: the above might not work exactly depending on supabase version, let's just get all slugs
  const { data: slugs } = await supabase.from('barbearias').select('slug');
  console.log("Current slugs in database:", slugs.map(s => s.slug));

  // 4. Test Client Access (Anon Key)
  const anonClient = createClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'));
  const { data: anonData, error: anonError } = await anonClient.from('barbearias').select('nome, plano').limit(1);
  if (anonError) {
    console.error("❌ ANON CLIENT BLOCKED (RLS likely still active):", anonError.message);
  } else {
    console.log("✅ ANON CLIENT CAN READ DATA (RLS disabled). Sample:", anonData);
  }

  console.log("--- AUDIT COMPLETE ---");
}

fullAudit();
