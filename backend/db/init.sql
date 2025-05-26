-- Database initialization script for TalentBridge
-- Este script será executado automaticamente na criação do banco de dados "Data1"
-- definido no arquivo docker-compose.yml

-- Função para atualizar timestamp de atualização
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Users table
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    papel VARCHAR(30) NOT NULL CHECK (papel IN ('instituicao_ensino', 'chefe_empresa', 'instituicao_contratante')),
    nome VARCHAR(255) NOT NULL,
    verificado BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Instituições de Ensino
CREATE TABLE IF NOT EXISTS instituicoes_ensino (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    localizacao VARCHAR(255) NOT NULL,
    areas_ensino JSONB,
    qtd_alunos INTEGER,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id)
);

-- Chefes de Empresas
CREATE TABLE IF NOT EXISTS chefes_empresas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    empresa VARCHAR(255) NOT NULL,
    setor VARCHAR(100) NOT NULL,
    porte VARCHAR(50) NOT NULL,
    localizacao VARCHAR(255) NOT NULL,
    areas_atuacao JSONB,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id)
);

-- Instituições Contratantes
CREATE TABLE IF NOT EXISTS instituicoes_contratantes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(100) NOT NULL,
    localizacao VARCHAR(255) NOT NULL,
    areas_interesse JSONB,
    programas_sociais JSONB,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id)
);

