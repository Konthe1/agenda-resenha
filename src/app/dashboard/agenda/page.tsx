export default function AgendaPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Agenda Completa</h1>
          <p>Gerencie todos os seus horários e profissionais</p>
        </div>
        <button className="btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
          + Novo Agendamento
        </button>
      </div>

      <div className="section-card" style={{ marginTop: '2rem', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
        <h2 style={{ marginBottom: '1rem' }}>Calendário Interativo em Breve</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', textAlign: 'center', lineHeight: '1.6' }}>
          O módulo avançado de calendário com visão diária/semanal e arrastar-e-soltar está sendo liberado gradativamente. Por enquanto, acompanhe seus próximos clientes na tela de Visão Geral.
        </p>
      </div>
    </div>
  );
}
