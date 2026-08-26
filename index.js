import express from 'express';
const app = express();

const HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Férias - Lojas Neitzke</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"><\/script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root { --primary: #1A3C8F; --danger: #D92B2B; --success: #2D9D6E; --gray: #6C757D; --light: #F8F9FA; --radius: 12px; }
    body { font-family: sans-serif; background: #f0f2f5; color: #333; }
    #loginPage { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, var(--primary), #0f2557); }
    #loginCard { background: white; padding: 40px; border-radius: var(--radius); width: 100%; max-width: 400px; }
    #loginCard h1 { color: var(--primary); margin-bottom: 20px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; color: var(--primary); }
    .form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
    .btn-primary { background: var(--primary); color: white; width: 100%; padding: 10px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .btn-primary:hover { background: #0f2557; }
    #dashboard { display: none; }
    .topbar { background: white; padding: 16px 24px; display: flex; justify-content: space-between; }
    .topbar h1 { color: var(--primary); font-size: 20px; }
    .main { max-width: 1100px; margin: 0 auto; padding: 24px; }
    .tabs { display: flex; gap: 4px; margin-bottom: 24px; border-bottom: 2px solid #eee; }
    .tab { padding: 12px 20px; background: none; border: none; cursor: pointer; font-weight: 600; color: var(--gray); }
    .tab.active { color: var(--primary); border-bottom: 3px solid var(--primary); }
    .card { background: white; border-radius: var(--radius); padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .card h2 { color: var(--primary); font-size: 17px; margin-bottom: 15px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: var(--light); padding: 10px; text-align: left; font-weight: 600; color: var(--primary); }
    td { padding: 10px; border-bottom: 1px solid #f0f0f0; }
    .btn { padding: 6px 12px; background: var(--danger); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; margin: 2px; }
    .btn-success { background: var(--success); }
    .btn:hover { opacity: 0.9; }
    .modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 1000; }
    .modal-box { background: white; padding: 32px; border-radius: var(--radius); width: 90%; max-width: 480px; max-height: 85vh; overflow-y: auto; }
    .modal-title { color: var(--primary); font-size: 18px; margin-bottom: 20px; }
  <\/style>
  <script>
    let sb = null, usuario = null, colabs = [], isAdmin = false, periodoEditandoId = null;

    async function init() {
      sb = window.supabase.createClient('https://boiakwhxkyposfyljiry.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvaWFrd2h4a3lwb3NmeWxqaXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMDUwODksImV4cCI6MjEwMTY4MTA4OX0.Kx1JID5_LuNATBeR67NeA_c0CxQKq6ggJLB6PJtJkWM');
      document.getElementById('novoperiodoDias').addEventListener('change', atualizarPreviewSaldo);
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
        isAdmin = data.is_admin;
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('nomeUsuario').textContent = data.nome + (isAdmin ? ' (Admin)' : '');
        atualizarAbas();
        carregarColabs();
        if (data.primeira_vez) {
          document.getElementById('senhaAtual').value = senha;
          document.getElementById('trocarSenhaModal').style.display = 'flex';
        }
      } catch (e) {
        alert('Erro: ' + e.message);
      }
    }

    async function confirmarTrocaSenha() {
      const novaSenha = document.getElementById('novaSenha').value;
      const confirmarSenha = document.getElementById('confirmarSenha').value;
      if (!novaSenha || !confirmarSenha) { alert('Preencha!'); return; }
      if (novaSenha !== confirmarSenha) { alert('Senhas não conferem!'); return; }
      if (novaSenha.length < 6) { alert('Mínimo 6 caracteres!'); return; }
      try {
        await sb.from('admin_users').update({ senha_hash: novaSenha, primeira_vez: false }).eq('id', usuario.id);
        await registrarLog('TROCAR_SENHA', 'Senha mudada');
        document.getElementById('trocarSenhaModal').style.display = 'none';
        alert('Pronto!');
      } catch (e) {
        alert('Erro: ' + e.message);
      }
    }

    function atualizarAbas() {
      document.querySelectorAll('.tab').forEach(aba => {
        const texto = aba.textContent;
        if ((texto.includes('Admins') || texto.includes('Auditoria') || texto.includes('Backup')) && !isAdmin) {
          aba.style.display = 'none';
        }
      });
    }

    async function carregarColabs() {
      const { data } = await sb.from('colaboradores').select('*').order('nome');
      colabs = data || [];
      let html = '<table><tr><th>Nome</th><th>Período</th><th>Dias</th><th>Disponível</th><th>Ação</th></tr>';
      colabs.forEach(c => {
        const cor = c.dias_disponiveis < 0 ? 'color: var(--danger);' : '';
        html += '<tr><td style="cursor: pointer; color: var(--primary); text-decoration: underline;" onclick="abrirHistorico(' + c.id + ')">' + c.nome + '</td><td>' + (c.periodo_aquisitivo || '-') + '</td><td>' + c.dias_totais + '</td><td style="' + cor + '">' + c.dias_disponiveis + '</td>';
        html += '<td><button class="btn btn-success" onclick="novoPeriodo(' + c.id + ')">+Período</button></td></tr>';
      });
      html += '</table>';
      document.getElementById('listaColabs').innerHTML = html;
    }

    async function novoPeriodo(id) {
      const c = colabs.find(x => x.id === id);
      periodoEditandoId = id;
      document.getElementById('periodoColab').value = c.nome;
      document.getElementById('periodoAtual').value = c.periodo_aquisitivo || '-';
      document.getElementById('novoPeriodoInicio').value = '';
      document.getElementById('novoperiodoFim').value = '';
      document.getElementById('novoperiodoDias').value = '30';
      atualizarPreviewSaldo();
      document.getElementById('novoPeriodoModal').style.display = 'flex';
    }

    function atualizarPreviewSaldo() {
      const c = colabs.find(x => x.id === periodoEditandoId);
      const dias = parseInt(document.getElementById('novoperiodoDias').value) || 0;
      const novo = c.dias_disponiveis + dias;
      document.getElementById('saldoNovo').textContent = novo;
      document.getElementById('saldoNovo').style.color = novo >= 0 ? 'var(--success)' : 'var(--danger)';
    }

    async function confirmarNovoPeriodo() {
      const c = colabs.find(x => x.id === periodoEditandoId);
      const inicio = document.getElementById('novoPeriodoInicio').value;
      const fim = document.getElementById('novoperiodoFim').value;
      const dias = parseInt(document.getElementById('novoperiodoDias').value);
      if (!inicio || !fim || !dias) { alert('Preencha tudo!'); return; }
      const dt1 = new Date(inicio), dt2 = new Date(fim);
      if (dt2 <= dt1) { alert('Datas inválidas!'); return; }
      const periodo = inicio.split('-').reverse().join('/') + ' a ' + fim.split('-').reverse().join('/');
      const novo = c.dias_disponiveis + dias;
      if (!confirm('Novo saldo: ' + novo + ' dias?')) return;
      await sb.from('colaboradores').update({ periodo_aquisitivo: periodo, dias_totais: dias, dias_disponiveis: novo }).eq('id', periodoEditandoId);
      await registrarLog('NOVO_PERIODO', c.nome);
      fecharModal('all');
      carregarColabs();
    }

    async function carregarAdmins() {
      const { data } = await sb.from('admin_users').select('*').order('nome');
      let html = '<table><tr><th>Nome</th><th>Email</th><th>Tipo</th><th>Ação</th></tr>';
      if (data) {
        data.forEach(a => {
          html += '<tr><td>' + a.nome + '</td><td>' + a.email + '</td><td>' + (a.is_admin ? 'Admin' : 'Usuário') + '</td>';
          html += '<td><button class="btn btn-success btn-reset" data-id="' + a.id + '" style="background: #FF9800;">Reset</button> <button class="btn btn-delete" data-id="' + a.id + '">Deletar</button></td></tr>';
        });
      }
      html += '</table>';
      const container = document.getElementById('listaAdmins');
      container.innerHTML = html;
      container.querySelectorAll('.btn-reset').forEach(btn => {
        btn.onclick = function() {
          const id = this.getAttribute('data-id');
          if (!confirm('Resetar?')) return;
          const senha = Math.random().toString(36).slice(-8);
          sb.from('admin_users').update({ senha_hash: senha, primeira_vez: true }).eq('id', id).then(() => {
            registrarLog('RESET_SENHA', 'Senha resetada');
            alert('Nova senha: ' + senha);
            carregarAdmins();
          });
        };
      });
      container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.onclick = function() {
          const id = this.getAttribute('data-id');
          if (!confirm('Deletar?')) return;
          sb.from('admin_users').delete().eq('id', id).then(() => {
            registrarLog('DELETAR_USUARIO', 'Usuário deletado');
            carregarAdmins();
          });
        };
      });
    }

    async function criarAdmin() {
      const nome = document.getElementById('adminNome').value;
      const email = document.getElementById('adminEmail').value;
      const isAdmin = document.getElementById('adminTipo').value === 'true';
      if (!nome || !email) { alert('Preencha!'); return; }
      const senha = Math.random().toString(36).slice(-8);
      await sb.from('admin_users').insert({ nome, email, senha_hash: senha, is_admin: isAdmin, primeira_vez: true, criado_em: new Date().toISOString() });
      await registrarLog('CRIAR_USUARIO', email);
      alert('Senha: ' + senha);
      fecharModal('all');
      carregarAdmins();
    }

    async function carregarAuditoria() {
      const { data } = await sb.from('logs_auditoria').select('*').order('timestamp', { ascending: false }).limit(100);
      let html = '<table><tr><th>Data</th><th>Usuário</th><th>Ação</th></tr>';
      if (data) {
        data.forEach(log => {
          html += '<tr><td>' + new Date(log.timestamp).toLocaleString('pt-BR') + '</td><td>' + log.usuario_nome + '</td><td>' + log.acao + '</td></tr>';
        });
      }
      html += '</table>';
      document.getElementById('listaAuditoria').innerHTML = html;
    }

    async function abrirHistorico(colabId) {
      const c = colabs.find(x => x.id === colabId);
      document.getElementById('historicoTitulo').textContent = c.nome;
      const { data } = await sb.from('ferias').select('*').eq('colaborador_id', colabId);
      let html = '';
      if (data && data.length) {
        html = '<table><tr><th>Início</th><th>Fim</th><th>Dias</th></tr>';
        data.forEach(f => { html += '<tr><td>' + f.data_inicio + '</td><td>' + f.data_fim + '</td><td>' + f.dias_utilizados + '</td></tr>'; });
        html += '</table>';
        const total = data.reduce((sum, f) => sum + f.dias_utilizados, 0);
        html += '<p>Total: ' + total + ' dias</p>';
      }
      document.getElementById('historicoConteudo').innerHTML = html || 'Nenhuma féria';
      document.getElementById('historicoModal').style.display = 'flex';
    }

    function exportarPDF() {
      const titulo = document.getElementById('historicoTitulo').textContent;
      const html = '<h1>' + titulo + '</h1><p>Lojas Neitzke</p>' + document.getElementById('historicoConteudo').innerHTML;
      const opt = { margin: 10, filename: titulo + '.pdf', html2canvas: { scale: 2 }, jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' } };
      html2pdf().set(opt).from(html).save();
    }

    function fecharModal(tipo) {
      if (tipo === 'all') document.querySelectorAll('[id\$="Modal"]').forEach(m => m.style.display = 'none');
      else document.getElementById(tipo + 'Modal').style.display = 'none';
    }

    function mostrarTab(id, btn) {
      if (!isAdmin && (id === 'backup' || id === 'auditoria' || id === 'admins')) { alert('Acesso negado!'); return; }
      fecharModal('all');
      document.querySelectorAll('[id\$="-tab"]').forEach(t => t.style.display = 'none');
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.getElementById(id + '-tab').style.display = 'block';
      btn.classList.add('active');
      if (id === 'admins') carregarAdmins();
      if (id === 'auditoria') carregarAuditoria();
    }

    function logout() { location.reload(); }

    init();
  <\/script>
</head>
<body>

<div id="loginPage">
  <div id="loginCard">
    <h1>Férias</h1>
    <p>Lojas Neitzke</p>
    <div class="form-group">
      <label>Email</label>
      <input type="email" id="loginEmail">
    </div>
    <div class="form-group">
      <label>Senha</label>
      <input type="password" id="loginSenha" onkeypress="if(event.key == 'Enter') fazerLogin()">
    </div>
    <button class="btn-primary" onclick="fazerLogin()">Entrar</button>
  </div>
</div>

<div id="dashboard">
  <div class="topbar">
    <h1>Férias - Lojas Neitzke</h1>
    <div>
      <span id="nomeUsuario" style="font-size: 13px;"></span>
      <button class="btn" onclick="logout()">Sair</button>
    </div>
  </div>

  <div class="main">
    <div class="tabs">
      <button class="tab active" onclick="mostrarTab('colabs', this)">Colaboradores</button>
      <button class="tab" onclick="mostrarTab('admins', this)">Admins</button>
      <button class="tab" onclick="mostrarTab('auditoria', this)">Auditoria</button>
    </div>

    <div id="colabs-tab" class="card">
      <h2>Colaboradores</h2>
      <div id="listaColabs"></div>
    </div>

    <div id="admins-tab" class="card" style="display:none;">
      <h2>Usuários</h2>
      <button class="btn btn-success" onclick="document.getElementById('newAdminModal').style.display = 'flex'">+ Novo</button>
      <div id="listaAdmins" style="margin-top: 20px;"></div>
    </div>

    <div id="auditoria-tab" class="card" style="display:none;">
      <h2>Auditoria</h2>
      <div id="listaAuditoria"></div>
    </div>
  </div>
</div>

<div class="modal" id="novoPeriodoModal" style="display: none;">
  <div class="modal-box">
    <h2 class="modal-title">Novo Período</h2>
    <div class="form-group"><label>Colaborador</label><input type="text" id="periodoColab" readonly></div>
    <div class="form-group"><label>Período Atual</label><input type="text" id="periodoAtual" readonly></div>
    <div class="form-group"><label>Início</label><input type="date" id="novoPeriodoInicio"></div>
    <div class="form-group"><label>Fim</label><input type="date" id="novoperiodoFim"></div>
    <div class="form-group"><label>Dias</label><input type="number" id="novoperiodoDias" value="30"></div>
    <div style="background: #f0f8ff; padding: 10px; margin-bottom: 15px; font-size: 12px;">Novo saldo: <span id="saldoNovo">30</span></div>
    <button class="btn" onclick="fecharModal('novoPeriodo')">Cancelar</button>
    <button class="btn btn-success" onclick="confirmarNovoPeriodo()">Confirmar</button>
  </div>
</div>

<div class="modal" id="newAdminModal" style="display: none;">
  <div class="modal-box">
    <h2 class="modal-title">Novo Usuário</h2>
    <div class="form-group"><label>Nome</label><input type="text" id="adminNome"></div>
    <div class="form-group"><label>Email</label><input type="email" id="adminEmail"></div>
    <div class="form-group"><label>Tipo</label><select id="adminTipo"><option value="false">Usuário</option><option value="true">Admin</option></select></div>
    <button class="btn" onclick="fecharModal('newAdmin')">Cancelar</button>
    <button class="btn btn-success" onclick="criarAdmin()">Criar</button>
  </div>
</div>

<div class="modal" id="trocarSenhaModal" style="display: none;">
  <div class="modal-box">
    <h2 class="modal-title">Trocar Senha</h2>
    <div class="form-group"><label>Senha Atual</label><input type="password" id="senhaAtual" readonly></div>
    <div class="form-group"><label>Nova Senha</label><input type="password" id="novaSenha"></div>
    <div class="form-group"><label>Confirmar</label><input type="password" id="confirmarSenha"></div>
    <button class="btn btn-success" onclick="confirmarTrocaSenha()">Salvar</button>
  </div>
</div>

<div class="modal" id="historicoModal" style="display: none;">
  <div class="modal-box">
    <h2 class="modal-title" id="historicoTitulo">Histórico</h2>
    <div id="historicoConteudo"></div>
    <button class="btn btn-success" onclick="exportarPDF()">Exportar PDF</button>
    <button class="btn" onclick="fecharModal('historico')">Fechar</button>
  </div>
</div>

</body>
</html>`;

app.get('*', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(HTML);
});

app.listen(process.env.PORT || 3000);
