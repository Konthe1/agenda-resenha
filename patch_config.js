
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'dashboard', 'configuracoes', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix handleSavePerfil
const saveRegex = /const handleSavePerfil = async \(\) => \{[\s\S]*?async function loadData/;
const newSave = `const handleSavePerfil = async () => {
      setIsSubmitting(true);
      try {
         let { data: { user }, error: authErr } = await supabase.auth.getUser();
         if (!user) {
            const { data: sess } = await supabase.auth.getSession();
            user = sess.session?.user || null;
         }
         if (!user) throw new Error("Sessão expirada. Por favor, faça login novamente.");

         const userId = user.id;
         
         // BUSCA O ID NO BANCO PELO OWNER_ID ANTES DE SALVAR (Evita duplicação por Slug)
         let currentId = barbeariaPerfil.id;
         if (!currentId) {
            const { data: existing } = await supabase
               .from('barbearias')
               .select('id')
               .eq('owner_id', userId)
               .maybeSingle();
            
            if (existing) currentId = existing.id;
         }

         const payload: any = {
            nome: barbeariaPerfil.nome,
            slug: barbeariaPerfil.slug,
            endereco: barbeariaPerfil.endereco,
            logo_url: barbeariaPerfil.logo_url,
            whatsapp: barbeariaPerfil.whatsapp,
            owner_id: userId
         };

         if (currentId) payload.id = currentId;

         const { data, error } = await supabase
            .from('barbearias')
            .upsert(payload) 
            .select()
            .single();
         
         if (error) throw error;
         
         if (data) {
            setBarbeariaPerfil({
               id: data.id,
               nome: data.nome || '',
               slug: data.slug || '',
               endereco: data.endereco || '',
               logo_url: data.logo_url || '',
               whatsapp: data.whatsapp || '',
               plano: (data.plano || 'FREE').toUpperCase()
            });
            alert("Perfil salvo com sucesso!");
         }
         
      } catch (e: any) {
         console.error("Erro ao salvar perfil:", e);
         alert("Erro ao salvar perfil: " + (e.message || "Erro desconhecido"));
      } finally {
         setIsSubmitting(false);
      }
   };

   async function loadData`;

content = content.replace(saveRegex, newSave);

// 2. Fix loadData
const loadRegex = /async function loadData\(\) \{[\s\S]*?console\.log\("Config: Iniciando loadData\.\.\."\);/;
const newLoad = `async function loadData() {
      setIsLoading(true);
      try {
        console.log("Config: Iniciando loadData...");
        let { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          const { data: sess } = await supabase.auth.getSession();
          user = sess.session?.user || null;
        }
        if (!user) {
          setIsLoading(false);
          return;
        }`;

content = content.replace(loadRegex, newLoad);

fs.writeFileSync(filePath, content);
console.log("File patched successfully!");
