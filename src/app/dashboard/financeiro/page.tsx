export default function FinanceiroPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Financeiro</h1>
          <p>Entradas, saídas e projeção de caixa</p>
        </div>
        <button className="btn-primary" style={{ padding: '0.6rem 1.25rem', background: '#10b981', color: 'white' }}>
          📥 Exportar Relatório
        </button>
      </div>

      <div className="metrics-grid" style={{ marginTop: '2rem' }}>
        <div className="metric-card">
          <div className="metric-header">
            <h3>Faturamento Mensal</h3>
            <span className="metric-icon">📈</span>
          </div>
          <p className="metric-value">R$ 14.500,00</p>
          <span className="metric-trend positive">↑ 22% vs mês anterior</span>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Ticket Médio</h3>
            <span className="metric-icon">🏷️</span>
          </div>
          <p className="metric-value">R$ 65,00</p>
          <span className="metric-trend positive">↑ R$ 5,00 vs mês anterior</span>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>A Receber (Futuro)</h3>
            <span className="metric-icon">⏳</span>
          </div>
          <p className="metric-value">R$ 3.200,00</p>
          <span className="metric-trend neutral">Agendamentos confirmados</span>
        </div>
      </div>

      <div className="section-card" style={{ marginTop: '2rem', minHeight: '30vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
        <h2 style={{ marginBottom: '1rem' }}>Gráficos de Faturamento em Breve</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', textAlign: 'center', lineHeight: '1.6' }}>
          A integração completa de fluxo de caixa e split de pagamentos para barbeiros estará disponível na próxima atualização do sistema.
        </p>
      </div>
    </div>
  );
}
