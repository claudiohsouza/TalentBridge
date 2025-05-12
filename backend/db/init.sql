-- Database initialization script for TalentBridge
-- Este script será executado automaticamente na criação do banco de dados "Data1"
-- definido no arquivo docker-compose.yml

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for institutions and companies
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

-- Jovens table (passive entities)
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
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_curso_formacao CHECK (
        (formacao = 'ensino_medio' AND curso IS NULL) OR
        (formacao != 'ensino_medio' AND curso IS NOT NULL)
    )
);

-- Instituições de Ensino information
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

-- Chefes de Empresas information
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

-- Instituições Contratantes information
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

-- Relação entre Jovens e Instituições de Ensino
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

-- Relação entre Jovens e Chefes de Empresas
CREATE TABLE IF NOT EXISTS jovens_empresas (
    id SERIAL PRIMARY KEY,
    jovem_id INTEGER REFERENCES jovens(id) ON DELETE CASCADE,
    chefe_empresa_id INTEGER REFERENCES chefes_empresas(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    cargo VARCHAR(255),
    data_inicio DATE,
    data_fim DATE,
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(jovem_id, chefe_empresa_id)
);

-- Oportunidades oferecidas pelas Instituições Contratantes
CREATE TABLE IF NOT EXISTS oportunidades (
    id SERIAL PRIMARY KEY,
    instituicao_id INTEGER REFERENCES instituicoes_contratantes(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    requisitos JSONB,
    beneficios JSONB,
    data_inicio DATE,
    data_fim DATE,
    status VARCHAR(50) NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recomendações de Jovens feitas por Instituições de Ensino e Chefes de Empresas
CREATE TABLE IF NOT EXISTS recomendacoes (
    id SERIAL PRIMARY KEY,
    jovem_id INTEGER REFERENCES jovens(id) ON DELETE CASCADE,
    oportunidade_id INTEGER REFERENCES oportunidades(id) ON DELETE CASCADE,
    recomendador_tipo VARCHAR(30) NOT NULL,
    recomendador_id INTEGER NOT NULL,
    justificativa TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pendente',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (recomendador_tipo IN ('instituicao_ensino', 'chefe_empresa')),
    UNIQUE(jovem_id, oportunidade_id, recomendador_tipo, recomendador_id)
);

-- Tabela para categorias de avaliação
CREATE TABLE IF NOT EXISTS categorias_avaliacao (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    peso DECIMAL(3,2) DEFAULT 1.0,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserir categorias padrão
INSERT INTO categorias_avaliacao (nome, descricao, peso) VALUES
    ('Habilidades Técnicas', 'Avaliação das competências técnicas específicas', 1.0),
    ('Soft Skills', 'Habilidades interpessoais e comportamentais', 1.0),
    ('Comprometimento', 'Dedicação e responsabilidade demonstradas', 1.0),
    ('Potencial de Crescimento', 'Capacidade de desenvolvimento e aprendizado', 1.0),
    ('Trabalho em Equipe', 'Capacidade de colaboração e trabalho em grupo', 1.0);

-- Tabela para avaliações
CREATE TABLE IF NOT EXISTS avaliacoes (
    id SERIAL PRIMARY KEY,
    jovem_id INTEGER REFERENCES jovens(id) ON DELETE CASCADE,
    avaliador_tipo VARCHAR(50) NOT NULL CHECK (avaliador_tipo IN ('instituicao_ensino', 'chefe_empresa')),
    avaliador_id INTEGER NOT NULL,
    categoria_id INTEGER REFERENCES categorias_avaliacao(id),
    nota DECIMAL(3,1) CHECK (nota >= 0 AND nota <= 10),
    comentario TEXT,
    evidencias TEXT[], -- Array de URLs ou referências que comprovam a avaliação
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para histórico de desenvolvimento
CREATE TABLE IF NOT EXISTS historico_desenvolvimento (
    id SERIAL PRIMARY KEY,
    jovem_id INTEGER REFERENCES jovens(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('certificacao', 'curso', 'projeto', 'conquista')),
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    data_inicio DATE,
    data_conclusao DATE,
    instituicao VARCHAR(200),
    comprovante_url TEXT,
    validado BOOLEAN DEFAULT FALSE,
    validado_por INTEGER, -- ID do usuário que validou
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para badges/conquistas
CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    icone_url TEXT,
    criterios JSONB, -- Critérios para ganhar o badge
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para badges conquistados pelos jovens
CREATE TABLE IF NOT EXISTS jovens_badges (
    jovem_id INTEGER REFERENCES jovens(id) ON DELETE CASCADE,
    badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
    data_conquista TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    concedido_por INTEGER, -- ID do usuário que concedeu o badge
    PRIMARY KEY (jovem_id, badge_id)
);

-- Tabela para opções padrão
CREATE TABLE IF NOT EXISTS opcoes_padrao (
    id SERIAL PRIMARY KEY,
    categoria VARCHAR(50) NOT NULL,
    valor VARCHAR(255) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(categoria, valor)
);

-- Inserir opções padrão
INSERT INTO opcoes_padrao (categoria, valor, descricao) VALUES
-- Áreas de Ensino
('area_ensino', 'Tecnologia da Informação', 'Cursos relacionados à computação e sistemas'),
('area_ensino', 'Engenharia de Software', 'Desenvolvimento de sistemas e aplicações'),
('area_ensino', 'Ciência da Computação', 'Fundamentos teóricos e práticos da computação'),
('area_ensino', 'Análise de Dados', 'Processamento e análise de grandes volumes de dados'),
('area_ensino', 'Engenharia Mecânica', 'Projetos e manutenção de sistemas mecânicos'),
('area_ensino', 'Engenharia Elétrica', 'Sistemas elétricos e eletrônicos'),
('area_ensino', 'Engenharia Civil', 'Construção civil e infraestrutura'),
('area_ensino', 'Administração', 'Gestão de negócios e organizações'),
('area_ensino', 'Marketing Digital', 'Estratégias de marketing online'),
('area_ensino', 'Design Gráfico', 'Criação visual e design'),
('area_ensino', 'Medicina', 'Ciências médicas e saúde'),
('area_ensino', 'Enfermagem', 'Cuidados de saúde e assistência'),
('area_ensino', 'Psicologia', 'Estudo do comportamento humano'),
('area_ensino', 'Direito', 'Ciências jurídicas'),
('area_ensino', 'Contabilidade', 'Gestão financeira e contábil'),

-- Áreas de Atuação
('area_atuacao', 'Desenvolvimento Web', 'Criação de sites e aplicações web'),
('area_atuacao', 'Desenvolvimento Mobile', 'Criação de aplicativos móveis'),
('area_atuacao', 'Inteligência Artificial', 'Sistemas inteligentes e machine learning'),
('area_atuacao', 'Cloud Computing', 'Computação em nuvem e infraestrutura'),
('area_atuacao', 'Segurança da Informação', 'Proteção de dados e sistemas'),
('area_atuacao', 'DevOps', 'Integração entre desenvolvimento e operações'),
('area_atuacao', 'Blockchain', 'Tecnologia de registro distribuído'),
('area_atuacao', 'IoT', 'Internet das Coisas e dispositivos conectados'),
('area_atuacao', 'Automação Industrial', 'Sistemas automatizados para indústria'),
('area_atuacao', 'Robótica', 'Desenvolvimento e programação de robôs'),
('area_atuacao', 'Big Data', 'Análise de grandes volumes de dados'),
('area_atuacao', 'UX/UI Design', 'Design de interfaces e experiência do usuário'),
('area_atuacao', 'Marketing Digital', 'Marketing online e mídias sociais'),
('area_atuacao', 'E-commerce', 'Comércio eletrônico'),
('area_atuacao', 'Gestão de Projetos', 'Coordenação e gerenciamento de projetos'),

-- Áreas de Interesse
('area_interesse', 'Tecnologia', 'Desenvolvimento e inovação tecnológica'),
('area_interesse', 'Educação', 'Formação e capacitação'),
('area_interesse', 'Sustentabilidade', 'Desenvolvimento sustentável e meio ambiente'),
('area_interesse', 'Inovação Social', 'Soluções inovadoras para problemas sociais'),
('area_interesse', 'Empreendedorismo', 'Criação e gestão de negócios'),
('area_interesse', 'Inclusão Digital', 'Democratização do acesso à tecnologia'),
('area_interesse', 'Saúde', 'Bem-estar e cuidados com a saúde'),
('area_interesse', 'Cultura', 'Manifestações culturais e artísticas'),
('area_interesse', 'Esporte', 'Práticas esportivas e qualidade de vida'),
('area_interesse', 'Cidadania', 'Direitos e deveres cidadãos'),
('area_interesse', 'Meio Ambiente', 'Preservação e conservação ambiental'),
('area_interesse', 'Direitos Humanos', 'Promoção e defesa dos direitos humanos'),
('area_interesse', 'Economia Criativa', 'Economia baseada em criatividade e inovação'),
('area_interesse', 'Mobilidade Urbana', 'Transporte e locomoção nas cidades'),
('area_interesse', 'Segurança Alimentar', 'Acesso a alimentação adequada'),

-- Programas Sociais
('programa_social', 'Jovem Aprendiz', 'Programa de aprendizagem profissional'),
('programa_social', 'Primeiro Emprego', 'Inserção no mercado de trabalho'),
('programa_social', 'Capacitação Digital', 'Formação em tecnologia'),
('programa_social', 'Mentoria Profissional', 'Acompanhamento de carreira'),
('programa_social', 'Inclusão Digital', 'Acesso à tecnologia'),
('programa_social', 'Empreendedorismo Jovem', 'Apoio a jovens empreendedores'),
('programa_social', 'Educação Financeira', 'Gestão de finanças pessoais'),
('programa_social', 'Liderança Juvenil', 'Desenvolvimento de lideranças'),
('programa_social', 'Cidadania Digital', 'Uso consciente da tecnologia'),
('programa_social', 'Cultura e Arte', 'Expressão artística e cultural'),
('programa_social', 'Esporte e Lazer', 'Atividades esportivas e recreativas'),
('programa_social', 'Meio Ambiente', 'Educação ambiental'),
('programa_social', 'Saúde e Bem-estar', 'Cuidados com a saúde'),
('programa_social', 'Voluntariado', 'Ações voluntárias'),
('programa_social', 'Emprego Verde', 'Trabalho em sustentabilidade');

-- Function to update "atualizado_em" timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating modification timestamps
CREATE TRIGGER update_usuarios_modtime
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_jovens_modtime
    BEFORE UPDATE ON jovens
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

CREATE TRIGGER update_jovens_instituicoes_modtime
    BEFORE UPDATE ON jovens_instituicoes
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_jovens_empresas_modtime
    BEFORE UPDATE ON jovens_empresas
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

-- Inserção de dados de exemplo
-- Senhas: $2b$12$1X.LrObGFyoDE3bQcWFQnOQZF3KQP/gILV/dk20XQNiulLUJVyPXe (equivale a "senha123")

-- Usuários de exemplo (instituições de ensino, chefes de empresa e instituições contratantes)
INSERT INTO usuarios (email, senha, papel, nome, verificado) VALUES
('univ.federal@exemplo.com', '$2b$12$1X.LrObGFyoDE3bQcWFQnOQZF3KQP/gILV/dk20XQNiulLUJVyPXe', 'instituicao_ensino', 'Universidade Federal', true),
('inst.tecnico@exemplo.com', '$2b$12$1X.LrObGFyoDE3bQcWFQnOQZF3KQP/gILV/dk20XQNiulLUJVyPXe', 'instituicao_ensino', 'Instituto Técnico de Informática', true),
('empresa.tech@exemplo.com', '$2b$12$1X.LrObGFyoDE3bQcWFQnOQZF3KQP/gILV/dk20XQNiulLUJVyPXe', 'chefe_empresa', 'Carlos Tecnologia LTDA', true),
('industria.abc@exemplo.com', '$2b$12$1X.LrObGFyoDE3bQcWFQnOQZF3KQP/gILV/dk20XQNiulLUJVyPXe', 'chefe_empresa', 'Indústria ABC', true),
('prefeitura@exemplo.com', '$2b$12$1X.LrObGFyoDE3bQcWFQnOQZF3KQP/gILV/dk20XQNiulLUJVyPXe', 'instituicao_contratante', 'Prefeitura Municipal', true),
('ong.futuro@exemplo.com', '$2b$12$1X.LrObGFyoDE3bQcWFQnOQZF3KQP/gILV/dk20XQNiulLUJVyPXe', 'instituicao_contratante', 'ONG Futuro Jovem', true),
('escola.tecnica@exemplo.com', '$2b$12$1X.LrObGFyoDE3bQcWFQnOQZF3KQP/gILV/dk20XQNiulLUJVyPXe', 'instituicao_ensino', 'Escola Técnica Estadual', true),
('startup.inovacao@exemplo.com', '$2b$12$1X.LrObGFyoDE3bQcWFQnOQZF3KQP/gILV/dk20XQNiulLUJVyPXe', 'chefe_empresa', 'Startup Inovação', true),
('empresa.agro@exemplo.com', '$2b$12$1X.LrObGFyoDE3bQcWFQnOQZF3KQP/gILV/dk20XQNiulLUJVyPXe', 'chefe_empresa', 'AgroTech Solutions', true),
('fundacao.social@exemplo.com', '$2b$12$1X.LrObGFyoDE3bQcWFQnOQZF3KQP/gILV/dk20XQNiulLUJVyPXe', 'instituicao_contratante', 'Fundação Social Brasil', true),
('etec@email.com', '$2b$10$K.0HwpsoPDGaB/atjB0m7uNF.DkSXZWQj1yS4kh.Kg3oGqJaFzjie', 'instituicao_ensino', 'ETEC São Paulo', true),
('empresa@email.com', '$2b$10$K.0HwpsoPDGaB/atjB0m7uNF.DkSXZWQj1yS4kh.Kg3oGqJaFzjie', 'chefe_empresa', 'Tech Solutions', true),
('contratante1@email.com', '$2b$10$K.0HwpsoPDGaB/atjB0m7uNF.DkSXZWQj1yS4kh.Kg3oGqJaFzjie', 'instituicao_contratante', 'Instituto Oportunidade', true),
('contratante2@email.com', '$2b$10$K.0HwpsoPDGaB/atjB0m7uNF.DkSXZWQj1yS4kh.Kg3oGqJaFzjie', 'instituicao_contratante', 'Fundação Emprega Jovem', true);

-- Dados de exemplo para instituições de ensino
INSERT INTO instituicoes_ensino (usuario_id, tipo, localizacao, areas_ensino, qtd_alunos) VALUES
(1, 'Universidade Pública', 'São Paulo, SP', '["Tecnologia", "Engenharia", "Administração", "Medicina"]', 15000),
(2, 'Instituto Técnico', 'Rio de Janeiro, RJ', '["Programação", "Design Digital", "Redes", "Segurança da Informação"]', 3000),
(7, 'Escola Técnica Estadual', 'Campinas, SP', '["Mecatrônica", "Administração", "Enfermagem", "Química"]', 2500),
(1, 'Técnica', 'São Paulo, SP', '["Tecnologia", "Administração"]', 1000);

-- Dados de exemplo para chefes de empresas
INSERT INTO chefes_empresas (usuario_id, empresa, setor, porte, localizacao, areas_atuacao) VALUES
(3, 'Carlos Tecnologia LTDA', 'Tecnologia', 'Médio', 'São Paulo, SP', '["Desenvolvimento de Software", "Inteligência Artificial", "Cloud Computing"]'),
(4, 'Indústria ABC', 'Manufatura', 'Grande', 'Belo Horizonte, MG', '["Automação Industrial", "Logística", "Produção"]'),
(8, 'Startup Inovação', 'Tecnologia', 'Pequeno', 'Florianópolis, SC', '["Mobile Apps", "Blockchain", "Fintech"]'),
(9, 'AgroTech Solutions', 'Agronegócio', 'Médio', 'Ribeirão Preto, SP', '["Tecnologia Agrícola", "IoT", "Sustentabilidade"]'),
(2, 'Tech Solutions', 'Tecnologia', 'Médio', 'São Paulo, SP', '["Desenvolvimento", "Inovação"]');

-- Dados de exemplo para instituições contratantes
INSERT INTO instituicoes_contratantes (usuario_id, tipo, localizacao, areas_interesse, programas_sociais) VALUES
(5, 'Órgão Público', 'Brasília, DF', '["Administração Pública", "Tecnologia", "Educação"]', '["Jovem Aprendiz", "Primeiro Emprego"]'),
(6, 'ONG', 'Porto Alegre, RS', '["Educação", "Tecnologia", "Empreendedorismo"]', '["Capacitação Digital", "Mentoria Profissional"]'),
(10, 'Fundação', 'Salvador, BA', '["Inclusão Social", "Desenvolvimento Sustentável", "Educação Digital"]', '["Inclusão Digital", "Capacitação Profissional", "Emprego Verde"]'),
(3, 'ONG', 'São Paulo, SP', '["Tecnologia", "Educação", "Administração"]', '["Programa Jovem Aprendiz", "Programa de Estágio"]'),
(4, 'Fundação', 'Rio de Janeiro, RJ', '["Engenharia", "Saúde", "Tecnologia"]', '["Primeiro Emprego", "Programa de Trainee"]');

-- Dados de exemplo para jovens
INSERT INTO jovens (nome, email, idade, formacao, curso, habilidades, interesses, planos_futuros) VALUES
('João Silva', 'joao.silva@exemplo.com', 19, 'ensino_medio', NULL, '["Programação Básica", "Inglês Intermediário"]', '["Tecnologia", "Jogos Digitais"]', 'Cursar faculdade de Ciência da Computação'),
('Maria Oliveira', 'maria.oliveira@exemplo.com', 22, 'superior', 'Bacharelado em Sistemas de Informação', '["Desenvolvimento Web", "Design Gráfico", "Marketing Digital"]', '["Tecnologia", "Design", "Comunicação"]', 'Trabalhar como desenvolvedor full-stack'),
('Carlos Santos', 'carlos.santos@exemplo.com', 18, 'tecnico', 'Técnico em Eletrônica', '["Eletrônica Básica", "Inglês Básico"]', '["Robótica", "Automação"]', 'Especializar-se em automação industrial'),
('Ana Pereira', 'ana.pereira@exemplo.com', 24, 'superior', 'Bacharelado em Ciência da Computação', '["Desenvolvimento Mobile", "UX/UI", "Firebase"]', '["Aplicativos", "Empreendedorismo"]', 'Criar uma startup na área de tecnologia'),
('Pedro Rodrigues', 'pedro.rodrigues@exemplo.com', 20, 'tecnico', 'Técnico em Análise de Dados', '["Python", "Análise de Dados", "SQL"]', '["Ciência de Dados", "Machine Learning"]', 'Especializar-se em inteligência artificial'),
('Mariana Costa', 'mariana.costa@exemplo.com', 25, 'superior', 'Bacharelado em Engenharia Civil', '["Gestão de Projetos", "Excel Avançado", "AutoCAD"]', '["Engenharia", "Sustentabilidade"]', 'Liderar projetos de engenharia sustentável'),
('Lucas Oliveira', 'lucas.oliveira@exemplo.com', 17, 'ensino_medio', NULL, '["Edição de Vídeo", "Redes Sociais", "Photoshop"]', '["Marketing Digital", "Audiovisual"]', 'Trabalhar com produção de conteúdo digital'),
('Isabela Santos', 'isabela.santos@exemplo.com', 23, 'superior', 'Bacharelado em Administração', '["Gestão Financeira", "Marketing", "Inglês Fluente"]', '["Empreendedorismo", "Negócios Internacionais"]', 'Abrir seu próprio negócio'),
('Gabriel Rodrigues', 'gabriel.rodrigues@exemplo.com', 21, 'tecnico', 'Técnico em Mecatrônica', '["Automação", "Robótica", "Desenho Técnico"]', '["Indústria 4.0", "Robótica Avançada"]', 'Trabalhar em empresas de tecnologia avançada'),
('Laura Pereira', 'laura.pereira@exemplo.com', 19, 'ensino_medio', NULL, '["Programação Front-end", "Inglês Básico", "Design"]', '["Desenvolvimento Web", "UX/UI"]', 'Tornar-se desenvolvedora web full-stack');

-- Relacionamentos entre jovens e instituições de ensino
INSERT INTO jovens_instituicoes (jovem_id, instituicao_id, status, data_inicio, curso, observacoes) VALUES
(1, 2, 'Cursando', '2023-02-01', 'Técnico em Informática', 'Aluno dedicado com bom desempenho'),
(2, 1, 'Cursando', '2021-03-01', 'Bacharelado em Sistemas de Informação', 'Participa de projetos de extensão'),
(3, 2, 'Cursando', '2023-02-01', 'Técnico em Eletrônica', 'Interesse em robótica'),
(4, 1, 'Concluído', '2018-03-01', 'Bacharelado em Ciência da Computação', 'Formada com distinção'),
(5, 2, 'Cursando', '2022-08-01', 'Técnico em Análise de Dados', 'Habilidade com matemática'),
(6, 1, 'Concluído', '2020-05-01', 'Bacharelado em Engenharia Civil', 'Premiada como melhor aluna do curso'),
(7, 3, 'Cursando', '2022-02-01', 'Ensino Médio Técnico em Multimídia', 'Interesse em audiovisual e redes sociais'),
(8, 1, 'Concluído', '2021-12-01', 'Bacharelado em Administração', 'Participou de empresa júnior'),
(9, 3, 'Cursando', '2021-02-01', 'Técnico em Mecatrônica', 'Participa de competições de robótica'),
(10, 2, 'Matriculado', '2023-08-01', 'Técnico em Desenvolvimento Web', 'Primeira experiência formal na área');

-- Relacionamentos entre jovens e chefes de empresas
INSERT INTO jovens_empresas (jovem_id, chefe_empresa_id, status, cargo, data_inicio, observacoes) VALUES
(1, 1, 'Estagiário', 'Estagiário de Desenvolvimento', '2023-06-01', 'Primeiro estágio, aprendendo rapidamente'),
(2, 1, 'Contratado', 'Desenvolvedor Junior', '2022-01-15', 'Ótimo desempenho, proativo'),
(4, 2, 'Contratado', 'Analista de Sistemas', '2023-03-10', 'Responsável por projetos de automação'),
(5, 1, 'Estagiário', 'Estagiário em Ciência de Dados', '2023-05-01', 'Trabalha com análise preditiva'),
(6, 2, 'Contratado', 'Engenheira Junior', '2023-01-15', 'Setor de projetos sustentáveis'),
(8, 4, 'Contratado', 'Assistente Administrativo', '2022-06-01', 'Área de gestão de projetos'),
(9, 2, 'Aprendiz', 'Jovem Aprendiz em Automação', '2023-03-01', 'Aprendendo sobre manutenção de equipamentos'),
(10, 3, 'Estagiário', 'Estagiária de Front-end', '2023-07-01', 'Desenvolvimento de interfaces mobile');

-- Oportunidades oferecidas pelas instituições contratantes
INSERT INTO oportunidades (instituicao_id, titulo, descricao, tipo, requisitos, beneficios, data_inicio, status) VALUES
(1, 'Programa Jovem Técnico', 'Programa de formação e contratação de jovens para área técnica', 'Programa de Capacitação', '["Ensino Médio Completo", "Conhecimentos Básicos em Informática"]', '["Bolsa Auxílio", "Vale Transporte", "Certificado"]', '2024-08-01', 'Aberta'),
(2, 'Incubadora de Startups Jovens', 'Programa de incubação para startups fundadas por jovens', 'Incubação', '["Ter entre 18 e 29 anos", "Projeto Inovador"]', '["Mentoria", "Espaço de Trabalho", "Networking"]', '2024-09-01', 'Aberta'),
(1, 'Estágio em Tecnologia', 'Vagas de estágio para jovens na área de tecnologia', 'Estágio', '["Cursando Ensino Superior", "Conhecimentos em Programação"]', '["Bolsa Estágio", "Vale Refeição", "Plano de Carreira"]', '2024-07-15', 'Aberta'),
(3, 'Projeto Jovens Programadores', 'Formação intensiva em programação com contratação dos melhores', 'Bootcamp', '["Ensino Médio Completo", "Interesse em Tecnologia", "Lógica de Programação"]', '["Curso Gratuito", "Material Didático", "Possibilidade de Contratação"]', '2023-09-15', 'Aberta'),
(2, 'Laboratório de Inovação Social', 'Programa para jovens desenvolverem soluções para problemas sociais', 'Projeto', '["Ter entre 16 e 29 anos", "Interesse em Impacto Social"]', '["Bolsa Auxílio", "Certificação", "Mentorias Especializadas"]', '2023-10-01', 'Aberta'),
(3, 'Agentes de Sustentabilidade', 'Programa de capacitação e atuação em projetos sustentáveis', 'Programa', '["Ensino Médio Completo", "Interesse em Sustentabilidade"]', '["Bolsa Auxílio", "Treinamento", "Certificação"]', '2023-11-01', 'Aberta'),
(1, 'Aprendiz em Administração Pública', 'Programa de aprendizagem na administração municipal', 'Jovem Aprendiz', '["Ter entre 14 e 22 anos", "Cursando Ensino Médio"]', '["Salário Aprendiz", "Vale Transporte", "Vale Alimentação"]', '2023-08-15', 'Aberta'),
(2, 'Hackathon de Impacto Social', 'Maratona de programação para solucionar desafios sociais', 'Evento', '["Conhecimentos em Programação", "Interesse em Impacto Social"]', '["Premiação", "Networking", "Possibilidade de Investimento"]', '2023-09-30', 'Aberta');

-- Recomendações de jovens para oportunidades
INSERT INTO recomendacoes (jovem_id, oportunidade_id, recomendador_tipo, recomendador_id, justificativa, status) VALUES
(1, 1, 'instituicao_ensino', 2, 'Aluno com grande potencial técnico e dedicação aos estudos', 'pendente'),
(2, 3, 'chefe_empresa', 1, 'Profissional com excelente desempenho e capacidade de aprendizado', 'aprovada'),
(3, 1, 'instituicao_ensino', 2, 'Estudante com interesse e aptidão pela área técnica', 'pendente'),
(4, 2, 'chefe_empresa', 2, 'Profissional com perfil empreendedor e visão inovadora', 'aprovada'),
(5, 4, 'instituicao_ensino', 2, 'Aluno com grande aptidão para programação e análise de dados', 'pendente'),
(6, 6, 'chefe_empresa', 2, 'Profissional com foco em sustentabilidade e excelentes habilidades técnicas', 'aprovada'),
(7, 5, 'instituicao_ensino', 3, 'Aluno criativo com forte interesse em projetos sociais', 'pendente'),
(8, 2, 'chefe_empresa', 4, 'Profissional com visão empreendedora e boas habilidades de gestão', 'aprovada'),
(9, 1, 'instituicao_ensino', 3, 'Estudante com habilidades técnicas avançadas em mecatrônica', 'pendente'),
(10, 4, 'instituicao_ensino', 2, 'Aluna com interesse em desenvolvimento e bom raciocínio lógico', 'pendente'),
(1, 3, 'chefe_empresa', 1, 'Estagiário dedicado com boa capacidade de aprendizado', 'aprovada'),
(5, 3, 'chefe_empresa', 1, 'Estagiário com ótimas habilidades analíticas', 'aprovada');

-- Inserir dados iniciais para teste
-- Usuários
INSERT INTO usuarios (email, senha, papel, nome, verificado) VALUES
('etec@email.com', '$2b$10$K.0HwpsoPDGaB/atjB0m7uNF.DkSXZWQj1yS4kh.Kg3oGqJaFzjie', 'instituicao_ensino', 'ETEC São Paulo', true),
('empresa@email.com', '$2b$10$K.0HwpsoPDGaB/atjB0m7uNF.DkSXZWQj1yS4kh.Kg3oGqJaFzjie', 'chefe_empresa', 'Tech Solutions', true),
('contratante1@email.com', '$2b$10$K.0HwpsoPDGaB/atjB0m7uNF.DkSXZWQj1yS4kh.Kg3oGqJaFzjie', 'instituicao_contratante', 'Instituto Oportunidade', true),
('contratante2@email.com', '$2b$10$K.0HwpsoPDGaB/atjB0m7uNF.DkSXZWQj1yS4kh.Kg3oGqJaFzjie', 'instituicao_contratante', 'Fundação Emprega Jovem', true);

-- Instituições de Ensino
INSERT INTO instituicoes_ensino (usuario_id, tipo, localizacao, areas_ensino, qtd_alunos) VALUES
(1, 'Técnica', 'São Paulo, SP', '["Tecnologia", "Administração"]', 1000);

-- Chefes de Empresa
INSERT INTO chefes_empresas (usuario_id, empresa, setor, porte, localizacao, areas_atuacao) VALUES
(2, 'Tech Solutions', 'Tecnologia', 'Médio', 'São Paulo, SP', '["Desenvolvimento", "Inovação"]');

-- Instituições Contratantes
INSERT INTO instituicoes_contratantes (usuario_id, tipo, localizacao, areas_interesse, programas_sociais) VALUES
(3, 'ONG', 'São Paulo, SP', '["Tecnologia", "Educação", "Administração"]', '["Programa Jovem Aprendiz", "Programa de Estágio"]'),
(4, 'Fundação', 'Rio de Janeiro, RJ', '["Engenharia", "Saúde", "Tecnologia"]', '["Primeiro Emprego", "Programa de Trainee"]');

-- Oportunidades
INSERT INTO oportunidades (instituicao_id, titulo, descricao, tipo, requisitos, beneficios, data_inicio, status) VALUES
(1, 'Programa Jovem Técnico', 'Programa de formação e contratação de jovens para área técnica', 'Programa de Capacitação', '["Ensino Médio Completo", "Conhecimentos Básicos em Informática"]', '["Bolsa Auxílio", "Vale Transporte", "Certificado"]', '2024-08-01', 'Aberta'),
(2, 'Incubadora de Startups Jovens', 'Programa de incubação para startups fundadas por jovens', 'Incubação', '["Ter entre 18 e 29 anos", "Projeto Inovador"]', '["Mentoria", "Espaço de Trabalho", "Networking"]', '2024-09-01', 'Aberta'),
(1, 'Estágio em Tecnologia', 'Vagas de estágio para jovens na área de tecnologia', 'Estágio', '["Cursando Ensino Superior", "Conhecimentos em Programação"]', '["Bolsa Estágio", "Vale Refeição", "Plano de Carreira"]', '2024-07-15', 'Aberta');

-- Avaliações para os jovens
INSERT INTO avaliacoes (jovem_id, avaliador_tipo, avaliador_id, categoria_id, nota, comentario, evidencias) VALUES
-- Avaliações Gabriel
(1, 'instituicao_ensino', 1, 1, 8.5, 'Excelente conhecimento técnico', '{"https://exemplo.com/certificado1"}'),
(1, 'instituicao_ensino', 1, 2, 9.0, 'Ótimo trabalho em equipe', NULL),
-- Avaliações Isabela
(2, 'instituicao_ensino', 1, 1, 9.5, 'Destaque em programação', '{"https://exemplo.com/certificado2"}'),
(2, 'chefe_empresa', 2, 3, 9.0, 'Muito comprometida com os projetos', NULL),
-- Avaliações João
(3, 'instituicao_ensino', 1, 4, 8.0, 'Grande potencial de aprendizado', NULL),
(3, 'instituicao_ensino', 1, 5, 8.5, 'Colaborativo e participativo', NULL);

-- Histórico de desenvolvimento
INSERT INTO historico_desenvolvimento (jovem_id, tipo, titulo, descricao, instituicao, validado, validado_por) VALUES
(1, 'curso', 'Curso de Web Development', 'Curso completo de desenvolvimento web', 'ETEC', true, 1),
(2, 'certificacao', 'Certificação Java', 'Certificação profissional Java', 'Oracle', true, 1),
(3, 'projeto', 'Projeto Integrador', 'Desenvolvimento de sistema escolar', 'ETEC', true, 1); 