
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
const getEnv = (key) => {
  const line = lines.find(l => l.startsWith(key + '='));
  return line ? line.split('=')[1].trim().replace(/^"|"$/g, '') : null;
};

const supabase = createClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'));

async function inspectAll() {
  console.log("Inspecting ALL barbearias in DB...");
  const { data, error } = await supabase.from('barbearias').select('id, nome, plano, owner_id, slug');
  
  if (error) {
    console.error("Error:", error);
  } else {
    data.forEach((b, i) => {
      console.log(`[${i}] ID: ${b.id} | Name: ${b.nome} | Plano: ${b.plano} | Owner: ${b.owner_id} | Slug: ${b.slug}`);
    });
  }
}

inspectAll();
