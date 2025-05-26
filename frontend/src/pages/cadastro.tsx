import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { opcoesService } from '../services/opcoes';
import { UserRole, RegisterRequest } from '../types';
import { Checkbox, CheckboxGroup } from '@chakra-ui/react';

// Lista de estados brasileiros
const estados = [
  { id: 1, sigla: 'AC', nome: 'Acre' },
  { id: 2, sigla: 'AL', nome: 'Alagoas' },
  { id: 3, sigla: 'AP', nome: 'Amapá' },
  { id: 4, sigla: 'AM', nome: 'Amazonas' },
  { id: 5, sigla: 'BA', nome: 'Bahia' },
  { id: 6, sigla: 'CE', nome: 'Ceará' },
  { id: 7, sigla: 'DF', nome: 'Distrito Federal' },
  { id: 8, sigla: 'ES', nome: 'Espírito Santo' },
  { id: 9, sigla: 'GO', nome: 'Goiás' },
  { id: 10, sigla: 'MA', nome: 'Maranhão' },
  { id: 11, sigla: 'MT', nome: 'Mato Grosso' },
  { id: 12, sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { id: 13, sigla: 'MG', nome: 'Minas Gerais' },
  { id: 14, sigla: 'PA', nome: 'Pará' },
  { id: 15, sigla: 'PB', nome: 'Paraíba' },
  { id: 16, sigla: 'PR', nome: 'Paraná' },
  { id: 17, sigla: 'PE', nome: 'Pernambuco' },
  { id: 18, sigla: 'PI', nome: 'Piauí' },
  { id: 19, sigla: 'RJ', nome: 'Rio de Janeiro' },
  { id: 20, sigla: 'RN', nome: 'Rio Grande do Norte' },
  { id: 21, sigla: 'RS', nome: 'Rio Grande do Sul' },
  { id: 22, sigla: 'RO', nome: 'Rondônia' },
  { id: 23, sigla: 'RR', nome: 'Roraima' },
  { id: 24, sigla: 'SC', nome: 'Santa Catarina' },
  { id: 25, sigla: 'SP', nome: 'São Paulo' },
  { id: 26, sigla: 'SE', nome: 'Sergipe' },
  { id: 27, sigla: 'TO', nome: 'Tocantins' }
];

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

const opcoesEnsino = [
  "Tecnologia da Informação",
  "Engenharia de Software",
  "Ciência da Computação",
  "Análise de Dados",
  "Engenharia Mecânica",
  "Engenharia Elétrica",
  "Engenharia Civil",
  "Administração",
  "Marketing Digital",
  "Design",
  "Medicina",
  "Enfermagem",
  "Psicologia",
  "Direito",
  "Contabilidade",
  "Recursos Humanos",
  "Comunicação",
  "Gestão de Projetos",
  "Economia",
  "Arquitetura"
];

const opcoesAtuacao = [
  "Tecnologia da Informação",
  "Desenvolvimento de Software",
  "Análise de Dados",
  "Marketing Digital",
  "Recursos Humanos",
  "Administração",
  "Finanças",
  "Contabilidade",
  "Design",
  "Vendas",
  "Atendimento ao Cliente",
  "Engenharia",
  "Produção",
  "Logística",
  "Saúde",
  "Educação",
  "Comunicação",
  "Gestão de Projetos",
  "Consultoria",
  "Pesquisa e Desenvolvimento"
];

const tiposInstituicaoPreSet = [
  "ONG",
  "Fundação",
  "Associação",
  "Instituto",
  "Órgão Público",
  "Outra"
];

const tiposInstituicaoEnsinoPreSet = [
  "Universidade Pública",
  "Universidade Privada",
  "Instituto Técnico",
  "Escola Técnica",
  "Escola de Ensino Médio",
  "Outra"
];

const setoresEmpresaPreSet = [
  "Tecnologia",
  "Manufatura",
  "Serviços",
  "Comércio",
  "Educação",
  "Saúde",
  "Outro"
];

const portesEmpresaPreSet = [
  "Micro",
  "Pequeno",
  "Médio",
  "Grande"
];

const programasSociaisPreSet = [
  "Programa Jovem Aprendiz",
  "Programa de Estágio",
  "Programa de Trainee",
  "Primeiro Emprego",
  "Capacitação Profissional",
  "Mentoria",
  "Inclusão Digital",
  "Inclusão Social",
  "Diversidade e Inclusão",
  "Empreendedorismo Social",
  "Educação Profissional",
  "Desenvolvimento de Lideranças",
  "Formação Técnica",
  "Apoio Educacional",
  "Orientação Profissional"
];

const areasInteressePreSet = [
  "Tecnologia da Informação",
  "Desenvolvimento de Software",
  "Engenharia",
  "Saúde",
  "Educação",
  "Administração e Negócios",
  "Marketing e Comunicação",
  "Design e Criatividade",
  "Finanças e Contabilidade",
  "Recursos Humanos",
  "Produção e Logística",
  "Pesquisa e Desenvolvimento",
  "Sustentabilidade",
  "Inovação Social",
  "Empreendedorismo"
];

const faixasAlunos = [
  { label: 'Até 100', value: '100' },
  { label: '101 a 500', value: '500' },
  { label: '501 a 1.000', value: '1000' },
  { label: '1.001 a 5.000', value: '5000' },
  { label: '5.001 a 10.000', value: '10000' },
  { label: 'Mais de 10.000', value: '10001' }
];

const areasInteresseCategorizadas = {
  'Tecnologia e Educação': [
    'Tecnologia e Inovação',
    'Educação e Capacitação',
    'Inclusão Digital',
    'Pesquisa e Desenvolvimento'
  ],
  'Desenvolvimento e Impacto Social': [
    'Desenvolvimento Social',
    'Cidadania e Direitos Humanos',
    'Responsabilidade Social',
    'Diversidade e Inclusão',
    'Inovação Social'
  ],
  'Carreira e Profissional': [
    'Empreendedorismo',
    'Liderança e Gestão',
    'Empregabilidade',
    'Desenvolvimento Profissional'
  ],
  'Cultura e Bem-estar': [
    'Cultura e Arte',
    'Esporte e Lazer',
    'Saúde e Bem-estar',
    'Economia Criativa'
  ],
  'Sustentabilidade': [
    'Sustentabilidade',
    'Meio Ambiente',
    'Voluntariado'
  ]
};

const programasSociaisCategorizados = {
  'Programas de Entrada': [
    'Programa Jovem Aprendiz',
    'Programa de Estágio',
    'Primeiro Emprego',
    'Programa de Trainee'
  ],
  'Desenvolvimento Profissional': [
    'Mentoria Profissional',
    'Capacitação Técnica',
    'Formação Profissional',
    'Desenvolvimento de Soft Skills'
  ],
  'Educação e Orientação': [
    'Educação Financeira',
    'Orientação Vocacional',
    'Apoio Educacional',
    'Programa de Bolsas'
  ],
  'Empreendedorismo e Liderança': [
    'Empreendedorismo Jovem',
    'Desenvolvimento de Lideranças',
    'Incubadora de Projetos',
    'Aceleração de Carreiras'
  ],
  'Inclusão e Diversidade': [
    'Inclusão Digital',
    'Inclusão Social',
    'Programa de Voluntariado',
    'Programa de Diversidade'
  ]
};

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

  // Estados para opções carregadas do backend
  const [tiposInstituicao, setTiposInstituicao] = useState<string[]>(tiposInstituicaoPreSet);
  const [tiposInstituicaoEnsino, setTiposInstituicaoEnsino] = useState<string[]>(tiposInstituicaoEnsinoPreSet);
  const [setoresEmpresa, setSetoresEmpresa] = useState<string[]>(setoresEmpresaPreSet);
  const [portesEmpresa, setPortesEmpresa] = useState<string[]>(portesEmpresaPreSet);
  const [areasInteresse, setAreasInteresse] = useState<string[]>(areasInteressePreSet);
  const [programasSociais, setProgramasSociais] = useState<string[]>(programasSociaisPreSet);
  const [areasEnsino, setAreasEnsino] = useState<string[]>(opcoesEnsino);
  const [areasAtuacao, setAreasAtuacao] = useState<string[]>(opcoesAtuacao);
  const [loadingOpcoes, setLoadingOpcoes] = useState(false);

  // Dentro do componente, atualize o estado para incluir as categorias expandidas
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});

  // Função para alternar a expansão de uma categoria
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Não é mais necessário carregar opções do backend pois estamos usando valores pre-set

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
  const handleArrayChange = (name: string, value: string | string[]) => {
    let items: string[] = [];
    if (Array.isArray(value)) {
      // Se for áreas de interesse, limitar a 4 opções
      if (name === 'areas_interesse' && value.length > 4) {
        return; // Não permite mais que 4 seleções
      }
      items = value;
    } else {
      items = value
        .split(/,|\n/)
        .map(item => item.trim())
        .filter(item => item !== '');
    }
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
              <label className="block text-cursor-text-tertiary text-sm mb-1">Tipo de Instituição*</label>
              <select
                name="tipo"
                className="w-full p-3 rounded-lg bg-[#1a1a1a] text-white border border-[#333] focus:border-cursor-primary focus:outline-none"
                value={formData.tipo}
                onChange={handleChange}
                required
              >
                <option value="">Selecione o tipo</option>
                {tiposInstituicaoEnsino.map(tipo => (
                  <option key={tipo} value={tipo} className="text-white bg-[#1a1a1a]">{tipo}</option>
                ))}
              </select>
              {errors.tipo && <p className="text-red-500 text-sm mt-1">{errors.tipo}</p>}
            </div>
            <div>
              <label className="block text-cursor-text-tertiary text-sm mb-1">Faixa de Número de Alunos*</label>
              <select
                name="qtd_alunos"
                className="w-full p-3 rounded-lg bg-[#1a1a1a] text-white border border-[#333] focus:border-cursor-primary focus:outline-none"
                value={formData.qtd_alunos || ''}
                onChange={handleChange}
                required
              >
                <option value="">Selecione a faixa</option>
                {faixasAlunos.map(faixa => (
                  <option key={faixa.value} value={faixa.value} className="text-white bg-[#1a1a1a]">{faixa.label}</option>
                ))}
              </select>
              {errors.qtd_alunos && <p className="text-red-500 text-sm mt-1">{errors.qtd_alunos}</p>}
            </div>
            <div>
              <label className="block text-cursor-text-tertiary text-sm mb-1">Áreas de Ensino*</label>
              <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#333]">
                {loadingOpcoes ? (
                  <p className="text-cursor-text-secondary">Carregando opções...</p>
                ) : (
                  <CheckboxGroup
                    colorScheme="blue"
                    value={formData.areas_ensino || []}
                    onChange={(val) => handleArrayChange('areas_ensino', val as string[])}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {areasEnsino.length > 0 ? (
                        areasEnsino.map((opcao) => (
                          <Checkbox 
                            key={`ensino_${opcao}`} 
                            value={opcao}
                            className="text-white"
                          >
                            {opcao}
                          </Checkbox>
                        ))
                      ) : (
                        <p className="text-cursor-text-secondary">Nenhuma área de ensino disponível</p>
                      )}
                    </div>
                  </CheckboxGroup>
                )}
              </div>
              {errors.areas_ensino && <p className="text-red-500 text-sm mt-1">{errors.areas_ensino}</p>}
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
                className="w-full p-3 rounded-lg bg-[#1a1a1a] text-white border border-[#333] focus:border-cursor-primary focus:outline-none"
                value={formData.setor}
                onChange={handleChange}
                required
              >
                <option value="">Selecione o setor</option>
                {setoresEmpresa.map(setor => (
                  <option key={setor} value={setor} className="text-white bg-[#1a1a1a]">{setor}</option>
                ))}
              </select>
              {errors.setor && <p className="text-red-500 text-sm mt-1">{errors.setor}</p>}
            </div>
            <div>
              <label className="block text-cursor-text-tertiary text-sm mb-1">Porte da Empresa*</label>
              <select
                name="porte"
                className="w-full p-3 rounded-lg bg-[#1a1a1a] text-white border border-[#333] focus:border-cursor-primary focus:outline-none"
                value={formData.porte}
                onChange={handleChange}
                required
              >
                <option value="">Selecione o porte</option>
                {portesEmpresa.map(porte => (
                  <option key={porte} value={porte} className="text-white bg-[#1a1a1a]">{porte}</option>
                ))}
              </select>
              {errors.porte && <p className="text-red-500 text-sm mt-1">{errors.porte}</p>}
            </div>
            <div>
              <label className="block text-cursor-text-tertiary text-sm mb-1">Áreas de Atuação*</label>
              <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#333] focus:border-cursor-primary focus:outline-none">
                {loadingOpcoes ? (
                  <p className="text-cursor-text-secondary">Carregando opções...</p>
                ) : (
                  <CheckboxGroup
                    colorScheme="blue"
                    value={formData.areas_atuacao || []}
                    onChange={(val) => handleArrayChange('areas_atuacao', val as string[])}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {areasAtuacao.length > 0 ? (
                        areasAtuacao.map((opcao) => (
                          <Checkbox 
                            key={`atuacao_${opcao}`} 
                            value={opcao}
                            className="text-white"
                          >
                            {opcao}
                          </Checkbox>
                        ))
                      ) : (
                        <p className="text-cursor-text-secondary">Nenhuma área de atuação disponível</p>
                      )}
                    </div>
                  </CheckboxGroup>
                )}
              </div>
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
                className="w-full p-3 rounded-lg bg-[#1a1a1a] text-white border border-[#333] focus:border-cursor-primary focus:outline-none"
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
              <label className="block text-cursor-text-tertiary text-sm mb-1">Áreas de Interesse* (máximo 4)</label>
              <div className="p-3 rounded-lg bg-cursor-bg border border-cursor-border">
                <CheckboxGroup
                  colorScheme="blue"
                  value={formData.areas_interesse || []}
                  onChange={(val) => handleArrayChange('areas_interesse', val as string[])}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {areasInteresse.map((area) => (
                      <Checkbox 
                        key={`interesse_${area}`} 
                        value={area}
                        isDisabled={(formData.areas_interesse?.length || 0) >= 4 && !formData.areas_interesse?.includes(area)}
                      >
                        {area}
                      </Checkbox>
                    ))}
                  </div>
                </CheckboxGroup>
              </div>
              {(formData.areas_interesse?.length || 0) >= 4 && (
                <p className="text-yellow-500 text-sm mt-1">Limite máximo de 4 áreas atingido</p>
              )}
              {errors.areas_interesse && <p className="text-red-500 text-sm mt-1">{errors.areas_interesse}</p>}
            </div>
            <div>
              <label className="block text-cursor-text-tertiary text-sm mb-1">Programas Sociais*</label>
              <div className="p-3 rounded-lg bg-cursor-bg border border-cursor-border">
                <CheckboxGroup
                  colorScheme="blue"
                  value={formData.programas_sociais || []}
                  onChange={(val) => handleArrayChange('programas_sociais', val as string[])}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {programasSociais.map((programa) => (
                      <Checkbox 
                        key={`programa_${programa}`} 
                        value={programa}
                      >
                        {programa}
                      </Checkbox>
                    ))}
                  </div>
                </CheckboxGroup>
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
                    Estado
                  </label>
                  <select
                    name="localizacao"
                    value={formData.localizacao}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Selecione um estado</option>
                    {estados.map(estado => (
                      <option key={estado.id} value={estado.sigla}>
                        {estado.nome} ({estado.sigla})
                      </option>
                    ))}
                  </select>
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
                      <select
                        name="tipo"
                        className="w-full p-3 rounded-lg bg-[#1a1a1a] text-white border border-[#333] focus:border-cursor-primary focus:outline-none"
                        value={formData.tipo}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecione o tipo</option>
                        {tiposInstituicaoEnsino.map(tipo => (
                          <option key={tipo} value={tipo} className="text-white bg-[#1a1a1a]">{tipo}</option>
                        ))}
                      </select>
                      {errors.tipo && <p className="text-red-500 text-sm mt-1">{errors.tipo}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                        Faixa de Número de Alunos
                      </label>
                      <select
                        name="qtd_alunos"
                        className="w-full p-3 rounded-lg bg-[#1a1a1a] text-white border border-[#333] focus:border-cursor-primary focus:outline-none"
                        value={formData.qtd_alunos || ''}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecione a faixa</option>
                        {faixasAlunos.map(faixa => (
                          <option key={faixa.value} value={faixa.value} className="text-white bg-[#1a1a1a]">{faixa.label}</option>
                        ))}
                      </select>
                      {errors.qtd_alunos && <p className="text-red-500 text-sm mt-1">{errors.qtd_alunos}</p>}
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                        Áreas de Ensino
                      </label>
                      <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#333]">
                        {loadingOpcoes ? (
                          <p className="text-cursor-text-secondary">Carregando opções...</p>
                        ) : (
                          <CheckboxGroup
                            colorScheme="blue"
                            value={formData.areas_ensino || []}
                            onChange={(val) => handleArrayChange('areas_ensino', val as string[])}
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {areasEnsino.length > 0 ? (
                                areasEnsino.map((opcao) => (
                                  <Checkbox 
                                    key={`ensino_${opcao}`} 
                                    value={opcao}
                                    className="text-white"
                                  >
                                    {opcao}
                                  </Checkbox>
                                ))
                              ) : (
                                <p className="text-cursor-text-secondary">Nenhuma área de ensino disponível</p>
                              )}
                            </div>
                          </CheckboxGroup>
                        )}
                      </div>
                      {errors.areas_ensino && <p className="text-red-500 text-sm mt-1">{errors.areas_ensino}</p>}
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
                      <select
                        name="setor"
                        className="w-full p-3 rounded-lg bg-[#1a1a1a] text-white border border-[#333] focus:border-cursor-primary focus:outline-none"
                        value={formData.setor}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecione o setor</option>
                        {setoresEmpresa.map(setor => (
                          <option key={setor} value={setor} className="text-white bg-[#1a1a1a]">{setor}</option>
                        ))}
                      </select>
                      {errors.setor && <p className="text-red-500 text-sm mt-1">{errors.setor}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                        Porte da Empresa
                      </label>
                      <select
                        name="porte"
                        className="w-full p-3 rounded-lg bg-[#1a1a1a] text-white border border-[#333] focus:border-cursor-primary focus:outline-none"
                        value={formData.porte}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecione o porte</option>
                        {portesEmpresa.map(porte => (
                          <option key={porte} value={porte} className="text-white bg-[#1a1a1a]">{porte}</option>
                        ))}
                      </select>
                      {errors.porte && <p className="text-red-500 text-sm mt-1">{errors.porte}</p>}
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                        Áreas de Atuação
                      </label>
                      <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#333] focus:border-cursor-primary focus:outline-none">
                        {loadingOpcoes ? (
                          <p className="text-cursor-text-secondary">Carregando opções...</p>
                        ) : (
                          <CheckboxGroup
                            colorScheme="blue"
                            value={formData.areas_atuacao || []}
                            onChange={(val) => handleArrayChange('areas_atuacao', val as string[])}
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {areasAtuacao.length > 0 ? (
                                areasAtuacao.map((opcao) => (
                                  <Checkbox 
                                    key={`atuacao_${opcao}`} 
                                    value={opcao}
                                    className="text-white"
                                  >
                                    {opcao}
                                  </Checkbox>
                                ))
                              ) : (
                                <p className="text-cursor-text-secondary">Nenhuma área de atuação disponível</p>
                              )}
                            </div>
                          </CheckboxGroup>
                        )}
                      </div>
                      {errors.areas_atuacao && <p className="text-red-500 text-sm mt-1">{errors.areas_atuacao}</p>}
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
                        className="w-full p-3 rounded-lg bg-[#1a1a1a] text-white border border-[#333] focus:border-cursor-primary focus:outline-none"
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
                        Áreas de Interesse* (máximo 4)
                      </label>
                      <div className="p-3 rounded-lg bg-cursor-bg border border-cursor-border">
                        <CheckboxGroup
                          colorScheme="blue"
                          value={formData.areas_interesse || []}
                          onChange={(val) => handleArrayChange('areas_interesse', val as string[])}
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {areasInteresse.map((area) => (
                              <Checkbox 
                                key={`interesse_${area}`} 
                                value={area}
                                isDisabled={(formData.areas_interesse?.length || 0) >= 4 && !formData.areas_interesse?.includes(area)}
                              >
                                {area}
                              </Checkbox>
                            ))}
                          </div>
                        </CheckboxGroup>
                      </div>
                      {(formData.areas_interesse?.length || 0) >= 4 && (
                        <p className="text-yellow-500 text-sm mt-1">Limite máximo de 4 áreas atingido</p>
                      )}
                      {errors.areas_interesse && <p className="text-red-500 text-sm mt-1">{errors.areas_interesse}</p>}
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-cursor-text-secondary mb-2">
                        Programas Sociais
                      </label>
                      <div className="p-3 rounded-lg bg-cursor-bg border border-cursor-border">
                        <CheckboxGroup
                          colorScheme="blue"
                          value={formData.programas_sociais || []}
                          onChange={(val) => handleArrayChange('programas_sociais', val as string[])}
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {programasSociais.map((programa) => (
                              <Checkbox 
                                key={`programa_${programa}`} 
                                value={programa}
                              >
                                {programa}
                              </Checkbox>
                            ))}
                          </div>
                        </CheckboxGroup>
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