export default function ClientesPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Meus Clientes</h1>
          <p>Base de dados e histórico de atendimentos</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="Buscar cliente..." 
            style={{ 
              padding: '0.6rem 1rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)', 
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)'
            }} 
          />
          <button className="btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
            + Novo Cliente
          </button>
        </div>
      </div>

      <div className="section-card" style={{ marginTop: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '1rem' }}>Nome</th>
              <th style={{ padding: '1rem' }}>WhatsApp</th>
              <th style={{ padding: '1rem' }}>Último Corte</th>
              <th style={{ padding: '1rem' }}>LTV</th>
              <th style={{ padding: '1rem' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {[
              { nome: 'Lucas Tavares', wpp: '(11) 98765-4321', data: 'Hoje', ltv: 'R$ 450,00' },
              { nome: 'Rafael Silva', wpp: '(11) 91234-5678', data: 'Semana passada', ltv: 'R$ 1.200,00' },
              { nome: 'Marcos Paulo', wpp: '(11) 99999-9999', data: 'Há 15 dias', ltv: 'R$ 150,00' },
            ].map((cliente, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {cliente.nome.charAt(0)}
                    </div>
                    {cliente.nome}
                  </div>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{cliente.wpp}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{cliente.data}</td>
                <td style={{ padding: '1rem', fontWeight: '600', color: '#10b981' }}>{cliente.ltv}</td>
                <td style={{ padding: '1rem' }}>
                  <button className="btn-text" style={{ fontSize: '0.85rem' }}>Ver Histórico</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
