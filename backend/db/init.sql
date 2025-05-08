-- Database initialization script for TalentBridge
-- Este script será executado automaticamente na criação do banco de dados "Data1"
-- definido no arquivo docker-compose.yml

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for institutions, companies and hiring institutions
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

-- Jovens table
CREATE TABLE IF NOT EXISTS jovens (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    idade INTEGER CHECK (idade >= 14 AND idade <= 29),
    formacao VARCHAR(100),
    curso VARCHAR(255),
    habilidades JSONB,
    interesses JSONB,
    planos_futuros TEXT,
    status VARCHAR(50) DEFAULT 'Ativo',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(email)
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
('fundacao.social@exemplo.com', '$2b$12$1X.LrObGFyoDE3bQcWFQnOQZF3KQP/gILV/dk20XQNiulLUJVyPXe', 'instituicao_contratante', 'Fundação Social Brasil', true);

-- Dados de exemplo para instituições de ensino
INSERT INTO instituicoes_ensino (usuario_id, tipo, localizacao, areas_ensino, qtd_alunos) VALUES
(1, 'Universidade Pública', 'São Paulo, SP', '["Tecnologia", "Engenharia", "Administração", "Medicina"]', 15000),
(2, 'Instituto Técnico', 'Rio de Janeiro, RJ', '["Programação", "Design Digital", "Redes", "Segurança da Informação"]', 3000),
(7, 'Escola Técnica Estadual', 'Campinas, SP', '["Mecatrônica", "Administração", "Enfermagem", "Química"]', 2500);

-- Dados de exemplo para chefes de empresas
INSERT INTO chefes_empresas (usuario_id, empresa, setor, porte, localizacao, areas_atuacao) VALUES
(3, 'Carlos Tecnologia LTDA', 'Tecnologia', 'Médio', 'São Paulo, SP', '["Desenvolvimento de Software", "Inteligência Artificial", "Cloud Computing"]'),
(4, 'Indústria ABC', 'Manufatura', 'Grande', 'Belo Horizonte, MG', '["Automação Industrial", "Logística", "Produção"]'),
(8, 'Startup Inovação', 'Tecnologia', 'Pequeno', 'Florianópolis, SC', '["Mobile Apps", "Blockchain", "Fintech"]'),
(9, 'AgroTech Solutions', 'Agronegócio', 'Médio', 'Ribeirão Preto, SP', '["Tecnologia Agrícola", "IoT", "Sustentabilidade"]');

-- Dados de exemplo para instituições contratantes
INSERT INTO instituicoes_contratantes (usuario_id, tipo, localizacao, areas_interesse, programas_sociais) VALUES
(5, 'Órgão Público', 'Brasília, DF', '["Administração Pública", "Tecnologia", "Educação"]', '["Jovem Aprendiz", "Primeiro Emprego"]'),
(6, 'ONG', 'Porto Alegre, RS', '["Educação", "Tecnologia", "Empreendedorismo"]', '["Capacitação Digital", "Mentoria Profissional"]'),
(10, 'Fundação', 'Salvador, BA', '["Inclusão Social", "Desenvolvimento Sustentável", "Educação Digital"]', '["Inclusão Digital", "Capacitação Profissional", "Emprego Verde"]');

-- Dados de exemplo para jovens
INSERT INTO jovens (nome, email, idade, formacao, curso, habilidades, interesses, planos_futuros) VALUES
('João Silva', 'joao.silva@exemplo.com', 19, 'Ensino Médio Completo', 'Técnico em Informática', '["Programação Básica", "Inglês Intermediário"]', '["Tecnologia", "Jogos Digitais"]', 'Cursar faculdade de Ciência da Computação'),
('Maria Santos', 'maria.santos@exemplo.com', 22, 'Graduação em Andamento', 'Bacharelado em Sistemas de Informação', '["Desenvolvimento Web", "Design Gráfico", "Marketing Digital"]', '["Tecnologia", "Design", "Comunicação"]', 'Trabalhar como desenvolvedor full-stack'),
('Pedro Oliveira', 'pedro.oliveira@exemplo.com', 18, 'Ensino Técnico em Andamento', 'Técnico em Eletrônica', '["Eletrônica Básica", "Inglês Básico"]', '["Robótica", "Automação"]', 'Especializar-se em automação industrial'),
('Ana Beatriz', 'ana.beatriz@exemplo.com', 24, 'Graduação Completa', 'Bacharelado em Ciência da Computação', '["Desenvolvimento Mobile", "UX/UI", "Firebase"]', '["Aplicativos", "Empreendedorismo"]', 'Criar uma startup na área de tecnologia'),
('Lucas Mendes', 'lucas.mendes@exemplo.com', 20, 'Técnico em Informática', 'Técnico em Análise de Dados', '["Python", "Análise de Dados", "SQL"]', '["Ciência de Dados", "Machine Learning"]', 'Especializar-se em inteligência artificial'),
('Carla Ferreira', 'carla.ferreira@exemplo.com', 25, 'Graduação em Engenharia', 'Bacharelado em Engenharia Civil', '["Gestão de Projetos", "Excel Avançado", "AutoCAD"]', '["Engenharia", "Sustentabilidade"]', 'Liderar projetos de engenharia sustentável'),
('Rafael Souza', 'rafael.souza@exemplo.com', 17, 'Ensino Médio em Andamento', 'Ensino Médio Técnico em Multimídia', '["Edição de Vídeo", "Redes Sociais", "Photoshop"]', '["Marketing Digital", "Audiovisual"]', 'Trabalhar com produção de conteúdo digital'),
('Juliana Costa', 'juliana.costa@exemplo.com', 23, 'Graduação em Administração', 'Bacharelado em Administração', '["Gestão Financeira", "Marketing", "Inglês Fluente"]', '["Empreendedorismo", "Negócios Internacionais"]', 'Abrir seu próprio negócio'),
('Fernando Gomes', 'fernando.gomes@exemplo.com', 21, 'Técnico em Mecatrônica', 'Técnico em Mecatrônica', '["Automação", "Robótica", "Desenho Técnico"]', '["Indústria 4.0", "Robótica Avançada"]', 'Trabalhar em empresas de tecnologia avançada'),
('Mariana Lima', 'mariana.lima@exemplo.com', 19, 'Ensino Médio Completo', 'Técnico em Desenvolvimento Web', '["Programação Front-end", "Inglês Básico", "Design"]', '["Desenvolvimento Web", "UX/UI"]', 'Tornar-se desenvolvedora web full-stack');

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
(1, 'Programa Jovem Técnico', 'Programa de formação e contratação de jovens para área técnica', 'Programa de Capacitação', '["Ensino Médio Completo", "Conhecimentos Básicos em Informática"]', '["Bolsa Auxílio", "Vale Transporte", "Certificado"]', '2023-08-01', 'Aberta'),
(2, 'Incubadora de Startups Jovens', 'Programa de incubação para startups fundadas por jovens', 'Incubação', '["Ter entre 18 e 29 anos", "Projeto Inovador"]', '["Mentoria", "Espaço de Trabalho", "Networking"]', '2023-09-01', 'Aberta'),
(1, 'Estágio em Tecnologia', 'Vagas de estágio para jovens na área de tecnologia', 'Estágio', '["Cursando Ensino Superior", "Conhecimentos em Programação"]', '["Bolsa Estágio", "Vale Refeição", "Plano de Carreira"]', '2023-07-15', 'Aberta'),
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