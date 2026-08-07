# 🏖️ Sistema de Controle de Férias - Lojas Neitzke

Um sistema web simples, seguro e 100% gratuito para gerenciar férias dos colaboradores.

## ✨ Funcionalidades

✅ **Autenticação de Admin** - Login seguro com senha hashada  
✅ **Gestão de Colaboradores** - Cadastrar, editar e gerenciar dados  
✅ **Registro de Férias** - Controlar períodos e dias utilizados  
✅ **Auditoria Completa** - Log de todas as ações (quem, quando, o quê)  
✅ **Cálculo Automático** - Dias disponíveis são atualizados automaticamente  
✅ **Reversão de Férias** - Deletar registros reverte dias automaticamente  
✅ **Interface Responsiva** - Funciona em desktop, tablet e celular  

## 🛠️ Tech Stack

- **Backend:** Node.js + Express
- **Banco de Dados:** Supabase (PostgreSQL)
- **Autenticação:** JWT + bcrypt
- **Frontend:** HTML5 + CSS3 + Vanilla JavaScript
- **Hospedagem:** Vercel (gratuita)
- **Domínio:** seu domínio personalizado

## 📋 Requisitos

- Node.js 16+ (para rodar localmente)
- Conta no Supabase (gratuita)
- Conta na Vercel (gratuita)
- Seu domínio (sosajudaai.com.br)

## 🚀 Quick Start Local

### 1. Clonar/Baixar Projeto
```bash
cd sistema-ferias
npm install
```

### 2. Configurar .env
Copie o `.env.example` e renomeie para `.env`:
```bash
cp .env.example .env
```

Preencha com suas credenciais do Supabase:
```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_chave_anonima_aqui
JWT_SECRET=sua_chave_super_secura_123456
PORT=3000
```

### 3. Executar
```bash
npm start
```

Acesse: `http://localhost:3000`

---

## 📖 Guia de Deployment

Veja o arquivo **[DEPLOYMENT.md](./DEPLOYMENT.md)** para instruções completas:

1. Criar projeto Supabase
2. Configurar banco de dados
3. Deploy na Vercel
4. Apontar domínio customizado

**Tempo total:** ~30 minutos

---

## 👥 Usando o Sistema

### Login
- Email: `admin@neitzke.com.br`
- Senha: `admin123` (⚠️ Troque na primeira vez!)

### Dashboard Tabs

#### 👥 Colaboradores
- Ver lista de todos os colaboradores
- Dias totais e disponíveis
- Adicionar novos colaboradores
- Deletar (se necessário)

#### 🏖️ Férias
- Registrar período de férias
- Data início, data fim, dias utilizados
- Observações opcionais
- Deletar (com reversão de dias)

#### 📋 Auditoria
- Log de todas as ações
- Quem fez cada alteração
- Quando foi feita
- O que foi feito

---

## 🔐 Segurança

- Senhas são hashadas com bcrypt (nunca armazenadas em texto plano)
- JWT tokens com expiração de 7 dias
- CORS configurado para seu domínio
- Log de auditoria completo de todas as ações
- Dados armazenados em PostgreSQL (Supabase)

---

## 📊 Estrutura do Banco de Dados

### Tabela: admins
```
id | nome | email | senha_hash | criado_em | atualizado_em
```

### Tabela: colaboradores
```
id | nome | periodo_aquisitivo | dias_totais | dias_disponiveis | ativo | criado_em | atualizado_em
```

### Tabela: ferias
```
id | colaborador_id | data_inicio | data_fim | dias_utilizados | observacoes | criado_em
```

### Tabela: logs_auditoria
```
id | usuario_id | acao | descricao | tabela_afetada | registro_id | timestamp
```

---

## 🔑 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `SUPABASE_URL` | URL do seu projeto Supabase | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Chave pública Supabase | `eyJhbGc...` |
| `JWT_SECRET` | Chave para assinar tokens JWT | `sua_chave_secura_123456` |
| `PORT` | Porta local (opcional) | `3000` |

---

## 🐛 Troubleshooting

### Erro "SUPABASE_URL não configurada"
→ Preencha as variáveis no `.env` com dados reais do Supabase

### Login não funciona
→ Confirme email e senha do admin padrão  
→ Verifique se a tabela `admins` tem dados no Supabase

### Dias não atualizam
→ Confirme que a query de atualização foi executada  
→ Recarregue a página

### Domínio não funciona
→ Aguarde propagação DNS (10-30 min)  
→ Verifique configuração de CNAME no Registro.br

---

## 📞 Suporte

- **Supabase:** https://supabase.com/docs
- **Vercel:** https://vercel.com/docs
- **Registro.br:** https://registro.br/suporte

---

## 📄 Licença

MIT - Libre para usar pessoal ou comercialmente

---

## 🎉 Créditos

Desenvolvido para **Lojas Neitzke** - 2024

Suportado por:
- [Supabase](https://supabase.com)
- [Vercel](https://vercel.com)
- [Node.js](https://nodejs.org)
