import express from 'express';
import { authMiddleware } from './auth.js';
import { validate, estudanteSchema } from '../middleware/validator.js';
import { ForbiddenError, NotFoundError } from '../middleware/errorHandler.js';

const router = express.Router();

// Middleware para verificar se o usuário é uma instituição
const isInstituicao = (req, res, next) => {
  if (req.user.papel !== 'instituicao') {
    throw new ForbiddenError('Apenas instituições podem acessar este recurso');
  }
  next();
};

// Listar estudantes
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    console.log('[API-estudantes] Recebida solicitação para listar estudantes');
    console.log('[API-estudantes] Usuário:', req.user.id, req.user.email, req.user.papel);
    
    const { pool } = req.app.locals;
    let query;
    const params = [];

    if (req.user.papel === 'instituicao') {
      // Instituições só veem seus próprios estudantes
      console.log('[API-estudantes] Listando estudantes para instituição ID:', req.user.id);
      query = `
        SELECT e.*, 
              u.email as instituicao_email 
        FROM estudantes e 
        JOIN usuarios u ON e.instituicao_id = u.id 
        WHERE e.instituicao_id = $1 
        ORDER BY e.nome`;
      params.push(req.user.id);
    } else {
      // Empresas veem todos os estudantes
      console.log('[API-estudantes] Listando todos estudantes para empresa');
      query = `
        SELECT e.*, 
              u.email as instituicao_email 
        FROM estudantes e 
        JOIN usuarios u ON e.instituicao_id = u.id 
        ORDER BY e.nome`;
    }

    console.log('[API-estudantes] Executando query:', query);
    console.log('[API-estudantes] Parâmetros:', params);
    
    const { rows } = await pool.query(query, params);
    console.log('[API-estudantes] Estudantes encontrados:', rows.length);
    
    // Processar dados antes de enviar para garantir que estão no formato correto
    const processedRows = rows.map(estudante => {
      try {
        // Tenta converter habilidades de string JSON para array
        if (estudante.habilidades && typeof estudante.habilidades === 'string') {
          try {
            estudante.habilidades = JSON.parse(estudante.habilidades);
          } catch (e) {
            console.warn('[API-estudantes] Erro ao fazer parsing de habilidades:', e);
            // Se falhar, mantém como está
          }
        }
        
        // Garantir que os campos numéricos são números
        if (estudante.media_geral !== null && typeof estudante.media_geral === 'string') {
          estudante.media_geral = parseFloat(estudante.media_geral);
        }
        
        if (estudante.estabilidade_estresse !== null && typeof estudante.estabilidade_estresse === 'string') {
          estudante.estabilidade_estresse = parseInt(estudante.estabilidade_estresse, 10);
        }
        
        return estudante;
      } catch (e) {
        console.error('[API-estudantes] Erro ao processar estudante:', e);
        return estudante;
      }
    });
    
    if (processedRows.length > 0) {
      console.log('[API-estudantes] Exemplo do primeiro estudante processado:', 
        JSON.stringify({
          id: processedRows[0].id,
          nome: processedRows[0].nome,
          instituicao_id: processedRows[0].instituicao_id,
          habilidades: Array.isArray(processedRows[0].habilidades) ? 
            `Array[${processedRows[0].habilidades.length}]` : 
            typeof processedRows[0].habilidades
        })
      );
    }
    
    res.json(processedRows);
  } catch (error) {
    console.error('[API-estudantes] Erro ao listar estudantes:', error);
    next(error);
  }
});

// Obter um estudante específico
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { pool } = req.app.locals;
    const { id } = req.params;
    
    let query;
    const params = [id];
    
    if (req.user.papel === 'instituicao') {
      // Instituições só podem ver seus próprios estudantes
      query = `
        SELECT e.*, 
               u.email as instituicao_email 
        FROM estudantes e 
        JOIN usuarios u ON e.instituicao_id = u.id 
        WHERE e.id = $1 AND e.instituicao_id = $2`;
      params.push(req.user.id);
    } else {
      // Empresas podem ver qualquer estudante
      query = `
        SELECT e.*, 
               u.email as instituicao_email 
        FROM estudantes e 
        JOIN usuarios u ON e.instituicao_id = u.id 
        WHERE e.id = $1`;
    }
    
    const { rows } = await pool.query(query, params);
    
    if (rows.length === 0) {
      throw new NotFoundError('Estudante não encontrado');
    }
    
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

