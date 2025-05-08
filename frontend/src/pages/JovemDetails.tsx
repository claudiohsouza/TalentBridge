import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Jovem } from '../types';

const JovemDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jovem, setJovem] = useState<Jovem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJovem = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/jovens/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar dados do jovem');
        }

        const data = await response.json();
        setJovem(data);
      } catch (error) {
        console.error('Erro:', error);
        setError('Erro ao carregar dados. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchJovem();
  }, [id]);

  const handleEdit = () => {
    navigate(`/instituicao-ensino/jovens/${id}/editar`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8 page-transition">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cursor-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !jovem) {
    return (
      <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8 page-transition">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-8">
            <div className="h-16 w-16 mx-auto mb-4 text-cursor-text-tertiary">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-cursor-text-primary mb-2">
              {error || 'Jovem não encontrado'}
            </h3>
            <p className="text-cursor-text-secondary mb-4">
              Não foi possível carregar os dados do jovem
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="btn-secondary"
              >
                Tentar novamente
              </button>
              <button
                onClick={() => navigate(-1)}
                className="btn-primary"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-cursor-text-primary">Detalhes do Jovem</h1>
            <p className="text-cursor-text-secondary mt-1">
              Visualize e gerencie as informações do jovem
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Voltar
            </button>
            <button
              onClick={handleEdit}
              className="btn-primary inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Informações Pessoais */}
          <div className="card">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-cursor-text-primary mb-4">
                Informações Pessoais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-cursor-text-tertiary mb-1">
                    Nome
                  </label>
                  <p className="text-cursor-text-primary">
                    {jovem.nome}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-cursor-text-tertiary mb-1">
                    Email
                  </label>
                  <p className="text-cursor-text-primary">
                    {jovem.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-cursor-text-tertiary mb-1">
                    Idade
                  </label>
                  <p className="text-cursor-text-primary">
                    {jovem.idade} anos
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-cursor-text-tertiary mb-1">
                    Status
                  </label>
                  <span className={`badge ${
                    jovem.status === 'Ativo' ? 'badge-success' : 
                    jovem.status === 'Inativo' ? 'badge-error' : 
                    'badge-default'
                  }`}>
                    {jovem.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Formação */}
          <div className="card">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-cursor-text-primary mb-4">
                Formação
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-cursor-text-tertiary mb-1">
                    Formação Atual
                  </label>
                  <p className="text-cursor-text-primary">
                    {jovem.formacao || 'Não informado'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Experiência Profissional */}
          <div className="card">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-cursor-text-primary mb-4">
                Experiência Profissional
              </h2>
              {jovem.empresas && jovem.empresas.length > 0 ? (
                <div className="space-y-6">
                  {jovem.empresas.map((empresa, index) => (
                    <div key={empresa.id} className="p-4 bg-cursor-background-light rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-cursor-text-tertiary mb-1">
                            Empresa
                          </label>
                          <p className="text-cursor-text-primary">
                            {empresa.nome}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-cursor-text-tertiary mb-1">
                            Cargo
                          </label>
                          <p className="text-cursor-text-primary">
                            {empresa.cargo}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-cursor-text-tertiary mb-1">
                            Status
                          </label>
                          <span className={`badge ${
                            empresa.status === 'Contratado' ? 'badge-success' : 
                            empresa.status === 'Estagiário' ? 'badge-warning' : 
                            'badge-default'
                          }`}>
                            {empresa.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-cursor-text-secondary">
                  Nenhuma experiência profissional registrada
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JovemDetails; 