import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { opcoesService } from '../services/api';
import { UserRole, RegisterRequest } from '../types';

// Remover constantes hardcoded
// const AREAS_INTERESSE_OPCOES = [ ... ]
// const PROGRAMAS_SOCIAIS_OPCOES = [ ... ]

interface FormData {
  email: string;
  senha: string;
  confirmarSenha: string;
  nome: string;
  papel: UserRole;
  // Campos para instituição de ensino
  tipo?: string;
  areas_ensino?: string[];
  qtd_alunos?: number;
  // Campos para chefe de empresa
  empresa?: string;
  setor?: string;
  porte?: string;
  areas_atuacao?: string[];
  // Campos comuns e de instituição contratante
  localizacao: string;
  areas_interesse?: string[];
  programas_sociais?: string[];
}

interface FormErrors {
  email?: string;
  senha?: string;
  confirmarSenha?: string;
  nome?: string;
  papel?: string;
  tipo?: string;
  empresa?: string;
  setor?: string;
  porte?: string;
  localizacao?: string;
  areas_ensino?: string;
  qtd_alunos?: string;
  areas_atuacao?: string;
  areas_interesse?: string;
  programas_sociais?: string;
  geral?: string;
}

export default function Cadastro() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    senha: '',
    confirmarSenha: '',
    nome: '',
    papel: 'instituicao_ensino',
    localizacao: '',
    tipo: '',
    areas_ensino: [],
    qtd_alunos: undefined,
    empresa: '',
    setor: '',
    porte: '',
    areas_atuacao: [],
    areas_interesse: [],
    programas_sociais: []
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const navigate = useNavigate();

  // Estado para armazenar opções carregadas do banco de dados
  const [areasInteresse, setAreasInteresse] = useState<string[]>([]);
  const [programasSociais, setProgramasSociais] = useState<string[]>([]);
  const [tiposInstituicao, setTiposInstituicao] = useState<string[]>([]);
  const [tiposInstituicaoEnsino, setTiposInstituicaoEnsino] = useState<string[]>([]);
  const [setoresEmpresa, setSetoresEmpresa] = useState<string[]>([]);
  const [portesEmpresa, setPortesEmpresa] = useState<string[]>([]);
  const [loadingOpcoes, setLoadingOpcoes] = useState(true);

  // Carregar opções do banco de dados
  useEffect(() => {
    const carregarOpcoes = async () => {
      try {
        setLoadingOpcoes(true);
        // Buscar todas as opções de uma vez
        const todasOpcoes = await opcoesService.obterTodasOpcoes();
        
        // Atualizar estados com as opções retornadas
        setAreasInteresse(todasOpcoes.areas_interesse || []);
        setProgramasSociais(todasOpcoes.programas_sociais || []);
        setTiposInstituicao(todasOpcoes.tipos_instituicao || []);
        setTiposInstituicaoEnsino(todasOpcoes.tipos_instituicao_ensino || []);
        setSetoresEmpresa(todasOpcoes.setores_empresa || []);
        setPortesEmpresa(todasOpcoes.portes_empresa || []);
      } catch (error) {
        console.error('Erro ao carregar opções do sistema:', error);
        // Em caso de erro, definir valores padrão para não quebrar o formulário
        setAreasInteresse(['Tecnologia', 'Educação', 'Administração']);
        setProgramasSociais(['Programa Jovem Aprendiz', 'Programa de Estágio']);
        setTiposInstituicao(['ONG', 'Fundação', 'Outro']);
        setTiposInstituicaoEnsino(['Universidade Pública', 'Universidade Privada', 'Outro']);
        setSetoresEmpresa(['Tecnologia', 'Serviços', 'Outro']);
        setPortesEmpresa(['Pequeno', 'Médio', 'Grande']);
      } finally {
        setLoadingOpcoes(false);
      }
    };

    carregarOpcoes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando ele é modificado
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Função para controlar a seleção de checkboxes
  const handleCheckboxChange = (name: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = prev[name as keyof FormData] as string[] || [];
      
      if (checked) {
        // Adicionar à array se não estiver presente
        return {
          ...prev,
          [name]: [...currentArray, value]
        };
      } else {
        // Remover da array se estiver desmarcado
        return {
          ...prev,
          [name]: currentArray.filter(item => item !== value)
        };
      }
    });
    
    // Limpar erro do campo quando ele é modificado
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Função especial para lidar com arrays (habilidades, interesses, etc)
  const handleArrayChange = (name: string, value: string) => {
    // Converter string em array, preservando espaços nos itens
    // Usamos uma expressão regular que separa apenas por vírgulas ou quebras de linha
    // E depois fazemos trim de cada item para remover espaços extras no início/fim
    const items = value
      .split(/,|\n/)
      .map(item => item.trim())
      .filter(item => item !== '');
    
    setFormData(prev => ({ ...prev, [name]: items }));
    
    // Limpar erro do campo quando ele é modificado
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validarFormulario = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validações básicas
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
      isValid = false;
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
      isValid = false;
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
      isValid = false;
    }

    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
      isValid = false;
    }
    
    if (!formData.nome) {
      newErrors.nome = 'Nome é obrigatório';
      isValid = false;
    }
    
    if (!formData.localizacao) {
      newErrors.localizacao = 'Localização é obrigatória';
      isValid = false;
    }

    // Validações específicas por papel
    if (formData.papel === 'instituicao_ensino') {
      if (!formData.tipo) {
        newErrors.tipo = 'Tipo da instituição é obrigatório';
        isValid = false;
      }
      
      if (!formData.areas_ensino || formData.areas_ensino.length === 0) {
        newErrors.areas_ensino = 'Indique pelo menos uma área de ensino';
        isValid = false;
      }
      
      if (!formData.qtd_alunos) {
        newErrors.qtd_alunos = 'Quantidade de alunos é obrigatória';
        isValid = false;
      }
    }
    
    if (formData.papel === 'chefe_empresa') {
      if (!formData.empresa) {
        newErrors.empresa = 'Nome da empresa é obrigatório';
        isValid = false;
      }
      
      if (!formData.setor) {
        newErrors.setor = 'Setor da empresa é obrigatório';
        isValid = false;
      }
      
      if (!formData.porte) {
        newErrors.porte = 'Porte da empresa é obrigatório';
        isValid = false;
      }
      
      if (!formData.areas_atuacao || formData.areas_atuacao.length === 0) {
        newErrors.areas_atuacao = 'Indique pelo menos uma área de atuação';
        isValid = false;
      }
    }
    
    if (formData.papel === 'instituicao_contratante') {
      if (!formData.tipo) {
        newErrors.tipo = 'Tipo da instituição é obrigatório';
        isValid = false;
      }
      
      if (!formData.areas_interesse || formData.areas_interesse.length === 0) {
        newErrors.areas_interesse = 'Indique pelo menos uma área de interesse';
        isValid = false;
      }
      
      if (!formData.programas_sociais || formData.programas_sociais.length === 0) {
        newErrors.programas_sociais = 'Indique pelo menos um programa social';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      // Construir payload de acordo com o papel
      const payload: RegisterRequest = {
        email: formData.email,
        senha: formData.senha,
        nome: formData.nome,
        papel: formData.papel as UserRole,
        localizacao: formData.localizacao,
      };
      
      // Adicionar campos específicos por papel
      if (formData.papel === 'instituicao_ensino') {
        payload.tipo = formData.tipo;
        payload.areas_ensino = formData.areas_ensino;
        payload.qtd_alunos = Number(formData.qtd_alunos);
      } else if (formData.papel === 'chefe_empresa') {
        payload.empresa = formData.empresa;
        payload.setor = formData.setor;
        payload.porte = formData.porte;
        payload.areas_atuacao = formData.areas_atuacao;
      } else if (formData.papel === 'instituicao_contratante') {
        payload.tipo = formData.tipo;
        payload.areas_interesse = formData.areas_interesse;
        payload.programas_sociais = formData.programas_sociais;
      }
      
      await authService.registro(payload);
      
      setSucesso(true);
      
      // Redirecionamento automático após 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      
      if (error.response?.data?.erro) {
        setErrors({ geral: error.response.data.erro });
      } else {
        setErrors({ geral: 'Erro ao conectar com o servidor' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Renderização condicional dos campos baseado no papel selecionado
  const renderCamposEspecificos = () => {
    switch (formData.papel) {
      case 'instituicao_ensino':
        return (
          <>
            <div>
              <label className="block text-cursor-text-tertiary text-sm mb-1">Tipo da Instituição*</label>
              <select
                name="tipo"
                className={`w-full p-3 rounded-lg bg-cursor-bg text-cursor-text-primary border ${
                  errors.tipo ? 'border-red-500' : 'border-cursor-border'
                } focus:border-cursor-primary focus:outline-none`}
                value={formData.tipo}
                onChange={handleChange}
                required
                disabled={loadingOpcoes}
              >
                <option value="">Selecione um tipo</option>
                {tiposInstituicaoEnsino.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              {errors.tipo && <p className="text-red-500 text-sm mt-1">{errors.tipo}</p>}
            </div>
            <div>
              <label className="block text-cursor-text-tertiary text-sm mb-1">Áreas de Ensino*</label>
              <textarea
                name="areas_ensino"
                placeholder="Tecnologia, Engenharia, Administração... (separadas por vírgula)"
                className={`w-full p-3 rounded-lg bg-cursor-bg text-cursor-text-primary border ${
                  errors.areas_ensino ? 'border-red-500' : 'border-cursor-border'
                } focus:border-cursor-primary focus:outline-none`}
                value={formData.areas_ensino?.join(', ')}
                onChange={(e) => handleArrayChange('areas_ensino', e.target.value)}
                rows={3}
                required
              />
              {errors.areas_ensino && <p className="text-red-500 text-sm mt-1">{errors.areas_ensino}</p>}
            </div>
            <div>
              <label className="block text-cursor-text-tertiary text-sm mb-1">Quantidade de Alunos*</label>
              <input
                type="number"
                name="qtd_alunos"
                placeholder="Ex: 1000"
                className={`w-full p-3 rounded-lg bg-cursor-bg text-cursor-text-primary border ${
                  errors.qtd_alunos ? 'border-red-500' : 'border-cursor-border'
                } focus:border-cursor-primary focus:outline-none`}
                value={formData.qtd_alunos || ''}
                onChange={handleChange}
                min="1"
                required
              />
              {errors.qtd_alunos && <p className="text-red-500 text-sm mt-1">{errors.qtd_alunos}</p>}
            </div>
          </>
        );
      case 'chefe_empresa':
        return (
          <>
            <div>
              <label className="block text-cursor-text-tertiary text-sm mb-1">Nome da Empresa*</label>
              <input
                type="text"
                name="empresa"
                placeholder="Nome da sua empresa"
                className={`w-full p-3 rounded-lg bg-cursor-bg text-cursor-text-primary border ${
                  errors.empresa ? 'border-red-500' : 'border-cursor-border'
                } focus:border-cursor-primary focus:outline-none`}
                value={formData.empresa}
                onChange={handleChange}
                required
              />
              {errors.empresa && <p className="text-red-500 text-sm mt-1">{errors.empresa}</p>}
            </div>
            <div>
              <label className="block text-cursor-text-tertiary text-sm mb-1">Setor*</label>
              <select
                name="setor"
                className={`w-full p-3 rounded-lg bg-cursor-bg text-cursor-text-primary border ${
                  errors.setor ? 'border-red-500' : 'border-cursor-border'
                } focus:border-cursor-primary focus:outline-none`}
                value={formData.setor}
                onChange={handleChange}
                required
                disabled={loadingOpcoes}
              >
                <option value="">Selecione um setor</option>
                {setoresEmpresa.map(setor => (
                  <option key={setor} value={setor}>{setor}</option>
                ))}
              </select>
              {errors.setor && <p className="text-red-500 text-sm mt-1">{errors.setor}</p>}
            </div>
            <div>
              <label className="block text-cursor-text-tertiary text-sm mb-1">Porte da Empresa*</label>
              <select
                name="porte"
                className={`w-full p-3 rounded-lg bg-cursor-bg text-cursor-text-primary border ${
                  errors.porte ? 'border-red-500' : 'border-cursor-border'
                } focus:border-cursor-primary focus:outline-none`}
                value={formData.porte}
                onChange={handleChange}
                required
                disabled={loadingOpcoes}
              >
                <option value="">Selecione um porte</option>
                {portesEmpresa.map(porte => (
                  <option key={porte} value={porte}>{porte}</option>
                ))}
              </select>
              {errors.porte && <p className="text-red-500 text-sm mt-1">{errors.porte}</p>}
            </div>
            <div>
              <label className="block text-cursor-text-tertiary text-sm mb-1">Áreas de Atuação*</label>
              <textarea
                name="areas_atuacao"
                placeholder="Desenvolvimento de Software, Marketing Digital... (separadas por vírgula)"
                className={`w-full p-3 rounded-lg bg-cursor-bg text-cursor-text-primary border ${
                  errors.areas_atuacao ? 'border-red-500' : 'border-cursor-border'
                } focus:border-cursor-primary focus:outline-none`}
                value={formData.areas_atuacao?.join(', ')}
                onChange={(e) => handleArrayChange('areas_atuacao', e.target.value)}
                rows={3}
                required
              />
              {errors.areas_atuacao && <p className="text-red-500 text-sm mt-1">{errors.areas_atuacao}</p>}
            </div>
          </>
        );
      case 'instituicao_contratante':
        return (
          <>
            <div>
              <label className="block text-cursor-text-tertiary text-sm mb-1">Tipo da Instituição*</label>
              <select
                name="tipo"
                className={`w-full p-3 rounded-lg bg-cursor-bg text-cursor-text-primary border ${
                  errors.tipo ? 'border-red-500' : 'border-cursor-border'
                } focus:border-cursor-primary focus:outline-none`}
                value={formData.tipo}
                onChange={handleChange}
                required
                disabled={loadingOpcoes}
              >
                <option value="">Selecione um tipo</option>
                {tiposInstituicao.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              {errors.tipo && <p className="text-red-500 text-sm mt-1">{errors.tipo}</p>}
            </div>
            <div>
              <label className="block text-cursor-text-tertiary text-sm mb-1">Áreas de Interesse*</label>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 mt-2 p-3 rounded-lg bg-[#1a1a1a] text-white border border-[#333]">
                {loadingOpcoes ? (
                  <div className="col-span-2 text-center py-2">
                    <p className="text-sm text-gray-500">Carregando opções...</p>
                  </div>
                ) : areasInteresse.map((area) => (
                  <div key={area} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`area-${area}`}
                      checked={formData.areas_interesse?.includes(area) || false}
                      onChange={(e) => handleCheckboxChange('areas_interesse', area, e.target.checked)}
                      className="form-checkbox w-4 h-4 mr-2 bg-transparent border border-[#555] text-[#6366f1] focus:ring-[#6366f1] checked:border-[#6366f1] rounded"
                    />
                    <label htmlFor={`area-${area}`} className="text-sm text-white">{area}</label>
                  </div>
                ))}
              </div>
              {errors.areas_interesse && <p className="text-red-500 text-sm mt-1">{errors.areas_interesse}</p>}
            </div>
            <div>
              <label className="block text-cursor-text-tertiary text-sm mb-1">Programas Sociais*</label>
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-2 mt-2 p-3 rounded-lg bg-[#1a1a1a] text-white border border-[#333]">
                {loadingOpcoes ? (
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-500">Carregando opções...</p>
                  </div>
                ) : programasSociais.map((programa) => (
                  <div key={programa} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`programa-${programa}`}
                      checked={formData.programas_sociais?.includes(programa) || false}
                      onChange={(e) => handleCheckboxChange('programas_sociais', programa, e.target.checked)}
                      className="form-checkbox w-4 h-4 mr-2 bg-transparent border border-[#555] text-[#6366f1] focus:ring-[#6366f1] checked:border-[#6366f1] rounded"
                    />
                    <label htmlFor={`programa-${programa}`} className="text-sm text-white">{programa}</label>
                  </div>
                ))}
              </div>
              {errors.programas_sociais && <p className="text-red-500 text-sm mt-1">{errors.programas_sociais}</p>}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-cursor-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-cursor-primary to-cursor-secondary bg-clip-text text-transparent">
              TalentBridge
            </span>
          </h1>
          <p className="mt-2 text-cursor-text-secondary">
            Crie sua conta para começar
          </p>
        </div>
        
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informações básicas */}
            <div>
              <h3 className="text-lg font-semibold text-cursor-text-primary mb-6">
                Informações Básicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                  {errors.nome && (
                    <p className="mt-1 text-sm text-cursor-error">{errors.nome}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-cursor-error">{errors.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                    Senha
                  </label>
                  <input
                    type="password"
                    name="senha"
                    value={formData.senha}
                    onChange={handleChange}
                    className="input-field"
                    required
                    minLength={6}
                  />
                  {errors.senha && (
                    <p className="mt-1 text-sm text-cursor-error">{errors.senha}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    name="confirmarSenha"
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                  {errors.confirmarSenha && (
                    <p className="mt-1 text-sm text-cursor-error">{errors.confirmarSenha}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                    Tipo de Usuário
                  </label>
                  <select
                    name="papel"
                    value={formData.papel}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="instituicao_ensino">Instituição de Ensino</option>
                    <option value="chefe_empresa">Chefe de Empresa</option>
                    <option value="instituicao_contratante">Instituição Contratante</option>
                  </select>
                  {errors.papel && (
                    <p className="mt-1 text-sm text-cursor-error">{errors.papel}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                    Localização
                  </label>
                  <input
                    type="text"
                    name="localizacao"
                    value={formData.localizacao}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Ex: São Paulo, SP"
                    required
                  />
                  {errors.localizacao && (
                    <p className="mt-1 text-sm text-cursor-error">{errors.localizacao}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Campos específicos por papel */}
            <div>
              <h3 className="text-lg font-semibold text-cursor-text-primary mb-6">
                Informações Específicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.papel === 'instituicao_ensino' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                        Tipo de Instituição
                      </label>
                      <input
                        type="text"
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Ex: Universidade, Escola Técnica"
                        required
                      />
                      {errors.tipo && (
                        <p className="mt-1 text-sm text-cursor-error">{errors.tipo}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                        Número de Alunos
                      </label>
                      <input
                        type="number"
                        name="qtd_alunos"
                        value={formData.qtd_alunos}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Ex: 1000"
                        required
                      />
                      {errors.qtd_alunos && (
                        <p className="mt-1 text-sm text-cursor-error">{errors.qtd_alunos}</p>
                      )}
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                        Áreas de Ensino
                      </label>
                      <textarea
                        name="areas_ensino"
                        value={formData.areas_ensino?.join('\n')}
                        onChange={(e) => handleArrayChange('areas_ensino', e.target.value)}
                        rows={4}
                        className="input-field"
                        placeholder="Digite uma área por linha&#10;Ex: Engenharia de Software&#10;Ciência da Computação&#10;Design Digital"
                        required
                      />
                      <p className="mt-1 text-sm text-cursor-text-tertiary">
                        Digite uma área por linha ou separe por vírgulas
                      </p>
                      {errors.areas_ensino && (
                        <p className="mt-1 text-sm text-cursor-error">{errors.areas_ensino}</p>
                      )}
                    </div>
                  </>
                )}
                
                {formData.papel === 'chefe_empresa' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                        Nome da Empresa
                      </label>
                      <input
                        type="text"
                        name="empresa"
                        value={formData.empresa}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Ex: TechCorp"
                        required
                      />
                      {errors.empresa && (
                        <p className="mt-1 text-sm text-cursor-error">{errors.empresa}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                        Setor
                      </label>
                      <input
                        type="text"
                        name="setor"
                        value={formData.setor}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Ex: Tecnologia"
                        required
                      />
                      {errors.setor && (
                        <p className="mt-1 text-sm text-cursor-error">{errors.setor}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                        Porte da Empresa
                      </label>
                      <input
                        type="text"
                        name="porte"
                        value={formData.porte}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Ex: Médio"
                        required
                      />
                      {errors.porte && (
                        <p className="mt-1 text-sm text-cursor-error">{errors.porte}</p>
                      )}
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                        Áreas de Atuação
                      </label>
                      <textarea
                        name="areas_atuacao"
                        value={formData.areas_atuacao?.join('\n')}
                        onChange={(e) => handleArrayChange('areas_atuacao', e.target.value)}
                        rows={4}
                        className="input-field"
                        placeholder="Digite uma área por linha&#10;Ex: Desenvolvimento Web&#10;Inteligência Artificial&#10;Cloud Computing"
                        required
                      />
                      <p className="mt-1 text-sm text-cursor-text-tertiary">
                        Digite uma área por linha ou separe por vírgulas
                      </p>
                      {errors.areas_atuacao && (
                        <p className="mt-1 text-sm text-cursor-error">{errors.areas_atuacao}</p>
                      )}
                    </div>
                  </>
                )}
                
                {formData.papel === 'instituicao_contratante' && (
                  <>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                        Tipo da Instituição
                      </label>
                      <select
                        name="tipo"
                        className="input-field"
                        value={formData.tipo}
                        onChange={handleChange}
                        required
                        disabled={loadingOpcoes}
                      >
                        <option value="">Selecione um tipo</option>
                        {tiposInstituicao.map(tipo => (
                          <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                      </select>
                      {errors.tipo && (
                        <p className="mt-1 text-sm text-cursor-error">{errors.tipo}</p>
                      )}
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                        Áreas de Interesse
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 mt-2 p-3 rounded-lg bg-[#1a1a1a] text-white border border-[#333]">
                        {loadingOpcoes ? (
                          <div className="col-span-2 text-center py-2">
                            <p className="text-sm text-gray-500">Carregando opções...</p>
                          </div>
                        ) : areasInteresse.map((area) => (
                          <div key={area} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`area-${area}`}
                              checked={formData.areas_interesse?.includes(area) || false}
                              onChange={(e) => handleCheckboxChange('areas_interesse', area, e.target.checked)}
                              className="form-checkbox w-4 h-4 mr-2 bg-transparent border border-[#555] text-[#6366f1] focus:ring-[#6366f1] checked:border-[#6366f1] rounded"
                            />
                            <label htmlFor={`area-${area}`} className="text-sm text-white">{area}</label>
                          </div>
                        ))}
                      </div>
                      {errors.areas_interesse && <p className="text-red-500 text-sm mt-1">{errors.areas_interesse}</p>}
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                        Programas Sociais
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-1 gap-2 mt-2 p-3 rounded-lg bg-[#1a1a1a] text-white border border-[#333]">
                        {loadingOpcoes ? (
                          <div className="text-center py-2">
                            <p className="text-sm text-gray-500">Carregando opções...</p>
                          </div>
                        ) : programasSociais.map((programa) => (
                          <div key={programa} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`programa-${programa}`}
                              checked={formData.programas_sociais?.includes(programa) || false}
                              onChange={(e) => handleCheckboxChange('programas_sociais', programa, e.target.checked)}
                              className="form-checkbox w-4 h-4 mr-2 bg-transparent border border-[#555] text-[#6366f1] focus:ring-[#6366f1] checked:border-[#6366f1] rounded"
                            />
                            <label htmlFor={`programa-${programa}`} className="text-sm text-white">{programa}</label>
                          </div>
                        ))}
                      </div>
                      {errors.programas_sociais && <p className="text-red-500 text-sm mt-1">{errors.programas_sociais}</p>}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {errors.geral && (
              <div className="p-3 bg-cursor-error/10 border border-cursor-error/30 rounded-lg">
                <p className="text-cursor-error text-sm">{errors.geral}</p>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-6 border-t border-cursor-border">
              <div className="flex flex-col space-y-2">
                <Link 
                  to="/login"
                  className="text-cursor-text-secondary hover:text-cursor-text-primary transition-colors"
                >
                  Já tem conta? Faça login
                </Link>
                <Link 
                  to="/" 
                  className="text-cursor-text-secondary hover:text-cursor-text-primary flex items-center gap-1 transition-colors text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Voltar para a página inicial
                </Link>
              </div>
              
              <button 
                type="submit" 
                className="btn-primary flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cadastrando...
                  </>
                ) : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}