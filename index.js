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
    body { font-family: Arial, sans-serif; background: #f5f5f5; }
    .login { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #1A3C8F, #0f2557); }
    .login-card { background: white; padding: 40px; border-radius: 8px; width: 90%; max-width: 400px; }
    .login-card h1 { color: #1A3C8F; margin-bottom: 30px; }
    input { width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 4px; }
    button { width: 100%; padding: 10px; background: #1A3C8F; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
    .dashboard { display: none; }
    .topbar { background: #1A3C8F; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; }
    .main { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #ddd; }
    .tab { padding: 10px 20px; background: none; border: none; cursor: pointer; color: #666; font-weight: bold; }
    .tab.active { color: #1A3C8F; border-bottom: 3px solid #1A3C8F; }
    .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
    .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; }
    .modal.show { display: flex; justify-content: center; align-items: center; }
    .modal-content { background: white; padding: 30px; border-radius: 8px; width: 90%; max-width: 500px; }
    .modal-close { position: absolute; top: 10px; right: 20px; font-size: 24px; cursor: pointer; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f0f0f0; padding: 10px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #eee; }
    .btn { padding: 8px 15px; background: #2D9D6E; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
    .btn-danger { background: #D92B2B; }
    .btn-primary { background: #1A3C8F; width: 100%; padding: 10px; }
  <\/style>
</head>
<body>

<div class="login" id="loginPage">
  <div class="login-card">
    <h1>🔐 Férias</h1>
    <p style="margin-bottom: 20px; color: #666;">Lojas Neitzke</p>
    <input type="email" id="loginEmail" placeholder="Email">
    <input type="password" id="loginSenha" placeholder="Senha" onkeypress="if(event.key==='Enter') fazerLogin()">
    <button onclick="fazerLogin()">Entrar</button>
  </div>
</div>

<div class="dashboard" id="dashboard">
  <div class="topbar">
    <h1>📊 Sistema de Férias</h1>
    <div>
      <span id="nomeUsuario"></span>
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
      <button class="btn" onclick="abrirModal('newColab')">+ Novo</button>
      <div id="listaColabs" style="margin-top: 20px;"></div>
    </div>

    <div id="ferias-tab" class="card" style="display:none;">
      <h2>Registrar Férias</h2>
      <button class="btn" onclick="abrirModal('newFeria')">+ Registrar</button>
      <div id="listaFerias" style="margin-top: 20px;"></div>
    </div>

    <div id="relatorios-tab" class="card" style="display:none;">
      <h2>Relatório de Colaboradores</h2>
      <div style="margin: 20px 0;">
        <button class="btn" onclick="selecionarTodos()">Selecionar Todos</button>
        <button class="btn" onclick="limparSelecao()">Limpar</button>
      </div>
      <div id="checkColabs" style="max-height: 300px; overflow-y: auto; border: 1px solid #ddd; padding: 10px;"></div>
      <div style="margin-top: 20px;">
        <button class="btn" onclick="exportarExcel()">Exportar Excel</button>
        <button class="btn" onclick="exportarPDF()">Exportar PDF</button>
      </div>
    </div>

    <div id="admins-tab" class="card" style="display:none;">
      <h2>Usuários</h2>
      <button class="btn" onclick="abrirModal('newAdmin')">+ Novo Usuário</button>
      <div id="listaAdmins" style="margin-top: 20px;"></div>
    </div>
  </div>
</div>

<div class="modal" id="newColabModal">
  <div class="modal-content">
    <span class="modal-close" onclick="fecharModal('newColab')">&times;</span>
    <h2>Novo Colaborador</h2>
    <input type="text" id="colNome" placeholder="Nome">
    <input type="text" id="colPeriodo" placeholder="Período">
    <input type="number" id="colDias" placeholder="Dias" value="30">
    <button class="btn-primary" onclick="criarColab()">Criar</button>
  </div>
</div>

<div class="modal" id="newFeriaModal">
  <div class="modal-content">
    <span class="modal-close" onclick="fecharModal('newFeria')">&times;</span>
    <h2>Registrar Férias</h2>
    <select id="feriaColab" style="width:100%; padding:10px; margin-bottom:15px;">
      <option>Selecione um colaborador</option>
    </select>
    <input type="date" id="feriaInicio" onchange="calcularDias()">
    <input type="date" id="feriaFim" onchange="calcularDias()">
    <input type="number" id="feriaDias" placeholder="Dias" readonly>
    <textarea id="feriaObs" placeholder="Observações (opcional)" style="width: 100%; height: 80px; padding:10px; margin-bottom:15px; border:1px solid #ddd; border-radius:4px;"><\/textarea>
    <button class="btn-primary" onclick="registrarFeria()">Registrar</button>
  </div>
</div>

<div class="modal" id="newAdminModal">
  <div class="modal-content">
    <span class="modal-close" onclick="fecharModal('newAdmin')">&times;</span>
    <h2>Novo Usuário</h2>
    <input type="text" id="adminNome" placeholder="Nome">
    <input type="email" id="adminEmail" placeholder="Email">
    <select id="adminTipo" style="width:100%; padding:10px; margin-bottom:15px;">
      <option value="false">Usuário Normal</option>
      <option value="true">Admin</option>
    </select>
    <button class="btn-primary" onclick="criarAdmin()">Criar</button>
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
    
    carregarColabs();
    carregarAdmins();
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
    html += '<td><button class="btn" onclick="abrirHistorico(' + c.id + ', \\\'' + c.nome + '\\\')">Ver Férias</button>';
    html += '<button class="btn btn-danger" onclick="deletarColab(' + c.id + ')">Deletar</button></td></tr>';
  });
  html += '</table>';
  document.getElementById('listaColabs').innerHTML = html;
  carregarCheckColabs();
}

function carregarCheckColabs() {
  let html = '';
  colabs.forEach(c => {
    html += '<label><input type="checkbox" id="check_' + c.id + '"> ' + c.nome + ' (' + c.dias_disponiveis + ' dias)</label><br>';
  });
  document.getElementById('checkColabs').innerHTML = html;
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
  if (!confirm('Deletar colaborador?')) return;
  await sb.from('colaboradores').delete().eq('id', id);
  carregarColabs();
}

async function carregarAdmins() {
  const { data } = await sb.from('admin_users').select('*').order('nome');
  let html = '<table><tr><th>Nome</th><th>Email</th><th>Tipo</th><th>Ação</th></tr>';
  data.forEach(a => {
    html += '<tr><td>' + a.nome + '</td><td>' + a.email + '</td><td>' + (a.is_admin ? 'Admin' : 'Usuário') + '</td>';
    html += '<td><button class="btn btn-danger" onclick="deletarAdmin(' + a.id + ')">Deletar</button></td></tr>';
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
  await sb.from('admin_users').insert({ nome, email, senha_hash: senhaTemp, is_admin: isAdmin, criado_em: new Date().toISOString() });
  alert('Senha temporária: ' + senhaTemp);
  fecharModal('newAdmin');
  carregarAdmins();
}

async function deletarAdmin(id) {
  if (!confirm('Deletar usuário?')) return;
  await sb.from('admin_users').delete().eq('id', id);
  carregarAdmins();
}

function abrirModal(tipo) {
  if (tipo === 'newColab') document.getElementById('newColabModal').classList.add('show');
  if (tipo === 'newFeria') {
    const sel = document.getElementById('feriaColab');
    sel.innerHTML = '<option>Selecione</option>';
    colabs.forEach(c => { sel.innerHTML += '<option value="' + c.id + '">' + c.nome + '</option>'; });
    document.getElementById('newFeriaModal').classList.add('show');
  }
  if (tipo === 'newAdmin') document.getElementById('newAdminModal').classList.add('show');
}

function fecharModal(tipo) {
  if (tipo === 'newColab') document.getElementById('newColabModal').classList.remove('show');
  if (tipo === 'newFeria') document.getElementById('newFeriaModal').classList.remove('show');
  if (tipo === 'newAdmin') document.getElementById('newAdminModal').classList.remove('show');
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

async function abrirHistorico(id, nome) {
  const { data } = await sb.from('ferias').select('*').eq('colaborador_id', id).order('data_inicio', { ascending: false });
  let html = '<h3>Férias de ' + nome + '</h3><table><tr><th>Início</th><th>Fim</th><th>Dias</th><th>Obs</th></tr>';
  if (data.length) {
    data.forEach(f => {
      html += '<tr><td>' + f.data_inicio + '</td><td>' + f.data_fim + '</td><td>' + f.dias_utilizados + '</td><td>' + (f.observacoes || '-') + '</td></tr>';
    });
  } else {
    html += '<tr><td colspan="4">Nenhuma férias registrada</td></tr>';
  }
  html += '</table>';
  alert(html);
}

function mostrarTab(id, btn) {
  document.querySelectorAll('[id$="-tab"]').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(id + '-tab').style.display = 'block';
  btn.classList.add('active');
}

function selecionarTodos() { colabs.forEach(c => { document.getElementById('check_' + c.id).checked = true; }); }
function limparSelecao() { colabs.forEach(c => { document.getElementById('check_' + c.id).checked = false; }); }

async function exportarExcel() {
  const selecionados = colabs.filter(c => document.getElementById('check_' + c.id).checked);
  if (!selecionados.length) { alert('Selecione colaboradores!'); return; }
  
  let csv = 'Nome,Período,Dias Totais,Dias Disponíveis\\n';
  selecionados.forEach(c => {
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
  const selecionados = colabs.filter(c => document.getElementById('check_' + c.id).checked);
  if (!selecionados.length) { alert('Selecione colaboradores!'); return; }
  
  let html = '<h1>Relatório de Férias</h1><table border="1"><tr><th>Nome</th><th>Período</th><th>Dias</th></tr>';
  selecionados.forEach(c => {
    html += '<tr><td>' + c.nome + '</td><td>' + (c.periodo_aquisitivo || '-') + '</td><td>' + c.dias_disponiveis + '</td></tr>';
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
</html>`;

app.get('*', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(HTML);
});

app.listen(process.env.PORT || 3000);
