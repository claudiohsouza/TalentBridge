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
    papel VARCHAR(20) NOT NULL CHECK (papel IN ('instituicao', 'empresa')),
    verificado BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS estudantes (
    id SERIAL PRIMARY KEY,
    instituicao_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    media_geral NUMERIC(4,2) CHECK (media_geral >= 0 AND media_geral <= 10),
    estabilidade_estresse INTEGER CHECK (estabilidade_estresse >= 1 AND estabilidade_estresse <= 5),
    habilidades JSONB,
    planos_futuros TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(instituicao_id, email)
);

-- Index for better search performance
CREATE INDEX IF NOT EXISTS idx_estudantes_instituicao ON estudantes(instituicao_id);
CREATE INDEX IF NOT EXISTS idx_estudantes_nome ON estudantes(nome);
CREATE INDEX IF NOT EXISTS idx_estudantes_email ON estudantes(email);

-- Function to update "atualizado_em" timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_usuarios_modtime
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Trigger for students table
CREATE TRIGGER update_estudantes_modtime
    BEFORE UPDATE ON estudantes
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Inserção de dados de exemplo
-- Senhas: $2b$12$1X.LrObGFyoDE3bQcWFQnOQZF3KQP/gILV/dk20XQNiulLUJVyPXe (equivale a "senha123")

-- Usuários de exemplo (instituições e empresas)
INSERT INTO usuarios (email, senha, papel, verificado) VALUES
('univ.federal@exemplo.com', '$2b$12$1X.LrObGFyoDE3bQcWFQnOQZF3KQP/gILV/dk20XQNiulLUJVyPXe', 'instituicao', true),
('faculdade.tech@exemplo.com', '$2b$12$1X.LrObGFyoDE3bQcWFQnOQZF3KQP/gILV/dk20XQNiulLUJVyPXe', 'instituicao', true),
('empresa.tecnologia@exemplo.com', '$2b$12$1X.LrObGFyoDE3bQcWFQnOQZF3KQP/gILV/dk20XQNiulLUJVyPXe', 'empresa', true),
('consultoria.dev@exemplo.com', '$2b$12$1X.LrObGFyoDE3bQcWFQnOQZF3KQP/gILV/dk20XQNiulLUJVyPXe', 'empresa', true);

-- Estudantes da Universidade Federal
INSERT INTO estudantes (instituicao_id, nome, email, media_geral, estabilidade_estresse, habilidades, planos_futuros) VALUES
(1, 'João Silva', 'joao.silva@aluno.exemplo.com', 8.7, 4, '["Java", "Python", "SQL", "Git"]', 'Pretendo me especializar em desenvolvimento backend e trabalhar com sistemas de alta performance.'),
(1, 'Maria Santos', 'maria.santos@aluno.exemplo.com', 9.2, 3, '["JavaScript", "React", "Node.js", "UX/UI"]', 'Busco oportunidades na área de desenvolvimento frontend e design de interfaces.'),
(1, 'Pedro Oliveira', 'pedro.oliveira@aluno.exemplo.com', 7.5, 5, '["C++", "AWS", "Docker", "Linux"]', 'Interessado em DevOps e infraestrutura em nuvem.'),
(1, 'Juliana Costa', 'juliana.costa@aluno.exemplo.com', 8.9, 4, '["Python", "Data Science", "Machine Learning", "R"]', 'Quero seguir carreira em ciência de dados e inteligência artificial.');

-- Estudantes da Faculdade Tech
INSERT INTO estudantes (instituicao_id, nome, email, media_geral, estabilidade_estresse, habilidades, planos_futuros) VALUES
(2, 'Carlos Ferreira', 'carlos.ferreira@aluno.exemplo.com', 8.3, 3, '["JavaScript", "Vue.js", "MongoDB", "Express"]', 'Pretendo trabalhar com aplicações web utilizando o stack MEVN.'),
(2, 'Ana Beatriz', 'ana.beatriz@aluno.exemplo.com', 9.5, 4, '["Flutter", "Dart", "Firebase", "UI Design"]', 'Desenvolvimento de aplicativos móveis multiplataforma.'),
(2, 'Lucas Mendes', 'lucas.mendes@aluno.exemplo.com', 7.8, 5, '["Java", "Spring Boot", "Hibernate", "PostgreSQL"]', 'Desenvolvimento de sistemas empresariais e APIs robustas.'),
(2, 'Camila Rodrigues', 'camila.rodrigues@aluno.exemplo.com', 8.6, 3, '["C#", ".NET", "Azure", "SQL Server"]', 'Desenvolvimento de soluções utilizando tecnologias Microsoft.'); 