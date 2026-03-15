
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
const getEnv = (key) => {
  const line = lines.find(l => l.startsWith(key + '='));
  return line ? line.split('=')[1].trim().replace(/^"|"$/g, '') : null;
};

const supabase = createClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'));

async function checkColumns() {
  const { data, error } = await supabase.from('barbearias').select('*').limit(1).single();
  if (error) {
    console.error("Error fetching barbearia:", error);
    return;
  }
  console.log("Column names in 'barbearias':", Object.keys(data));
}

checkColumns();
