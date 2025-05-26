import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Jovem, 
  Avaliacao, 
  HistoricoDesenvolvimento 
} from '../types';
import { AvaliacoesJovem } from '../components/AvaliacoesJovem';
import { avaliacoesService } from '../services/avaliacoes';
import { jovensService } from '../services/jovens';

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

// Função para formatar texto com primeira letra maiúscula
const capitalizarPalavras = (texto: string): string => {
  return texto.split(' ').map(palavra => 
    palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase()
  ).join(' ');
};

const JovemDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jovem, setJovem] = useState<Jovem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [mediaGeral, setMediaGeral] = useState(0);
  const [totalAvaliacoes, setTotalAvaliacoes] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(undefined);

        if (!id) {
          setError('ID do jovem não fornecido');
          return;
        }

        console.log(`[JovemDetails] Iniciando carregamento de dados para jovem ${id}`);

        // Buscar dados do jovem
        try {
          const jovemData = await jovensService.obterJovem(Number(id));
          console.log('[JovemDetails] Dados do jovem carregados:', jovemData);
          setJovem(jovemData);
        } catch (error: any) {
          console.error('[JovemDetails] Erro ao carregar dados do jovem:', error);
          setError(error.message || 'Erro ao carregar dados do jovem');
          return;
        }

        // Buscar avaliações
        try {
          const avaliacoesData = await avaliacoesService.obterAvaliacoesJovem(Number(id));
          setAvaliacoes(avaliacoesData.avaliacoes);
          setMediaGeral(avaliacoesData.media_geral);
          setTotalAvaliacoes(avaliacoesData.total_avaliacoes);
          console.log('[JovemDetails] Avaliações carregadas com sucesso');
        } catch (error: any) {
          console.error('[JovemDetails] Erro ao carregar avaliações:', error);
          // Não definimos o erro principal aqui pois os dados do jovem já foram carregados
        }
      } catch (error: any) {
        console.error('[JovemDetails] Erro geral ao carregar dados:', error);
        setError('Erro ao carregar dados. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddAvaliacao = async (avaliacao: Avaliacao) => {
    try {
      const novaAvaliacao = await avaliacoesService.criarAvaliacao(Number(id), avaliacao);
      setAvaliacoes(prev => [novaAvaliacao, ...prev]);
      
      // Atualizar média e total
      const avaliacoesData = await avaliacoesService.obterAvaliacoesJovem(Number(id));
      setMediaGeral(avaliacoesData.media_geral);
      setTotalAvaliacoes(avaliacoesData.total_avaliacoes);
    } catch (error) {
      console.error('Erro ao adicionar avaliação:', error);
      throw error;
    }
  };

  const handleAddHistorico = async (historico: HistoricoDesenvolvimento) => {
    // TODO: Implementar adição de histórico
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este jovem?')) {
      return;
    }

    try {
      await jovensService.excluirJovem(Number(id));
      
      // Redirecionar para o dashboard específico do papel do usuário
      if (user?.papel === 'instituicao_ensino') {
        navigate('/instituicao-ensino');
      } else if (user?.papel === 'chefe_empresa') {
        navigate('/chefe-empresa');
      } else if (user?.papel === 'instituicao_contratante') {
        navigate('/instituicao-contratante');
      } else if (user?.papel) {
        // Mapear o papel para a URL correta
        const papelParaUrl = {
          'instituicao_ensino': 'instituicao-ensino',
          'chefe_empresa': 'chefe-empresa',
          'instituicao_contratante': 'instituicao-contratante'
        };
        navigate(`/${papelParaUrl[user.papel]}/jovens`);
      }
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro ao excluir jovem. Por favor, tente novamente.');
    }
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

  if (!jovem) {
    return (
      <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-cursor-text-primary mb-2">
              {error || 'Jovem não encontrado'}
            </h3>
            <button 
              onClick={() => {
                const papelParaUrl = {
                  'instituicao_ensino': 'instituicao-ensino',
                  'chefe_empresa': 'chefe-empresa',
                  'instituicao_contratante': 'instituicao-contratante'
                };
                const urlPapel = user?.papel ? papelParaUrl[user.papel] : '';
                navigate(`/${urlPapel}/jovens`);
              }}
              className="btn-primary mt-4"
            >
              Voltar para lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">{jovem.nome}</h1>
          <p className="text-cursor-text-secondary">{formatarFormacao(jovem.formacao)} • {jovem.curso}</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate(`/avaliacoes/novo/${id}`)}
            className="btn-primary"
          >
            Nova Avaliação
          </button>
          <button
            onClick={() => navigate(`/historico/novo/${id}`)}
            className="btn-secondary"
          >
            Adicionar Histórico
          </button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-2">Desempenho</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{mediaGeral.toFixed(1)}</span>
            <span className="text-cursor-text-secondary mb-1">/10</span>
          </div>
          <p className="text-sm text-cursor-text-secondary mt-2">
            Baseado em {totalAvaliacoes} avaliações
          </p>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-2">Habilidades</h3>
          <div className="flex flex-wrap gap-2">
            {jovem.habilidades?.slice(0, 3).map((hab, index) => (
              <span key={index} className="px-2 py-1 bg-cursor-background-light rounded-full text-sm">
                {hab}
              </span>
            ))}
            {jovem.habilidades?.length > 3 && (
              <span className="px-2 py-1 bg-cursor-background-light rounded-full text-sm">
                +{jovem.habilidades.length - 3}
              </span>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-2">Interesses</h3>
          <div className="flex flex-wrap gap-2">
            {jovem.interesses?.slice(0, 3).map((interesse, index) => (
              <span key={index} className="px-2 py-1 bg-cursor-background-light rounded-full text-sm">
                {interesse}
              </span>
            ))}
            {jovem.interesses?.length > 3 && (
              <span className="px-2 py-1 bg-cursor-background-light rounded-full text-sm">
                +{jovem.interesses.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Atividades Recentes</h2>
        <div className="space-y-4">
          {avaliacoes.slice(0, 3).map(avaliacao => (
            <div key={avaliacao.id} className="card p-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-sm font-medium">{avaliacao.categoria?.nome}</span>
                  <p className="text-sm text-cursor-text-secondary mt-1">
                    Nota: {avaliacao.nota.toFixed(1)}/10
                  </p>
                </div>
                <span className="text-sm text-cursor-text-tertiary">
                  {new Date(avaliacao.criado_em).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-cursor-text-primary mb-4">Informações Pessoais</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-cursor-text-secondary">Nome</dt>
              <dd className="mt-1 text-sm text-cursor-text-primary">{jovem.nome}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-cursor-text-secondary">Email</dt>
              <dd className="mt-1 text-sm text-cursor-text-primary">{jovem.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-cursor-text-secondary">Idade</dt>
              <dd className="mt-1 text-sm text-cursor-text-primary">{jovem.idade}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-cursor-text-secondary">Formação</dt>
              <dd className="mt-1 text-sm text-cursor-text-primary">{formatarFormacao(jovem.formacao) || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-cursor-text-secondary">Curso</dt>
              <dd className="mt-1 text-sm text-cursor-text-primary">{jovem.curso || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-cursor-text-secondary">Status</dt>
              <dd className="mt-1">
                <span className={`badge ${
                  jovem.status === 'Ativo' ? 'badge-success' : 
                  jovem.status === 'Inativo' ? 'badge-error' : 
                  'badge-default'
                }`}>
                  {jovem.status}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-cursor-text-primary mb-4">Habilidades e Interesses</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-cursor-text-secondary">Habilidades</dt>
              <dd className="mt-1">
                {jovem.habilidades && jovem.habilidades.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {jovem.habilidades.map((hab, index) => (
                      <span key={index} className="badge badge-primary">{capitalizarPalavras(hab)}</span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-cursor-text-tertiary">Nenhuma habilidade cadastrada</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-cursor-text-secondary">Interesses</dt>
              <dd className="mt-1">
                {jovem.interesses && jovem.interesses.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {jovem.interesses.map((interesse, index) => (
                      <span key={index} className="badge badge-secondary">{capitalizarPalavras(interesse)}</span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-cursor-text-tertiary">Nenhum interesse cadastrado</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-cursor-text-secondary">Planos Futuros</dt>
              <dd className="mt-1 text-sm text-cursor-text-primary">
                {jovem.planos_futuros || '-'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8">
        <AvaliacoesJovem
          jovemId={Number(id)}
          avaliacoes={avaliacoes}
          historico={jovem.historico || []}
          badges={jovem.badges || []}
          mediaGeral={mediaGeral}
          onAddAvaliacao={handleAddAvaliacao}
          onAddHistorico={handleAddHistorico}
        />
      </div>
    </div>
  );
};

export default JovemDetails; 