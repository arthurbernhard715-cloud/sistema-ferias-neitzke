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
    :root { --primary: #1A3C8F; --danger: #D92B2B; --success: #2D9D6E; --gray: #6C757D; --light: #F8F9FA; --radius: 12px; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f2f5; color: #333; }
    #loginPage { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, var(--primary), #0f2557); }
    #loginCard { background: white; padding: 40px; border-radius: var(--radius); width: 100%; max-width: 400px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
    #loginCard h1 { color: var(--primary); margin-bottom: 6px; font-size: 28px; }
    #loginCard p { color: var(--gray); font-size: 13px; margin-bottom: 24px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; color: var(--primary); }
    .form-group input { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
    .form-group input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(26,60,143,0.1); }
    .btn-primary { background: var(--primary); color: white; width: 100%; padding: 10px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .btn-primary:hover { background: #0f2557; }
    #dashboard { display: none; }
    .topbar { background: white; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .topbar h1 { color: var(--primary); font-size: 20px; }
    .main { max-width: 1100px; margin: 0 auto; padding: 24px; }
    .tabs { display: flex; gap: 4px; margin-bottom: 24px; border-bottom: 2px solid #eee; }
    .tab { padding: 12px 20px; background: none; border: none; cursor: pointer; font-size: 14px; font-weight: 600; color: var(--gray); transition: all 0.2s; }
    .tab.active { color: var(--primary); border-bottom: 3px solid var(--primary); }
    .card { background: white; border-radius: var(--radius); padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .card h2 { color: var(--primary); font-size: 17px; margin-bottom: 15px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: var(--light); padding: 10px; text-align: left; font-weight: 600; color: var(--primary); }
    td { padding: 10px; border-bottom: 1px solid #f0f0f0; }
    .btn { padding: 6px 12px; background: var(--danger); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; margin: 2px; }
    .btn-success { background: var(--success); }
    .btn:hover { opacity: 0.9; }
    .empty { text-align: center; padding: 40px; color: var(--gray); }
  <\/style>
</head>
<body>

<div id="loginPage">
  <div id="loginCard">
    <h1>🔐 Férias</h1>
    <p>Lojas Neitzke</p>
    <div class="form-group">
      <label>Email</label>
      <input type="email" id="loginEmail" placeholder="email@example.com">
    </div>
    <div class="form-group">
      <label>Senha</label>
      <input type="password" id="loginSenha" placeholder="••••••••" onkeypress="if(event.key==='Enter') fazerLogin()">
    </div>
    <button class="btn-primary" onclick="fazerLogin()">Entrar</button>
  </div>
</div>

<div id="dashboard">
  <div class="topbar">
    <h1>📊 Férias - Lojas Neitzke</h1>
    <div style="display: flex; gap: 15px; align-items: center;">
      <span id="nomeUsuario" style="font-size: 13px; color: var(--gray);"></span>
      <button class="btn" onclick="logout()">Sair</button>
    </div>
  </div>

  <div class="main">
    <div class="tabs">
      <button class="tab active" onclick="mostrarTab('colabs', this)">👥 Colaboradores</button>
      <button class="tab" onclick="mostrarTab('ferias', this)">🏖️ Férias</button>
      <button class="tab" onclick="mostrarTab('admins', this)">🔑 Admins</button>
      <button class="tab" onclick="mostrarTab('auditoria', this)">📋 Auditoria</button>
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

    <div id="auditoria-tab" class="card" style="display:none;">
      <h2>Log de Auditoria</h2>
      <div id="listaAuditoria" style="margin-top: 20px;"></div>
    </div>

    <div id="admins-tab" class="card" style="display:none;">
      <h2>Usuários do Sistema</h2>
      <button class="btn btn-success" onclick="abrirModal('newAdmin')">+ Novo Usuário</button>
      <div id="listaAdmins" style="margin-top: 20px;"></div>
    </div>
  </div>
</div>

<div class="modal" id="newColabModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); justify-content:center; align-items:center; z-index:1000;">
  <div class="card" style="width: 90%; max-width: 480px;">
    <h2>Novo Colaborador</h2>
    <div class="form-group">
      <label>Nome</label>
      <input type="text" id="colNome" placeholder="Nome">
    </div>
    <div class="form-group">
      <label>Período</label>
      <input type="text" id="colPeriodo" placeholder="Período">
    </div>
    <div class="form-group">
      <label>Dias</label>
      <input type="number" id="colDias" value="30">
    </div>
    <div style="display: flex; gap: 10px;">
      <button class="btn" onclick="fecharModal('newColab')">Cancelar</button>
      <button class="btn btn-success" onclick="criarColab()">Criar</button>
    </div>
  </div>
</div>

<div class="modal" id="newAdminModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); justify-content:center; align-items:center; z-index:1000;">
  <div class="card" style="width: 90%; max-width: 480px;">
    <h2>Novo Usuário</h2>
    <div class="form-group">
      <label>Nome</label>
      <input type="text" id="adminNome" placeholder="Nome">
    </div>
    <div class="form-group">
      <label>Email</label>
      <input type="email" id="adminEmail" placeholder="email@example.com">
    </div>
    <div class="form-group">
      <label>Tipo</label>
      <select id="adminTipo" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
        <option value="false">Usuário Normal</option>
        <option value="true">Admin</option>
      </select>
    </div>
    <div style="display: flex; gap: 10px;">
      <button class="btn" onclick="fecharModal('newAdmin')">Cancelar</button>
      <button class="btn btn-success" onclick="criarAdmin()">Criar</button>
    </div>
  </div>
</div>

<div class="modal" id="historicoModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); justify-content:center; align-items:center; z-index:1000;">
  <div class="card" style="width: 90%; max-width: 600px; max-height: 80vh; overflow-y: auto;">
    <h2 id="historicoTitulo">Histórico de Férias</h2>
    <div id="historicoConteudo"></div>
    <button class="btn" onclick="fecharModal('historico')" style="margin-top: 20px;">Fechar</button>
  </div>
</div>
  <div class="card" style="width: 90%; max-width: 480px;">
    <h2>Registrar Férias</h2>
    <div class="form-group">
      <label>Colaborador</label>
      <select id="feriaColab" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;"><option>Selecione</option></select>
    </div>
    <div class="form-group">
      <label>Início</label>
      <input type="date" id="feriaInicio" onchange="calcularDias()">
    </div>
    <div class="form-group">
      <label>Fim</label>
      <input type="date" id="feriaFim" onchange="calcularDias()">
    </div>
    <div class="form-group">
      <label>Dias</label>
      <input type="number" id="feriaDias" readonly>
    </div>
    <div style="display: flex; gap: 10px;">
      <button class="btn" onclick="fecharModal('newFeria')">Cancelar</button>
      <button class="btn btn-success" onclick="registrarFeria()">Registrar</button>
    </div>
  </div>
</div>

<script>
let sb = null, usuario = null, colabs = [];

async function init() {
  sb = window.supabase.createClient('https://boiakwhxkyposfyljiry.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvaWFrd2h4a3lwb3NmeWxqaXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMDUwODksImV4cCI6MjEwMTY4MTA4OX0.Kx1JID5_LuNATBeR67NeA_c0CxQKq6ggJLB6PJtJkWM');
}

async function registrarLog(acao, desc) {
  await sb.from('logs_auditoria').insert({ acao, descricao: desc, usuario_nome: usuario.nome, timestamp: new Date().toISOString() });
}

async function fazerLogin() {
  const email = document.getElementById('loginEmail').value;
  const senha = document.getElementById('loginSenha').value;
  if (!email || !senha) { alert('Preencha tudo!'); return; }
  try {
    const { data } = await sb.from('admin_users').select('*').eq('email', email).single();
    if (!data || data.senha_hash !== senha) { alert('Email ou senha incorretos!'); return; }
    usuario = data;
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('nomeUsuario').textContent = data.nome;
    carregarColabs();
  } catch (e) {
    alert('Erro: ' + e.message);
  }
}

async function carregarColabs() {
  const { data } = await sb.from('colaboradores').select('*').order('nome');
  colabs = data || [];
  let html = '<table><tr><th>Nome</th><th>Período</th><th>Dias</th><th>Disponível</th><th>Ação</th></tr>';
  colabs.forEach(c => {
    html += '<tr><td style="cursor: pointer; color: var(--primary); font-weight: 600; text-decoration: underline;" onclick="abrirHistorico(' + c.id + ')">' + c.nome + '</td><td>' + (c.periodo_aquisitivo || '-') + '</td><td>' + c.dias_totais + '</td><td>' + c.dias_disponiveis + '</td>';
    html += '<td><button class="btn btn-success" onclick="editarColab(' + c.id + ')">Editar</button> <button class="btn" onclick="deletarColab(' + c.id + ')">Deletar</button></td></tr>';
  });
  html += '</table>';
  document.getElementById('listaColabs').innerHTML = html;
}

function editarColab(id) {
  const c = colabs.find(x => x.id === id);
  const nome = prompt('Nome:', c.nome);
  const periodo = prompt('Período:', c.periodo_aquisitivo);
  const dias = prompt('Dias:', c.dias_totais);
  if (nome && periodo && dias) {
    sb.from('colaboradores').update({ nome, periodo_aquisitivo: periodo, dias_totais: dias }).eq('id', id).then(() => {
      registrarLog('EDITAR_COLAB', 'Colaborador ' + nome + ' editado');
      carregarColabs();
    });
  }
}

async function criarColab() {
  const nome = document.getElementById('colNome').value;
  const periodo = document.getElementById('colPeriodo').value;
  const dias = document.getElementById('colDias').value;
  if (!nome || !periodo) { alert('Preencha tudo!'); return; }
  await sb.from('colaboradores').insert({ nome, periodo_aquisitivo: periodo, dias_totais: dias, dias_disponiveis: dias, ativo: true, criado_em: new Date().toISOString() });
  await registrarLog('CRIAR_COLAB', 'Novo colaborador: ' + nome);
  fecharModal('newColab');
  carregarColabs();
}

async function deletarColab(id) {
  const c = colabs.find(x => x.id === id);
  if (!confirm('Deletar ' + c.nome + '?')) return;
  await sb.from('colaboradores').delete().eq('id', id);
  await registrarLog('DELETAR_COLAB', 'Deletado: ' + c.nome);
  carregarColabs();
}

async function carregarFerias() {
  const { data } = await sb.from('ferias').select('*, colaboradores(nome)').order('data_inicio', { ascending: false });
  let html = '<table><tr><th>Colaborador</th><th>Início</th><th>Fim</th><th>Dias</th><th>Ação</th></tr>';
  if (data && data.length) {
    data.forEach(f => {
      html += '<tr><td>' + f.colaboradores.nome + '</td><td>' + f.data_inicio + '</td><td>' + f.data_fim + '</td><td>' + f.dias_utilizados + '</td>';
      html += '<td><button class="btn" onclick="deletarFeria(' + f.id + ', ' + f.colaborador_id + ', ' + f.dias_utilizados + ')">Deletar</button></td></tr>';
    });
  } else {
    html += '<tr><td colspan="5" style="text-align: center;">Nenhuma féria</td></tr>';
  }
  html += '</table>';
  document.getElementById('listaFerias').innerHTML = html;
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
  if (!cid || !inicio || !fim || !dias) { alert('Preencha tudo!'); return; }
  const c = colabs.find(x => x.id == cid);
  if (c.dias_disponiveis < dias) { alert('Dias insuficientes!'); return; }
  await sb.from('ferias').insert({ colaborador_id: cid, data_inicio: inicio, data_fim: fim, dias_utilizados: dias, observacoes: '', criado_em: new Date().toISOString() });
  await sb.from('colaboradores').update({ dias_disponiveis: c.dias_disponiveis - dias }).eq('id', cid);
  await registrarLog('REGISTRAR_FERIA', c.nome + ': ' + dias + ' dias');
  fecharModal('newFeria');
  carregarColabs();
  carregarFerias();
}

async function deletarFeria(id, cid, dias) {
  if (!confirm('Deletar?')) return;
  const c = colabs.find(x => x.id == cid);
  await sb.from('ferias').delete().eq('id', id);
  await sb.from('colaboradores').update({ dias_disponiveis: c.dias_disponiveis + dias }).eq('id', cid);
  await registrarLog('DELETAR_FERIA', 'Férias deletada - ' + dias + ' dias devolvidos');
  carregarColabs();
  carregarFerias();
}

async function carregarAuditoria() {
  const { data } = await sb.from('logs_auditoria').select('*').order('timestamp', { ascending: false }).limit(100);
  let html = '<table><tr><th>Data</th><th>Usuário</th><th>Ação</th><th>Descrição</th></tr>';
  if (data && data.length) {
    data.forEach(log => {
      const data_fmt = new Date(log.timestamp).toLocaleString('pt-BR');
      html += '<tr><td>' + data_fmt + '</td><td>' + log.usuario_nome + '</td><td>' + log.acao + '</td><td>' + (log.descricao || '-') + '</td></tr>';
    });
  }
  html += '</table>';
  document.getElementById('listaAuditoria').innerHTML = html;
}

function abrirModal(tipo) {
  if (tipo === 'newColab') document.getElementById('newColabModal').style.display = 'flex';
  if (tipo === 'newFeria') {
    const sel = document.getElementById('feriaColab');
    sel.innerHTML = '<option>Selecione</option>';
    colabs.forEach(c => { sel.innerHTML += '<option value="' + c.id + '">' + c.nome + '</option>'; });
    document.getElementById('newFeriaModal').style.display = 'flex';
  }
  if (tipo === 'newAdmin') {
    document.getElementById('adminNome').value = '';
    document.getElementById('adminEmail').value = '';
    document.getElementById('adminTipo').value = 'false';
    document.getElementById('newAdminModal').style.display = 'flex';
  }
}

function fecharModal(tipo) {
  if (tipo === 'newColab') document.getElementById('newColabModal').style.display = 'none';
  if (tipo === 'newFeria') document.getElementById('newFeriaModal').style.display = 'none';
  if (tipo === 'newAdmin') document.getElementById('newAdminModal').style.display = 'none';
  if (tipo === 'historico') document.getElementById('historicoModal').style.display = 'none';
  document.getElementById('colNome').value = '';
  document.getElementById('colPeriodo').value = '';
  document.getElementById('colDias').value = 30;
}

async function carregarAdmins() {
  const { data } = await sb.from('admin_users').select('*').order('nome');
  let html = '<table><tr><th>Nome</th><th>Email</th><th>Tipo</th><th>Ação</th></tr>';
  if (data && data.length) {
    data.forEach(a => {
      html += '<tr><td>' + a.nome + '</td><td>' + a.email + '</td><td>' + (a.is_admin ? 'Admin' : 'Usuário') + '</td>';
      html += '<td><button class="btn" onclick="deletarAdmin(' + a.id + ')">Deletar</button></td></tr>';
    });
  }
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
  await registrarLog('CRIAR_USUARIO', 'Novo usuário: ' + email + ' - Senha: ' + senhaTemp);
  alert('Email: ' + email + '  |  Senha: ' + senhaTemp);
  fecharModal('newAdmin');
  carregarAdmins();
}

async function deletarAdmin(id) {
  if (!confirm('Deletar?')) return;
  await sb.from('admin_users').delete().eq('id', id);
  await registrarLog('DELETAR_USUARIO', 'Usuário deletado');
  carregarAdmins();
}

async function abrirHistorico(colabId) {
  const c = colabs.find(x => x.id === colabId);
  if (!c) return;
  document.getElementById('historicoTitulo').textContent = 'Férias de ' + c.nome;
  const { data } = await sb.from('ferias').select('*').eq('colaborador_id', colabId).order('data_inicio', { ascending: false });
  let html = '';
  if (data && data.length) {
    html = '<table><tr><th>Início</th><th>Fim</th><th>Dias</th><th>Obs</th></tr>';
    data.forEach(f => {
      html += '<tr><td>' + f.data_inicio + '</td><td>' + f.data_fim + '</td><td>' + f.dias_utilizados + '</td><td>' + (f.observacoes || '-') + '</td></tr>';
    });
    html += '</table>';
    const total = data.reduce((sum, f) => sum + f.dias_utilizados, 0);
    html += '<p style="margin-top: 15px; color: var(--primary); font-weight: 600;">Total: ' + total + ' dias</p>';
  } else {
    html = '<p style="text-align: center; color: var(--gray);">Nenhuma féria registrada</p>';
  }
  document.getElementById('historicoConteudo').innerHTML = html;
  document.getElementById('historicoModal').style.display = 'flex';
}

function mostrarTab(id, btn) {
  document.querySelectorAll('[id$="-tab"]').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(id + '-tab').style.display = 'block';
  btn.classList.add('active');
  if (id === 'ferias') carregarFerias();
  if (id === 'admins') carregarAdmins();
  if (id === 'auditoria') carregarAuditoria();
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
