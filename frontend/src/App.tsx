import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
// Componentes
import Login from './pages/login';
import Cadastro from './pages/cadastro';
import DashboardInstituicaoEnsino from './pages/DashboardInstituicaoEnsino';
import DashboardChefeEmpresa from './pages/DashboardChefeEmpresa';
import DashboardInstituicaoContratante from './pages/DashboardInstituicaoContratante';
import Home from './pages/Home';
import Perfil from './pages/Perfil';
import AlterarSenhaPage from './pages/AlterarSenhaPage';
import JovensList from './pages/JovensList';
import JovemDetails from './pages/JovemDetails';
import OportunidadesList from './pages/OportunidadesList';
import OportunidadeDetails from './pages/OportunidadeDetails';
import NovaOportunidade from './pages/NovaOportunidade';
import NovoJovem from './pages/NovoJovem';
// Auth Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Definição dos tipos de papel para autenticação
import { UserRole } from './types';

// Componente para rotas protegidas (requer autenticação)
type ProtectedRouteProps = {
  children: JSX.Element;
  allowedRole?: UserRole;
};

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-cursor-background">
      <div className="flex flex-col items-center">
        <div className="h-16 w-16 rounded-full bg-cursor-primary/20 flex items-center justify-center mb-4">
          <svg className="animate-spin h-8 w-8 text-cursor-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <div className="text-cursor-text-secondary">Carregando...</div>
      </div>
    </div>;
  }
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (allowedRole) {
    const allowedRoles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
    if (user?.papel && !allowedRoles.includes(user.papel)) {
      // Redirecionamento baseado no papel atual do usuário
      if (user.papel === 'instituicao_ensino') {
        return <Navigate to="/instituicao-ensino" replace />;
      } else if (user.papel === 'chefe_empresa') {
        return <Navigate to="/chefe-empresa" replace />;
      } else if (user.papel === 'instituicao_contratante') {
        return <Navigate to="/instituicao-contratante" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }
  }
  
  return children;
};

// Componente para rotas públicas (acessíveis apenas quando não autenticado)
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-cursor-background">
      <div className="flex flex-col items-center">
        <div className="h-16 w-16 rounded-full bg-cursor-primary/20 flex items-center justify-center mb-4">
          <svg className="animate-spin h-8 w-8 text-cursor-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <div className="text-cursor-text-secondary">Carregando...</div>
      </div>
    </div>;
  }
  
  if (isAuthenticated && user) {
    // Redirecionar para o dashboard apropriado com base no papel
    if (user.papel === 'instituicao_ensino') {
      return <Navigate to="/instituicao-ensino" replace />;
    } else if (user.papel === 'chefe_empresa') {
      return <Navigate to="/chefe-empresa" replace />;
    } else if (user.papel === 'instituicao_contratante') {
      return <Navigate to="/instituicao-contratante" replace />;
    }
  }
  
  return children;
};

const AppLayout = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Páginas onde o Navbar não deve ser exibido
  const noNavbarRoutes = ['/login', '/cadastro'];
  const shouldShowNavbar = !noNavbarRoutes.includes(location.pathname);
  
  return (
    <div className="flex flex-col min-h-screen bg-cursor-background">
      {shouldShowNavbar && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/cadastro" element={<PublicRoute><Cadastro /></PublicRoute>} />
          
          <Route 
            path="/perfil" 
            element={<ProtectedRoute><Perfil /></ProtectedRoute>} 
          />
          
          <Route 
            path="/alterar-senha" 
            element={<ProtectedRoute><AlterarSenhaPage /></ProtectedRoute>} 
          />
          
          {/* Rotas para Instituição de Ensino */}
          <Route 
            path="/instituicao-ensino/*" 
            element={
              <ProtectedRoute allowedRole="instituicao_ensino">
                <Routes>
                  <Route path="/" element={<DashboardInstituicaoEnsino />} />
                  <Route path="jovens" element={<JovensList />} />
                  <Route path="jovens/novo" element={<NovoJovem />} />
                  <Route path="jovens/:id" element={<JovemDetails />} />
                  <Route path="oportunidades" element={<OportunidadesList />} />
                  <Route path="oportunidades/:id" element={<OportunidadeDetails />} />
                </Routes>
              </ProtectedRoute>
            }
          />
          
          {/* Rotas para Chefe de Empresa */}
          <Route 
            path="/chefe-empresa/*" 
            element={
              <ProtectedRoute allowedRole="chefe_empresa">
                <Routes>
                  <Route path="/" element={<DashboardChefeEmpresa />} />
                  <Route path="jovens" element={<JovensList />} />
                  <Route path="jovens/novo" element={<NovoJovem />} />
                  <Route path="jovens/:id" element={<JovemDetails />} />
                  <Route path="oportunidades" element={<OportunidadesList />} />
                  <Route path="oportunidades/:id" element={<OportunidadeDetails />} />
                </Routes>
              </ProtectedRoute>
            }
          />
          
          {/* Rotas para Instituição Contratante */}
          <Route 
            path="/instituicao-contratante/*" 
            element={
              <ProtectedRoute allowedRole="instituicao_contratante">
                <Routes>
                  <Route path="/" element={<DashboardInstituicaoContratante />} />
                  <Route path="jovens" element={<JovensList />} />
                  <Route path="jovens/:id" element={<JovemDetails />} />
                  <Route path="oportunidades" element={<OportunidadesList />} />
                  <Route path="oportunidades/nova" element={<NovaOportunidade />} />
                  <Route path="oportunidades/:id" element={<OportunidadeDetails />} />
                </Routes>
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;