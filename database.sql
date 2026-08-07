-- ========== TABELA DE ADMINS ==========
CREATE TABLE IF NOT EXISTS admins (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== TABELA DE COLABORADORES ==========
CREATE TABLE IF NOT EXISTS colaboradores (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  periodo_aquisitivo VARCHAR(100),
  dias_totais INT NOT NULL DEFAULT 30,
  dias_disponiveis INT NOT NULL DEFAULT 30,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== TABELA DE FÉRIAS ==========
CREATE TABLE IF NOT EXISTS ferias (
  id BIGSERIAL PRIMARY KEY,
  colaborador_id BIGINT NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  dias_utilizados INT NOT NULL,
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== TABELA DE AUDITORIA ==========
CREATE TABLE IF NOT EXISTS logs_auditoria (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES admins(id) ON DELETE SET NULL,
  acao VARCHAR(50) NOT NULL,
  descricao TEXT,
  tabela_afetada VARCHAR(100),
  registro_id BIGINT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== ÍNDICES ==========
CREATE INDEX IF NOT EXISTS idx_ferias_colaborador ON ferias(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_ferias_data ON ferias(data_inicio, data_fim);
CREATE INDEX IF NOT EXISTS idx_auditoria_timestamp ON logs_auditoria(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON logs_auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_colaboradores_ativo ON colaboradores(ativo);

-- ========== INSERIR ADMIN PADRÃO ==========
-- IMPORTANTE: Substituir a senha! Use: bcryptjs.hashSync('SuaSenha123!', 10)
-- Você pode usar um gerador online: https://bcrypt-generator.com/
-- Exemplo de hash da senha "admin123":
-- $2a$10$YourHashedPasswordHere...

INSERT INTO admins (nome, email, senha_hash) VALUES (
  'Admin Lojas Neitzke',
  'admin@neitzke.com.br',
  '$2a$10$eImiTXuWVxfaHNAVIpeH2OPST9/PgBkqquzi.Ss1Nzy.j4iHHWUei'
) ON CONFLICT (email) DO NOTHING;

-- A senha acima é: admin123
-- Você DEVE alterar isso após o primeiro login!
