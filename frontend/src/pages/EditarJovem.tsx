import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { jovemService } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';

interface FormData {
  nome: string;
  email: string;
  idade: string;
  formacao: string;
  curso?: string;
  habilidades: string[];
  interesses: string[];
  planos_futuros: string;
}

const EditarJovem: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Redirecionar se não for instituição de ensino
  useEffect(() => {
    if (user?.papel !== 'instituicao_ensino') {
      navigate('/');
    }
  }, [user, navigate]);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{mensagem: string, tipo: 'success' | 'error'} | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    idade: '',
    formacao: '',
    curso: '',
    habilidades: [],
    interesses: [],
    planos_futuros: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const carregarJovem = async () => {
      if (!id) return;
      
      try {
        const response = await jovemService.getJovem(parseInt(id));
        setFormData({
          nome: response.nome,
          email: response.email,
          idade: response.idade.toString(),
          formacao: response.formacao || '',
          curso: response.curso || '',
          habilidades: response.habilidades || [],
          interesses: response.interesses || [],
          planos_futuros: response.planos_futuros || ''
        });
      } catch (error) {
        console.error('Erro ao carregar jovem:', error);
        setFeedback({
          mensagem: 'Erro ao carregar dados do jovem',
          tipo: 'error'
        });
      }
    };

    carregarJovem();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpar erro do campo quando ele for alterado
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayChange = (name: string, value: string[]) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpar erro do campo quando ele for alterado
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.idade) {
      newErrors.idade = 'Idade é obrigatória';
    } else if (parseInt(formData.idade) < 14 || parseInt(formData.idade) > 29) {
      newErrors.idade = 'Idade deve estar entre 14 e 29 anos';
    }

    if (!formData.formacao) {
      newErrors.formacao = 'Formação é obrigatória';
    }

    if (['Graduação Completa', 'Pós-graduação', 'Mestrado', 'Doutorado'].includes(formData.formacao) && !formData.curso) {
      newErrors.curso = 'Curso é obrigatório para formação superior';
    }

    if (!formData.habilidades.length) {
      newErrors.habilidades = 'Pelo menos uma habilidade é obrigatória';
    }

    if (!formData.interesses.length) {
      newErrors.interesses = 'Pelo menos um interesse é obrigatório';
    }

    if (!formData.planos_futuros.trim()) {
      newErrors.planos_futuros = 'Planos futuros são obrigatórios';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setFeedback({
        mensagem: 'Por favor, corrija os erros no formulário',
        tipo: 'error'
      });
      return;
    }

    setLoading(true);
    setFeedback(null);
    
    try {
      await jovemService.atualizarJovem(parseInt(id!), {
        ...formData,
        idade: parseInt(formData.idade)
      });
      
      setFeedback({
        mensagem: 'Jovem atualizado com sucesso!',
        tipo: 'success'
      });
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/instituicao-ensino/jovens');
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao atualizar jovem:', error);
      
      setFeedback({
        mensagem: error.response?.data?.message || error.message || 'Erro ao atualizar jovem',
        tipo: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Se não for instituição de ensino, não renderizar nada
  if (user?.papel !== 'instituicao_ensino') {
    return null;
  }

  return (
    <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-cursor-text-primary">Editar Jovem</h1>
            <p className="text-cursor-text-secondary mt-1">Atualize as informações do jovem</p>
          </div>
          <button 
            onClick={() => navigate('/instituicao-ensino/jovens')}
            className="btn-secondary"
          >
            Voltar
          </button>
        </div>

        {feedback && (
          <div className={`mb-8 p-4 rounded-lg ${
            feedback.tipo === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {feedback.mensagem}
          </div>
        )}

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-cursor-text-secondary mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className={`input-field w-full ${errors.nome ? 'border-cursor-error' : ''}`}
                  required
                />
                {errors.nome && (
                  <p className="mt-1 text-sm text-cursor-error">{errors.nome}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-cursor-text-secondary mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field w-full ${errors.email ? 'border-cursor-error' : ''}`}
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-cursor-error">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="idade" className="block text-sm font-medium text-cursor-text-secondary mb-1">
                  Idade *
                </label>
                <input
                  type="number"
                  id="idade"
                  name="idade"
                  value={formData.idade}
                  onChange={handleChange}
                  min="14"
                  max="29"
                  className={`input-field w-full ${errors.idade ? 'border-cursor-error' : ''}`}
                  required
                />
                {errors.idade && (
                  <p className="mt-1 text-sm text-cursor-error">{errors.idade}</p>
                )}
              </div>

              <div>
                <label htmlFor="formacao" className="block text-sm font-medium text-cursor-text-secondary mb-1">
                  Formação *
                </label>
                <select
                  id="formacao"
                  name="formacao"
                  value={formData.formacao}
                  onChange={handleChange}
                  className={`input-field w-full ${errors.formacao ? 'border-cursor-error' : ''}`}
                  required
                >
                  <option value="">Selecione uma formação</option>
                  <option value="ensino_medio">Ensino Médio</option>
                  <option value="tecnico">Técnico</option>
                  <option value="superior">Superior</option>
                  <option value="pos_graduacao">Pós-graduação</option>
                </select>
                {errors.formacao && (
                  <p className="mt-1 text-sm text-cursor-error">{errors.formacao}</p>
                )}
              </div>

              {formData.formacao !== 'ensino_medio' && (
                <div>
                  <label htmlFor="curso" className="block text-sm font-medium text-cursor-text-secondary mb-1">
                    Curso *
                  </label>
                  <input
                    type="text"
                    id="curso"
                    name="curso"
                    value={formData.curso}
                    onChange={handleChange}
                    className={`input-field w-full ${errors.curso ? 'border-cursor-error' : ''}`}
                    required
                  />
                  {errors.curso && (
                    <p className="mt-1 text-sm text-cursor-error">{errors.curso}</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-cursor-text-secondary mb-1">
                Habilidades *
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.habilidades.map((habilidade, index) => (
                  <span 
                    key={index} 
                    className="badge badge-primary cursor-pointer"
                    onClick={() => handleArrayChange('habilidades', formData.habilidades.filter((_, i) => i !== index))}
                  >
                    {habilidade} ×
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Digite uma habilidade e pressione Enter"
                  className="input-field flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = e.currentTarget.value.trim();
                      if (value && !formData.habilidades.includes(value)) {
                        handleArrayChange('habilidades', [...formData.habilidades, value]);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
              </div>
              {errors.habilidades && (
                <p className="mt-1 text-sm text-cursor-error">{errors.habilidades}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-cursor-text-secondary mb-1">
                Interesses *
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.interesses.map((interesse, index) => (
                  <span 
                    key={index} 
                    className="badge badge-secondary cursor-pointer"
                    onClick={() => handleArrayChange('interesses', formData.interesses.filter((_, i) => i !== index))}
                  >
                    {interesse} ×
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Digite um interesse e pressione Enter"
                  className="input-field flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = e.currentTarget.value.trim();
                      if (value && !formData.interesses.includes(value)) {
                        handleArrayChange('interesses', [...formData.interesses, value]);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
              </div>
              {errors.interesses && (
                <p className="mt-1 text-sm text-cursor-error">{errors.interesses}</p>
              )}
            </div>

            <div>
              <label htmlFor="planos_futuros" className="block text-sm font-medium text-cursor-text-secondary mb-1">
                Planos para o futuro *
              </label>
              <textarea
                id="planos_futuros"
                name="planos_futuros"
                value={formData.planos_futuros}
                onChange={handleChange}
                rows={3}
                className={`input-field w-full ${errors.planos_futuros ? 'border-cursor-error' : ''}`}
                required
              />
              {errors.planos_futuros && (
                <p className="mt-1 text-sm text-cursor-error">{errors.planos_futuros}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/instituicao-ensino/jovens')}
                className="btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="loading-spinner mr-2"></div>
                    Salvando...
                  </div>
                ) : 'Salvar alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarJovem; 