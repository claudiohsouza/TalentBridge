import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  const getUserDashboardPath = () => {
    if (!user) return '/';
    
    switch (user.papel) {
      case 'instituicao_ensino':
        return '/instituicao-ensino';
      case 'chefe_empresa':
        return '/chefe-empresa';
      case 'instituicao_contratante':
        return '/instituicao-contratante';
      default:
        return '/';
    }
  };

  return (
    <div className="bg-cursor-background min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 py-24 md:py-32">
        {/* Gradient Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-[10%] opacity-30">
            <div className="absolute top-0 left-[10%] w-[50%] h-[50%] bg-cursor-primary rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 right-[20%] w-[40%] h-[40%] bg-cursor-secondary rounded-full blur-[100px]"></div>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-cursor-primary to-cursor-secondary bg-clip-text text-transparent">
                TalentBridge
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-cursor-text-secondary max-w-2xl mx-auto mb-10">
              Conectando jovens talentosos com as melhores oportunidades no mercado de trabalho.
            </p>
            
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link 
                  to="/login" 
                  className="btn-primary px-8 py-3 text-lg"
                >
                  Login
                </Link>
                <Link 
                  to="/cadastro" 
                  className="btn-secondary px-8 py-3 text-lg"
                >
                  Cadastro
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link 
                  to={getUserDashboardPath()} 
                  className="btn-primary px-8 py-3 text-lg"
                >
                  Acessar Dashboard
                </Link>
                <Link 
                  to="/perfil" 
                  className="btn-secondary px-8 py-3 text-lg"
                >
                  Meu Perfil
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-cursor-background-light py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-cursor-primary to-cursor-secondary bg-clip-text text-transparent">
              Como funciona
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="card p-6 hover:border-cursor-primary transition-colors duration-300">
              <div className="h-12 w-12 rounded-full bg-cursor-primary/20 flex items-center justify-center mb-4">
                <span className="text-cursor-primary text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-cursor-text-primary">Instituições e Empresas</h3>
              <p className="text-cursor-text-secondary">
                Cadastre jovens e destaque seus talentos para instituições contratantes.
              </p>
            </div>
            
            {/* Card 2 */}
            <div className="card p-6 hover:border-cursor-primary transition-colors duration-300">
              <div className="h-12 w-12 rounded-full bg-cursor-primary/20 flex items-center justify-center mb-4">
                <span className="text-cursor-primary text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-cursor-text-primary">Jovens</h3>
              <p className="text-cursor-text-secondary">
                Tenha seu perfil destacado com suas habilidades, interesses e histórico.
              </p>
            </div>
            
            {/* Card 3 */}
            <div className="card p-6 hover:border-cursor-primary transition-colors duration-300">
              <div className="h-12 w-12 rounded-full bg-cursor-primary/20 flex items-center justify-center mb-4">
                <span className="text-cursor-primary text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-cursor-text-primary">Instituições Contratantes</h3>
              <p className="text-cursor-text-secondary">
                Encontre talentos recomendados que combinam com as suas oportunidades.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-cursor-background border-t border-cursor-border py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-cursor-text-tertiary">
            © {new Date().getFullYear()} TalentBridge. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}