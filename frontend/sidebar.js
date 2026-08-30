// Shared sidebar + topbar for all admin pages
const API = (window.SCMS_CONFIG && window.SCMS_CONFIG.apiBase) || 'http://localhost:8080/scms/api';
const user = JSON.parse(localStorage.getItem('scms_user') || '{}');

function requireAdmin(){ if(!user.id||user.role!=='Admin') window.location.href='index.html'; }
function requireResident(){ if(!user.id||user.role!=='Resident') window.location.href='index.html'; }
function requireGuard(){ if(!user.id||user.role!=='Guard') window.location.href='index.html'; }

function logout(){ if(confirm('Are you sure you want to logout?')){ localStorage.removeItem('scms_user'); window.location.href='index.html'; } }

/* ---- Demo-only role switcher ----------------------------------------------
   Lets a visitor jump between the Admin / Resident / Guard views (and perform
   that role's actions) without logging out. Ids/names match the seed data in
   database/scms_database.sql and js/mock-api.js. */
const DEMO_USERS = {
  Admin:    { id:1, name:'Admin User',   role:'Admin',    apartment:'' },
  Resident: { id:2, name:'Ali Raza',     role:'Resident', apartment:'A-203' },
  Guard:    { id:4, name:'Guard Hassan', role:'Guard',    apartment:'' }
};
function switchRole(role){
  const u = DEMO_USERS[role];
  if(!u) return;
  localStorage.setItem('scms_user', JSON.stringify(u));
  window.location.href = role==='Admin' ? 'admin.html'
                       : role==='Resident' ? 'resident.html'
                       : 'guard.html';
}
function renderRoleSwitcher(current){
  const cur = String(current||'').toLowerCase();
  const items = [
    {key:'Admin',    icon:'fa-user-shield',   label:'Admin'},
    {key:'Resident', icon:'fa-house-user',    label:'Resident'},
    {key:'Guard',    icon:'fa-shield-halved', label:'Guard'}
  ];
  return `<div class="role-switch">
    <div class="rs-label"><i class="fa-solid fa-shuffle"></i> Demo · switch view</div>
    <div class="rs-btns">
      ${items.map(it=>`<button class="rs-btn${it.key.toLowerCase()===cur?' active':''}" ${it.key.toLowerCase()===cur?'disabled':''} onclick="switchRole('${it.key}')">
        <i class="fa-solid ${it.icon}"></i><span>${it.label}</span></button>`).join('')}
    </div>
  </div>`;
}

function renderAdminSidebar(activePage){
  const navItems = [
    {href:'admin.html',icon:'fa-grid-2',label:'Dashboard',id:'dashboard'},
    {href:'visitors.html',icon:'fa-users',label:'Visitors',id:'visitors'},
    {href:'complaints.html',icon:'fa-circle-exclamation',label:'Complaints',id:'complaints'},
    {href:'billing.html',icon:'fa-wallet',label:'Billing',id:'billing'},
    {href:'parking.html',icon:'fa-car',label:'Parking',id:'parking'},
    {href:'announcements.html',icon:'fa-bullhorn',label:'Announcements',id:'announcements'},
    {href:'manage-users.html',icon:'fa-user-gear',label:'Manage Users',id:'manage-users'},
  ];
  const nav = navItems.map(n=>`
    <a href="${n.href}" class="nav-item ${activePage===n.id?'active':''}">
      <i class="fa-solid ${n.icon}"></i><span>${n.label}</span>
    </a>`).join('');
  return `<aside class="sidebar">
    <div class="sidebar-top">
      <div class="brand"><div class="brand-icon">🏘</div><div><h3>SCMS</h3><small>Admin Panel</small></div></div>
      <nav class="nav">${nav}</nav>
    </div>
    <div class="sidebar-bottom">
      <div class="user-card">
        <div class="avatar">${(user.name||'A')[0].toUpperCase()}</div>
        <div><p class="u-name">${user.name||'Admin'}</p><small>Administrator</small></div>
      </div>
      ${renderRoleSwitcher('Admin')}
      <button class="logout-btn" onclick="logout()"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
    </div>
  </aside>`;
}

