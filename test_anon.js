
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
const getEnv = (key) => {
  const line = lines.find(l => l.startsWith(key + '='));
  return line ? line.split('=')[1].trim().replace(/^"|"$/g, '') : null;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAnonAccess() {
  console.log("Testing ANON_KEY access to 'barbearias'...");
  const { data, error } = await supabase.from('barbearias').select('id, nome, plano').limit(5);
  
  if (error) {
    console.error("❌ ACCESS DENIED (RLS active?):", error.message);
    console.error("Error Code:", error.code);
  } else {
    console.log("✅ ACCESS GRANTED. Found records:", data.length);
    data.forEach(b => console.log(`- ${b.nome} (Plano: ${b.plano})`));
  }
}

testAnonAccess();
