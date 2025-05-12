import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Jovem, Oportunidade } from '../types';

const DashboardInstituicaoEnsino: React.FC = () => {
  const { user } = useAuth();
  const [jovens, setJovens] = useState<Jovem[]>([]);
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Buscar jovens
        const jovensResponse = await fetch('/api/jovens', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!jovensResponse.ok) {
          throw new Error('Erro ao carregar jovens');
        }

        // Buscar oportunidades
        const opResponse = await fetch('/api/oportunidades', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!opResponse.ok) {
          throw new Error('Erro ao carregar oportunidades');
        }

        const jovensData = await jovensResponse.json();
        const opData = await opResponse.json();
        
        setJovens(jovensData);
        setOportunidades(opData);
        setLoading(false);
      } catch (error) {
        console.error('Erro:', error);
        setError('Erro ao carregar dados. Por favor, tente novamente.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar apenas oportunidades abertas
  const oportunidadesAbertas = oportunidades.filter(op => op.status === 'Aberta');

  const handleNovoJovem = () => {
    navigate('/instituicao-ensino/jovens/novo');
  };

  return (
    <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-cursor-text-primary">Dashboard da Instituição de Ensino</h1>
            <p className="text-cursor-text-secondary mt-1">
              Bem-vindo(a), <span className="font-medium text-cursor-text-primary">{user?.nome}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 hover:border-cursor-primary transition-colors duration-300">
            <h2 className="text-lg font-semibold text-cursor-text-primary mb-2">Jovens Cadastrados</h2>
            <p className="text-3xl font-bold text-cursor-primary">{loading ? '-' : jovens.length}</p>
            <Link 
              to="/instituicao-ensino/jovens" 
              className="text-cursor-primary text-sm mt-2 inline-flex items-center hover:text-cursor-primary-dark transition-colors"
            >
              Ver todos
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="card p-6 hover:border-cursor-primary transition-colors duration-300">
            <h2 className="text-lg font-semibold text-cursor-text-primary mb-2">Oportunidades Disponíveis</h2>
            <p className="text-3xl font-bold text-cursor-primary">
              {loading ? '-' : oportunidadesAbertas.length}
            </p>
            <Link 
              to="/instituicao-ensino/oportunidades" 
              className="text-cursor-primary text-sm mt-2 inline-flex items-center hover:text-cursor-primary-dark transition-colors"
            >
              Ver todas
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="card p-6 hover:border-cursor-primary transition-colors duration-300">
            <h2 className="text-lg font-semibold text-cursor-text-primary mb-2">Recomendações Realizadas</h2>
            <p className="text-3xl font-bold text-cursor-primary">-</p>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="p-6 border-b border-cursor-border flex justify-between items-center">
            <h2 className="text-lg font-semibold text-cursor-text-primary">Jovens Recentes</h2>
            <button 
              onClick={handleNovoJovem}
              className="btn-primary inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Adicionar Jovem
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
                  Nenhum jovem cadastrado
                </h3>
                <p className="text-cursor-text-secondary mb-4">
                  Comece adicionando seu primeiro jovem ao sistema
                </p>
                <button 
                  onClick={handleNovoJovem}
                  className="btn-primary"
                >
                  Adicionar Jovem
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
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cursor-border">
                    {jovens.slice(0, 5).map(jovem => (
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
                {jovens.length > 5 && (
                  <div className="p-4 border-t border-cursor-border">
                    <Link 
                      to="/instituicao-ensino/jovens" 
                      className="text-cursor-primary hover:text-cursor-primary-dark transition-colors inline-flex items-center"
                    >
                      Ver todos os {jovens.length} jovens
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
      </div>
    </div>
  );
};

export default DashboardInstituicaoEnsino; 