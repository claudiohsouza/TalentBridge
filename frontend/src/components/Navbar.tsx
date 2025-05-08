import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaHome, FaSignInAlt, FaUserPlus, FaUserGraduate, FaPlus, FaCog, FaUserCircle, FaSignOutAlt, FaBars } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const linkClass = (path: string) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-cursor-background-light ${
      location.pathname === path ? 'text-cursor-primary font-medium' : 'text-cursor-text-secondary hover:text-cursor-text-primary'
    }`;

  const getDashboardPath = () => {
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
    <nav className="bg-cursor-background border-b border-cursor-border sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-cursor-primary to-cursor-secondary bg-clip-text text-transparent">
                TalentBridge
              </span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className={linkClass('/')}>
              <FaHome className="h-5 w-5" />
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to={getDashboardPath()} 
                  className={linkClass(getDashboardPath())}
                >
                  <FaUserGraduate className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link 
                  to="/perfil" 
                  className={linkClass('/perfil')}
                >
                  <FaUserCircle className="h-5 w-5" />
                  Perfil
                </Link>
                <button 
                  onClick={logout}
                  className="btn-primary ml-2 flex items-center gap-2"
                >
                  <FaSignOutAlt className="h-5 w-5" />
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={linkClass('/login')}
                >
                  <FaSignInAlt className="h-5 w-5" />
                  Login
                </Link>
                <Link 
                  to="/cadastro" 
                  className="btn-primary ml-2 flex items-center gap-2"
                >
                  <FaUserPlus className="h-5 w-5" />
                  Cadastro
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-cursor-text-secondary hover:text-cursor-text-primary hover:bg-cursor-background-light focus:outline-none transition-colors duration-200"
            >
              <FaBars className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden animate-slide-down">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-cursor-background-light border-t border-cursor-border">
            <Link 
              to="/" 
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-cursor-text-secondary hover:text-cursor-text-primary hover:bg-cursor-background-card transition-colors duration-200"
              onClick={closeMenu}
            >
              <FaHome className="h-5 w-5" />
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to={getDashboardPath()} 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-cursor-text-secondary hover:text-cursor-text-primary hover:bg-cursor-background-card transition-colors duration-200"
                  onClick={closeMenu}
                >
                  <FaUserGraduate className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link 
                  to="/perfil" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-cursor-text-secondary hover:text-cursor-text-primary hover:bg-cursor-background-card transition-colors duration-200"
                  onClick={closeMenu}
                >
                  <FaUserCircle className="h-5 w-5" />
                  Perfil
                </Link>
                <button 
                  onClick={() => {
                    closeMenu();
                    logout();
                  }}
                  className="btn-primary w-full flex items-center gap-2 justify-center"
                >
                  <FaSignOutAlt className="h-5 w-5" />
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-cursor-text-secondary hover:text-cursor-text-primary hover:bg-cursor-background-card transition-colors duration-200"
                  onClick={closeMenu}
                >
                  <FaSignInAlt className="h-5 w-5" />
                  Login
                </Link>
                <Link 
                  to="/cadastro" 
                  className="btn-primary w-full flex items-center gap-2 justify-center"
                  onClick={closeMenu}
                >
                  <FaUserPlus className="h-5 w-5" />
                  Cadastro
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;