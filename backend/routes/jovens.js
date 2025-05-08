import express from 'express';
import { validate, jovemSchema, recomendacaoSchema } from '../middleware/validator.js';
import { authMiddleware, checkRole } from '../routes/auth.js';
import { ForbiddenError, NotFoundError, DatabaseError } from '../middleware/errorHandler.js';

const router = express.Router();

// Listar jovens
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    console.log('[API-jovens] Recebida solicitação para listar jovens');
    console.log('[API-jovens] Usuário:', req.user.id, req.user.email, req.user.papel);
    
    // Verificar disponibilidade do pool
    const pool = req.db;
    if (!pool) {
      console.error('[API-jovens] Pool de conexão não disponível');
      return next(new Error('Erro de conexão com o banco de dados'));
    }
    
    // Query base para consulta
    const baseQuery = `
      SELECT 
        j.id, j.nome, j.email, j.idade, j.formacao, 
        j.habilidades, j.interesses, j.planos_futuros,
        j.criado_em, j.atualizado_em
      FROM jovens j
    `;
    
    let query = '';
    const params = [];
    
    // Filtrar jovens com base no papel do usuário
    if (req.user.papel === 'instituicao_ensino') {
      console.log('[API-jovens] Buscando jovens para instituição de ensino');
      
      // Instituições de ensino veem apenas jovens relacionados a elas
      const instituicao = await pool.query(
        'SELECT id FROM instituicoes_ensino WHERE usuario_id = $1',
        [req.user.id]
      );
      
      if (instituicao.rows.length === 0) {
        return res.status(400).json({ message: 'Perfil de instituição não encontrado' });
      }
      
      const instituicaoId = instituicao.rows[0].id;
      query = `
        ${baseQuery}
        WHERE EXISTS (
          SELECT 1 FROM jovens_instituicoes ji2 
          WHERE ji2.jovem_id = j.id AND ji2.instituicao_id = $1
        )
        GROUP BY j.id
        ORDER BY j.nome
      `;
      params.push(instituicaoId);
    } 
    else if (req.user.papel === 'chefe_empresa') {
      // Chefes de empresa veem apenas jovens relacionados a eles
      const empresa = await pool.query(
        'SELECT id FROM chefes_empresas WHERE usuario_id = $1',
        [req.user.id]
      );
      
      if (empresa.rows.length === 0) {
        return res.status(400).json({ message: 'Perfil de empresa não encontrado' });
      }
      
      const empresaId = empresa.rows[0].id;
      query = `
        ${baseQuery}
        WHERE EXISTS (
          SELECT 1 FROM jovens_empresas je2 
          WHERE je2.jovem_id = j.id AND je2.chefe_empresa_id = $1
        )
        GROUP BY j.id
        ORDER BY j.nome
      `;
      params.push(empresaId);
    }
    else if (req.user.papel === 'instituicao_contratante') {
      // Instituições contratantes veem todos os jovens
      query = `
        ${baseQuery}
        GROUP BY j.id
        ORDER BY j.nome
      `;
    }
    else {
      return next(new ForbiddenError('Papel não autorizado'));
    }
    
    console.log('[API-jovens] Executando query:', query);
    console.log('[API-jovens] Parâmetros:', params);
    
    const { rows } = await pool.query(query, params);
    console.log('[API-jovens] Jovens encontrados:', rows.length);
    
    // Processar dados
    const processedRows = rows.map(jovem => {
      // Converte habilidades e interesses de string para array se necessário
      if (jovem.habilidades && typeof jovem.habilidades === 'string') {
        try {
          jovem.habilidades = JSON.parse(jovem.habilidades);
        } catch (e) {
          console.warn('[API-jovens] Erro ao fazer parsing de habilidades');
          jovem.habilidades = [];
        }
      }
      
      if (jovem.interesses && typeof jovem.interesses === 'string') {
        try {
          jovem.interesses = JSON.parse(jovem.interesses);
        } catch (e) {
          console.warn('[API-jovens] Erro ao fazer parsing de interesses');
          jovem.interesses = [];
        }
      }
      
      return jovem;
    });
    
    res.json(processedRows);
  } catch (error) {
    console.error('[API-jovens] Erro ao listar jovens:', error);
    next(error);
  }
});

