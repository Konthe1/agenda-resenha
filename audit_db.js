const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const target = line.trim();
    if(target && !target.startsWith('#')) {
        const match = target.match(/^([^=]+)=(.*)$/);
        if (match) env[match[1]] = match[2];
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function audit() {
    console.log("--- DATABASE AUDIT ---");
    
    // 1. Check RLS status for barbearias
    const { data: rlsCheck, error: rlsError } = await supabase.rpc('check_rls_status', { table_name: 'barbearias' });
    if (rlsError) {
        console.log("Could not check RLS via RPC (normal if helper not installed). Testing manually...");
    }

    // 2. Check the user
    const email = 'admin@resenhateste.com';
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users.users.find(u => u.email === email);
    
    if (!user) {
        console.error("User not found!");
        return;
    }
    console.log(`User ID: ${user.id}`);

    // 3. Check barbearia record
    const { data: barbearia, error: barbError } = await supabase
        .from('barbearias')
        .select('*')
        .eq('owner_id', user.id);
    
    console.log("Barbearia records found for user:", JSON.stringify(barbearia, null, 2));
    if (barbError) console.error("Error fetching barbearia:", barbError);

    // 4. Try to fetch with Service Role without filter to see all
    const { data: allData } = await supabase.from('barbearias').select('id, nome, owner_id, plano').limit(10);
    console.log("All barbearias (Service Role):", JSON.stringify(allData, null, 2));
}

audit();