// Adicionar estudante
router.post('/', authMiddleware, isInstituicao, validate(estudanteSchema), async (req, res, next) => {
  try {
    const { pool } = req.app.locals;
    const { nome, email, media_geral, estabilidade_estresse, habilidades, planos_futuros } = req.body;
    
    // Converter para números, se fornecidos
    const mediaGeralNum = media_geral !== undefined && media_geral !== null ? parseFloat(media_geral) : null;
    const estabilidadeNum = estabilidade_estresse !== undefined && estabilidade_estresse !== null ? parseInt(estabilidade_estresse, 10) : null;
    
    // Verificar se o email já está cadastrado para esta instituição
    const existingStudent = await pool.query(
      'SELECT id FROM estudantes WHERE email = $1 AND instituicao_id = $2',
      [email, req.user.id]
    );
    
    if (existingStudent.rows.length > 0) {
      throw new ForbiddenError('Já existe um estudante com este email nesta instituição');
    }
    
    const result = await pool.query(
      `INSERT INTO estudantes 
       (instituicao_id, nome, email, media_geral, estabilidade_estresse, habilidades, planos_futuros)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user.id,
        nome,
        email,
        mediaGeralNum,
        estabilidadeNum,
        habilidades ? JSON.stringify(habilidades) : null,
        planos_futuros || null
      ]
    );
    
    // Adicionar o email da instituição à resposta
    const estudante = result.rows[0];
    estudante.instituicao_email = req.user.email;
    
    res.status(201).json(estudante);
  } catch (error) {
    next(error);
  }
});

// Atualizar estudante
router.put('/:id', authMiddleware, isInstituicao, validate(estudanteSchema), async (req, res, next) => {
  try {
    const { pool } = req.app.locals;
    const { id } = req.params;
    const { nome, email, media_geral, estabilidade_estresse, habilidades, planos_futuros } = req.body;
    
    // Converter para números, se fornecidos
    const mediaGeralNum = media_geral !== undefined && media_geral !== null ? parseFloat(media_geral) : null;
    const estabilidadeNum = estabilidade_estresse !== undefined && estabilidade_estresse !== null ? parseInt(estabilidade_estresse, 10) : null;
    
    // Verificar se o estudante existe e pertence a esta instituição
    const estudanteExistente = await pool.query(
      'SELECT * FROM estudantes WHERE id = $1 AND instituicao_id = $2',
      [id, req.user.id]
    );
    
    if (estudanteExistente.rows.length === 0) {
      throw new NotFoundError('Estudante não encontrado ou não pertence a esta instituição');
    }
    
    // Verificar se o novo email já está em uso por outro estudante desta instituição
    if (email !== estudanteExistente.rows[0].email) {
      const emailExistente = await pool.query(
        'SELECT id FROM estudantes WHERE email = $1 AND instituicao_id = $2 AND id != $3',
        [email, req.user.id, id]
      );
      
      if (emailExistente.rows.length > 0) {
        throw new ForbiddenError('Já existe outro estudante com este email nesta instituição');
      }
    }
    
    const result = await pool.query(
      `UPDATE estudantes 
       SET nome = $1, 
           email = $2, 
           media_geral = $3, 
           estabilidade_estresse = $4, 
           habilidades = $5, 
           planos_futuros = $6,
           atualizado_em = NOW()
       WHERE id = $7 AND instituicao_id = $8
       RETURNING *`,
      [
        nome,
        email,
        mediaGeralNum,
        estabilidadeNum,
        habilidades ? JSON.stringify(habilidades) : null,
        planos_futuros || null,
        id,
        req.user.id
      ]
    );
    
    // Adicionar o email da instituição à resposta
    const estudante = result.rows[0];
    estudante.instituicao_email = req.user.email;
    
    res.json(estudante);
  } catch (error) {
    next(error);
  }
});

// Excluir estudante
router.delete('/:id', authMiddleware, isInstituicao, async (req, res, next) => {
  try {
    const { pool } = req.app.locals;
    const { id } = req.params;
    
    // Verificar se o estudante existe e pertence a esta instituição
    const estudanteExistente = await pool.query(
      'SELECT * FROM estudantes WHERE id = $1 AND instituicao_id = $2',
      [id, req.user.id]
    );
    
    if (estudanteExistente.rows.length === 0) {
      throw new NotFoundError('Estudante não encontrado ou não pertence a esta instituição');
    }
    
    await pool.query(
      'DELETE FROM estudantes WHERE id = $1 AND instituicao_id = $2',
      [id, req.user.id]
    );
    
    res.json({ 
      success: true, 
      message: 'Estudante excluído com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

export default router; 