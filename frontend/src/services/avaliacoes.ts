import api from './api';
import { Avaliacao, AvaliacaoInput, CategoriaAvaliacao } from '../types';

interface AvaliacoesResponse {
  avaliacoes: Avaliacao[];
  media_geral: number;
  total_avaliacoes: number;
}

export const avaliacoesService = {
  // Buscar categorias de avaliação
  obterCategorias: async (): Promise<CategoriaAvaliacao[]> => {
    const response = await api.get('/api/avaliacoes/categorias');
    return response.data;
  },

  // Buscar avaliações de um jovem
  obterAvaliacoesJovem: async (jovemId: number): Promise<AvaliacoesResponse> => {
    const response = await api.get(`/api/avaliacoes/jovem/${jovemId}`);
    return response.data;
  },

  // Criar nova avaliação
  criarAvaliacao: async (jovemId: number, avaliacao: AvaliacaoInput): Promise<Avaliacao> => {
    const response = await api.post(`/api/avaliacoes/jovem/${jovemId}`, avaliacao);
    return response.data;
  },

  // Atualizar avaliação
  atualizarAvaliacao: async (avaliacaoId: number, avaliacao: Partial<AvaliacaoInput>): Promise<Avaliacao> => {
    const response = await api.put(`/api/avaliacoes/${avaliacaoId}`, avaliacao);
    return response.data;
  },

  // Excluir avaliação
  excluirAvaliacao: async (avaliacaoId: number): Promise<void> => {
    await api.delete(`/api/avaliacoes/${avaliacaoId}`);
  }
}; 