const sharedCSS = `
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;font-family:'Inter',sans-serif;}
:root{
  --bg:#0a0e1a; --surface:rgba(255,255,255,0.04); --surface2:rgba(255,255,255,0.07);
  --border:rgba(255,255,255,0.08); --text:#e2e8f0; --muted:#64748b;
  --purple:#6366f1; --purple-dark:#4338ca; --purple-light:#818cf8;
  --green:#22c55e; --red:#ef4444; --yellow:#f59e0b; --blue:#3b82f6; --orange:#f97316;
  --sidebar-w:260px;
}
body{background:var(--bg);color:var(--text);display:flex;min-height:100vh;}
body::before{content:'';position:fixed;inset:0;
  background:radial-gradient(ellipse at 0% 0%, rgba(99,102,241,0.12) 0%, transparent 60%),
             radial-gradient(ellipse at 100% 100%, rgba(139,92,246,0.1) 0%, transparent 60%);
  pointer-events:none;z-index:0;}
.sidebar{width:var(--sidebar-w);height:100vh;position:fixed;left:0;top:0;z-index:100;
  background:rgba(10,14,26,0.95);backdrop-filter:blur(20px);
  border-right:1px solid var(--border);display:flex;flex-direction:column;justify-content:space-between;padding:24px 16px;}
.brand{display:flex;align-items:center;gap:12px;padding:0 8px 24px;border-bottom:1px solid var(--border);}
.brand-icon{width:42px;height:42px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
.brand h3{color:white;font-size:17px;font-weight:700;line-height:1.2;}
.brand small{color:var(--muted);font-size:11px;}
.nav{margin-top:20px;display:flex;flex-direction:column;gap:4px;}
.nav-item{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;
  color:var(--muted);text-decoration:none;font-size:14px;font-weight:500;transition:0.2s;}
.nav-item i{width:18px;text-align:center;font-size:15px;}
.nav-item:hover{background:var(--surface2);color:var(--text);}
.nav-item.active{background:linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.15));
  color:var(--purple-light);border:1px solid rgba(99,102,241,0.2);}
.user-card{display:flex;align-items:center;gap:10px;padding:12px;background:var(--surface);
  border-radius:12px;border:1px solid var(--border);margin-bottom:10px;}
.avatar{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);
  display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:white;flex-shrink:0;}
.u-name{font-size:13px;font-weight:600;color:var(--text);}
.user-card small{color:var(--muted);font-size:11px;}
.logout-btn{width:100%;padding:10px;border:1px solid rgba(239,68,68,0.2);
  background:rgba(239,68,68,0.08);color:#ef4444;border-radius:10px;cursor:pointer;
  font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px;transition:0.2s;}
.logout-btn:hover{background:#ef4444;color:white;border-color:#ef4444;}
.main{margin-left:var(--sidebar-w);flex:1;padding:32px;position:relative;z-index:1;overflow-x:hidden;}
.page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;flex-wrap:wrap;gap:16px;}
.page-title h1{font-size:28px;font-weight:800;color:white;margin-bottom:4px;}
.page-title p{color:var(--muted);font-size:14px;}
.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:18px;margin-bottom:28px;}
.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:22px;
  transition:0.3s;cursor:default;position:relative;overflow:hidden;}
.stat-card::before{content:'';position:absolute;inset:0;border-radius:20px;opacity:0;transition:0.3s;
  background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.05));}
.stat-card:hover::before{opacity:1;}
.stat-card:hover{transform:translateY(-4px);border-color:rgba(99,102,241,0.3);}
.stat-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;}
.stat-icon{width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:20px;}
.stat-card h2{font-size:32px;font-weight:800;margin-bottom:4px;}
.stat-card p{color:var(--muted);font-size:13px;font-weight:500;}
.stat-trend{font-size:11px;padding:3px 8px;border-radius:20px;font-weight:600;}
.box{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:24px;}
.box-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;}
.box-title{font-size:16px;font-weight:700;color:white;}
.btn{padding:10px 20px;border-radius:10px;border:none;font-size:13px;font-weight:600;cursor:pointer;transition:0.2s;display:inline-flex;align-items:center;gap:8px;}
.btn-primary{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;}
.btn-primary:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(99,102,241,0.35);}
.btn-danger{background:rgba(239,68,68,0.12);color:#ef4444;border:1px solid rgba(239,68,68,0.2);}
.btn-danger:hover{background:#ef4444;color:white;}
.btn-sm{padding:7px 14px;font-size:12px;}
.badge{padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;display:inline-block;}
.badge-green{background:rgba(34,197,94,0.15);color:#22c55e;}
.badge-yellow{background:rgba(245,158,11,0.15);color:#f59e0b;}
.badge-red{background:rgba(239,68,68,0.15);color:#ef4444;}
.badge-blue{background:rgba(59,130,246,0.15);color:#60a5fa;}
.badge-purple{background:rgba(99,102,241,0.15);color:#818cf8;}
.search-bar{position:relative;margin-bottom:20px;}
.search-bar i{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--muted);}
.search-bar input{width:100%;padding:12px 12px 12px 42px;background:var(--surface2);
  border:1px solid var(--border);border-radius:12px;color:var(--text);font-size:14px;outline:none;transition:0.2s;}
.search-bar input:focus{border-color:var(--purple);}
.search-bar input::placeholder{color:var(--muted);}
table{width:100%;border-collapse:collapse;}
th{text-align:left;padding:12px 16px;color:var(--muted);font-size:12px;font-weight:600;
  text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid var(--border);}
td{padding:14px 16px;font-size:13.5px;border-bottom:1px solid rgba(255,255,255,0.04);transition:0.2s;}
tr:hover td{background:var(--surface2);}
.form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:16px;}
.fg{display:flex;flex-direction:column;gap:6px;}
.fg label{font-size:12px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;}
.fg input,.fg select,.fg textarea{padding:11px 14px;background:var(--surface2);border:1px solid var(--border);
  border-radius:10px;color:var(--text);font-size:13.5px;outline:none;transition:0.2s;}
.fg input:focus,.fg select:focus,.fg textarea:focus{border-color:var(--purple);}
.fg input::placeholder{color:var(--muted);}
.fg select option{background:#1e293b;}
.fg textarea{resize:vertical;min-height:80px;}
.empty-state{text-align:center;padding:50px 20px;color:var(--muted);}
.empty-state i{font-size:48px;margin-bottom:14px;opacity:0.4;}
.toast{position:fixed;bottom:28px;right:28px;padding:14px 20px;border-radius:14px;
  font-size:14px;font-weight:600;z-index:9999;animation:slideUp 0.3s ease;display:none;
  align-items:center;gap:10px;max-width:320px;}
.toast.show{display:flex;}
.toast-success{background:#166534;border:1px solid #22c55e;color:#bbf7d0;}
.toast-error{background:#7f1d1d;border:1px solid #ef4444;color:#fecaca;}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.filter-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;}
.filter-tab{padding:8px 18px;border-radius:20px;border:1px solid var(--border);background:transparent;
  color:var(--muted);font-size:13px;font-weight:500;cursor:pointer;transition:0.2s;}
.filter-tab.active,.filter-tab:hover{background:var(--purple);color:white;border-color:var(--purple);}
@keyframes spin{to{transform:rotate(360deg)}}
.spin{animation:spin 1s linear infinite;display:inline-block;}
.role-switch{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:10px;}
.rs-label{display:flex;align-items:center;gap:6px;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:9px;}
.rs-btns{display:flex;gap:6px;}
.rs-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 4px;border-radius:9px;border:1px solid var(--border);background:var(--surface2);color:var(--muted);font-family:inherit;font-size:11px;font-weight:600;cursor:pointer;transition:0.2s;}
.rs-btn i{font-size:14px;}
.rs-btn:hover:not(:disabled){color:var(--text);border-color:var(--purple);background:rgba(99,102,241,0.12);}
.rs-btn.active{background:linear-gradient(135deg,rgba(99,102,241,0.28),rgba(139,92,246,0.16));color:var(--purple-light);border-color:rgba(99,102,241,0.45);cursor:default;}
</style>`;
