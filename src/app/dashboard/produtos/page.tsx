"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [barbeariaId, setBarbeariaId] = useState<string | null>(null);
  const [plano, setPlano] = useState<string>('FREE');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("Todos");
  
  // States para Novo/Editar Produto Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
    preco_custo: '',
    estoque: '',
    estoque_minimo: '5',
    categoria: 'Geral',
    imagem_url: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      try {
        console.log("Iniciando carregamento de dados do Produto...");
        
        // 1. Tentar pegar o usuário logado
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        
        let barbearia = null;

        if (user) {
          console.log("Usuário identificado:", user.id);
          // 2. Buscar a barbearia deste usuário
          let { data: barbOwner, error: errOwner } = await supabase
            .from('barbearias')
            .select('id, plano')
            .eq('owner_id', user.id)
            .maybeSingle();
          barbearia = barbOwner;

          // Fallback: se não achar pelo owner, tenta a primeira disponível (para demos/novos users)
          if (!barbearia && !errOwner) {
            console.log("Buscando qualquer barbearia como fallback...");
            const { data: firstBarb } = await supabase
              .from('barbearias')
              .select('id, plano')
              .limit(1)
              .maybeSingle();
            barbearia = firstBarb;
          }
        }

        // 4. Fallback 2: Se ATE AGORA for null, a tabela barbearias está VAZIA. 
        // Vamos tentar criar uma padrão para o usuário logado não travar.
        if (!barbearia && user) {
          console.log("Criando barbearia padrão...");
          const { data: newBarb, error: createErr } = await supabase
            .from('barbearias')
            .insert({ 
              nome: 'Minha Barbearia', 
              owner_id: user.id,
              slug: 'barbearia-' + Math.floor(Math.random() * 1000)
            })
            .select('id, plano')
            .single();
          
          if (!createErr) {
            barbearia = newBarb;
            console.log("Barbearia padrão criada com ID:", barbearia?.id);
          } else {
            console.error("Erro ao criar barbearia padrão:", createErr);
          }
        }

        if (barbearia) {
          console.log("Barbearia ID definido:", barbearia.id);
          setBarbeariaId(barbearia.id);
          // Forçar PRO em ambiente de demo/fallback
          setPlano((barbearia.plano || 'PRO').toUpperCase());
          
          // 3. Buscar produtos
          const { data: prods, error: prodsErr } = await supabase
            .from('produtos')
            .select('*')
            .eq('barbearia_id', barbearia.id)
            .order('nome');
          
          if (prodsErr) console.error("Erro ao buscar produtos:", prodsErr);
          if (prods) {
            console.log(`${prods.length} produtos carregados.`);
            setProdutos(prods);
          }
        } else {
          console.error("FALHA CRÍTICA: Nenhuma barbearia encontrada ou criada.");
        }
      } catch (err) {
        console.error("Erro fatal no loadInitialData:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!barbeariaId) {
      alert("Aguarde o carregamento do sistema ou verifique seu perfil nas Configurações.");
      return;
    }

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${barbeariaId}/${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('produtos-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('produtos-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, imagem_url: publicUrl });
    } catch (error: any) {
      alert('Erro ao subir imagem: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
     if (!formData.nome || !formData.preco) {
       alert("Por favor, preencha o Nome e o Preço do produto.");
       return;
     }

     if (!barbeariaId) {
       alert("Erro: Não foi possível identificar sua barbearia. Por favor, configure seu perfil em 'Configurações' primeiro.");
       return;
     }

     const payload = {
        barbearia_id: barbeariaId,
        nome: formData.nome,
        preco: Number(formData.preco),
        preco_custo: Number(formData.preco_custo) || 0,
        estoque: Number(formData.estoque) || 0,
        estoque_minimo: Number(formData.estoque_minimo) || 5,
        categoria: formData.categoria,
        imagem_url: formData.imagem_url
     };

     try {
       if (editingProduct) {
         const { data, error } = await supabase
           .from('produtos')
           .update(payload)
           .eq('id', editingProduct.id)
           .select()
           .single();
         
         if (error) throw error;
         setProdutos(produtos.map(p => p.id === data.id ? data : p));
       } else {
         const { data, error } = await supabase
           .from('produtos')
           .insert(payload)
           .select()
           .single();
         
         if (error) throw error;
         setProdutos([...produtos, data]);
       }
       setIsModalOpen(false);
       resetForm();
     } catch (err: any) {
       alert("Erro ao salvar: " + err.message);
     }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      nome: '', preco: '', preco_custo: '', estoque: '', 
      estoque_minimo: '5', categoria: 'Geral', imagem_url: ''
    });
  };

  const handleEdit = (produto: any) => {
    setEditingProduct(produto);
    setFormData({
      nome: produto.nome,
      preco: produto.preco.toString(),
      preco_custo: (produto.preco_custo || 0).toString(),
      estoque: produto.estoque.toString(),
      estoque_minimo: (produto.estoque_minimo || 5).toString(),
      categoria: produto.categoria || 'Geral',
      imagem_url: produto.imagem_url || ''
    });
    setIsModalOpen(true);
  };

  const handleVenda = async (produto: any) => {
     if (produto.estoque <= 0) {
        alert('Estoque esgotado!');
        return;
     }
     const newEstoque = produto.estoque - 1;
     const { error } = await supabase.from('produtos').update({ estoque: newEstoque }).eq('id', produto.id);
     if (!error) {
       setProdutos(produtos.map(p => p.id === produto.id ? { ...p, estoque: newEstoque } : p));
     }
  };

  const handleDelete = async (id: string) => {
     if (!confirm('Deseja excluir este produto?')) return;
     const { error } = await supabase.from('produtos').delete().eq('id', id);
     if (!error) {
       setProdutos(produtos.filter(p => p.id !== id));
     }
  };

  const filteredProducts = produtos.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategoria === "Todos" || p.categoria === filterCategoria;
    return matchesSearch && matchesCategory;
  });

  const categories = ["Todos", ...Array.from(new Set(produtos.map(p => p.categoria || "Geral"))).filter(c => c !== "Todos")];

  const totalEstoqueValue = produtos.reduce((acc, p) => acc + (p.preco * p.estoque), 0);
  const totalPotentialProfit = produtos.reduce((acc, p) => acc + ((p.preco - (p.preco_custo || 0)) * p.estoque), 0);
  const lowStockCount = produtos.filter(p => p.estoque <= (p.estoque_minimo || 5)).length;

  const UpgradeOverlay = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)', borderRadius: '16px', background: 'rgba(0,0,0,0.4)', padding: '2rem', textAlign: 'center' }}>
      <div className="section-card animate-fade-in" style={{ maxWidth: '500px', border: '2px solid var(--accent-primary)', boxShadow: '0 0 30px rgba(249, 115, 22, 0.3)', background: 'var(--bg-secondary)' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>💎</div>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--accent-primary)', marginBottom: '1rem' }}>Gerenciamento de Produtos PRO</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
          O controle de <strong>Estoque, Vendas e Produtos Premium</strong> é uma exclusividade do Plano PRO. Profissionalize sua gestão e venda mais produtos!
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', textAlign: 'left', marginBottom: '2rem', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>✅ Controle de Estoque</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>✅ Vendas Rápidas</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>✅ Alerta de Reposição</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>✅ Lucro Potencial</div>
        </div>
        <button 
           className="btn-primary" 
           style={{ padding: '1.2rem', fontSize: '1.1rem', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)' }}
           onClick={() => window.location.href = '/dashboard/planos'}
        >
          🚀 Liberar Módulo de Produtos
        </button>
      </div>
    </div>
  );

  return (
    <div className="produtos-page" style={{ position: 'relative' }}>
      {plano !== 'PRO' && <UpgradeOverlay />}
      
      <div style={{ filter: plano !== 'PRO' ? 'grayscale(1) opacity(0.3)' : 'none', pointerEvents: plano !== 'PRO' ? 'none' : 'auto' }}>
        <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div className="page-title">
          <h1>Produtos e Estoque</h1>
          <p>Gerencie os produtos para venda na barbearia (Módulo PRO)</p>
        </div>
        <button className="btn-primary" style={{ padding: '0.6rem 1.25rem' }} onClick={() => setIsModalOpen(true)}>+ Novo Produto</button>
      </div>

      <div className="dashboard-content-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {/* Métricas Rápidas */}
        <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-secondary)', borderLeft: '4px solid var(--accent-primary)', padding: '1.5rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Valor Total em Estoque</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>R$ {totalEstoqueValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        
        <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-secondary)', borderLeft: '4px solid #10b981', padding: '1.5rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Lucro Potencial</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>R$ {totalPotentialProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>

        <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-secondary)', borderLeft: '4px solid #f59e0b', padding: '1.5rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Itens com Estoque Baixo</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f59e0b' }}>{lowStockCount} itens</span>
        </div>
      </div>

      <div style={{ marginTop: '2.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Buscar produto..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }}
            />
          </div>
          <select 
            value={filterCategoria}
            onChange={e => setFilterCategoria(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {isLoading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Carregando estoque premium...</div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
            Nenhum produto encontrado.
          </div>
        ) : (
          filteredProducts.map(p => {
            const isLowStock = p.estoque <= (p.estoque_minimo || 5);
            return (
              <div key={p.id} className="section-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', border: isLowStock ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-color)' }}>
                {p.imagem_url ? (
                  <div style={{ height: '180px', width: '100%', overflow: 'hidden' }}>
                    <img src={p.imagem_url} alt={p.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{ height: '180px', width: '100%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                    🛍️
                  </div>
                )}
                
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{p.nome}</h3>
                    <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '50px', color: 'var(--text-secondary)' }}>{p.categoria}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#10b981' }}>R$ {p.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    {p.preco_custo > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>Margem: R$ {(p.preco - p.preco_custo).toFixed(2)}</span>}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Estoque</span>
                      <span style={{ fontWeight: 'bold', color: isLowStock ? '#f59e0b' : 'white' }}>{p.estoque} unid.</span>
                    </div>
                    {isLowStock && <span style={{ fontSize: '0.7rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>🚨 Crítico</span>}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleVenda(p)} 
                      className="btn-primary" 
                      style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}
                      disabled={p.estoque <= 0}
                    >
                      🛒 Venda
                    </button>
                    <button 
                      onClick={() => handleEdit(p)} 
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'white', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(p.id)} 
                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(5px)' }}>
           <div className="section-card animate-fade-in" style={{ width: '500px', maxWidth: '95%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                 <h2 style={{ fontSize: '1.5rem' }}>{editingProduct ? '✏️ Editar Produto' : '🛍️ Novo Produto'}</h2>
                 <button className="btn-icon" onClick={() => { setIsModalOpen(false); resetForm(); }}>❌</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                 {/* Upload de Imagem */}
                 <div style={{ textAlign: 'center', background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                    {formData.imagem_url ? (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={formData.imagem_url} alt="Preview" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px' }} />
                        <button onClick={() => setFormData({...formData, imagem_url: ''})} style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#ef4444', border: 'none', borderRadius: '50%', color: 'white', padding: '5px', cursor: 'pointer' }}>✕</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                         <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📸</span>
                         <label style={{ cursor: 'pointer', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                            {isUploading ? 'Enviando...' : 'Carregar Foto do Produto'}
                            <input type="file" hidden accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                         </label>
                      </div>
                    )}
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                       <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nome do Produto</label>
                       <input type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Ex: Cera Modeladora Extra Forte" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                    </div>
                    <div>
                       <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Preço Venda (R$)</label>
                       <input type="number" value={formData.preco} onChange={e => setFormData({...formData, preco: e.target.value})} placeholder="Ex: 45.00" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                    </div>
                    <div>
                       <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Preço Custo (R$)</label>
                       <input type="number" value={formData.preco_custo} onChange={e => setFormData({...formData, preco_custo: e.target.value})} placeholder="Ex: 20.00" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                    </div>
                    <div>
                       <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Estoque Atual</label>
                       <input type="number" value={formData.estoque} onChange={e => setFormData({...formData, estoque: e.target.value})} placeholder="0" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                    </div>
                    <div>
                       <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Estoque Mínimo (Alerta)</label>
                       <input type="number" value={formData.estoque_minimo} onChange={e => setFormData({...formData, estoque_minimo: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                       <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Categoria</label>
                       <input type="text" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} placeholder="Cabelo, Barba, etc" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                    </div>
                 </div>

                 <button className="btn-primary" style={{ marginTop: '1rem', padding: '1.2rem', fontSize: '1.1rem', borderRadius: '12px' }} onClick={handleSave}>
                    {editingProduct ? 'Atualizar Produto' : 'Salvar no Estoque'}
                 </button>
              </div>
           </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
