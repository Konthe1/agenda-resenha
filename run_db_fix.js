const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregamento manual do .env.local para evitar dependência de 'dotenv'
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Erro: Variáveis de ambiente não encontradas.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runFix() {
  const sqlPath = path.join('c:/Users/Administrador/.gemini/antigravity/brain/f099e81f-d5ff-4cb1-969e-5a8e930c30b3/FIX_DATA_AND_TABLES.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  console.log("Executando SQL de correção...");
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.error("Erro ao executar SQL:", error);
  } else {
    console.log("SQL executado com sucesso!", data);
  }
}

runFix();
