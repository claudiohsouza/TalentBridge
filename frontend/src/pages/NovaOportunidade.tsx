import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { opcoesService } from '../services/api';

const NovaOportunidade: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para armazenar opções carregadas do banco de dados
  const [tiposVaga, setTiposVaga] = useState<string[]>([]);
  const [areasAtuacao, setAreasAtuacao] = useState<string[]>([]);
  const [loadingOpcoes, setLoadingOpcoes] = useState(true);

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    requisitos: '',
    tipo: '',
    area: '',
    salario: '',
    beneficios: '',
    horario: '',
    local: '',
  });

  // Carregar opções do banco de dados
  useEffect(() => {
    const carregarOpcoes = async () => {
      try {
        setLoadingOpcoes(true);
        // Buscar todas as opções de uma vez
        const todasOpcoes = await opcoesService.obterTodasOpcoes();
        
        // Atualizar estados com as opções retornadas
        setTiposVaga(todasOpcoes.tipos_vaga || []);
        setAreasAtuacao(todasOpcoes.areas_atuacao || todasOpcoes.areas_interesse || []);
        
        // Definir valores padrão se disponíveis
        if (todasOpcoes.tipos_vaga && todasOpcoes.tipos_vaga.length > 0) {
          setFormData(prev => ({ ...prev, tipo: todasOpcoes.tipos_vaga[0] }));
        }
      } catch (error) {
        console.error('Erro ao carregar opções do sistema:', error);
        // Em caso de erro, definir valores padrão
        const tiposVagaDefault = ['Estágio', 'CLT', 'PJ', 'Temporário'];
        const areasAtuacaoDefault = ['Tecnologia', 'Marketing', 'RH', 'Administração', 'Engenharia'];
        
        setTiposVaga(tiposVagaDefault);
        setAreasAtuacao(areasAtuacaoDefault);
        setFormData(prev => ({ ...prev, tipo: tiposVagaDefault[0] }));
      } finally {
        setLoadingOpcoes(false);
      }
    };

    carregarOpcoes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/oportunidades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Erro ao criar oportunidade');
      }

      navigate('/instituicao-contratante/oportunidades');
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro ao criar oportunidade. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-cursor-text-primary">Nova Oportunidade</h1>
          <p className="text-cursor-text-secondary mt-1">
            Preencha os dados da nova oportunidade
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card divide-y divide-cursor-border">
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="titulo" className="block text-sm font-medium text-cursor-text-primary mb-1">
                  Título da Oportunidade
                </label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  required
                  className="input-field w-full"
                  placeholder="Ex: Desenvolvedor Web Júnior"
                />
              </div>

              <div>
                <label htmlFor="descricao" className="block text-sm font-medium text-cursor-text-primary mb-1">
                  Descrição
                </label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="input-field w-full"
                  placeholder="Descreva as principais atividades e responsabilidades"
                />
              </div>

              <div>
                <label htmlFor="requisitos" className="block text-sm font-medium text-cursor-text-primary mb-1">
                  Requisitos
                </label>
                <textarea
                  id="requisitos"
                  name="requisitos"
                  value={formData.requisitos}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="input-field w-full"
                  placeholder="Liste os requisitos necessários para a vaga"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="tipo" className="block text-sm font-medium text-cursor-text-primary mb-1">
                    Tipo de Vaga
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    required
                    className="input-field w-full"
                    disabled={loadingOpcoes}
                  >
                    {loadingOpcoes ? (
                      <option value="">Carregando...</option>
                    ) : (
                      <>
                        <option value="">Selecione um tipo</option>
                        {tiposVaga.map(tipo => (
                          <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor="area" className="block text-sm font-medium text-cursor-text-primary mb-1">
                    Área
                  </label>
                  <select
                    id="area"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    required
                    className="input-field w-full"
                    disabled={loadingOpcoes}
                  >
                    {loadingOpcoes ? (
                      <option value="">Carregando...</option>
                    ) : (
                      <>
                        <option value="">Selecione uma área</option>
                        {areasAtuacao.map(area => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="salario" className="block text-sm font-medium text-cursor-text-primary mb-1">
                    Salário/Bolsa
                  </label>
                  <input
                    type="text"
                    id="salario"
                    name="salario"
                    value={formData.salario}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="Ex: R$ 2.000,00 ou A combinar"
                  />
                </div>

                <div>
                  <label htmlFor="horario" className="block text-sm font-medium text-cursor-text-primary mb-1">
                    Horário
                  </label>
                  <input
                    type="text"
                    id="horario"
                    name="horario"
                    value={formData.horario}
                    onChange={handleChange}
                    required
                    className="input-field w-full"
                    placeholder="Ex: Segunda a Sexta, 09h às 16h"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="beneficios" className="block text-sm font-medium text-cursor-text-primary mb-1">
                  Benefícios
                </label>
                <textarea
                  id="beneficios"
                  name="beneficios"
                  value={formData.beneficios}
                  onChange={handleChange}
                  rows={2}
                  className="input-field w-full"
                  placeholder="Liste os benefícios oferecidos"
                />
              </div>

              <div>
                <label htmlFor="local" className="block text-sm font-medium text-cursor-text-primary mb-1">
                  Local de Trabalho
                </label>
                <input
                  type="text"
                  id="local"
                  name="local"
                  value={formData.local}
                  onChange={handleChange}
                  required
                  className="input-field w-full"
                  placeholder="Ex: Remoto, Híbrido ou Presencial (Endereço)"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-cursor-background-light flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || loadingOpcoes}
              className="btn-primary min-w-[120px] flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Criar Oportunidade'
              )}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-cursor-error/10 border-t border-cursor-error/20">
              <p className="text-sm text-cursor-error">{error}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default NovaOportunidade; 