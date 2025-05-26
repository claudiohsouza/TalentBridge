import express from 'express';
// Removendo a importação do middleware de autenticação
// import { authMiddleware } from './auth.js';
import db from '../db-connect.js';
import { emecService } from '../services/emec.js';

const router = express.Router();
const pool = db.pool;

// Rota para obter todas as opções
router.get('/', async (req, res) => {
    try {
        // Buscar áreas de ensino
        const areasEnsino = await emecService.getAreasEnsino();
        console.log('Áreas de ensino carregadas:', areasEnsino);
        
        // Buscar áreas de atuação
        const areasAtuacao = await emecService.getAreasAtuacao();
        console.log('Áreas de atuação carregadas:', areasAtuacao);
        
        // Buscar outras opções do banco de dados
        const result = await pool.query('SELECT categoria, valor, ordem FROM opcoes_sistema ORDER BY categoria, ordem');
        const opcoes = result.rows;
        
        // Combinar todas as opções
        const todasOpcoes = [...areasEnsino, ...areasAtuacao, ...opcoes];
        
        // Agrupar opções por categoria
        const opcoesAgrupadas = todasOpcoes.reduce((acc, opcao) => {
            if (!acc[opcao.categoria]) {
                acc[opcao.categoria] = [];
            }
            acc[opcao.categoria].push(opcao.valor);
            return acc;
        }, {});

        console.log('Opções agrupadas:', opcoesAgrupadas);
        res.json(opcoesAgrupadas);
    } catch (error) {
        console.error('Erro ao buscar opções:', error);
        res.status(500).json({ error: 'Erro ao buscar opções' });
    }
});

// Rota para obter opções de uma categoria específica - removendo authMiddleware
router.get('/:categoria', async (req, res) => {
  try {
    const { categoria } = req.params;
    
    const result = await pool.query(
      'SELECT id, valor, descricao FROM opcoes_padrao WHERE categoria = $1 AND ativo = true ORDER BY valor',
      [categoria]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar opções:', error);
    res.status(500).json({ erro: 'Erro ao buscar opções' });
  }
});

// Endpoint para iniciar/popular a tabela de opções - removendo authMiddleware e verificação de papel
router.post('/init', async (req, res, next) => {
  try {
    // Verificar se a tabela existe, se não existir, criar
    await pool.query(`
      CREATE TABLE IF NOT EXISTS opcoes_sistema (
        id SERIAL PRIMARY KEY,
        categoria VARCHAR(50) NOT NULL,
        valor TEXT NOT NULL,
        descricao TEXT,
        ordem INT DEFAULT 0,
        ativo BOOLEAN DEFAULT true,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(categoria, valor)
      )
    `);
    
    // Limpar dados existentes se solicitado
    if (req.body.limpar) {
      await pool.query('TRUNCATE TABLE opcoes_sistema RESTART IDENTITY');
    }
    
    // Definir opções padrão a serem adicionadas
    const opcoesDefault = [
      // Áreas de Ensino
      { categoria: 'area_ensino', valor: 'Tecnologia da Informação', ordem: 1 },
      { categoria: 'area_ensino', valor: 'Engenharia de Software', ordem: 2 },
      { categoria: 'area_ensino', valor: 'Ciência da Computação', ordem: 3 },
      { categoria: 'area_ensino', valor: 'Análise de Dados', ordem: 4 },
      { categoria: 'area_ensino', valor: 'Engenharia Mecânica', ordem: 5 },
      { categoria: 'area_ensino', valor: 'Engenharia Elétrica', ordem: 6 },
      { categoria: 'area_ensino', valor: 'Engenharia Civil', ordem: 7 },
      { categoria: 'area_ensino', valor: 'Administração', ordem: 8 },
      { categoria: 'area_ensino', valor: 'Marketing Digital', ordem: 9 },
      { categoria: 'area_ensino', valor: 'Design Gráfico', ordem: 10 },
      { categoria: 'area_ensino', valor: 'Medicina', ordem: 11 },
      { categoria: 'area_ensino', valor: 'Enfermagem', ordem: 12 },
      { categoria: 'area_ensino', valor: 'Psicologia', ordem: 13 },
      { categoria: 'area_ensino', valor: 'Direito', ordem: 14 },
      { categoria: 'area_ensino', valor: 'Contabilidade', ordem: 15 },
      
      // Áreas de Interesse
      { categoria: 'areas_interesse', valor: 'Tecnologia', ordem: 1 },
      { categoria: 'areas_interesse', valor: 'Educação', ordem: 2 },
      { categoria: 'areas_interesse', valor: 'Administração', ordem: 3 },
      { categoria: 'areas_interesse', valor: 'Engenharia', ordem: 4 },
      { categoria: 'areas_interesse', valor: 'Saúde', ordem: 5 },
      { categoria: 'areas_interesse', valor: 'Marketing', ordem: 6 },
      { categoria: 'areas_interesse', valor: 'Finanças', ordem: 7 },
      { categoria: 'areas_interesse', valor: 'Design', ordem: 8 },
      { categoria: 'areas_interesse', valor: 'Comunicação', ordem: 9 },
      { categoria: 'areas_interesse', valor: 'Sustentabilidade', ordem: 10 },
      
      // Programas Sociais
      { categoria: 'programas_sociais', valor: 'Programa Jovem Aprendiz', ordem: 1 },
      { categoria: 'programas_sociais', valor: 'Programa de Estágio', ordem: 2 },
      { categoria: 'programas_sociais', valor: 'Programa de Trainee', ordem: 3 },
      { categoria: 'programas_sociais', valor: 'Primeiro Emprego', ordem: 4 },
      { categoria: 'programas_sociais', valor: 'Inclusão Social', ordem: 5 },
      { categoria: 'programas_sociais', valor: 'Diversidade', ordem: 6 },
      { categoria: 'programas_sociais', valor: 'Capacitação Profissional', ordem: 7 },
      
      // Tipos de Instituição Contratante
      { categoria: 'tipos_instituicao', valor: 'ONG', ordem: 1 },
      { categoria: 'tipos_instituicao', valor: 'Fundação', ordem: 2 },
      { categoria: 'tipos_instituicao', valor: 'Associação', ordem: 3 },
      { categoria: 'tipos_instituicao', valor: 'Instituto', ordem: 4 },
      { categoria: 'tipos_instituicao', valor: 'Órgão Público', ordem: 5 },
      { categoria: 'tipos_instituicao', valor: 'Outra', ordem: 6 },
      
      // Tipos de Instituição de Ensino
      { categoria: 'tipos_instituicao_ensino', valor: 'Universidade Pública', ordem: 1 },
      { categoria: 'tipos_instituicao_ensino', valor: 'Universidade Privada', ordem: 2 },
      { categoria: 'tipos_instituicao_ensino', valor: 'Instituto Técnico', ordem: 3 },
      { categoria: 'tipos_instituicao_ensino', valor: 'Escola Técnica', ordem: 4 },
      { categoria: 'tipos_instituicao_ensino', valor: 'Escola de Ensino Médio', ordem: 5 },
      { categoria: 'tipos_instituicao_ensino', valor: 'Outra', ordem: 6 },
      
      // Setores de Empresas
      { categoria: 'setores_empresa', valor: 'Tecnologia', ordem: 1 },
      { categoria: 'setores_empresa', valor: 'Manufatura', ordem: 2 },
      { categoria: 'setores_empresa', valor: 'Serviços', ordem: 3 },
      { categoria: 'setores_empresa', valor: 'Comércio', ordem: 4 },
      { categoria: 'setores_empresa', valor: 'Educação', ordem: 5 },
      { categoria: 'setores_empresa', valor: 'Saúde', ordem: 6 },
      { categoria: 'setores_empresa', valor: 'Outro', ordem: 7 },
      
      // Portes de Empresas
      { categoria: 'portes_empresa', valor: 'Micro', ordem: 1 },
      { categoria: 'portes_empresa', valor: 'Pequeno', ordem: 2 },
      { categoria: 'portes_empresa', valor: 'Médio', ordem: 3 },
      { categoria: 'portes_empresa', valor: 'Grande', ordem: 4 },
      
      // Tipos de Vaga
      { categoria: 'tipos_vaga', valor: 'Estágio', ordem: 1 },
      { categoria: 'tipos_vaga', valor: 'CLT', ordem: 2 },
      { categoria: 'tipos_vaga', valor: 'PJ', ordem: 3 },
      { categoria: 'tipos_vaga', valor: 'Temporário', ordem: 4 },
      { categoria: 'tipos_vaga', valor: 'Freelancer', ordem: 5 },
      { categoria: 'tipos_vaga', valor: 'Jovem Aprendiz', ordem: 6 },
      { categoria: 'tipos_vaga', valor: 'Trainee', ordem: 7 },
      
      // Áreas de Atuação
      { categoria: 'areas_atuacao', valor: 'Tecnologia da Informação', ordem: 1 },
      { categoria: 'areas_atuacao', valor: 'Desenvolvimento de Software', ordem: 2 },
      { categoria: 'areas_atuacao', valor: 'Marketing Digital', ordem: 3 },
      { categoria: 'areas_atuacao', valor: 'Recursos Humanos', ordem: 4 },
      { categoria: 'areas_atuacao', valor: 'Administração', ordem: 5 },
      { categoria: 'areas_atuacao', valor: 'Finanças', ordem: 6 },
      { categoria: 'areas_atuacao', valor: 'Contabilidade', ordem: 7 },
      { categoria: 'areas_atuacao', valor: 'Design', ordem: 8 },
      { categoria: 'areas_atuacao', valor: 'Vendas', ordem: 9 },
      { categoria: 'areas_atuacao', valor: 'Atendimento ao Cliente', ordem: 10 },
      { categoria: 'areas_atuacao', valor: 'Engenharia', ordem: 11 },
      { categoria: 'areas_atuacao', valor: 'Produção', ordem: 12 },
      { categoria: 'areas_atuacao', valor: 'Logística', ordem: 13 },
      { categoria: 'areas_atuacao', valor: 'Saúde', ordem: 14 },
      { categoria: 'areas_atuacao', valor: 'Educação', ordem: 15 },
      
      // Habilidades Profissionais
      { categoria: 'habilidades', valor: 'Programação', ordem: 1 },
      { categoria: 'habilidades', valor: 'Marketing Digital', ordem: 2 },
      { categoria: 'habilidades', valor: 'Análise de Dados', ordem: 3 },
      { categoria: 'habilidades', valor: 'Gerenciamento de Projetos', ordem: 4 },
      { categoria: 'habilidades', valor: 'UX/UI Design', ordem: 5 },
      { categoria: 'habilidades', valor: 'Desenvolvimento Web', ordem: 6 },
      { categoria: 'habilidades', valor: 'Banco de Dados', ordem: 7 },
      { categoria: 'habilidades', valor: 'Redação', ordem: 8 },
      { categoria: 'habilidades', valor: 'Microsoft Office', ordem: 9 },
      { categoria: 'habilidades', valor: 'Inglês', ordem: 10 },
      { categoria: 'habilidades', valor: 'Espanhol', ordem: 11 },
      { categoria: 'habilidades', valor: 'Comunicação', ordem: 12 },
      { categoria: 'habilidades', valor: 'Liderança', ordem: 13 },
      { categoria: 'habilidades', valor: 'Trabalho em Equipe', ordem: 14 },
      { categoria: 'habilidades', valor: 'Resolução de Problemas', ordem: 15 }
    ];
    
    // Inserir opções na tabela
    for (const opcao of opcoesDefault) {
      await pool.query(`
        INSERT INTO opcoes_sistema (categoria, valor, ordem)
        VALUES ($1, $2, $3)
        ON CONFLICT (categoria, valor) DO NOTHING
      `, [opcao.categoria, opcao.valor, opcao.ordem]);
    }
    
    res.json({ 
      message: 'Opções do sistema inicializadas com sucesso',
      count: opcoesDefault.length 
    });
  } catch (error) {
    console.error('[API-opcoes] Erro ao inicializar opções:', error);
    next(error);
  }
});

// Mantemos a rota sem autenticação para compatibilidade
router.post('/init-sem-auth', async (req, res, next) => {
  try {
    // Verificar se a tabela existe, se não existir, criar
    await pool.query(`
      CREATE TABLE IF NOT EXISTS opcoes_sistema (
        id SERIAL PRIMARY KEY,
        categoria VARCHAR(50) NOT NULL,
        valor TEXT NOT NULL,
        descricao TEXT,
        ordem INT DEFAULT 0,
        ativo BOOLEAN DEFAULT true,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(categoria, valor)
      )
    `);
    
    // Limpar dados existentes se solicitado
    if (req.body.limpar) {
      await pool.query('TRUNCATE TABLE opcoes_sistema RESTART IDENTITY');
    }
    
    // Definir opções padrão a serem adicionadas
    const opcoesDefault = [
      // Áreas de Ensino
      { categoria: 'area_ensino', valor: 'Tecnologia da Informação', ordem: 1 },
      { categoria: 'area_ensino', valor: 'Engenharia de Software', ordem: 2 },
      { categoria: 'area_ensino', valor: 'Ciência da Computação', ordem: 3 },
      { categoria: 'area_ensino', valor: 'Análise de Dados', ordem: 4 },
      { categoria: 'area_ensino', valor: 'Engenharia Mecânica', ordem: 5 },
      { categoria: 'area_ensino', valor: 'Engenharia Elétrica', ordem: 6 },
      { categoria: 'area_ensino', valor: 'Engenharia Civil', ordem: 7 },
      { categoria: 'area_ensino', valor: 'Administração', ordem: 8 },
      { categoria: 'area_ensino', valor: 'Marketing Digital', ordem: 9 },
      { categoria: 'area_ensino', valor: 'Design Gráfico', ordem: 10 },
      { categoria: 'area_ensino', valor: 'Medicina', ordem: 11 },
      { categoria: 'area_ensino', valor: 'Enfermagem', ordem: 12 },
      { categoria: 'area_ensino', valor: 'Psicologia', ordem: 13 },
      { categoria: 'area_ensino', valor: 'Direito', ordem: 14 },
      { categoria: 'area_ensino', valor: 'Contabilidade', ordem: 15 },
      
      // Áreas de Interesse
      { categoria: 'areas_interesse', valor: 'Tecnologia', ordem: 1 },
      { categoria: 'areas_interesse', valor: 'Educação', ordem: 2 },
      { categoria: 'areas_interesse', valor: 'Administração', ordem: 3 },
      { categoria: 'areas_interesse', valor: 'Engenharia', ordem: 4 },
      { categoria: 'areas_interesse', valor: 'Saúde', ordem: 5 },
      { categoria: 'areas_interesse', valor: 'Marketing', ordem: 6 },
      { categoria: 'areas_interesse', valor: 'Finanças', ordem: 7 },
      { categoria: 'areas_interesse', valor: 'Design', ordem: 8 },
      { categoria: 'areas_interesse', valor: 'Comunicação', ordem: 9 },
      { categoria: 'areas_interesse', valor: 'Sustentabilidade', ordem: 10 },
      
      // Programas Sociais
      { categoria: 'programas_sociais', valor: 'Programa Jovem Aprendiz', ordem: 1 },
      { categoria: 'programas_sociais', valor: 'Programa de Estágio', ordem: 2 },
      { categoria: 'programas_sociais', valor: 'Programa de Trainee', ordem: 3 },
      { categoria: 'programas_sociais', valor: 'Primeiro Emprego', ordem: 4 },
      { categoria: 'programas_sociais', valor: 'Inclusão Social', ordem: 5 },
      { categoria: 'programas_sociais', valor: 'Diversidade', ordem: 6 },
      { categoria: 'programas_sociais', valor: 'Capacitação Profissional', ordem: 7 },
      
      // Tipos de Instituição Contratante
      { categoria: 'tipos_instituicao', valor: 'ONG', ordem: 1 },
      { categoria: 'tipos_instituicao', valor: 'Fundação', ordem: 2 },
      { categoria: 'tipos_instituicao', valor: 'Associação', ordem: 3 },
      { categoria: 'tipos_instituicao', valor: 'Instituto', ordem: 4 },
      { categoria: 'tipos_instituicao', valor: 'Órgão Público', ordem: 5 },
      { categoria: 'tipos_instituicao', valor: 'Outra', ordem: 6 },
      
      // Tipos de Instituição de Ensino
      { categoria: 'tipos_instituicao_ensino', valor: 'Universidade Pública', ordem: 1 },
      { categoria: 'tipos_instituicao_ensino', valor: 'Universidade Privada', ordem: 2 },
      { categoria: 'tipos_instituicao_ensino', valor: 'Instituto Técnico', ordem: 3 },
      { categoria: 'tipos_instituicao_ensino', valor: 'Escola Técnica', ordem: 4 },
      { categoria: 'tipos_instituicao_ensino', valor: 'Escola de Ensino Médio', ordem: 5 },
      { categoria: 'tipos_instituicao_ensino', valor: 'Outra', ordem: 6 },
      
      // Setores de Empresas
      { categoria: 'setores_empresa', valor: 'Tecnologia', ordem: 1 },
      { categoria: 'setores_empresa', valor: 'Manufatura', ordem: 2 },
      { categoria: 'setores_empresa', valor: 'Serviços', ordem: 3 },
      { categoria: 'setores_empresa', valor: 'Comércio', ordem: 4 },
      { categoria: 'setores_empresa', valor: 'Educação', ordem: 5 },
      { categoria: 'setores_empresa', valor: 'Saúde', ordem: 6 },
      { categoria: 'setores_empresa', valor: 'Outro', ordem: 7 },
      
      // Portes de Empresas
      { categoria: 'portes_empresa', valor: 'Micro', ordem: 1 },
      { categoria: 'portes_empresa', valor: 'Pequeno', ordem: 2 },
      { categoria: 'portes_empresa', valor: 'Médio', ordem: 3 },
      { categoria: 'portes_empresa', valor: 'Grande', ordem: 4 },
      
      // Tipos de Vaga
      { categoria: 'tipos_vaga', valor: 'Estágio', ordem: 1 },
      { categoria: 'tipos_vaga', valor: 'CLT', ordem: 2 },
      { categoria: 'tipos_vaga', valor: 'PJ', ordem: 3 },
      { categoria: 'tipos_vaga', valor: 'Temporário', ordem: 4 },
      { categoria: 'tipos_vaga', valor: 'Freelancer', ordem: 5 },
      { categoria: 'tipos_vaga', valor: 'Jovem Aprendiz', ordem: 6 },
      { categoria: 'tipos_vaga', valor: 'Trainee', ordem: 7 },
      
      // Áreas de Atuação
      { categoria: 'areas_atuacao', valor: 'Tecnologia da Informação', ordem: 1 },
      { categoria: 'areas_atuacao', valor: 'Desenvolvimento de Software', ordem: 2 },
      { categoria: 'areas_atuacao', valor: 'Marketing Digital', ordem: 3 },
      { categoria: 'areas_atuacao', valor: 'Recursos Humanos', ordem: 4 },
      { categoria: 'areas_atuacao', valor: 'Administração', ordem: 5 },
      { categoria: 'areas_atuacao', valor: 'Finanças', ordem: 6 },
      { categoria: 'areas_atuacao', valor: 'Contabilidade', ordem: 7 },
      { categoria: 'areas_atuacao', valor: 'Design', ordem: 8 },
      { categoria: 'areas_atuacao', valor: 'Vendas', ordem: 9 },
      { categoria: 'areas_atuacao', valor: 'Atendimento ao Cliente', ordem: 10 },
      { categoria: 'areas_atuacao', valor: 'Engenharia', ordem: 11 },
      { categoria: 'areas_atuacao', valor: 'Produção', ordem: 12 },
      { categoria: 'areas_atuacao', valor: 'Logística', ordem: 13 },
      { categoria: 'areas_atuacao', valor: 'Saúde', ordem: 14 },
      { categoria: 'areas_atuacao', valor: 'Educação', ordem: 15 },
      
      // Habilidades Profissionais
      { categoria: 'habilidades', valor: 'Programação', ordem: 1 },
      { categoria: 'habilidades', valor: 'Marketing Digital', ordem: 2 },
      { categoria: 'habilidades', valor: 'Análise de Dados', ordem: 3 },
      { categoria: 'habilidades', valor: 'Gerenciamento de Projetos', ordem: 4 },
      { categoria: 'habilidades', valor: 'UX/UI Design', ordem: 5 },
      { categoria: 'habilidades', valor: 'Desenvolvimento Web', ordem: 6 },
      { categoria: 'habilidades', valor: 'Banco de Dados', ordem: 7 },
      { categoria: 'habilidades', valor: 'Redação', ordem: 8 },
      { categoria: 'habilidades', valor: 'Microsoft Office', ordem: 9 },
      { categoria: 'habilidades', valor: 'Inglês', ordem: 10 },
      { categoria: 'habilidades', valor: 'Espanhol', ordem: 11 },
      { categoria: 'habilidades', valor: 'Comunicação', ordem: 12 },
      { categoria: 'habilidades', valor: 'Liderança', ordem: 13 },
      { categoria: 'habilidades', valor: 'Trabalho em Equipe', ordem: 14 },
      { categoria: 'habilidades', valor: 'Resolução de Problemas', ordem: 15 }
    ];
    
    // Inserir opções na tabela
    for (const opcao of opcoesDefault) {
      await pool.query(`
        INSERT INTO opcoes_sistema (categoria, valor, ordem)
        VALUES ($1, $2, $3)
        ON CONFLICT (categoria, valor) DO NOTHING
      `, [opcao.categoria, opcao.valor, opcao.ordem]);
    }
    
    res.json({ 
      message: 'Opções do sistema inicializadas com sucesso',
      count: opcoesDefault.length 
    });
  } catch (error) {
    console.error('[API-opcoes] Erro ao inicializar opções:', error);
    next(error);
  }
});

// Obter todas as categorias disponíveis
router.get('/categorias', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT categoria FROM opcoes_padrao WHERE ativo = true ORDER BY categoria'
    );
    
    res.json(result.rows.map(row => row.categoria));
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ erro: 'Erro ao buscar categorias' });
  }
});

export default router; 