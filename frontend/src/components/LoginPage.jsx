import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './LoginPage.css';
import { getApiBaseCandidates, isApiBaseLocked } from '../config/api';
import VideoCarousel from './HomeScreen';

export default function LoginPage({ onLogin }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Signup form state
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [guestType, setGuestType] = useState('Talent Relative');

  const safeParseJson = async (response) => {
    const text = await response.text();
    if (!text) {
      return null;
    }
    try {
      return JSON.parse(text);
    } catch (parseError) {
      return null;
    }
  };

  const credentials = [
    { label: 'Staff', email: 'staff@eternelles.com', password: 'staff123' },
    { label: 'Talent', email: 'talent@eternelles.com', password: 'talent123' },
    { label: 'Guest', email: 'guest@eternelles.com', password: 'guest123' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const candidates = getApiBaseCandidates();
      let response;
      let data;
      let lastError;
        let selectedBase;

      for (const base of candidates) {
        try {
          response = await fetch(`${base}/v1/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              password,
            }),
          });

          data = await safeParseJson(response);

          if (response.ok && data) {
            lastError = null;
            selectedBase = base;
            break;
          }

          lastError = new Error(data?.detail || t('errors.invalidCredentials'));
        } catch (fetchError) {
          lastError = fetchError;
        }
      }

      if (lastError) {
        throw lastError;
      }
      if (selectedBase && !isApiBaseLocked()) {
        localStorage.setItem('api_base', selectedBase);
      }
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      onLogin({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.full_name,
        role: data.user.role,
        subscription_tier: data.user.subscription_tier,
      });
    } catch (err) {
      const messageText = err?.message || '';
      const isNetworkError = messageText.toLowerCase().includes('failed to fetch')
        || messageText.toLowerCase().includes('networkerror');
      const message = isNetworkError
        ? t('errors.networkError')
        : messageText || t('errors.loginFailed');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const candidates = getApiBaseCandidates();
      let response;
      let data;
      let lastError;
        let selectedBase;

      for (const base of candidates) {
        try {
          response = await fetch(`${base}/v1/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: 'demo@kcd-agency.com',
              password: 'demo123',
            }),
          });

          data = await safeParseJson(response);

          if (response.ok && data) {
            lastError = null;
            selectedBase = base;
            break;
          }

          lastError = new Error(data?.detail || t('errors.invalidCredentials'));
        } catch (fetchError) {
          lastError = fetchError;
        }
      }

      if (lastError) {
        throw lastError;
      }
      if (selectedBase && !isApiBaseLocked()) {
        localStorage.setItem('api_base', selectedBase);
      }
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      onLogin({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.full_name,
        role: data.user.role,
        subscription_tier: data.user.subscription_tier,
      });
    } catch (err) {
      const messageText = err?.message || '';
      const message = messageText || t('errors.loginFailed');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="gradient-bg-login"></div>
        <div className="animated-bg-login"></div>
      </div>
      <div className="login-content">
        <div className="login-box">
          <div className="login-header">
            <h1 className="login-logo">ETERNELLES</h1>
            <p className="login-tagline">Accédez à l'evenement</p>
          </div>
          <div className="login-tabs">
            <button className={tab === 'signup' ? 'active' : ''} onClick={() => setTab('signup')}>S'INSCRIRE</button>
            <button className={tab === 'login' ? 'active' : ''} onClick={() => setTab('login')}>SE CONNECTER</button>
          </div>
          {tab === 'login' && (
            <form onSubmit={handleSubmit} className="login-form">
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemple.com"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Mot de passe</label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="show-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="login-button"
                disabled={loading || !email || !password}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          )}
          {tab === 'signup' && (
            <form className="signup-form">
              <div className="form-group">
                <label htmlFor="firstName">Prénom</label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Prénom"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="surname">Nom</label>
                <input
                  id="surname"
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Nom"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="signupEmail">Email</label>
                <input
                  id="signupEmail"
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="email@exemple.com"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="guestType">Type d'invité</label>
                <select
                  id="guestType"
                  value={guestType}
                  onChange={(e) => setGuestType(e.target.value)}
                  required
                >
                  <option value="Talent Relative">Talent Relative</option>
                  <option value="VIP">VIP</option>
                  <option value="Sponsor">Sponsor</option>
                  <option value="Staff - Basketball">Staff - Basketball</option>
                  <option value="Staff - Spectacle">Staff - Spectacle</option>
                  <option value="Staff - Fashion">Staff - Fashion</option>
                  <option value="Staff - Facilities">Staff - Facilities</option>
                  <option value="Staff - Photographer/video">Staff - Photographer/video</option>
                  <option value="Staff - Press/Media">Staff - Press/Media</option>
                </select>
              </div>
              <button type="submit" className="login-button login-signup-cta">Créer un compte</button>
            </form>
          )}
          <div className="credentials-panel">
            <h4>Identifiants test</h4>
            <p>Utilisez ces comptes pour vous connecter.</p>
            <ul>
              {credentials.map((item) => (
                <li key={item.email}>
                  <strong>{item.label}</strong>
                  <span>{item.email}</span>
                  <span>{item.password}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Hero carousel from HomeScreen under the hero video */}
        <section className="carousel-section login-carousel-section">
          {/* Import and reuse VideoCarousel from HomeScreen */}
          {/* The following assumes VideoCarousel and eventsVideos are imported or defined above */}
          <VideoCarousel
            title="Basketball"
            subtitle="La balle est dans votre camp"
            videos={[
              'https://www.youtube.com/watch?v=5D0i7mtlqLs&pp=ygUeZmFzaGlvbiBtb2RlbGxpbmcgZmFzaGlvbiB3ZWVr',
              'https://www.youtube.com/watch?v=Nq-taA3DQEE&pp=ygUeZmFzaGlvbiBtb2RlbGxpbmcgZmFzaGlvbiB3ZWVr',
              'https://www.youtube.com/watch?v=CwmKr-wkj1M&pp=ygUeZmFzaGlvbiBtb2RlbGxpbmcgZmFzaGlvbiB3ZWVr2AYL',
              'https://www.youtube.com/watch?v=HfJgt9oEXms&pp=ygUeZmFzaGlvbiBtb2RlbGxpbmcgZmFzaGlvbiB3ZWVr',
              'https://www.youtube.com/watch?v=vK3Jq8AJO5s&pp=ygUeZmFzaGlvbiBtb2RlbGxpbmcgZmFzaGlvbiB3ZWVr',
              'https://www.youtube.com/watch?v=25956Au5n8Y&pp=ygUeZmFzaGlvbiBtb2RlbGxpbmcgZmFzaGlvbiB3ZWVr',
              'https://www.youtube.com/watch?v=6eCl9q2x77U&pp=ygUeZmFzaGlvbiBtb2RlbGxpbmcgZmFzaGlvbiB3ZWVr',
            ]}
          />
        </section>
      </div>
    </div>
  );
}
