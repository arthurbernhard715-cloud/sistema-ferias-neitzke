import express from 'express';
const app = express();

const HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Férias - Lojas Neitzke</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --primary: #1A3C8F;
      --danger: #D92B2B;
      --success: #2D9D6E;
      --gray: #6C757D;
      --light: #F8F9FA;
      --radius: 12px;
    }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f2f5; color: #333; }

    /* LOGIN */
    #loginPage { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, var(--primary), #0f2557); }
    #loginCard { background: white; padding: 40px; border-radius: var(--radius); width: 100%; max-width: 400px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
    #loginCard h1 { color: var(--primary); margin-bottom: 6px; font-size: 28px; }
    #loginCard p { color: var(--gray); font-size: 13px; margin-bottom: 24px; }
    
    input { width: 100%; padding: 10px 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
    input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(26,60,143,0.1); }
    
    button { padding: 10px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .btn-primary { background: var(--primary); color: white; width: 100%; }
    .btn-primary:hover { background: #0f2557; }
    
    /* DASHBOARD */
    #dashboard { display: none; }
    .topbar { background: white; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .topbar h1 { color: var(--primary); font-size: 20px; }
    .main { max-width: 1100px; margin: 0 auto; padding: 24px; }
    
    .tabs { display: flex; gap: 4px; margin-bottom: 24px; border-bottom: 2px solid #eee; }
    .tab { padding: 12px 20px; background: none; border: none; cursor: pointer; font-size: 14px; font-weight: 600; color: var(--gray); }
    .tab.active { color: var(--primary); border-bottom: 3px solid var(--primary); }
    
    .card { background: white; padding: 20px; border-radius: var(--radius); box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 20px; }
    .card h2 { color: var(--primary); font-size: 17px; margin-bottom: 15px; }
    
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: var(--light); padding: 10px; text-align: left; font-weight: 600; color: var(--primary); }
    td { padding: 10px; border-bottom: 1px solid #f0f0f0; }
    
    .btn { padding: 6px 12px; background: var(--danger); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; margin: 2px; }
    .btn-success { background: var(--success); }
    .btn:hover { opacity: 0.9; }
    
    /* MODAL */
    .modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 1000; }
    .modal.active { display: flex; }
    .modal-box { background: white; padding: 32px; border-radius: var(--radius); width: 90%; max-width: 480px; }
    .modal-title { color: var(--primary); font-size: 18px; margin-bottom: 20px; }
    .modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
    
    /* MODAL FORÇADO (PRIMEIRA VEZ) */
    .modal-forced { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); justify-content: center; align-items: center; z-index: 2000; }
    .modal-forced.active { display: flex; }
    
    select { width: 100%; padding: 10px 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
    textarea { width: 100%; padding: 10px 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; font-family: inherit; }
  <\/style>
</head>
<body>

<!-- LOGIN -->
<div id="loginPage">
  <div id="loginCard">
    <h1>🔐 Férias</h1>
    <p>Lojas Neitzke</p>
    <div id="loginAlert"></div>
    <input type="email" id="loginEmail" placeholder="Email">
    <input type="password" id="loginSenha" placeholder="Senha" onkeypress="if(event.key==='Enter') fazerLogin()">
    <button class="btn-primary" onclick="fazerLogin()">Entrar</button>
  </div>
</div>

<!-- MODAL FORÇADO - PRIMEIRA VEZ -->
<div class="modal-forced" id="modalPrimeiraVez">
  <div class="modal-box">
    <h2 class="modal-title">🔐 Alterar Senha</h2>
    <p style="margin-bottom: 15px; color: var(--gray); font-size: 13px;">Este é seu primeiro acesso. Por favor, altere sua senha.</p>
    <input type="password" id="novaSenha" placeholder="Nova senha">
    <input type="password" id="confirmarSenha" placeholder="Confirmar senha">
    <button class="btn-primary" onclick="confirmarNovaSenha()">Alterar Senha</button>
  </div>
</div>

<!-- DASHBOARD -->
<div id="dashboard">
  <div class="topbar">
    <h1>📊 Sistema de Férias</h1>
    <div style="display: flex; align-items: center; gap: 15px;">
      <span id="nomeUsuario" style="font-size: 13px; color: var(--gray);"></span>
      <button class="btn btn-danger" onclick="logout()">Sair</button>
    </div>
  </div>

  <div class="main">
    <div class="tabs">
      <button class="tab active" onclick="mostrarTab('colabs', this)">👥 Colaboradores</button>
      <button class="tab" onclick="mostrarTab('ferias', this)">🏖️ Férias</button>
      <button class="tab" onclick="mostrarTab('relatorios', this)">📊 Relatórios</button>
      <button class="tab" onclick="mostrarTab('admins', this)">🔑 Admins</button>
    </div>

    <div id="colabs-tab" class="card">
      <h2>Colaboradores</h2>
      <button class="btn btn-success" onclick="abrirModal('newColab')">+ Novo</button>
      <div id="listaColabs" style="margin-top: 20px;"></div>
    </div>

    <div id="ferias-tab" class="card" style="display:none;">
      <h2>Registrar Férias</h2>
      <button class="btn btn-success" onclick="abrirModal('newFeria')">+ Registrar</button>
      <div id="listaFerias" style="margin-top: 20px;"></div>
    </div>

    <div id="relatorios-tab" class="card" style="display:none;">
      <h2>Relatório de Colaboradores</h2>
      <button class="btn btn-success" onclick="exportarExcel()">Exportar Excel</button>
      <button class="btn btn-success" onclick="exportarPDF()">Exportar PDF</button>
    </div>

    <div id="admins-tab" class="card" style="display:none;">
      <h2>Usuários do Sistema</h2>
      <button class="btn btn-success" onclick="abrirModal('newAdmin')">+ Novo Usuário</button>
      <div id="listaAdmins" style="margin-top: 20px;"></div>
    </div>
  </div>
</div>

<!-- MODALS -->
<div class="modal" id="newColabModal">
  <div class="modal-box">
    <h2 class="modal-title">Novo Colaborador</h2>
    <input type="text" id="colNome" placeholder="Nome">
    <input type="text" id="colPeriodo" placeholder="Período">
    <input type="number" id="colDias" placeholder="Dias" value="30">
    <div class="modal-footer">
      <button class="btn" onclick="fecharModal('newColab')">Cancelar</button>
      <button class="btn btn-success" onclick="criarColab()">Criar</button>
    </div>
  </div>
</div>

<div class="modal" id="newFeriaModal">
  <div class="modal-box">
    <h2 class="modal-title">Registrar Férias</h2>
    <select id="feriaColab"><option>Selecione</option></select>
    <input type="date" id="feriaInicio" onchange="calcularDias()">
    <input type="date" id="feriaFim" onchange="calcularDias()">
    <input type="number" id="feriaDias" placeholder="Dias" readonly>
    <textarea id="feriaObs" placeholder="Observações (opcional)"><\/textarea>
    <div class="modal-footer">
      <button class="btn" onclick="fecharModal('newFeria')">Cancelar</button>
      <button class="btn btn-success" onclick="registrarFeria()">Registrar</button>
    </div>
  </div>
</div>

<div class="modal" id="newAdminModal">
  <div class="modal-box">
    <h2 class="modal-title">Novo Usuário</h2>
    <input type="text" id="adminNome" placeholder="Nome">
    <input type="email" id="adminEmail" placeholder="Email">
    <select id="adminTipo">
      <option value="false">Usuário Normal</option>
      <option value="true">Admin</option>
    </select>
    <div class="modal-footer">
      <button class="btn" onclick="fecharModal('newAdmin')">Cancelar</button>
      <button class="btn btn-success" onclick="criarAdmin()">Criar</button>
    </div>
  </div>
</div>

<script>
let sb = null;
let usuario = null;
let colabs = [];

async function init() {
  const url = 'https://boiakwhxkyposfyljiry.supabase.co';
  const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvaWFrd2h4a3lwb3NmeWxqaXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMDUwODksImV4cCI6MjEwMTY4MTA4OX0.Kx1JID5_LuNATBeR67NeA_c0CxQKq6ggJLB6PJtJkWM';
  sb = window.supabase.createClient(url, key);
}

async function fazerLogin() {
  const email = document.getElementById('loginEmail').value;
  const senha = document.getElementById('loginSenha').value;
  if (!email || !senha) { alert('Preencha email e senha!'); return; }
  
  try {
    const { data } = await sb.from('admin_users').select('*').eq('email', email).single();
    if (!data || data.senha_hash !== senha) { alert('Email ou senha incorretos!'); return; }
    
    usuario = data;
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('nomeUsuario').textContent = data.nome;
    
    // Se é primeira vez, mostra modal forçado
    if (data.primeira_vez) {
      document.getElementById('modalPrimeiraVez').classList.add('active');
    } else {
      carregarColabs();
      carregarAdmins();
    }
  } catch (e) {
    alert('Erro: ' + e.message);
  }
}

async function confirmarNovaSenha() {
  const nova = document.getElementById('novaSenha').value;
  const confirmar = document.getElementById('confirmarSenha').value;
  
  if (!nova || !confirmar) { alert('Preencha as duas senhas!'); return; }
  if (nova !== confirmar) { alert('As senhas não conferem!'); return; }
  if (nova.length < 6) { alert('Senha deve ter pelo menos 6 caracteres!'); return; }
  
  try {
    await sb.from('admin_users').update({ senha_hash: nova, primeira_vez: false }).eq('id', usuario.id);
    usuario.primeira_vez = false;
    document.getElementById('modalPrimeiraVez').classList.remove('active');
    carregarColabs();
    carregarAdmins();
    alert('Senha alterada com sucesso!');
  } catch (e) {
    alert('Erro: ' + e.message);
  }
}

async function carregarColabs() {
  const { data } = await sb.from('colaboradores').select('*').order('nome');
  colabs = data || [];
  
  let html = '<table><tr><th>Nome</th><th>Período</th><th>Dias</th><th>Disponível</th><th>Ações</th></tr>';
  colabs.forEach(c => {
    html += '<tr><td>' + c.nome + '</td><td>' + (c.periodo_aquisitivo || '-') + '</td><td>' + c.dias_totais + '</td><td>' + c.dias_disponiveis + '</td>';
    html += '<td><button class="btn" onclick="deletarColab(' + c.id + ')">Deletar</button></td></tr>';
  });
  html += '</table>';
  document.getElementById('listaColabs').innerHTML = html;
}

async function criarColab() {
  const nome = document.getElementById('colNome').value;
  const periodo = document.getElementById('colPeriodo').value;
  const dias = document.getElementById('colDias').value;
  if (!nome || !periodo) { alert('Preencha tudo!'); return; }
  
  await sb.from('colaboradores').insert({ nome, periodo_aquisitivo: periodo, dias_totais: dias, dias_disponiveis: dias, ativo: true, criado_em: new Date().toISOString() });
  fecharModal('newColab');
  carregarColabs();
}

async function deletarColab(id) {
  if (!confirm('Deletar?')) return;
  await sb.from('colaboradores').delete().eq('id', id);
  carregarColabs();
}

async function carregarAdmins() {
  const { data } = await sb.from('admin_users').select('*').order('nome');
  let html = '<table><tr><th>Nome</th><th>Email</th><th>Tipo</th><th>Ação</th></tr>';
  data.forEach(a => {
    html += '<tr><td>' + a.nome + '</td><td>' + a.email + '</td><td>' + (a.is_admin ? 'Admin' : 'Usuário') + '</td>';
    html += '<td><button class="btn" onclick="deletarAdmin(' + a.id + ')">Deletar</button></td></tr>';
  });
  html += '</table>';
  document.getElementById('listaAdmins').innerHTML = html;
}

async function criarAdmin() {
  const nome = document.getElementById('adminNome').value;
  const email = document.getElementById('adminEmail').value;
  const isAdmin = document.getElementById('adminTipo').value === 'true';
  if (!nome || !email) { alert('Preencha tudo!'); return; }
  
  const senhaTemp = Math.random().toString(36).slice(-8);
  await sb.from('admin_users').insert({ nome, email, senha_hash: senhaTemp, is_admin: isAdmin, primeira_vez: true, criado_em: new Date().toISOString() });
  alert('Usuário criado!\\nEmail: ' + email + '\\nSenha: ' + senhaTemp);
  fecharModal('newAdmin');
  carregarAdmins();
}

async function deletarAdmin(id) {
  if (!confirm('Deletar?')) return;
  await sb.from('admin_users').delete().eq('id', id);
  carregarAdmins();
}

function abrirModal(tipo) {
  if (tipo === 'newColab') document.getElementById('newColabModal').classList.add('active');
  if (tipo === 'newFeria') {
    const sel = document.getElementById('feriaColab');
    sel.innerHTML = '<option>Selecione</option>';
    colabs.forEach(c => { sel.innerHTML += '<option value="' + c.id + '">' + c.nome + '</option>'; });
    document.getElementById('newFeriaModal').classList.add('active');
  }
  if (tipo === 'newAdmin') document.getElementById('newAdminModal').classList.add('active');
}

function fecharModal(tipo) {
  if (tipo === 'newColab') document.getElementById('newColabModal').classList.remove('active');
  if (tipo === 'newFeria') document.getElementById('newFeriaModal').classList.remove('active');
  if (tipo === 'newAdmin') document.getElementById('newAdminModal').classList.remove('active');
}

function calcularDias() {
  const inicio = new Date(document.getElementById('feriaInicio').value);
  const fim = new Date(document.getElementById('feriaFim').value);
  if (inicio && fim) {
    const dias = Math.floor((fim - inicio) / (1000 * 60 * 60 * 24)) + 1;
    document.getElementById('feriaDias').value = dias;
  }
}

async function registrarFeria() {
  const cid = document.getElementById('feriaColab').value;
  const inicio = document.getElementById('feriaInicio').value;
  const fim = document.getElementById('feriaFim').value;
  const dias = parseInt(document.getElementById('feriaDias').value);
  const obs = document.getElementById('feriaObs').value;
  
  if (!cid || !inicio || !fim || !dias) { alert('Preencha tudo!'); return; }
  
  const c = colabs.find(x => x.id == cid);
  if (c.dias_disponiveis < dias) { alert('Dias insuficientes!'); return; }
  
  await sb.from('ferias').insert({ colaborador_id: cid, data_inicio: inicio, data_fim: fim, dias_utilizados: dias, observacoes: obs, criado_em: new Date().toISOString() });
  await sb.from('colaboradores').update({ dias_disponiveis: c.dias_disponiveis - dias }).eq('id', cid);
  
  fecharModal('newFeria');
  carregarColabs();
}

function mostrarTab(id, btn) {
  document.querySelectorAll('[id$="-tab"]').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(id + '-tab').style.display = 'block';
  btn.classList.add('active');
}

function exportarExcel() {
  let csv = 'Nome,Período,Dias Totais,Dias Disponíveis\\n';
  colabs.forEach(c => {
    csv += '"' + c.nome + '","' + (c.periodo_aquisitivo || '-') + '",' + c.dias_totais + ',' + c.dias_disponiveis + '\\n';
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'relatorio.csv';
  a.click();
}

function exportarPDF() {
  let html = '<h1>Relatório de Férias</h1><table border="1"><tr><th>Nome</th><th>Dias</th></tr>';
  colabs.forEach(c => {
    html += '<tr><td>' + c.nome + '</td><td>' + c.dias_disponiveis + '</td></tr>';
  });
  html += '</table>';
  const win = window.open();
  win.document.write(html);
  win.print();
}

function logout() { location.reload(); }

init();
<\/script>

</body>
</html>\`;

app.get('*', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(HTML);
});

app.listen(process.env.PORT || 3000);
