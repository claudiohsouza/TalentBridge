import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Jovem } from '../types';

const JovensList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jovens, setJovens] = useState<Jovem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchJovens = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/jovens', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar jovens');
        }

        const data = await response.json();
        setJovens(data);
      } catch (error) {
        console.error('Erro:', error);
        setError('Erro ao carregar dados. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchJovens();
  }, []);

  const filteredJovens = jovens.filter(jovem =>
    jovem.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jovem.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (jovem.formacao && jovem.formacao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-cursor-text-primary">Jovens</h1>
            <p className="text-cursor-text-secondary mt-1">
              Gerencie os jovens cadastrados no sistema
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Buscar jovens..."
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
              onClick={() => navigate('/instituicao-ensino/jovens/novo')}
              className="btn-primary inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Adicionar Jovem
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
          ) : filteredJovens.length === 0 ? (
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
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-cursor-text-primary mb-2">
                    Nenhum jovem cadastrado
                  </h3>
                  <p className="text-cursor-text-secondary mb-4">
                    Comece adicionando seu primeiro jovem ao sistema
                  </p>
                  <button 
                    onClick={() => navigate('/instituicao-ensino/jovens/novo')}
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
                      Idade
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
                  {filteredJovens.map(jovem => (
                    <tr key={jovem.id} className="hover:bg-cursor-background-light transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-cursor-text-primary">
                        {jovem.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-cursor-text-secondary">
                        {jovem.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-cursor-text-secondary">
                        {jovem.idade}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-cursor-text-secondary">
                        {jovem.formacao || '-'}
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
                        <Link 
                          to={`/instituicao-ensino/jovens/${jovem.id}`}
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

export default JovensList; 