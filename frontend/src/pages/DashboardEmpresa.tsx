// src/pages/DashboardEmpresa.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Breadcrumbs from '../components/Breadcrumbs';
import { FaCopy, FaEnvelope, FaFilter, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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

interface Estudante {
  id: number;
  nome: string;
  email: string;
  media_geral: number;
  estabilidade_estresse: number;
  habilidades?: string[];
  planos_futuros?: string;
  criado_em?: string;
}

const DashboardEmpresa: React.FC = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<{ email: string; papel: string } | null>(null);
  const [estudantes, setEstudantes] = useState<Estudante[]>([]);
  const [filtroMedia, setFiltroMedia] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const userEmail = localStorage.getItem('email');
    if (userEmail) {
      setUsuario({ email: userEmail, papel: 'empresa' });
    }
  }, []);

  // Carregar estudantes
  useEffect(() => {
    setLoading(true);
    setErro('');
    console.log('Token:', token); // Debug token
    axios.get('http://localhost:5000/api/estudantes', {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json; charset=utf-8',
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
      .then(res => {
        console.log('Resposta da API:', res.data); // Debug resposta
        // Processa os dados para garantir codificação correta
        const estudantesProcessados = res.data.map((est: Estudante) => ({
          ...est,
          nome: decodeText(est.nome),
          planos_futuros: decodeText(est.planos_futuros),
          habilidades: est.habilidades ? est.habilidades.map(decodeText) : []
        }));
        setEstudantes(estudantesProcessados);
      })
      .catch((error) => {
        console.error('Erro detalhado:', error); // Debug erro
        setErro('Erro ao carregar estudantes');
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Filtrar estudantes
  const estudantesFiltrados = estudantes.filter(
    (estudante) => estudante.media_geral >= filtroMedia
  );

  const handleCopy = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success('E-mail copiado!');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-cursor-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', path: '/' },
            { label: 'Dashboard Empresa', path: '/empresa' }
          ]}
        />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">
            <span className="bg-gradient-to-r from-cursor-primary to-cursor-accent bg-clip-text text-transparent">
              Dashboard Empresa
            </span>
          </h1>
          
          {/* Filtros */}
          <div className="w-full md:w-auto bg-cursor-bg-light border border-cursor-border rounded-lg p-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FaFilter className="text-cursor-text-tertiary" />
              <span className="text-cursor-text-secondary text-sm whitespace-nowrap">Média Mínima:</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={filtroMedia}
              onChange={(e) => setFiltroMedia(Number(e.target.value))}
              className="w-24 accent-cursor-primary"
            />
            <span className="text-cursor-text-primary font-medium">{filtroMedia.toFixed(1)}</span>
          </div>
        </div>
        
        {/* Mensagem de erro */}
        {erro && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500">
            {erro}
          </div>
        )}
        
        {/* Loading */}
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {estudantesFiltrados.map((estudante) => (
              <div
                key={estudante.id}
                className="bg-cursor-bg-light border border-cursor-border hover:border-cursor-primary/50 transition-colors duration-300 rounded-xl p-5 animate-fade-in relative group shadow-cursor"
              >
                <h3 className="font-bold text-lg text-cursor-text-primary mb-2">{estudante.nome}</h3>
                
                <div className="flex items-center gap-2 mb-4">
                  <a
                    href={`mailto:${estudante.email}?subject=Oportunidade via TalentBridge`}
                    className="text-cursor-text-tertiary hover:text-cursor-primary transition-colors"
                    title="Enviar e-mail"
                  >
                    <FaEnvelope />
                  </a>
                  <span className="text-cursor-text-secondary text-sm flex-1 truncate">{estudante.email}</span>
                  <button
                    onClick={() => handleCopy(estudante.email)}
                    className="text-cursor-text-tertiary hover:text-cursor-primary transition-colors"
                    title="Copiar e-mail"
                  >
                    <FaCopy />
                  </button>
                </div>
                
                {/* Habilidades */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {Array.isArray(estudante.habilidades) && estudante.habilidades.map((hab, i) => (
                    <span key={i} className="bg-cursor-primary/10 text-cursor-primary text-xs px-2 py-1 rounded-full">{hab}</span>
                  ))}
                </div>
                
                {/* Métricas */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  {/* Média */}
                  <div className="bg-cursor-bg rounded-lg p-3 border border-cursor-border">
                    <p className="text-cursor-text-tertiary text-xs mb-1">Média Geral</p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-cursor-bg-lighter overflow-hidden flex-1">
                        <div 
                          className="h-full bg-gradient-to-r from-cursor-primary to-cursor-accent" 
                          style={{ width: `${(typeof estudante.media_geral === 'number' 
                            ? estudante.media_geral 
                            : typeof estudante.media_geral === 'string'
                              ? parseFloat(estudante.media_geral)
                              : 0) * 10}%` }}
                        ></div>
                      </div>
                      <span className="text-cursor-text-primary font-medium">
                        {typeof estudante.media_geral === 'number' 
                          ? estudante.media_geral.toFixed(1) 
                          : typeof estudante.media_geral === 'string'
                            ? parseFloat(estudante.media_geral).toFixed(1)
                            : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Estabilidade */}
                  <div className="bg-cursor-bg rounded-lg p-3 border border-cursor-border">
                    <p className="text-cursor-text-tertiary text-xs mb-1">Estabilidade</p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-cursor-bg-lighter overflow-hidden flex-1">
                        <div 
                          className="h-full bg-gradient-to-r from-cursor-primary to-cursor-accent" 
                          style={{ width: `${(typeof estudante.estabilidade_estresse === 'number' 
                            ? estudante.estabilidade_estresse 
                            : typeof estudante.estabilidade_estresse === 'string'
                              ? parseInt(estudante.estabilidade_estresse, 10)
                              : 0) / 5 * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-cursor-text-primary font-medium">
                        {typeof estudante.estabilidade_estresse === 'number' 
                          ? estudante.estabilidade_estresse 
                          : typeof estudante.estabilidade_estresse === 'string'
                            ? parseInt(estudante.estabilidade_estresse, 10)
                            : 'N/A'}/5
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Planos futuros */}
                {estudante.planos_futuros && (
                  <div className="mt-2">
                    <p className="text-cursor-text-tertiary text-xs mb-1">Planos Futuros</p>
                    <p className="text-cursor-text-secondary text-sm line-clamp-2" title={estudante.planos_futuros}>
                      {estudante.planos_futuros}
                    </p>
                  </div>
                )}
                
                {estudante.criado_em && (
                  <p className="text-cursor-text-tertiary text-xs mt-3">
                    Cadastrado em: {new Date(estudante.criado_em).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
            
            {estudantesFiltrados.length === 0 && !loading && (
              <div className="col-span-full py-12 text-center">
                <div className="bg-cursor-bg-light border border-cursor-border rounded-xl p-8 inline-block mx-auto">
                  <p className="text-cursor-text-secondary mb-2">Nenhum estudante encontrado com os filtros atuais.</p>
                  {filtroMedia > 0 && (
                    <button 
                      className="text-cursor-primary hover:underline text-sm"
                      onClick={() => setFiltroMedia(0)}
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardEmpresa;