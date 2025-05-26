import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Oportunidade } from '../types';

// Função utilitária para corrigir problemas de codificação
const corrigirTexto = (texto: string): string => {
  if (!texto) return '';
  
  return texto
    .replace(/Ã§/g, 'ç')
    .replace(/Ã£/g, 'ã')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã\u0082/g, 'Â')
    .replace(/Ã³/g, 'ó')
    .replace(/Ã§Ã£/g, 'ção');
};

const OportunidadesList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mapear o papel para a URL correta
  const papelParaUrl = {
    'instituicao_ensino': 'instituicao-ensino',
    'chefe_empresa': 'chefe-empresa',
    'instituicao_contratante': 'instituicao-contratante'
  };
  const urlBase = user?.papel ? `/${papelParaUrl[user.papel]}/oportunidades` : '';

  useEffect(() => {
    const fetchOportunidades = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/oportunidades', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar oportunidades');
        }

        const data = await response.json();
        setOportunidades(data);
      } catch (error) {
        console.error('Erro:', error);
        setError('Erro ao carregar dados. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchOportunidades();
  }, []);

  const filteredOportunidades = oportunidades.filter(oportunidade =>
    oportunidade.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    oportunidade.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    oportunidade.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-cursor-text-primary">Oportunidades</h1>
            <p className="text-cursor-text-secondary mt-1">
              Gerencie as oportunidades disponíveis
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Buscar oportunidades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-full pl-10"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-cursor-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <button
              onClick={() => navigate(`${urlBase}/nova`)}
              className="btn-primary inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nova Oportunidade
            </button>
          </div>
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cursor-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-cursor-error mb-2">{error}</div>
              <button 
                onClick={() => window.location.reload()}
                className="btn-secondary"
              >
                Tentar novamente
              </button>
            </div>
          ) : filteredOportunidades.length === 0 ? (
            <div className="text-center py-8">
              {searchTerm ? (
                <>
                  <div className="h-16 w-16 mx-auto mb-4 text-cursor-text-tertiary">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-cursor-text-primary mb-2">
                    Nenhum resultado encontrado
                  </h3>
                  <p className="text-cursor-text-secondary mb-4">
                    Tente buscar com outros termos
                  </p>
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="btn-secondary"
                  >
                    Limpar busca
                  </button>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 mx-auto mb-4 text-cursor-text-tertiary">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-cursor-text-primary mb-2">
                    Nenhuma oportunidade cadastrada
                  </h3>
                  <p className="text-cursor-text-secondary mb-4">
                    Comece criando sua primeira oportunidade
                  </p>
                  <button 
                    onClick={() => navigate(`${urlBase}/nova`)}
                    className="btn-primary"
                  >
                    Nova Oportunidade
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-cursor-background-light">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-secondary uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-secondary uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-secondary uppercase tracking-wider">
                      Área
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-secondary uppercase tracking-wider">
                      Recomendações
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-secondary uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cursor-border">
                  {filteredOportunidades.map(oportunidade => (
                    <tr key={oportunidade.id} className="hover:bg-cursor-background-light transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-cursor-text-primary">
                        {corrigirTexto(oportunidade.titulo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-cursor-text-secondary">
                        {corrigirTexto(oportunidade.tipo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-cursor-text-secondary">
                        {corrigirTexto(oportunidade.area)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`badge ${
                          oportunidade.status === 'Aberta' ? 'badge-success' : 
                          oportunidade.status === 'Fechada' ? 'badge-warning' : 
                          'badge-default'
                        }`}>
                          {corrigirTexto(oportunidade.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-cursor-text-secondary">
                        {oportunidade.total_recomendacoes || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link 
                          to={`${urlBase}/${oportunidade.id}`}
                          className="text-cursor-primary hover:text-cursor-primary-dark transition-colors"
                        >
                          Ver detalhes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OportunidadesList; 