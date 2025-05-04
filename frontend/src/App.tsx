import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
// Componentes
import Login from './pages/login';
import Cadastro from './pages/cadastro';
import DashboardInstituicao from './pages/DashboardInstituicao';
import DashboardEmpresa from './pages/DashboardEmpresa';
import Home from './pages/Home';
import Perfil from './pages/Perfil';
import AlterarSenhaPage from './pages/AlterarSenhaPage';
// Auth Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Componente para rotas protegidas que requerem autenticação
const ProtectedRoute = ({ children, allowedRole }: { children: JSX.Element, allowedRole?: string }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-cursor-bg">
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
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Se um papel específico é requerido e o usuário não tem esse papel
  if (allowedRole && user?.papel !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Componente para rotas públicas (acessíveis apenas quando não autenticado)
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-cursor-bg">
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
    return <Navigate to={user.papel === 'instituicao' ? '/instituicao' : '/empresa'} replace />;
  }
  
  return children;
};

const AppLayout = () => {
  const { user, logout, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-cursor-bg">
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

  return (
    <div className="flex flex-col min-h-screen bg-cursor-bg text-cursor-text-primary">
      <Navbar usuario={user} onLogout={logout} />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/cadastro" 
            element={
              <PublicRoute>
                <Cadastro />
              </PublicRoute>
            } 
          />
          <Route path="/perfil" element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          } />
          <Route path="/alterar-senha" element={
            <ProtectedRoute>
              <AlterarSenhaPage />
            </ProtectedRoute>
          } />
          <Route 
            path="/instituicao/*" 
            element={
              <ProtectedRoute allowedRole="instituicao">
                <Routes>
                  <Route path="/" element={<DashboardInstituicao />} />
                  <Route path="adicionar" element={<DashboardInstituicao />} />
                </Routes>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/empresa" 
            element={
              <ProtectedRoute allowedRole="empresa">
                <DashboardEmpresa />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;