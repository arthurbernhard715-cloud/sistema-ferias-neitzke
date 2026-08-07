import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase setup
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_super_segura_123456';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Variáveis SUPABASE_URL e SUPABASE_ANON_KEY não configuradas!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Middleware de autenticação
const autenticar = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (erro) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
};

// ========== ROTAS DE AUTENTICAÇÃO ==========

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha obrigatórios' });
    }

    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }

    const senhaValida = await bcrypt.compare(senha, data.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }

    const token = jwt.sign(
      { id: data.id, email: data.email, nome: data.nome },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Log de login
    await supabase.from('logs_auditoria').insert({
      usuario_id: data.id,
      acao: 'LOGIN',
      descricao: `Admin ${data.nome} realizou login`,
      tabela_afetada: 'admins',
      timestamp: new Date().toISOString()
    });

    res.json({
      sucesso: true,
      token,
      usuario: { id: data.id, nome: data.nome, email: data.email }
    });
  } catch (erro) {
    console.error('Erro no login:', erro);
    res.status(500).json({ erro: 'Erro ao realizar login' });
  }
});

// ========== ROTAS DE COLABORADORES ==========

// Listar colaboradores
app.get('/api/colaboradores', autenticar, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('colaboradores')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;
    res.json({ sucesso: true, dados: data });
  } catch (erro) {
    console.error('Erro ao listar colaboradores:', erro);
    res.status(500).json({ erro: 'Erro ao listar colaboradores' });
  }
});

