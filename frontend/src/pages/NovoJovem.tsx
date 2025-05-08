import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jovemService } from '../services/api';
import { JovemInput } from '../types';

const NovoJovem: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{mensagem: string, tipo: 'success' | 'error'} | null>(null);
  
  // Estado do formulário
  const [formData, setFormData] = useState<JovemInput>({
    nome: '',
    email: '',
    idade: 0,
    formacao: '',
    curso: '',
    habilidades: [],
    interesses: [],
    planos_futuros: ''
  });
  
  // Habilidade e interesse temporários para adicionar aos arrays
  const [novaHabilidade, setNovaHabilidade] = useState<string>('');
  const [novoInteresse, setNovoInteresse] = useState<string>('');
  
  // Listas de opções predefinidas
  const habilidadesOpcoes = [
    "Comunicação oral e escrita",
    "Trabalho em equipe",
    "Liderança",
    "Organização",
    "Gestão de tempo",
    "Resolução de problemas",
    "Pensamento crítico",
    "Fluência em inglês",
    "Conhecimento em informática",
    "Excel avançado",
    "Programação",
    "Análise de dados",
    "Atendimento ao cliente",
    "Negociação",
    "Criatividade",
    "Adaptabilidade"
  ];
  
  const interessesOpcoes = [
    "Tecnologia",
    "Programação",
    "Inteligência Artificial",
    "Marketing Digital",
    "Empreendedorismo",
    "Saúde",
    "Educação",
    "Meio Ambiente",
    "Sustentabilidade",
    "Responsabilidade Social",
    "Finanças",
    "Artes",
    "Design",
    "Esportes",
    "Ciências",
    "Inovação"
  ];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Tratamento especial para o campo de idade (deve ser número)
    if (name === 'idade') {
      setFormData({
        ...formData,
        [name]: value ? parseInt(value) : 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const adicionarHabilidade = () => {
    if (novaHabilidade.trim() && !formData.habilidades?.includes(novaHabilidade.trim())) {
      setFormData({
        ...formData,
        habilidades: [...(formData.habilidades || []), novaHabilidade.trim()]
      });
      setNovaHabilidade('');
    }
  };
  
  const removerHabilidade = (index: number) => {
    setFormData({
      ...formData,
      habilidades: formData.habilidades?.filter((_, i) => i !== index)
    });
  };
  
  const adicionarInteresse = () => {
    if (novoInteresse.trim() && !formData.interesses?.includes(novoInteresse.trim())) {
      setFormData({
        ...formData,
        interesses: [...(formData.interesses || []), novoInteresse.trim()]
      });
      setNovoInteresse('');
    }
  };
  
  const removerInteresse = (index: number) => {
    setFormData({
      ...formData,
      interesses: formData.interesses?.filter((_, i) => i !== index)
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    
    try {
      // Validações
      if (!formData.nome.trim()) {
        throw new Error('O nome é obrigatório');
      }
      
      if (!formData.email.trim()) {
        throw new Error('O email é obrigatório');
      }
      
      if (!formData.idade || formData.idade < 14) {
        throw new Error('A idade deve ser maior que 14 anos');
      }
      
      // Enviar dados para a API
      const response = await jovemService.adicionarJovem(formData);
      
      setFeedback({
        mensagem: 'Jovem adicionado com sucesso!',
        tipo: 'success'
      });
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        if (user?.papel === 'instituicao_ensino') {
          navigate('/instituicao-ensino/jovens');
        } else if (user?.papel === 'chefe_empresa') {
          navigate('/chefe-empresa/jovens');
        }
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao adicionar jovem:', error);
      
      setFeedback({
        mensagem: error.response?.data?.message || error.message || 'Erro ao adicionar jovem',
        tipo: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Verificar se deve mostrar o campo de curso
  const mostrarCampoCurso = () => {
    const formacoesSuperiores = ['Graduação Completa', 'Pós-graduação', 'Mestrado', 'Doutorado'];
    return formacoesSuperiores.includes(formData.formacao || '');
  };
  
  return (
    <div className="min-h-screen bg-cursor-background py-8 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-cursor-text-primary">Adicionar Novo Jovem</h1>
          <p className="text-cursor-text-secondary mt-1">
            Preencha o formulário abaixo para adicionar um novo jovem
          </p>
        </div>
        
        {feedback && (
          <div className={`mb-6 p-4 rounded-lg ${feedback.tipo === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {feedback.mensagem}
          </div>
        )}
        
        <div className="card overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-cursor-text-secondary mb-1">
                  Nome completo *
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="input-field w-full"
                  required
                />
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
                  className="input-field w-full"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="idade" className="block text-sm font-medium text-cursor-text-secondary mb-1">
                  Idade *
                </label>
                <input
                  type="number"
                  id="idade"
                  name="idade"
                  value={formData.idade || ''}
                  onChange={handleChange}
                  min="14"
                  max="100"
                  className="input-field w-full"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="formacao" className="block text-sm font-medium text-cursor-text-secondary mb-1">
                  Formação
                </label>
                <select
                  id="formacao"
                  name="formacao"
                  value={formData.formacao || ''}
                  onChange={handleChange}
                  className="input-field w-full"
                >
                  <option value="">Selecione uma formação</option>
                  <option value="Ensino Fundamental">Ensino Fundamental</option>
                  <option value="Ensino Médio">Ensino Médio</option>
                  <option value="Ensino Médio Técnico">Ensino Médio Técnico</option>
                  <option value="Graduação Incompleta">Graduação Incompleta</option>
                  <option value="Graduação Completa">Graduação Completa</option>
                  <option value="Pós-graduação">Pós-graduação</option>
                  <option value="Mestrado">Mestrado</option>
                  <option value="Doutorado">Doutorado</option>
                </select>
              </div>
              
              {mostrarCampoCurso() && (
                <div>
                  <label htmlFor="curso" className="block text-sm font-medium text-cursor-text-secondary mb-1">
                    Curso
                  </label>
                  <select
                    id="curso"
                    name="curso"
                    value={formData.curso || ''}
                    onChange={handleChange}
                    className="input-field w-full"
                  >
                    <option value="">Selecione um curso</option>
                    <option value="Administração">Administração</option>
                    <option value="Arquitetura e Urbanismo">Arquitetura e Urbanismo</option>
                    <option value="Ciência da Computação">Ciência da Computação</option>
                    <option value="Ciências Contábeis">Ciências Contábeis</option>
                    <option value="Direito">Direito</option>
                    <option value="Educação Física">Educação Física</option>
                    <option value="Enfermagem">Enfermagem</option>
                    <option value="Engenharia Civil">Engenharia Civil</option>
                    <option value="Engenharia de Computação">Engenharia de Computação</option>
                    <option value="Engenharia de Software">Engenharia de Software</option>
                    <option value="Engenharia Elétrica">Engenharia Elétrica</option>
                    <option value="Engenharia Mecânica">Engenharia Mecânica</option>
                    <option value="Farmácia">Farmácia</option>
                    <option value="Fisioterapia">Fisioterapia</option>
                    <option value="Medicina">Medicina</option>
                    <option value="Nutrição">Nutrição</option>
                    <option value="Odontologia">Odontologia</option>
                    <option value="Pedagogia">Pedagogia</option>
                    <option value="Psicologia">Psicologia</option>
                    <option value="Publicidade e Propaganda">Publicidade e Propaganda</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-cursor-text-secondary mb-1">
                Habilidades
              </label>
              <div className="flex">
                <select
                  value={novaHabilidade}
                  onChange={(e) => setNovaHabilidade(e.target.value)}
                  className="input-field flex-grow"
                >
                  <option value="">Selecione uma habilidade</option>
                  {habilidadesOpcoes.map(habilidade => (
                    <option key={habilidade} value={habilidade}>{habilidade}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={adicionarHabilidade}
                  className="btn-secondary ml-2"
                >
                  Adicionar
                </button>
              </div>
              
              {formData.habilidades && formData.habilidades.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.habilidades.map((habilidade, index) => (
                    <div key={index} className="bg-cursor-background-light rounded-full px-3 py-1 flex items-center">
                      <span className="text-sm">{habilidade}</span>
                      <button
                        type="button"
                        onClick={() => removerHabilidade(index)}
                        className="ml-2 text-cursor-text-tertiary hover:text-cursor-error"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-cursor-text-secondary mb-1">
                Interesses
              </label>
              <div className="flex">
                <select
                  value={novoInteresse}
                  onChange={(e) => setNovoInteresse(e.target.value)}
                  className="input-field flex-grow"
                >
                  <option value="">Selecione um interesse</option>
                  {interessesOpcoes.map(interesse => (
                    <option key={interesse} value={interesse}>{interesse}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={adicionarInteresse}
                  className="btn-secondary ml-2"
                >
                  Adicionar
                </button>
              </div>
              
              {formData.interesses && formData.interesses.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.interesses.map((interesse, index) => (
                    <div key={index} className="bg-cursor-background-light rounded-full px-3 py-1 flex items-center">
                      <span className="text-sm">{interesse}</span>
                      <button
                        type="button"
                        onClick={() => removerInteresse(index)}
                        className="ml-2 text-cursor-text-tertiary hover:text-cursor-error"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="planos_futuros" className="block text-sm font-medium text-cursor-text-secondary mb-1">
                Planos para o futuro
              </label>
              <textarea
                id="planos_futuros"
                name="planos_futuros"
                value={formData.planos_futuros || ''}
                onChange={handleChange}
                rows={3}
                className="input-field w-full"
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  if (user?.papel === 'instituicao_ensino') {
                    navigate('/instituicao-ensino/jovens');
                  } else if (user?.papel === 'chefe_empresa') {
                    navigate('/chefe-empresa/jovens');
                  }
                }}
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
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Salvando...
                  </div>
                ) : 'Salvar jovem'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NovoJovem; 