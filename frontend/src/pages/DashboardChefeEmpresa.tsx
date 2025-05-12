import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Jovem, Oportunidade } from '../types';

// Função para formatar a formação
const formatarFormacao = (formacao: string): string => {
  const formatacoes: { [key: string]: string } = {
    'ensino_medio': 'Ensino Médio',
    'tecnico': 'Técnico',
    'superior': 'Superior',
    'pos_graduacao': 'Pós-Graduação'
  };
  return formatacoes[formacao] || formacao;
};

const DashboardChefeEmpresa: React.FC = () => {
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

  // Filtrar oportunidades por status
  const oportunidadesAbertas = oportunidades.filter(op => op.status === 'Aberta');
  const oportunidadesFechadas = oportunidades.filter(op => op.status === 'Fechada');
  const jovensContratados = jovens.filter(jovem => 
    jovem.empresas?.some(empresa => empresa.status === 'Contratado')
  );
  const taxaAproveitamento = oportunidades.length > 0 
    ? ((jovensContratados.length / oportunidades.length) * 100).toFixed(1) 
    : '0';

  return (
    <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-cursor-text-primary">Dashboard do Chefe de Empresa</h1>
            <p className="text-cursor-text-secondary mt-1">
              Bem-vindo(a), <span className="font-medium text-cursor-text-primary">{user?.nome}</span>
            </p>
          </div>

          {/* Ações Rápidas */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/chefe-empresa/oportunidades/nova')}
              className="btn-primary inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nova Oportunidade
            </button>
          </div>
        </div>

        {/* Cards Informativos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 hover:border-cursor-primary transition-colors duration-300">
            <h2 className="text-lg font-semibold text-cursor-text-primary mb-2">Jovens Vinculados</h2>
            <p className="text-3xl font-bold text-cursor-primary">{loading ? '-' : jovens.length}</p>
            <Link 
              to="/chefe-empresa/jovens" 
              className="text-cursor-primary text-sm mt-2 inline-flex items-center hover:text-cursor-primary-dark transition-colors"
            >
              Ver todos
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="card p-6 hover:border-cursor-primary transition-colors duration-300">
            <h2 className="text-lg font-semibold text-cursor-text-primary mb-2">Oportunidades Abertas</h2>
            <p className="text-3xl font-bold text-cursor-primary">{loading ? '-' : oportunidadesAbertas.length}</p>
            <Link 
              to="/chefe-empresa/oportunidades" 
              className="text-cursor-primary text-sm mt-2 inline-flex items-center hover:text-cursor-primary-dark transition-colors"
            >
              Ver todas
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="card p-6 hover:border-cursor-primary transition-colors duration-300">
            <h2 className="text-lg font-semibold text-cursor-text-primary mb-2">Em Processo</h2>
            <p className="text-3xl font-bold text-cursor-primary">{loading ? '-' : oportunidadesFechadas.length}</p>
            <Link 
              to="/chefe-empresa/oportunidades" 
              className="text-cursor-primary text-sm mt-2 inline-flex items-center hover:text-cursor-primary-dark transition-colors"
            >
              Ver detalhes
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="card p-6 hover:border-cursor-primary transition-colors duration-300">
            <h2 className="text-lg font-semibold text-cursor-text-primary mb-2">Taxa de Aproveitamento</h2>
            <p className="text-3xl font-bold text-cursor-primary">{loading ? '-' : `${taxaAproveitamento}%`}</p>
            <span className="text-cursor-text-secondary text-sm mt-2">
              {jovensContratados.length} contratações
            </span>
          </div>
        </div>

        {/* Seção de Últimas Atividades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-cursor-text-primary mb-4">Últimas Recomendações</h2>
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-cursor-background-light rounded w-3/4"></div>
                <div className="h-4 bg-cursor-background-light rounded w-1/2"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {oportunidades.slice(0, 3).map(op => (
                  <div key={op.id} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-cursor-text-primary">{op.titulo}</h3>
                      <p className="text-sm text-cursor-text-secondary">{op.total_recomendacoes || 0} recomendações</p>
                    </div>
                    <Link 
                      to={`/chefe-empresa/oportunidades/${op.id}`}
                      className="text-cursor-primary hover:text-cursor-primary-dark"
                    >
                      Ver
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-cursor-text-primary mb-4">Jovens Recentes</h2>
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-cursor-background-light rounded w-3/4"></div>
                <div className="h-4 bg-cursor-background-light rounded w-1/2"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {jovens.slice(0, 3).map(jovem => (
                  <div key={jovem.id} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-cursor-text-primary">{jovem.nome}</h3>
                      <p className="text-sm text-cursor-text-secondary">{formatarFormacao(jovem.formacao)}</p>
                    </div>
                    <Link 
                      to={`/chefe-empresa/jovens/${jovem.id}`}
                      className="text-cursor-primary hover:text-cursor-primary-dark"
                    >
                      Ver
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
            <strong className="font-bold">Erro! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardChefeEmpresa; 