-- Jovens/Alunos
CREATE TABLE IF NOT EXISTS jovens (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    idade INTEGER CHECK (idade >= 14 AND idade <= 29),
    formacao VARCHAR(100) CHECK (formacao IN ('ensino_medio', 'tecnico', 'superior', 'pos_graduacao')),
    curso VARCHAR(255),
    habilidades JSONB,
    interesses JSONB,
    planos_futuros TEXT,
    status VARCHAR(50) DEFAULT 'Ativo',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Relacionamento entre Jovens e Instituições de Ensino
CREATE TABLE IF NOT EXISTS jovens_instituicoes (
    id SERIAL PRIMARY KEY,
    jovem_id INTEGER REFERENCES jovens(id) ON DELETE CASCADE,
    instituicao_id INTEGER REFERENCES instituicoes_ensino(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    data_inicio DATE,
    data_fim DATE,
    curso VARCHAR(255),
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(jovem_id, instituicao_id)
);

-- Oportunidades
CREATE TABLE IF NOT EXISTS oportunidades (
    id SERIAL PRIMARY KEY,
    instituicao_id INTEGER REFERENCES instituicoes_contratantes(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    requisitos JSONB,
    beneficios JSONB,
    data_inicio DATE,
    data_fim DATE,
    status VARCHAR(50) DEFAULT 'Aberta' CHECK (status IN ('Aberta', 'Fechada', 'Encerrada', 'Cancelada')),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recomendações
CREATE TABLE IF NOT EXISTS recomendacoes (
    id SERIAL PRIMARY KEY,
    oportunidade_id INTEGER REFERENCES oportunidades(id) ON DELETE CASCADE,
    jovem_id INTEGER REFERENCES jovens(id) ON DELETE CASCADE,
    recomendador_tipo VARCHAR(30) NOT NULL CHECK (recomendador_tipo IN ('instituicao_ensino', 'chefe_empresa')),
    recomendador_id INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Aprovada', 'Rejeitada')),
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(oportunidade_id, jovem_id)
);

-- Opções padrão
CREATE TABLE IF NOT EXISTS opcoes_padrao (
    id SERIAL PRIMARY KEY,
    categoria VARCHAR(50) NOT NULL,
    valor VARCHAR(255) NOT NULL,
    ordem INTEGER NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(categoria, valor)
);

-- Triggers para atualização automática de timestamps
CREATE TRIGGER update_usuarios_modtime
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_instituicoes_ensino_modtime
    BEFORE UPDATE ON instituicoes_ensino
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_chefes_empresas_modtime
    BEFORE UPDATE ON chefes_empresas
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_instituicoes_contratantes_modtime
    BEFORE UPDATE ON instituicoes_contratantes
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_jovens_modtime
    BEFORE UPDATE ON jovens
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_jovens_instituicoes_modtime
    BEFORE UPDATE ON jovens_instituicoes
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_oportunidades_modtime
    BEFORE UPDATE ON oportunidades
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_recomendacoes_modtime
    BEFORE UPDATE ON recomendacoes
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Inserir opções padrão
INSERT INTO opcoes_padrao (categoria, valor, ordem) VALUES
    -- Áreas de Ensino
    ('areas_ensino', 'Tecnologia da Informação', 1),
    ('areas_ensino', 'Engenharia', 2),
    ('areas_ensino', 'Administração', 3),
    ('areas_ensino', 'Saúde', 4),
    ('areas_ensino', 'Educação', 5),
    
    -- Áreas de Atuação
    ('areas_atuacao', 'Tecnologia', 1),
    ('areas_atuacao', 'Indústria', 2),
    ('areas_atuacao', 'Comércio', 3),
    ('areas_atuacao', 'Serviços', 4),
    ('areas_atuacao', 'Educação', 5),
    
    -- Tipos de Instituição
    ('tipos_instituicao', 'ONG', 1),
    ('tipos_instituicao', 'Fundação', 2),
    ('tipos_instituicao', 'Instituto', 3),
    ('tipos_instituicao', 'Órgão Público', 4),
    
    -- Tipos de Instituição de Ensino
    ('tipos_instituicao_ensino', 'Universidade Pública', 1),
    ('tipos_instituicao_ensino', 'Universidade Privada', 2),
    ('tipos_instituicao_ensino', 'Instituto Técnico', 3),
    ('tipos_instituicao_ensino', 'Escola Técnica', 4),
    
    -- Setores de Empresa
    ('setores_empresa', 'Tecnologia', 1),
    ('setores_empresa', 'Indústria', 2),
    ('setores_empresa', 'Comércio', 3),
    ('setores_empresa', 'Serviços', 4),
    ('setores_empresa', 'Educação', 5),
    
    -- Portes de Empresa
    ('portes_empresa', 'Micro', 1),
    ('portes_empresa', 'Pequeno', 2),
    ('portes_empresa', 'Médio', 3),
    ('portes_empresa', 'Grande', 4),
    
    -- Tipos de Oportunidade
    ('tipos_oportunidade', 'Jovem Aprendiz', 1),
    ('tipos_oportunidade', 'Estágio', 2),
    ('tipos_oportunidade', 'Trainee', 3),
    ('tipos_oportunidade', 'CLT', 4),
    ('tipos_oportunidade', 'Freelancer', 5),
    
    -- Habilidades
    ('habilidades', 'Programação', 1),
    ('habilidades', 'Marketing Digital', 2),
    ('habilidades', 'Análise de Dados', 3),
    ('habilidades', 'Design Gráfico', 4),
    ('habilidades', 'Gestão de Projetos', 5),
    ('habilidades', 'Inglês', 6),
    ('habilidades', 'Excel Avançado', 7),
    ('habilidades', 'Comunicação', 8),
    ('habilidades', 'Liderança', 9),
    ('habilidades', 'Trabalho em Equipe', 10);

-- Dados de exemplo
-- Senha: 123456 (hash: $2b$12$tCvBW4rcz7/CROmZuLE5/.SVVxqzp3gKIwQrBmAqxnKuWh8dYLEx2)

-- Usuários exemplo
INSERT INTO usuarios (email, senha, papel, nome, verificado) VALUES
    ('etec@email.com', '$2b$12$tCvBW4rcz7/CROmZuLE5/.SVVxqzp3gKIwQrBmAqxnKuWh8dYLEx2', 'instituicao_ensino', 'ETEC São Paulo', true),
    ('empresa@email.com', '$2b$12$tCvBW4rcz7/CROmZuLE5/.SVVxqzp3gKIwQrBmAqxnKuWh8dYLEx2', 'chefe_empresa', 'Tech Solutions', true),
    ('ong@email.com', '$2b$12$tCvBW4rcz7/CROmZuLE5/.SVVxqzp3gKIwQrBmAqxnKuWh8dYLEx2', 'instituicao_contratante', 'ONG Futuro Digital', true);

-- Instituição de Ensino exemplo
INSERT INTO instituicoes_ensino (usuario_id, tipo, localizacao, areas_ensino, qtd_alunos) VALUES
    (1, 'Escola Técnica', 'São Paulo, SP', '["Tecnologia da Informação", "Administração"]', 1000);

-- Empresa exemplo
INSERT INTO chefes_empresas (usuario_id, empresa, setor, porte, localizacao, areas_atuacao) VALUES
    (2, 'Tech Solutions', 'Tecnologia', 'Médio', 'São Paulo, SP', '["Tecnologia", "Serviços"]');

-- Instituição Contratante exemplo
INSERT INTO instituicoes_contratantes (usuario_id, tipo, localizacao, areas_interesse, programas_sociais) VALUES
    (3, 'ONG', 'São Paulo, SP', '["Tecnologia", "Educação"]', '["Jovem Aprendiz", "Capacitação Profissional"]');

-- Jovens exemplo
INSERT INTO jovens (nome, email, idade, formacao, curso, habilidades, interesses, planos_futuros) VALUES
    ('João Silva', 'joao.silva@email.com', 18, 'ensino_medio', 'Técnico em Informática',
     '["Programação Básica", "HTML", "CSS"]',
     '["Desenvolvimento Web", "Jogos", "Inteligência Artificial"]',
     'Fazer faculdade de Ciência da Computação'),
    
    ('Maria Santos', 'maria.santos@email.com', 20, 'tecnico', 'Técnico em Desenvolvimento de Sistemas',
     '["Java", "Python", "Banco de Dados"]',
     '["Desenvolvimento Backend", "Segurança da Informação"]',
     'Trabalhar como desenvolvedora full-stack'),
    
    ('Pedro Oliveira', 'pedro.oliveira@email.com', 16, 'ensino_medio', 'Curso Técnico em Administração',
     '["Excel", "Word", "Inglês Básico"]',
     '["Gestão de Empresas", "Marketing Digital"]',
     'Abrir próprio negócio'),
    
    ('Ana Costa', 'ana.costa@email.com', 22, 'superior', 'Análise e Desenvolvimento de Sistemas',
     '["React", "Node.js", "TypeScript"]',
     '["Desenvolvimento Frontend", "UX/UI Design"]',
     'Trabalhar em uma grande empresa de tecnologia');

-- Relacionamentos entre Jovens e Instituição de Ensino
INSERT INTO jovens_instituicoes (jovem_id, instituicao_id, status, data_inicio, curso, observacoes) VALUES
    (1, 1, 'Cursando', '2024-02-01', 'Técnico em Informática', 'Aluno dedicado, com interesse em programação'),
    (2, 1, 'Cursando', '2023-08-01', 'Técnico em Desenvolvimento de Sistemas', 'Excelente desempenho em programação'),
    (3, 1, 'Cursando', '2024-02-01', 'Técnico em Administração', 'Demonstra perfil empreendedor'),
    (4, 1, 'Concluído', '2022-02-01', 'Técnico em Desenvolvimento de Sistemas', 'Formada com ótimas notas');

-- Oportunidades exemplo
INSERT INTO oportunidades (instituicao_id, titulo, descricao, tipo, requisitos, beneficios, status, data_inicio, data_fim) VALUES
    (1, 'Programa Jovem Aprendiz em TI', 
     'Oportunidade para jovens interessados em tecnologia. Aprenda na prática as principais tecnologias do mercado.',
     'Jovem Aprendiz',
     '["Cursando Ensino Médio", "Interesse em Tecnologia", "Conhecimento básico em informática"]',
     '["Vale Transporte", "Vale Refeição", "Bolsa Auxílio", "Curso de Capacitação"]',
     'Aberta',
     '2024-04-01',
     '2024-12-31'),
     
    (1, 'Estágio em Desenvolvimento Web', 
     'Vaga para estudantes de TI interessados em desenvolvimento web. Trabalhe com as mais recentes tecnologias do mercado.',
     'Estágio',
     '["Cursando Superior em TI", "Conhecimento básico em programação", "HTML/CSS/JavaScript"]',
     '["Vale Transporte", "Vale Refeição", "Bolsa Estágio", "Possibilidade de Efetivação"]',
     'Aberta',
     '2024-03-15',
     '2024-09-15');

-- Recomendações exemplo
INSERT INTO recomendacoes (oportunidade_id, jovem_id, recomendador_tipo, recomendador_id, status, observacoes) VALUES
    (1, 1, 'instituicao_ensino', 1, 'Pendente', 'Aluno com grande potencial e interesse em tecnologia'),
    (2, 2, 'instituicao_ensino', 1, 'Aprovada', 'Excelente aluna, com ótimo conhecimento técnico'),
    (2, 4, 'instituicao_ensino', 1, 'Aprovada', 'Aluna destaque, com experiência em projetos reais'); 