import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaTachometerAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if current location is home page
  const isHomePage = location.pathname === '/';

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
    <nav className="bg-cursor-background-card border-b border-cursor-border py-3 px-4 md:px-6 relative z-50">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-bold text-xl text-cursor-text-primary">
            TalentBridge
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          {isAuthenticated ? (
            <>
              {/* Only show Home button if not on home page */}
              {!isHomePage && (
                <Link 
                  to="/" 
                  className="nav-link"
                >
                  <FaHome className="h-5 w-5" />
                  <span>Home</span>
                </Link>
              )}
                
              <Link 
                to={getDashboardPath()} 
                className="nav-link"
              >
                <FaTachometerAlt className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
                
              <Link 
                to="/perfil" 
                className="nav-link"
              >
                <FaUser className="h-5 w-5" />
                <span>Perfil</span>
              </Link>
                
              <button 
                onClick={logout}
                className="nav-link text-cursor-error"
              >
                <FaSignOutAlt className="h-5 w-5" />
                <span>Sair</span>
              </button>
            </>
          ) : (
            <>
              {/* Only show Home button if not on home page */}
              {!isHomePage && (
                <Link 
                  to="/" 
                  className="nav-link"
                >
                  <FaHome className="h-5 w-5" />
                  <span>Home</span>
                </Link>
              )}
                
              <Link 
                to="/login" 
                className="nav-link"
              >
                <FaSignInAlt className="h-5 w-5" />
                <span>Login</span>
              </Link>
                
              <Link 
                to="/cadastro" 
                className="btn-primary"
              >
                <FaUserPlus className="h-5 w-5" />
                <span>Cadastro</span>
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
            <FaTachometerAlt className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? 'fixed inset-0 bg-black bg-opacity-50 z-50' : 'hidden'}`} onClick={closeMenu}>
        <div className="absolute right-0 top-0 h-screen w-64 bg-cursor-background-card shadow-lg p-4" onClick={e => e.stopPropagation()}>
          <div className="flex flex-col space-y-4">
            {isAuthenticated ? (
              <>
                {/* Only show Home button if not on home page */}
                {!isHomePage && (
                  <Link 
                    to="/" 
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-cursor-text-secondary hover:text-cursor-text-primary hover:bg-cursor-background-card transition-colors duration-200"
                    onClick={closeMenu}
                  >
                    <FaHome className="h-5 w-5" />
                    Home
                  </Link>
                )}
                
                <Link 
                  to={getDashboardPath()} 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-cursor-text-secondary hover:text-cursor-text-primary hover:bg-cursor-background-card transition-colors duration-200"
                  onClick={closeMenu}
                >
                  <FaTachometerAlt className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link 
                  to="/perfil" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-cursor-text-secondary hover:text-cursor-text-primary hover:bg-cursor-background-card transition-colors duration-200"
                  onClick={closeMenu}
                >
                  <FaUser className="h-5 w-5" />
                  Perfil
                </Link>
                <button 
                  onClick={logout}
                  className="btn-primary w-full flex items-center gap-2 justify-center"
                >
                  <FaSignOutAlt className="h-5 w-5" />
                  Sair
                </button>
              </>
            ) : (
              <>
                {/* Only show Home button if not on home page */}
                {!isHomePage && (
                  <Link 
                    to="/" 
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-cursor-text-secondary hover:text-cursor-text-primary hover:bg-cursor-background-card transition-colors duration-200"
                    onClick={closeMenu}
                  >
                    <FaHome className="h-5 w-5" />
                    Home
                  </Link>
                )}
                
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
      </div>
    </nav>
  );
};

export default Navbar;