// Rota para o formulário de criação de jovem
router.get('/novo', authMiddleware, (req, res) => {
  res.json({ 
    message: 'Formulário para criar um novo jovem',
    campos_obrigatorios: ['nome', 'email', 'idade'],
    campos_opcionais: ['formacao', 'habilidades', 'interesses', 'planos_futuros']
  });
});

// Obter um jovem específico
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    console.log('[API-jovens] Recebida solicitação para obter detalhes do jovem:', req.params.id);
    console.log('[API-jovens] Usuário:', req.user.id, req.user.email, req.user.papel);
    
    const pool = req.db;
    if (!pool) {
      console.error('[API-jovens] Pool de conexão não disponível');
      return next(new Error('Erro de conexão com o banco de dados'));
    }
    
    const { id } = req.params;
    
    // Validar se o ID é um número inteiro
    const jovemId = parseInt(id);
    if (isNaN(jovemId)) {
      console.error('[API-jovens] ID inválido fornecido:', id);
      return res.status(400).json({ 
        message: 'ID inválido. O ID do jovem deve ser um número inteiro.',
        error: 'INVALID_ID'
      });
    }
    
    // Verificar se o jovem existe
    console.log('[API-jovens] Buscando dados do jovem');
    const jovemQuery = await pool.query(
      'SELECT * FROM jovens WHERE id = $1',
      [jovemId]
    );
    
    if (jovemQuery.rows.length === 0) {
      console.log('[API-jovens] Jovem não encontrado:', jovemId);
      return next(new NotFoundError('Jovem não encontrado'));
    }
    
    const jovem = jovemQuery.rows[0];
    console.log('[API-jovens] Jovem encontrado:', jovem.nome);
    
    // Obter relacionamentos com instituições
    console.log('[API-jovens] Buscando relacionamentos com instituições');
    const instituicoesQuery = await pool.query(
      `SELECT ji.*, ie.tipo, ie.localizacao
       FROM jovens_instituicoes ji
       JOIN instituicoes_ensino ie ON ji.instituicao_id = ie.id
       WHERE ji.jovem_id = $1`,
      [jovemId]
    );
    
    // Obter relacionamentos com empresas
    console.log('[API-jovens] Buscando relacionamentos com empresas');
    const empresasQuery = await pool.query(
      `SELECT je.*, ce.empresa, ce.setor
       FROM jovens_empresas je
       JOIN chefes_empresas ce ON je.chefe_empresa_id = ce.id
       WHERE je.jovem_id = $1`,
      [jovemId]
    );
    
    // Verificar permissão de acesso baseado no papel
    let temPermissao = false;
    
    if (req.user.papel === 'instituicao_contratante') {
      temPermissao = true;
      console.log('[API-jovens] Acesso permitido para instituição contratante');
    }
    else if (req.user.papel === 'instituicao_ensino') {
      console.log('[API-jovens] Verificando permissão para instituição de ensino');
      const instituicao = await pool.query(
        'SELECT id FROM instituicoes_ensino WHERE usuario_id = $1',
        [req.user.id]
      );
      
      if (instituicao.rows.length > 0) {
        const instituicaoId = instituicao.rows[0].id;
        temPermissao = instituicoesQuery.rows.some(i => i.instituicao_id === instituicaoId);
        console.log('[API-jovens] Permissão para instituição de ensino:', temPermissao);
      }
    }
    else if (req.user.papel === 'chefe_empresa') {
      console.log('[API-jovens] Verificando permissão para chefe de empresa');
      const empresa = await pool.query(
        'SELECT id FROM chefes_empresas WHERE usuario_id = $1',
        [req.user.id]
      );
      
      if (empresa.rows.length > 0) {
        const empresaId = empresa.rows[0].id;
        temPermissao = empresasQuery.rows.some(e => e.chefe_empresa_id === empresaId);
        console.log('[API-jovens] Permissão para chefe de empresa:', temPermissao);
      }
    }
    
    if (!temPermissao) {
      console.log('[API-jovens] Acesso negado para o usuário');
      return next(new ForbiddenError('Sem permissão para acessar dados deste jovem'));
    }
    
    // Processar dados para resposta
    const resposta = {
      ...jovem,
      instituicoes: instituicoesQuery.rows,
      empresas: empresasQuery.rows
    };
    
    // Converter campos JSON
    if (resposta.habilidades && typeof resposta.habilidades === 'string') {
      try {
        resposta.habilidades = JSON.parse(resposta.habilidades);
      } catch (e) {
        resposta.habilidades = [];
      }
    }
    
    if (resposta.interesses && typeof resposta.interesses === 'string') {
      try {
        resposta.interesses = JSON.parse(resposta.interesses);
      } catch (e) {
        resposta.interesses = [];
      }
    }
    
    console.log('[API-jovens] Enviando resposta com sucesso');
    res.json(resposta);
  } catch (error) {
    console.error('[API-jovens] Erro ao obter detalhes do jovem:', error);
    next(error);
  }
});

// Criar novo jovem
router.post('/', authMiddleware, checkRole(['instituicao_ensino', 'chefe_empresa']), validate(jovemSchema), async (req, res, next) => {
  try {
    console.log('[API-jovens] Recebida solicitação para criar novo jovem');
    console.log('[API-jovens] Usuário:', req.user.id, req.user.email, req.user.papel);
    
    const pool = req.db;
    if (!pool) {
      console.error('[API-jovens] Pool de conexão não disponível');
      return next(new Error('Erro de conexão com o banco de dados'));
    }
    
    const { nome, email, idade, formacao, curso, habilidades, interesses, planos_futuros } = req.body;
    
    // Verificar se o email já está em uso
    const emailExistente = await pool.query('SELECT id FROM jovens WHERE email = $1', [email]);
    if (emailExistente.rows.length > 0) {
      return res.status(400).json({
        message: 'Email já está em uso por outro jovem',
        error: 'EMAIL_IN_USE'
      });
    }
    
    // Determinar o tipo do usuário e obter a ID da instituição/empresa
    let entidadeId;
    let entidadeTipo = req.user.papel;
    
    if (entidadeTipo === 'instituicao_ensino') {
      const result = await pool.query(
        'SELECT id FROM instituicoes_ensino WHERE usuario_id = $1',
        [req.user.id]
      );
      
      if (result.rows.length === 0) {
        return res.status(400).json({ message: 'Perfil de instituição não encontrado' });
      }
      
      entidadeId = result.rows[0].id;
    } 
    else if (entidadeTipo === 'chefe_empresa') {
      const result = await pool.query(
        'SELECT id FROM chefes_empresas WHERE usuario_id = $1',
        [req.user.id]
      );
      
      if (result.rows.length === 0) {
        return res.status(400).json({ message: 'Perfil de empresa não encontrado' });
      }
      
      entidadeId = result.rows[0].id;
    }
    else {
      return next(new ForbiddenError('Não autorizado a adicionar jovens'));
    }
    
    // Preparar dados para inserir
    const habilidadesJSON = habilidades ? JSON.stringify(habilidades) : null;
    const interessesJSON = interesses ? JSON.stringify(interesses) : null;
    
    // Inicia uma transação
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Inserir o jovem
      const jovemResult = await client.query(
        `INSERT INTO jovens 
        (nome, email, idade, formacao, curso, habilidades, interesses, planos_futuros, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [nome, email, idade, formacao, curso, habilidadesJSON, interessesJSON, planos_futuros, 'Ativo']
      );
      
      const novoJovem = jovemResult.rows[0];
      
      // Criar relação entre o jovem e a instituição ou empresa
      if (entidadeTipo === 'instituicao_ensino') {
        await client.query(
          `INSERT INTO jovens_instituicoes 
          (jovem_id, instituicao_id, data_inicio, status)
          VALUES ($1, $2, CURRENT_DATE, 'Ativo')`,
          [novoJovem.id, entidadeId]
        );
      } else if (entidadeTipo === 'chefe_empresa') {
        await client.query(
          `INSERT INTO jovens_empresas 
          (jovem_id, chefe_empresa_id, data_inicio, cargo, status)
          VALUES ($1, $2, CURRENT_DATE, 'Não informado', 'Ativo')`,
          [novoJovem.id, entidadeId]
        );
      }
      
      await client.query('COMMIT');
      
      console.log('[API-jovens] Jovem criado com sucesso:', novoJovem.id);
      
      // Processar dados para resposta
      if (novoJovem.habilidades && typeof novoJovem.habilidades === 'string') {
        try {
          novoJovem.habilidades = JSON.parse(novoJovem.habilidades);
        } catch (e) {
          novoJovem.habilidades = [];
        }
      }
      
      if (novoJovem.interesses && typeof novoJovem.interesses === 'string') {
        try {
          novoJovem.interesses = JSON.parse(novoJovem.interesses);
        } catch (e) {
          novoJovem.interesses = [];
        }
      }
      
      res.status(201).json({
        success: true,
        message: 'Jovem criado com sucesso',
        jovem: novoJovem
      });
    } catch (dbError) {
      await client.query('ROLLBACK');
      console.error('[API-jovens] Erro na transação:', dbError);
      return next(new DatabaseError('Erro ao criar jovem', { error: dbError.message }));
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[API-jovens] Erro ao criar jovem:', error);
    next(error);
  }
});

// Rota para recomendação de jovens para oportunidades
router.post('/recomendar', authMiddleware, checkRole(['instituicao_ensino', 'chefe_empresa']), validate(recomendacaoSchema), async (req, res, next) => {
  try {
    const pool = req.db;
    const { jovem_id, oportunidade_id, justificativa } = req.body;
    
    if (!jovem_id || !oportunidade_id || !justificativa) {
      return res.status(400).json({ message: 'Dados incompletos para recomendação' });
    }
    
    // Verificar se o jovem existe
    const jovemExiste = await pool.query('SELECT id FROM jovens WHERE id = $1', [jovem_id]);
    if (jovemExiste.rows.length === 0) {
      return next(new NotFoundError('Jovem não encontrado'));
    }
    
    // Verificar se a oportunidade existe
    const oportunidadeExiste = await pool.query('SELECT id FROM oportunidades WHERE id = $1', [oportunidade_id]);
    if (oportunidadeExiste.rows.length === 0) {
      return next(new NotFoundError('Oportunidade não encontrada'));
    }
    
    // Determinar o tipo e id do recomendador
    let recomendadorTipo = req.user.papel;
    let recomendadorId;
    
    if (recomendadorTipo === 'instituicao_ensino') {
      const result = await pool.query(
        'SELECT id FROM instituicoes_ensino WHERE usuario_id = $1',
        [req.user.id]
      );
      
      if (result.rows.length === 0) {
        return res.status(400).json({ message: 'Perfil de instituição não encontrado' });
      }
      
      recomendadorId = result.rows[0].id;
      
      // Verificar se o jovem está vinculado a esta instituição
      const vinculo = await pool.query(
        'SELECT id FROM jovens_instituicoes WHERE jovem_id = $1 AND instituicao_id = $2',
        [jovem_id, recomendadorId]
      );
      
      if (vinculo.rows.length === 0) {
        return next(new ForbiddenError('Jovem não está vinculado a esta instituição'));
      }
    } 
    else if (recomendadorTipo === 'chefe_empresa') {
      const result = await pool.query(
        'SELECT id FROM chefes_empresas WHERE usuario_id = $1',
        [req.user.id]
      );
      
      if (result.rows.length === 0) {
        return res.status(400).json({ message: 'Perfil de empresa não encontrado' });
      }
      
      recomendadorId = result.rows[0].id;
      
      // Verificar se o jovem está vinculado a esta empresa
      const vinculo = await pool.query(
        'SELECT id FROM jovens_empresas WHERE jovem_id = $1 AND chefe_empresa_id = $2',
        [jovem_id, recomendadorId]
      );
      
      if (vinculo.rows.length === 0) {
        return next(new ForbiddenError('Jovem não está vinculado a esta empresa'));
      }
    }
    
    // Verificar se já existe uma recomendação similar
    const recomendacaoExistente = await pool.query(
      `SELECT id FROM recomendacoes 
       WHERE jovem_id = $1 
       AND oportunidade_id = $2 
       AND recomendador_tipo = $3 
       AND recomendador_id = $4`,
      [jovem_id, oportunidade_id, recomendadorTipo, recomendadorId]
    );
    
    if (recomendacaoExistente.rows.length > 0) {
      return res.status(400).json({ message: 'Recomendação já existe' });
    }
    
    // Inserir recomendação
    try {
      const result = await pool.query(
        `INSERT INTO recomendacoes 
         (jovem_id, oportunidade_id, recomendador_tipo, recomendador_id, justificativa, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [jovem_id, oportunidade_id, recomendadorTipo, recomendadorId, justificativa, 'pendente']
      );
      
      res.status(201).json({
        success: true,
        message: 'Recomendação realizada com sucesso',
        recomendacao: result.rows[0]
      });
    } catch (dbError) {
      return next(new DatabaseError('Erro ao salvar recomendação', { error: dbError.message }));
    }
  } catch (error) {
    next(error);
  }
});

export default router; 