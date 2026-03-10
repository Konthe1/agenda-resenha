import Link from "next/link";
import "./painel.css";

export default function PainelBarbearia() {
  return (
    <div className="dashboard-container">
      {/* Sidebar Mobile/Desktop */}
      <nav className="dashboard-nav">
        <div className="nav-header">
           <span className="logo-icon">💈</span>
           <h2 className="logo-text">Resenha<span className="accent">Agenda</span></h2>
        </div>
        
        <ul className="nav-links">
           <li>
              <Link href="/barbearia/painel" className="nav-item active">
                 <span className="icon">📅</span>
                 <span>Minha Agenda</span>
              </Link>
           </li>
           <li>
              <Link href="/barbearia/painel/audios" className="nav-item">
                 <span className="icon">🎙️</span>
                 <span>Meus Áudios</span>
                 <span className="badge">Novo</span>
              </Link>
           </li>
           <li>
              <Link href="/barbearia/painel/clientes" className="nav-item">
                 <span className="icon">👥</span>
                 <span>Clientes</span>
              </Link>
           </li>
           <li>
              <Link href="/barbearia/painel/configuracoes" className="nav-item">
                 <span className="icon">⚙️</span>
                 <span>Ajustes</span>
              </Link>
           </li>
        </ul>
        
        <div className="nav-footer">
           <div className="user-profile">
              <div className="avatar">A</div>
              <div className="user-info">
                 <span className="user-name">Admin</span>
                 <span className="user-role">Barbearia Root</span>
              </div>
           </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="dashboard-main">
         <header className="main-header">
            <div>
               <h1 className="page-title">Bem-vindo, Parceiro! 👋</h1>
               <p className="page-subtitle">Aqui está o resumo do seu dia.</p>
            </div>
            
            <button className="btn-primary share-btn">
               <span className="icon">📲</span>
               <span>Copiar Link da Agenda</span>
            </button>
         </header>

         <div className="dashboard-content">
            {/* Cards de Resumo */}
            <div className="stats-grid">
               <div className="stat-card card">
                  <span className="stat-label">Agendamentos Hoje</span>
                  <span className="stat-value">12</span>
                  <span className="stat-trend positive">↑ 2 a mais que ontem</span>
               </div>
               
               <div className="stat-card card">
                  <span className="stat-label">Áudios Enviados</span>
                  <span className="stat-value">45</span>
                  <span className="stat-trend neutral">Nesta semana</span>
               </div>

               <div className="stat-card card">
                  <span className="stat-label">Faturamento Previsto</span>
                  <span className="stat-value">R$ 480,00</span>
                  <span className="stat-trend">Baseado nos agendamentos</span>
               </div>
            </div>

            {/* Agenda Lista Mock */}
            <div className="agenda-section">
               <div className="section-header">
                  <h3>Próximos Clientes</h3>
                  <button className="btn-secondary filter-btn">Filtrar</button>
               </div>
               
               <div className="agenda-list">
                  <div className="agenda-item card">
                     <div className="time-block">
                        <span className="time">14:00</span>
                        <span className="duration">40 min</span>
                     </div>
                     <div className="details-block">
                        <h4>João Silva</h4>
                        <p>Corte + Barba na Navalha</p>
                     </div>
                     <div className="action-block">
                        <span className="status-badge confirmed">Confirmado</span>
                        <button className="action-icon-btn">💬</button>
                     </div>
                  </div>
                  
                  <div className="agenda-item card">
                     <div className="time-block">
                        <span className="time">15:00</span>
                        <span className="duration">30 min</span>
                     </div>
                     <div className="details-block">
                        <h4>Marcos Oliveira</h4>
                        <p>Apenas Corte</p>
                     </div>
                     <div className="action-block">
                        <span className="status-badge pending">Aguardando</span>
                        <button className="action-icon-btn">💬</button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </main>
    </div>
  );
}
