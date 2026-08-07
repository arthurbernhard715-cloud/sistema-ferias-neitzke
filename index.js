import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// HTML
let html = '';
try {
  html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
} catch (err) {
  html = '<h1>Erro ao carregar</h1>';
}

// Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta';

console.log('✓ SUPABASE_URL:', SUPABASE_URL ? 'OK' : 'FALTA');
console.log('✓ SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'OK' : 'FALTA');

const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

app.use(cors());
app.use(express.json());

// Auth middleware
const autenticar = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ erro: 'Token não fornecido' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (erro) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
};

// ========== LOGIN ==========
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
      console.log('Admin não encontrado:', email);
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }

    const senhaValida = await bcrypt.compare(senha, data.senha_hash);
    if (!senhaValida) {
      console.log('Senha inválida para:', email);
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }

    const token = jwt.sign(
      { id: data.id, email: data.email, nome: data.nome },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

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

// ========== COLABORADORES ==========
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

    await supabase.from('logs_auditoria').insert({
      usuario_id: req.usuario.id,
      acao: 'CRIAR_COLABORADOR',
      descricao: `Colaborador "${nome}" criado`,
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

app.delete('/api/colaboradores/:id', autenticar, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('colaboradores').delete().eq('id', id);
    if (error) throw error;

    await supabase.from('logs_auditoria').insert({
      usuario_id: req.usuario.id,
      acao: 'DELETAR_COLABORADOR',
      descricao: 'Colaborador deletado',
      tabela_afetada: 'colaboradores',
      registro_id: id,
      timestamp: new Date().toISOString()
    });

    res.json({ sucesso: true, mensagem: 'Colaborador deletado' });
  } catch (erro) {
    console.error('Erro ao deletar colaborador:', erro);
    res.status(500).json({ erro: 'Erro ao deletar colaborador' });
  }
});

// ========== FÉRIAS ==========
app.get('/api/colaboradores/:id/ferias', autenticar, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('ferias')
      .select('*')
      .eq('colaborador_id', id)
      .order('data_inicio', { ascending: false });

    if (error) throw error;
    res.json({ sucesso: true, dados: data });
  } catch (erro) {
    console.error('Erro ao listar férias:', erro);
    res.status(500).json({ erro: 'Erro ao listar férias' });
  }
});

app.post('/api/ferias', autenticar, async (req, res) => {
  try {
    const { colaborador_id, data_inicio, data_fim, dias_utilizados, observacoes } = req.body;

    if (!colaborador_id || !data_inicio || !data_fim || !dias_utilizados) {
      return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
    }

    const { data: colaborador } = await supabase
      .from('colaboradores')
      .select('*')
      .eq('id', colaborador_id)
      .single();

    if (!colaborador) {
      return res.status(404).json({ erro: 'Colaborador não encontrado' });
    }

    if (colaborador.dias_disponiveis < dias_utilizados) {
      return res.status(400).json({
        erro: `Dias insuficientes. Disponível: ${colaborador.dias_disponiveis}`
      });
    }

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

    await supabase
      .from('colaboradores')
      .update({ dias_disponiveis: colaborador.dias_disponiveis - dias_utilizados })
      .eq('id', colaborador_id);

    await supabase.from('logs_auditoria').insert({
      usuario_id: req.usuario.id,
      acao: 'REGISTRAR_FERIAS',
      descricao: `${dias_utilizados} dias de férias registrados`,
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

app.delete('/api/ferias/:id', autenticar, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: ferias } = await supabase.from('ferias').select('*').eq('id', id).single();

    if (!ferias) return res.status(404).json({ erro: 'Férias não encontradas' });

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

    await supabase.from('ferias').delete().eq('id', id);

    await supabase.from('logs_auditoria').insert({
      usuario_id: req.usuario.id,
      acao: 'DELETAR_FERIAS',
      descricao: 'Férias deletadas',
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

// ========== AUDITORIA ==========
app.get('/api/auditoria/logs', autenticar, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('logs_auditoria')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(500);

    if (error) throw error;
    res.json({ sucesso: true, dados: data });
  } catch (erro) {
    console.error('Erro ao listar auditoria:', erro);
    res.status(500).json({ erro: 'Erro ao listar logs' });
  }
});

// ========== HTML ==========
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
});

// ========== START ==========
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando`);
});