// Criar colaborador
app.post('/api/colaboradores', autenticar, async (req, res) => {
  try {
    const { nome, periodo_aquisitivo, dias_totais } = req.body;

    if (!nome || !periodo_aquisitivo || dias_totais === undefined) {
      return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
    }

    const { data, error } = await supabase
      .from('colaboradores')
      .insert({
        nome,
        periodo_aquisitivo,
        dias_totais,
        dias_disponiveis: dias_totais,
        ativo: true,
        criado_em: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Log
    await supabase.from('logs_auditoria').insert({
      usuario_id: req.usuario.id,
      acao: 'CRIAR_COLABORADOR',
      descricao: `Colaborador "${nome}" criado com ${dias_totais} dias de férias`,
      tabela_afetada: 'colaboradores',
      registro_id: data.id,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({ sucesso: true, dados: data });
  } catch (erro) {
    console.error('Erro ao criar colaborador:', erro);
    res.status(500).json({ erro: 'Erro ao criar colaborador' });
  }
});

// Atualizar colaborador
app.put('/api/colaboradores/:id', autenticar, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, periodo_aquisitivo, dias_totais, ativo } = req.body;

    const { data, error } = await supabase
      .from('colaboradores')
      .update({
        nome,
        periodo_aquisitivo,
        dias_totais,
        ativo,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log
    await supabase.from('logs_auditoria').insert({
      usuario_id: req.usuario.id,
      acao: 'ATUALIZAR_COLABORADOR',
      descricao: `Colaborador "${nome}" atualizado`,
      tabela_afetada: 'colaboradores',
      registro_id: id,
      timestamp: new Date().toISOString()
    });

    res.json({ sucesso: true, dados: data });
  } catch (erro) {
    console.error('Erro ao atualizar colaborador:', erro);
    res.status(500).json({ erro: 'Erro ao atualizar colaborador' });
  }
});

// ========== ROTAS DE FÉRIAS ==========

// Listar férias de um colaborador
app.get('/api/colaboradores/:id/ferias', autenticar, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('ferias')
      .select(`
        *,
        colaboradores:colaborador_id(nome)
      `)
      .eq('colaborador_id', id)
      .order('data_inicio', { ascending: false });

    if (error) throw error;
    res.json({ sucesso: true, dados: data });
  } catch (erro) {
    console.error('Erro ao listar férias:', erro);
    res.status(500).json({ erro: 'Erro ao listar férias' });
  }
});

// Registrar férias
app.post('/api/ferias', autenticar, async (req, res) => {
  try {
    const { colaborador_id, data_inicio, data_fim, dias_utilizados, observacoes } = req.body;

    if (!colaborador_id || !data_inicio || !data_fim || !dias_utilizados) {
      return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
    }

    // Buscar colaborador
    const { data: colaborador, error: erroColab } = await supabase
      .from('colaboradores')
      .select('*')
      .eq('id', colaborador_id)
      .single();

    if (erroColab || !colaborador) {
      return res.status(404).json({ erro: 'Colaborador não encontrado' });
    }

    if (colaborador.dias_disponiveis < dias_utilizados) {
      return res.status(400).json({
        erro: `Dias insuficientes. Disponível: ${colaborador.dias_disponiveis}`
      });
    }

    // Criar registro de férias
    const { data: ferias, error: erroFerias } = await supabase
      .from('ferias')
      .insert({
        colaborador_id,
        data_inicio,
        data_fim,
        dias_utilizados,
        observacoes,
        criado_em: new Date().toISOString()
      })
      .select()
      .single();

    if (erroFerias) throw erroFerias;

    // Atualizar dias disponíveis
    const novo_dias_disponiveis = colaborador.dias_disponiveis - dias_utilizados;
    await supabase
      .from('colaboradores')
      .update({ dias_disponiveis: novo_dias_disponiveis })
      .eq('id', colaborador_id);

    // Log
    await supabase.from('logs_auditoria').insert({
      usuario_id: req.usuario.id,
      acao: 'REGISTRAR_FERIAS',
      descricao: `${dias_utilizados} dias de férias registrados para ${colaborador.nome} (${data_inicio} a ${data_fim})`,
      tabela_afetada: 'ferias',
      registro_id: ferias.id,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({ sucesso: true, dados: ferias });
  } catch (erro) {
    console.error('Erro ao registrar férias:', erro);
    res.status(500).json({ erro: 'Erro ao registrar férias' });
  }
});

// Deletar férias (com reversão de dias)
app.delete('/api/ferias/:id', autenticar, async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar férias
    const { data: ferias, error: erroFerias } = await supabase
      .from('ferias')
      .select('*')
      .eq('id', id)
      .single();

    if (erroFerias || !ferias) {
      return res.status(404).json({ erro: 'Registro de férias não encontrado' });
    }

    // Reversão de dias
    const { data: colaborador } = await supabase
      .from('colaboradores')
      .select('*')
      .eq('id', ferias.colaborador_id)
      .single();

    if (colaborador) {
      await supabase
        .from('colaboradores')
        .update({ dias_disponiveis: colaborador.dias_disponiveis + ferias.dias_utilizados })
        .eq('id', ferias.colaborador_id);
    }

    // Deletar
    const { error: erroDeletar } = await supabase
      .from('ferias')
      .delete()
      .eq('id', id);

    if (erroDeletar) throw erroDeletar;

    // Log
    await supabase.from('logs_auditoria').insert({
      usuario_id: req.usuario.id,
      acao: 'DELETAR_FERIAS',
      descricao: `Registro de férias deletado (${ferias.dias_utilizados} dias revertidos)`,
      tabela_afetada: 'ferias',
      registro_id: id,
      timestamp: new Date().toISOString()
    });

    res.json({ sucesso: true, mensagem: 'Férias deletadas com sucesso' });
  } catch (erro) {
    console.error('Erro ao deletar férias:', erro);
    res.status(500).json({ erro: 'Erro ao deletar férias' });
  }
});

// ========== ROTAS DE AUDITORIA ==========

// Listar logs
app.get('/api/auditoria/logs', autenticar, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('logs_auditoria')
      .select(`
        *,
        admins:usuario_id(nome, email)
      `)
      .order('timestamp', { ascending: false })
      .limit(500);

    if (error) throw error;
    res.json({ sucesso: true, dados: data });
  } catch (erro) {
    console.error('Erro ao listar auditoria:', erro);
    res.status(500).json({ erro: 'Erro ao listar logs de auditoria' });
  }
});

// ========== SERVIR HTML ==========

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📋 Sistema de Férias - Lojas Neitzke`);
});
