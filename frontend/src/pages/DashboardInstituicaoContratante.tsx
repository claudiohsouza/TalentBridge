import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Oportunidade, Jovem } from '../types';

const DashboardInstituicaoContratante: React.FC = () => {
  const { user } = useAuth();
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [jovens, setJovens] = useState<Jovem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingJovens, setLoadingJovens] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorJovens, setErrorJovens] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

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
        setLoading(false);
      } catch (error) {
        console.error('Erro:', error);
        setError('Erro ao carregar dados. Por favor, tente novamente.');
        setLoading(false);
      }
    };

    const fetchJovens = async () => {
      try {
        setLoadingJovens(true);
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
        console.error('Erro ao carregar jovens:', error);
        setErrorJovens('Erro ao carregar jovens. Por favor, tente novamente.');
      } finally {
        setLoadingJovens(false);
      }
    };

    fetchOportunidades();
    fetchJovens();
  }, []);

  const handleNovaOportunidade = () => {
    navigate('/instituicao-contratante/oportunidades/nova');
  };

  const filteredJovens = jovens.filter(jovem =>
    jovem.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jovem.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (jovem.formacao && jovem.formacao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-cursor-text-primary">Dashboard da Instituição Contratante</h1>
            <p className="text-cursor-text-secondary mt-1">
              Bem-vindo(a), <span className="font-medium text-cursor-text-primary">{user?.nome}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 hover:border-cursor-primary transition-colors duration-300">
            <h2 className="text-lg font-semibold text-cursor-text-primary mb-2">Oportunidades Ativas</h2>
            <p className="text-3xl font-bold text-cursor-primary">
              {oportunidades.filter(o => o.status === 'Aberta').length}
            </p>
            <Link 
              to="/instituicao-contratante/oportunidades" 
              className="text-cursor-primary text-sm mt-2 inline-flex items-center hover:text-cursor-primary-dark transition-colors"
            >
              Ver todas
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="card p-6 hover:border-cursor-primary transition-colors duration-300">
            <h2 className="text-lg font-semibold text-cursor-text-primary mb-2">Total de Recomendações</h2>
            <p className="text-3xl font-bold text-cursor-primary">
              {oportunidades.reduce((acc, o) => acc + (o.total_recomendacoes || 0), 0)}
            </p>
          </div>

          <div className="card p-6 hover:border-cursor-primary transition-colors duration-300">
            <h2 className="text-lg font-semibold text-cursor-text-primary mb-2">Jovens Cadastrados</h2>
            <p className="text-3xl font-bold text-cursor-primary">
              {loadingJovens ? '-' : jovens.length}
            </p>
            <Link 
              to="#jovens-section" 
              className="text-cursor-primary text-sm mt-2 inline-flex items-center hover:text-cursor-primary-dark transition-colors"
            >
              Ver todos
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="card overflow-hidden mb-8">
          <div className="p-6 border-b border-cursor-border flex justify-between items-center">
            <h2 className="text-lg font-semibold text-cursor-text-primary">Oportunidades Recentes</h2>
            <button 
              onClick={handleNovaOportunidade}
              className="btn-primary inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nova Oportunidade
            </button>
          </div>
          
          <div className="p-6">
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
            ) : oportunidades.length === 0 ? (
              <div className="text-center py-8">
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
                  onClick={handleNovaOportunidade}
                  className="btn-primary"
                >
                  Nova Oportunidade
                </button>
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
                    {oportunidades.slice(0, 5).map(oportunidade => (
                      <tr key={oportunidade.id} className="hover:bg-cursor-background-light transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-cursor-text-primary">
                          {oportunidade.titulo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-cursor-text-secondary">
                          {oportunidade.tipo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`badge ${
                            oportunidade.status === 'Aberta' ? 'badge-success' : 
                            oportunidade.status === 'Fechada' ? 'badge-warning' : 
                            oportunidade.status === 'Encerrada' ? 'badge-default' :
                            'badge-error'
                          }`}>
                            {oportunidade.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-cursor-text-secondary">
                          {oportunidade.total_recomendacoes || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link 
                            to={`/instituicao-contratante/oportunidades/${oportunidade.id}`}
                            className="text-cursor-primary hover:text-cursor-primary-dark transition-colors"
                          >
                            Ver detalhes
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {oportunidades.length > 5 && (
                  <div className="p-4 border-t border-cursor-border">
                    <Link 
                      to="/instituicao-contratante/oportunidades" 
                      className="text-cursor-primary hover:text-cursor-primary-dark transition-colors inline-flex items-center"
                    >
                      Ver todas as {oportunidades.length} oportunidades
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Seção de Jovens Cadastrados */}
        <div id="jovens-section" className="card overflow-hidden">
          <div className="p-6 border-b border-cursor-border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold text-cursor-text-primary">Jovens Cadastrados</h2>
            <div className="relative w-full md:w-64">
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
          </div>
          
          <div className="p-6">
            {loadingJovens ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cursor-primary"></div>
              </div>
            ) : errorJovens ? (
              <div className="text-center py-8">
                <div className="text-cursor-error mb-2">{errorJovens}</div>
                <button 
                  onClick={() => window.location.reload()}
                  className="btn-secondary"
                >
                  Tentar novamente
                </button>
              </div>
            ) : jovens.length === 0 ? (
              <div className="text-center py-8">
                <div className="h-16 w-16 mx-auto mb-4 text-cursor-text-tertiary">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-cursor-text-primary mb-2">
                  Nenhum jovem cadastrado no sistema
                </h3>
                <p className="text-cursor-text-secondary mb-4">
                  Aguarde até que instituições de ensino cadastrem jovens
                </p>
              </div>
            ) : filteredJovens.length === 0 ? (
              <div className="text-center py-8">
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
                        Habilidades
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-cursor-text-secondary">
                          {jovem.habilidades && Array.isArray(jovem.habilidades) ? 
                            jovem.habilidades.slice(0, 2).join(', ') + (jovem.habilidades.length > 2 ? '...' : '') 
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link 
                            to={`/instituicao-contratante/jovens/${jovem.id}`}
                            className="text-cursor-primary hover:text-cursor-primary-dark transition-colors"
                          >
                            Ver perfil
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
    </div>
  );
};

export default DashboardInstituicaoContratante; 