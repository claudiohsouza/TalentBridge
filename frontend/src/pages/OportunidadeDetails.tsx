import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Oportunidade, Recomendacao } from '../types';

const OportunidadeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [oportunidade, setOportunidade] = useState<Oportunidade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOportunidadeDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/oportunidades/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar detalhes da oportunidade');
        }

        const data = await response.json();
        setOportunidade(data);
        setLoading(false);
      } catch (error) {
        console.error('Erro:', error);
        setError('Erro ao carregar dados. Por favor, tente novamente.');
        setLoading(false);
      }
    };

    if (id) {
      fetchOportunidadeDetails();
    }
  }, [id]);

  const getBasePath = () => {
    if (user?.papel === 'instituicao_ensino') {
      return '/instituicao-ensino';
    } else if (user?.papel === 'chefe_empresa') {
      return '/chefe-empresa';
    } else if (user?.papel === 'instituicao_contratante') {
      return '/instituicao-contratante';
    }
    return '';
  };

  const handleVoltar = () => {
    navigate(`${getBasePath()}/oportunidades`);
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Não definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-cursor-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-cursor-text-secondary">Carregando informações...</p>
        </div>
      </div>
    );
  }

  if (error || !oportunidade) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <p>{error || 'Oportunidade não encontrada'}</p>
            <button
              onClick={handleVoltar}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cursor-primary hover:bg-cursor-primary-dark focus:outline-none"
            >
              Voltar para lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = oportunidade.is_owner || user?.papel === 'instituicao_contratante';
  const canRecommend = !isOwner && (user?.papel === 'instituicao_ensino' || user?.papel === 'chefe_empresa');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center">
        <button
          onClick={handleVoltar}
          className="mr-4 inline-flex items-center text-cursor-text-secondary hover:text-cursor-primary"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar
        </button>
        <h1 className="text-2xl font-bold text-cursor-text-primary">{oportunidade.titulo}</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        {/* Cabeçalho */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-cursor-text-primary mr-3">{oportunidade.titulo}</h2>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  oportunidade.status === 'Aberta' ? 'bg-green-100 text-green-800' : 
                  oportunidade.status === 'Fechada' ? 'bg-yellow-100 text-yellow-800' : 
                  oportunidade.status === 'Encerrada' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {oportunidade.status}
                </span>
              </div>
              <p className="text-cursor-text-secondary mt-1">
                Oferecida por: {oportunidade.instituicao_nome || `Instituição #${oportunidade.instituicao_id}`}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              {isOwner && (
                <button
                  className="inline-flex items-center px-4 py-2 border border-cursor-primary text-sm font-medium rounded-md text-cursor-primary bg-white hover:bg-cursor-primary/10 focus:outline-none"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Editar
                </button>
              )}
              {canRecommend && (
                <Link
                  to={`${getBasePath()}/oportunidades/${oportunidade.id}/recomendar`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cursor-primary hover:bg-cursor-primary-dark focus:outline-none"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Recomendar Jovem
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Corpo do cartão */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna da esquerda: Informações básicas */}
          <div>
            <h3 className="text-lg font-medium text-cursor-text-primary mb-4">Detalhes da Oportunidade</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-cursor-text-tertiary">Tipo</div>
                <div className="mt-1 text-cursor-text-primary">{oportunidade.tipo}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-cursor-text-tertiary">Descrição</div>
                <div className="mt-1 text-cursor-text-primary whitespace-pre-line">{oportunidade.descricao}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-cursor-text-tertiary">Requisitos</div>
                <div className="mt-1">
                  {oportunidade.requisitos ? (
                    Array.isArray(oportunidade.requisitos) ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {oportunidade.requisitos.map((requisito: string, index: number) => (
                          <li key={index} className="text-cursor-text-primary">{requisito}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-cursor-text-primary whitespace-pre-line">{oportunidade.requisitos}</div>
                    )
                  ) : (
                    <div className="text-cursor-text-secondary">Nenhum requisito específico</div>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-cursor-text-tertiary">Benefícios</div>
                <div className="mt-1">
                  {oportunidade.beneficios ? (
                    Array.isArray(oportunidade.beneficios) ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {oportunidade.beneficios.map((beneficio: string, index: number) => (
                          <li key={index} className="text-cursor-text-primary">{beneficio}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-cursor-text-primary whitespace-pre-line">{oportunidade.beneficios}</div>
                    )
                  ) : (
                    <div className="text-cursor-text-secondary">Nenhum benefício listado</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Coluna da direita: Datas e recomendações */}
          <div>
            <h3 className="text-lg font-medium text-cursor-text-primary mb-4">Período e Recomendações</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-cursor-text-tertiary">Data de Início</div>
                <div className="mt-1 text-cursor-text-primary">{formatDate(oportunidade.data_inicio)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-cursor-text-tertiary">Data de Término</div>
                <div className="mt-1 text-cursor-text-primary">{formatDate(oportunidade.data_fim)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-cursor-text-tertiary">Total de Recomendações</div>
                <div className="mt-1 text-cursor-text-primary font-medium">
                  {oportunidade.total_recomendacoes || 0} {(oportunidade.total_recomendacoes || 0) === 1 ? 'jovem recomendado' : 'jovens recomendados'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de recomendações - apenas visível para instituições contratantes ou se for o dono */}
      {isOwner && oportunidade.recomendacoes && oportunidade.recomendacoes.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-cursor-text-primary">Recomendações Recebidas</h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jovem</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recomendado por</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {oportunidade.recomendacoes.map((recomendacao: Recomendacao) => (
                    <tr key={recomendacao.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-cursor-text-primary">{recomendacao.jovem_nome}</div>
                        <div className="text-sm text-cursor-text-secondary">{recomendacao.jovem_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-cursor-text-primary">{recomendacao.recomendador_nome}</div>
                        <div className="text-sm text-cursor-text-secondary">{recomendacao.recomendador_tipo === 'instituicao_ensino' ? 'Instituição de Ensino' : 'Empresa'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          recomendacao.status === 'Aprovada' ? 'bg-green-100 text-green-800' : 
                          recomendacao.status === 'Negada' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {recomendacao.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-cursor-primary hover:underline">Ver Detalhes</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OportunidadeDetails; 