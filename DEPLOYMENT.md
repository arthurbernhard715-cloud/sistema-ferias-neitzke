# 📋 Guia de Deployment - Sistema de Férias Neitzke

> **100% GRATUITO** - Supabase (Free Tier) + Vercel (Free Tier) + Seu Domínio

---

## 1️⃣ CRIAR PROJETO NO SUPABASE

### Passo 1: Criar Conta
- Acesse: https://supabase.com
- Clique em "Start your project"
- Autentique com GitHub ou Google

### Passo 2: Criar Novo Projeto
- Nome: `sistema-ferias-neitzke`
- Region: **São Paulo** (Brazil - sa-east-1)
- Database password: **Use uma senha forte** (salve em segurança)
- Clique: Create new project

### Passo 3: Criar Tabelas
- No dashboard do Supabase, vá para: **SQL Editor**
- Clique em: "+ New Query"
- Copie TODO o conteúdo do arquivo `database.sql`
- Cole na query
- Clique: "Run"
- ✅ Tabelas criadas!

### Passo 4: Obter Credenciais
- Vá para: **Settings → API**
- Copie:
  - `Project URL` (isso é seu SUPABASE_URL)
  - `anon public` key (isso é seu SUPABASE_ANON_KEY)
- **Guarde em segurança!**

---

## 2️⃣ CRIAR CONTA NA VERCEL E FAZER DEPLOY

### Passo 1: Preparar Código
Você já tem tudo pronto! Adicione um arquivo `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ],
  "env": {
    "SUPABASE_URL": "@supabase_url",
    "SUPABASE_ANON_KEY": "@supabase_anon_key",
    "JWT_SECRET": "@jwt_secret"
  }
}
```

### Passo 2: Fazer Upload para GitHub
Você pode:
- Fazer git push do projeto para GitHub, ou
- Fazer upload dos arquivos diretamente na Vercel

**Arquivos essenciais:**
- `package.json`
- `index.js`
- `public/index.html`
- `.env.example`

### Passo 3: Conectar Vercel
- Acesse: https://vercel.com
- Clique: "Add New → Project"
- Selecione seu repositório GitHub (ou importe)
- Clique: "Continue"

### Passo 4: Configurar Variáveis de Ambiente
- Em **Environment Variables**, adicione:
  - `SUPABASE_URL` = (valor copiado do Supabase)
  - `SUPABASE_ANON_KEY` = (valor copiado do Supabase)
  - `JWT_SECRET` = Uma senha aleatória forte (ex: `mys3cur3jwt123456!@#`)

- Clique: "Deploy"
- ✅ Sistema rodando em: `https://[seu-projeto].vercel.app`

---

## 3️⃣ CONFIGURAR DOMÍNIO CUSTOMIZADO

### Opção A: Subdomínio (Recomendado)
**Apontará para:** `ferias.sosajudaai.com.br`

#### No Dashboard da Vercel:
- Vá para: **Settings → Domains**
- Clique: "Add Domain"
- Digite: `ferias.sosajudaai.com.br`
- Selecione: "Add Domain"
- Vercel mostrará um registro `CNAME`

Exemplo:
```
Type: CNAME
Name: ferias
Value: cname.vercel-dns.com
```

#### No Registro.br (seu painel de domínio):
- Entre em: https://www.registro.br/
- Vá para: "Meus domínios" → seu domínio
- Busque: "Gerenciar DNS" ou "Advanced"
- Clique: "Adicionar novo registro"
- Preencha:
  - **Host/Nome:** `ferias`
  - **Tipo:** `CNAME`
  - **Valor/Alvo:** (o valor que Vercel mostrou)
  - **TTL:** 3600
- Clique: "Salvar"

**Espere 10-30 minutos** para a DNS propagar.

Pronto! Acesse: `https://ferias.sosajudaai.com.br`

### Opção B: Subpath (Alternativo)
**Apontará para:** `sosajudaai.com.br/neitzkeferias`

Isso requer redirecionamento do seu site atual (mais complexo).
Recomendado: **Use Opção A (Subdomínio)**

---

## 4️⃣ CONFIGURAR ADMIN INICIAL

### Trocar Senha do Admin
O admin padrão tem:
- **Email:** `admin@neitzke.com.br`
- **Senha:** `admin123`

**IMPORTANTE:** Trocar na primeira execução!

#### Gerar nova senha com hash bcrypt:
1. Acesse: https://bcrypt-generator.com/
2. Digite sua nova senha (ex: `MinhaSenha123!@#`)
3. Clique "Hash"
4. Copie o hash gerado
5. No Supabase → Table Editor → `admins`
6. Edite o registro do admin
7. Paste o novo `senha_hash`

**OU** via SQL no Supabase:
```sql
UPDATE admins 
SET senha_hash = '[seu_novo_hash_bcrypt]'
WHERE email = 'admin@neitzke.com.br';
```

---

## 5️⃣ CRIAR MAIS ADMINS (Opcional)

Se tiver múltiplos administradores, crie usuários extras via SQL:

```sql
INSERT INTO admins (nome, email, senha_hash) VALUES (
  'João - Gerente RH',
  'joao@neitzke.com.br',
  '[hash_bcrypt_da_senha]'
);
```

**Gere o hash em:** https://bcrypt-generator.com/

---

## 6️⃣ VERIFICAÇÕES FINAIS

### ✅ Checklist
- [ ] Supabase projeto criado
- [ ] Tabelas criadas com sucesso
- [ ] Credenciais copiadas (URL + Key)
- [ ] Código feito upload/GitHub
- [ ] Vercel conectado e deploiado
- [ ] Variáveis de ambiente configuradas
- [ ] Domínio apontado (CNAME no Registro.br)
- [ ] DNS propagou (esperar 10-30 min)
- [ ] Admin padrão senha alterada
- [ ] Acesso via `ferias.sosajudaai.com.br` funcionando

---

## 7️⃣ TROUBLESHOOTING

### Sistema mostra "erro de conexão" ou "500"
1. Verifique as variáveis de ambiente no Vercel estão corretas
2. Confirme o Supabase está online (dashboard)
3. Teste o login em incógnito (limpar cache)

### Login não funciona
- Confirme email e senha do admin (padrão: `admin@neitzke.com.br` / `admin123`)
- Verifique se a tabela `admins` tem dados:
  ```sql
  SELECT * FROM admins;
  ```

### Domínio não carrega
- Aguarde 10-30 min para DNS propagar
- Teste com: `nslookup ferias.sosajudaai.com.br`
- Se ainda não funcionar, refaça o registro CNAME no Registro.br

### Certificado SSL não aparece
- Vercel gera automaticamente após DNS estar correto
- Pode levar alguns minutos
- Recarregue a página em alguns minutos

---

## 📞 SUPORTE

Se encontrar problemas:

1. **Supabase Docs:** https://supabase.com/docs
2. **Vercel Docs:** https://vercel.com/docs
3. **Registro.br Help:** https://registro.br/suporte

---

## 🎉 Pronto!

Seu sistema de férias está 100% online e seguro!

**URL:** `https://ferias.sosajudaai.com.br`  
**Admin inicial:** `admin@neitzke.com.br`  
**Custo:** R$ 0,00 🎊
