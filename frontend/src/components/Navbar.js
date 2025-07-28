import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/navbar.css';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    navigate('/');
  };

  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <nav className="navbar">
      <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        IntelliHealth
      </h1>

      <div className="navbar-controls">
        <select onChange={handleLanguageChange} defaultValue={i18n.language || 'en'}>
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="mr">मराठी</option>
        </select>

        <button onClick={() => navigate('/')} className="nav-btn">
          {t('navbar.home')}
        </button>

        {!isLoggedIn && (
          <>
            <button onClick={() => navigate('/login')} className="nav-btn">
              {t('navbar.login')}
            </button>
            <button onClick={() => navigate('/signup')} className="nav-btn">
              {t('navbar.signup')}
            </button>
          </>
        )}

        {isLoggedIn && (
          <button onClick={handleLogout} className="logout-btn">
            {t('navbar.logout')}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
