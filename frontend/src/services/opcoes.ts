import api from './api';

interface OpcaoPadrao {
  id: number;
  valor: string;
  descricao: string;
}

export const opcoesService = {
  // Buscar todas as categorias disponíveis
  obterCategorias: async (): Promise<string[]> => {
    const response = await api.get('/opcoes');
    return response.data;
  },

  // Buscar opções de uma categoria específica
  obterOpcoesPorCategoria: async (categoria: string): Promise<OpcaoPadrao[]> => {
    const response = await api.get(`/opcoes/${categoria}`);
    return response.data;
  },

  // Constantes para os tipos de categorias
  CATEGORIAS: {
    AREAS_ENSINO: 'area_ensino',
    AREAS_ATUACAO: 'area_atuacao',
    AREAS_INTERESSE: 'area_interesse',
    PROGRAMAS_SOCIAIS: 'programa_social'
  }
}; 