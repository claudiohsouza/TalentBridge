import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Jovem } from '../types';
import { jovensService } from '../services/jovens';

const JovensList: React.FC = () => {
  const { user } = useAuth();
  const [jovens, setJovens] = useState<Jovem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJovens = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('[JovensList] Buscando lista de jovens');
        
        const data = await jovensService.listarJovens();
        console.log('[JovensList] Jovens carregados:', data.length);
        setJovens(data);
      } catch (error: any) {
        console.error('[JovensList] Erro ao carregar jovens:', error);
        setError(error.message || 'Erro ao carregar jovens. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchJovens();
  }, []);

  const handleNovoJovem = () => {
    navigate('/instituicao-ensino/jovens/novo');
  };

  const handleVerDetalhes = (jovemId: number) => {
    // Mapear o papel para a URL correta
    const papelParaUrl = {
      'instituicao_ensino': 'instituicao-ensino',
      'chefe_empresa': 'chefe-empresa',
      'instituicao_contratante': 'instituicao-contratante'
    };
    const urlPapel = user?.papel ? papelParaUrl[user.papel] : '';
    const path = `/${urlPapel}/jovens/${jovemId}`;
    console.log('[JovensList] Navegando para:', path);
    navigate(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cursor-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-cursor-text-primary">Jovens</h1>
          {user?.papel === 'instituicao_ensino' && (
            <button 
              onClick={handleNovoJovem}
              className="btn-primary inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Adicionar Jovem
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
            <strong className="font-bold">Erro! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {jovens.length === 0 ? (
          <div className="text-center py-8">
            <div className="h-16 w-16 mx-auto mb-4 text-cursor-text-tertiary">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-cursor-text-primary mb-2">
              Nenhum jovem encontrado
            </h3>
            {user?.papel === 'instituicao_ensino' && (
              <>
                <p className="text-cursor-text-secondary mb-4">
                  Comece adicionando seu primeiro jovem ao sistema
                </p>
                <button 
                  onClick={handleNovoJovem}
                  className="btn-primary"
                >
                  Adicionar Jovem
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
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-secondary uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-secondary uppercase tracking-wider">
                    Formação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cursor-text-secondary uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cursor-border">
                {jovens.map(jovem => (
                  <tr key={jovem.id} className="hover:bg-cursor-background-light transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-cursor-text-primary">
                      {jovem.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-cursor-text-secondary">
                      {jovem.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-cursor-text-secondary">
                      {jovem.formacao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`badge ${
                        jovem.status === 'Ativo' ? 'badge-success' : 
                        jovem.status === 'Inativo' ? 'badge-error' : 
                        'badge-default'
                      }`}>
                        {jovem.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleVerDetalhes(jovem.id)}
                        className="text-cursor-primary hover:text-cursor-primary-dark transition-colors"
                      >
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default JovensList; 