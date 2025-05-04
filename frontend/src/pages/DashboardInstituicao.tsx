import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { estudanteService } from '../services/api';
import { Estudante, EstudanteInput } from '../types';
import { toast } from 'react-hot-toast';
import Breadcrumbs from '../components/Breadcrumbs';
import { FaPlus, FaTimes, FaUserGraduate, FaSync } from 'react-icons/fa';

// Função para decodificar caracteres especiais
const decodeText = (text: string | null | undefined): string => {
  if (!text) return '';
  try {
    // Primeiro tenta decodificar caracteres HTML
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    const decoded = textarea.value;
    
    // Depois tenta decodificar UTF-8
    return decodeURIComponent(escape(decoded));
  } catch (e) {
    // Se houver erro, retorna o texto original
    return text;
  }
};

interface FormData {
  nome: string;
  email: string;
  media_geral: string;
  estabilidade_estresse: string;
  habilidades: string;
  planos_futuros: string;
}

interface FormErrors {
  nome?: string;
  email?: string;
  media_geral?: string;
  estabilidade_estresse?: string;
  geral?: string;
}

const DashboardInstituicao: React.FC = () => {
  const [estudantes, setEstudantes] = useState<Estudante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    media_geral: '',
    estabilidade_estresse: '',
    habilidades: '',
    planos_futuros: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Carrega a lista de estudantes
  useEffect(() => {
    if (!isAuthenticated || user?.papel !== 'instituicao') {
      navigate('/');
      return;
    }
    
    fetchEstudantes();
  }, [isAuthenticated, user, navigate]);

  const fetchEstudantes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[DashboardInstituicao] Buscando estudantes do servidor...');
      let data = await estudanteService.listarEstudantes();
      console.log('[DashboardInstituicao] Dados brutos recebidos:', JSON.stringify(data));
      
      // Garantir que todos os dados estão decodificados corretamente
      data = data.map(estudante => {
        console.log('[DashboardInstituicao] Processando estudante:', estudante.id, estudante.nome);
        return {
          ...estudante,
          nome: decodeText(estudante.nome),
          email: decodeText(estudante.email),
          planos_futuros: estudante.planos_futuros ? decodeText(estudante.planos_futuros) : null,
          habilidades: parseHabilidades(estudante.habilidades),
          // Garantir que valores numéricos são do tipo correto
          media_geral: estudante.media_geral !== null ? 
            (typeof estudante.media_geral === 'string' ? 
              parseFloat(estudante.media_geral) : estudante.media_geral) : null,
          estabilidade_estresse: estudante.estabilidade_estresse !== null ? 
            (typeof estudante.estabilidade_estresse === 'string' ? 
              parseInt(estudante.estabilidade_estresse, 10) : estudante.estabilidade_estresse) : null
        };
      });
      
      console.log('[DashboardInstituicao] Estudantes processados:', data.length);
      setEstudantes(data);
    } catch (err: any) {
      console.error('[DashboardInstituicao] Erro ao buscar estudantes:', err);
      setError('Erro ao carregar estudantes. Por favor, tente novamente.');
      toast.error('Erro ao carregar estudantes');
    } finally {
      setLoading(false);
    }
  };

  // Função para analisar o campo habilidades em diferentes formatos
  const parseHabilidades = (habilidades: any): string[] | null => {
    if (!habilidades) return null;
    
    console.log('[DashboardInstituicao] Analisando habilidades:', typeof habilidades, habilidades);
    
    // Já é um array, retorna como está
    if (Array.isArray(habilidades)) {
      return habilidades.map(decodeText);
    }
    
    // É uma string JSON
    if (typeof habilidades === 'string') {
      try {
        // Tenta fazer parsing como JSON
        const parsed = JSON.parse(habilidades);
        if (Array.isArray(parsed)) {
          return parsed.map(decodeText);
        }
        return null;
      } catch (e) {
        console.error('[DashboardInstituicao] Erro ao fazer parsing de habilidades:', e);
        // Se falhar no parsing, tenta tratar como lista separada por vírgulas
        return habilidades.split(',').map(skill => decodeText(skill.trim()));
      }
    }
    
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Limpa o erro quando o campo é modificado
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors({ ...formErrors, [name]: undefined });
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    // Validar nome
    if (!formData.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
      isValid = false;
    }

    // Validar email
    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
      isValid = false;
    }

    // Validar média geral (opcional, mas se fornecida deve ser válida)
    if (formData.media_geral && (isNaN(parseFloat(formData.media_geral)) || parseFloat(formData.media_geral) < 0 || parseFloat(formData.media_geral) > 10)) {
      errors.media_geral = 'Média deve ser um número entre 0 e 10';
      isValid = false;
    }

    // Validar estabilidade estresse (opcional, mas se fornecida deve ser válida)
    if (formData.estabilidade_estresse && (isNaN(parseInt(formData.estabilidade_estresse)) || parseInt(formData.estabilidade_estresse) < 1 || parseInt(formData.estabilidade_estresse) > 5)) {
      errors.estabilidade_estresse = 'Estabilidade deve ser um número entre 1 e 5';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const habilidadesArray = formData.habilidades
        ? formData.habilidades.split(',').map(skill => skill.trim())
        : [];
        
      const estudanteInput: EstudanteInput = {
        nome: formData.nome,
        email: formData.email,
        media_geral: formData.media_geral ? parseFloat(formData.media_geral) : undefined,
        estabilidade_estresse: formData.estabilidade_estresse ? parseInt(formData.estabilidade_estresse) : undefined,
        habilidades: habilidadesArray.length > 0 ? habilidadesArray : undefined,
        planos_futuros: formData.planos_futuros || undefined
      };
      
      console.log('Enviando dados do estudante:', estudanteInput);
      
      const novoEstudante = await estudanteService.adicionarEstudante(estudanteInput);
      
      // Processa os dados recebidos para garantir que as propriedades numéricas são números
      const estudanteProcessado: Estudante = {
        ...novoEstudante,
        // Garantir que os valores são do tipo correto
        media_geral: novoEstudante.media_geral !== null ? 
          (typeof novoEstudante.media_geral === 'string' ? 
            parseFloat(novoEstudante.media_geral) : novoEstudante.media_geral) : null,
        estabilidade_estresse: novoEstudante.estabilidade_estresse !== null ? 
          (typeof novoEstudante.estabilidade_estresse === 'string' ? 
            parseInt(novoEstudante.estabilidade_estresse, 10) : novoEstudante.estabilidade_estresse) : null
      };
      
      // Atualiza a lista com o novo estudante
      setEstudantes([...estudantes, estudanteProcessado]);
      
      // Limpa o formulário
      setFormData({
        nome: '',
        email: '',
        media_geral: '',
        estabilidade_estresse: '',
        habilidades: '',
        planos_futuros: ''
      });
      
      setShowForm(false);
      toast.success('Estudante adicionado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao adicionar estudante:', err);
      
      if (err.response?.data?.erro) {
        setFormErrors({ geral: err.response.data.erro });
        toast.error(err.response.data.erro);
      } else {
        setFormErrors({ geral: 'Erro ao adicionar estudante' });
        toast.error('Erro ao adicionar estudante');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cursor-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', path: '/' },
            { label: 'Dashboard Instituição', path: '/instituicao' }
          ]}
        />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">
            <span className="bg-gradient-to-r from-cursor-primary to-cursor-accent bg-clip-text text-transparent">
              Gerenciamento de Estudantes
            </span>
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
              showForm 
                ? 'bg-cursor-bg-lighter text-cursor-text-secondary border border-cursor-border' 
                : 'bg-cursor-primary text-white hover:bg-cursor-primary-dark'
            }`}
          >
            {showForm ? <><FaTimes /> Cancelar</> : <><FaPlus /> Adicionar Estudante</>}
          </button>
        </div>
        
        {showForm && (
          <div className="bg-cursor-bg-light border border-cursor-border rounded-xl p-6 shadow-cursor mb-8 animate-fade-in">
            <h2 className="text-xl font-medium text-cursor-text-primary mb-4 flex items-center gap-2">
              <FaUserGraduate className="text-cursor-primary" />
              Adicionar Novo Estudante
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-cursor-text-tertiary text-sm mb-1">Nome*</label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg bg-cursor-bg text-cursor-text-primary border ${formErrors.nome ? 'border-red-500' : 'border-cursor-border'} focus:border-cursor-primary focus:outline-none`}
                    placeholder="Nome completo"
                    required
                  />
                  {formErrors.nome && <p className="text-red-500 text-sm mt-1">{formErrors.nome}</p>}
                </div>
                
                <div>
                  <label className="block text-cursor-text-tertiary text-sm mb-1">Email*</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg bg-cursor-bg text-cursor-text-primary border ${formErrors.email ? 'border-red-500' : 'border-cursor-border'} focus:border-cursor-primary focus:outline-none`}
                    placeholder="email@exemplo.com"
                    required
                  />
                  {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-cursor-text-tertiary text-sm mb-1">Média Geral (0-10)</label>
                  <input
                    type="number"
                    name="media_geral"
                    min="0"
                    max="10"
                    step="0.01"
                    value={formData.media_geral}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg bg-cursor-bg text-cursor-text-primary border ${formErrors.media_geral ? 'border-red-500' : 'border-cursor-border'} focus:border-cursor-primary focus:outline-none`}
                    placeholder="Ex: 8.5"
                  />
                  {formErrors.media_geral && <p className="text-red-500 text-sm mt-1">{formErrors.media_geral}</p>}
                </div>
                
                <div>
                  <label className="block text-cursor-text-tertiary text-sm mb-1">Estabilidade/Estresse (1-5)</label>
                  <input
                    type="number"
                    name="estabilidade_estresse"
                    min="1"
                    max="5"
                    value={formData.estabilidade_estresse}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg bg-cursor-bg text-cursor-text-primary border ${formErrors.estabilidade_estresse ? 'border-red-500' : 'border-cursor-border'} focus:border-cursor-primary focus:outline-none`}
                    placeholder="1 (baixo) a 5 (alto)"
                  />
                  {formErrors.estabilidade_estresse && <p className="text-red-500 text-sm mt-1">{formErrors.estabilidade_estresse}</p>}
                </div>
              </div>
              
              <div className="mb-5">
                <label className="block text-cursor-text-tertiary text-sm mb-1">Habilidades (separadas por vírgula)</label>
                <input
                  type="text"
                  name="habilidades"
                  value={formData.habilidades}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-cursor-bg text-cursor-text-primary border border-cursor-border focus:border-cursor-primary focus:outline-none"
                  placeholder="React, Node.js, SQL, Java..."
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-cursor-text-tertiary text-sm mb-1">Planos Futuros</label>
                <textarea
                  name="planos_futuros"
                  value={formData.planos_futuros}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-cursor-bg text-cursor-text-primary border border-cursor-border focus:border-cursor-primary focus:outline-none"
                  rows={3}
                  placeholder="Descreva os objetivos e planos futuros do estudante..."
                />
              </div>
              
              {formErrors.geral && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500">
                  {formErrors.geral}
                </div>
              )}
              
              <div className="flex justify-end border-t border-cursor-border pt-5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-md text-cursor-text-secondary hover:text-cursor-text-primary mr-3"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-cursor-primary hover:bg-cursor-primary-dark text-white transition-colors"
                  disabled={submitting}
                >
                  {submitting ? 'Salvando...' : 'Salvar Estudante'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-cursor-primary/20 flex items-center justify-center mb-3">
                <svg className="animate-spin h-6 w-6 text-cursor-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-cursor-text-secondary">Carregando estudantes...</p>
            </div>
          </div>
        ) : error ? (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-500 mb-2">{error}</p>
            <button 
              onClick={fetchEstudantes}
              className="flex items-center gap-2 text-cursor-primary hover:underline"
            >
              <FaSync className="text-xs" /> Tentar novamente
            </button>
          </div>
        ) : estudantes.length === 0 ? (
          <div className="bg-cursor-bg-light border border-cursor-border rounded-xl p-8 text-center shadow-cursor">
            <div className="h-16 w-16 mx-auto rounded-full bg-cursor-primary/20 flex items-center justify-center mb-4">
              <FaUserGraduate className="text-cursor-primary text-xl" />
            </div>
            <p className="text-cursor-text-secondary mb-4">Nenhum estudante cadastrado.</p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 rounded-md bg-cursor-primary hover:bg-cursor-primary-dark text-white transition-colors inline-flex items-center gap-2"
              >
                <FaPlus /> Adicionar Primeiro Estudante
              </button>
            )}
          </div>
        ) : (
          <div className="bg-cursor-bg-light border border-cursor-border rounded-xl overflow-hidden shadow-cursor">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-cursor-border">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-cursor-text-tertiary uppercase tracking-wider bg-cursor-bg">Nome</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-cursor-text-tertiary uppercase tracking-wider bg-cursor-bg">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-cursor-text-tertiary uppercase tracking-wider bg-cursor-bg">Média</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-cursor-text-tertiary uppercase tracking-wider bg-cursor-bg">Estabilidade</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-cursor-text-tertiary uppercase tracking-wider bg-cursor-bg">Habilidades</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cursor-border">
                  {estudantes.map((estudante) => (
                    <tr key={estudante.id} className="hover:bg-cursor-bg-lighter">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-cursor-text-primary">{decodeText(estudante.nome)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-cursor-text-secondary">{decodeText(estudante.email)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {estudante.media_geral !== null ? (
                          <div className="text-sm font-medium text-cursor-text-primary">
                            {typeof estudante.media_geral === 'number' 
                              ? estudante.media_geral.toFixed(2) 
                              : typeof estudante.media_geral === 'string' 
                                ? parseFloat(estudante.media_geral).toFixed(2)
                                : 'N/A'
                            }
                          </div>
                        ) : (
                          <span className="text-sm text-cursor-text-tertiary">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {estudante.estabilidade_estresse !== null ? (
                          <div className="flex items-center">
                            <div className="h-2 w-24 rounded-full bg-cursor-bg-lighter overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-cursor-primary to-cursor-accent" 
                                style={{ width: `${(typeof estudante.estabilidade_estresse === 'number' 
                                  ? estudante.estabilidade_estresse 
                                  : typeof estudante.estabilidade_estresse === 'string' 
                                    ? parseInt(estudante.estabilidade_estresse, 10) 
                                    : 0) / 5 * 100}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm text-cursor-text-secondary">
                              {typeof estudante.estabilidade_estresse === 'number' 
                                ? estudante.estabilidade_estresse 
                                : typeof estudante.estabilidade_estresse === 'string' 
                                  ? parseInt(estudante.estabilidade_estresse, 10) 
                                  : 'N/A'}/5
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-cursor-text-tertiary">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {estudante.habilidades && estudante.habilidades.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(estudante.habilidades) && estudante.habilidades.map((skill, index) => (
                              <span 
                                key={index} 
                                className="bg-cursor-primary/10 text-cursor-primary text-xs px-2 py-1 rounded-full"
                              >
                                {decodeText(skill)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-cursor-text-tertiary">Não informado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardInstituicao;