
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
const getEnv = (key) => {
  const line = lines.find(l => l.startsWith(key + '='));
  return line ? line.split('=')[1].trim().replace(/^"|"$/g, '') : null;
};

const supabase = createClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'));

async function inspectSchema() {
  console.log("Inspecting 'barbearias' constraints...");
  
  const { data, error } = await supabase.rpc('get_table_constraints', { table_name: 'barbearias' });
  
  if (error) {
    // If RPC doesn't exist, try a direct query to information_schema
    const { data: constraints, error: err2 } = await supabase.from('information_schema.table_constraints')
      .select('*')
      .eq('table_name', 'barbearias');
    
    if (constraints) {
        console.log("Constraints found via information_schema:");
        constraints.forEach(c => console.log(`- ${c.constraint_name} (${c.constraint_type})`));
    } else {
        console.error("Could not fetch constraints:", err2);
    }
  } else {
    console.log("Constraints:", data);
  }

  // Check unique indexes specifically
  const { data: indexes } = await supabase.from('pg_indexes').select('*').eq('tablename', 'barbearias');
  if (indexes) {
      console.log("\nIndexes found:");
      indexes.forEach(idx => console.log(`- ${idx.indexname}: ${idx.indexdef}`));
  }
}

inspectSchema();
