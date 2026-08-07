import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Ler HTML
let html = '';
try {
  html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
} catch (err) {
  console.error('Erro ao ler HTML:', err.message);
  html = '<h1>Erro ao carregar página</h1>';
}

// Rota raiz
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Teste de conexão
app.get('/api/test', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'Backend funcionando!',
    url: process.env.SUPABASE_URL ? 'tem URL' : 'SEM URL',
    key: process.env.SUPABASE_ANON_KEY ? 'tem KEY' : 'SEM KEY'
  });
});

// Iniciar
app.listen(PORT, () => {
  console.log(`✅ Servidor na porta ${PORT}`);
});
