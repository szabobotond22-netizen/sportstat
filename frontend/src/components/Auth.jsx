import React, { useState } from 'react';
import { apiUrl } from '../api';

const Auth = ({ onLogin }) => {
  const [mode, setMode] = useState('login'); // login | register | verify | forgot | reset
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    verificationCode: '',
    resetCode: '',
    newPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resendingCode, setResendingCode] = useState(false);

  const verifyLoginCode = async (email, code) => {
    const verifyResponse = await fetch(apiUrl('/api/auth/verify-login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, code })
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      throw new Error(verifyData.message || 'A verifikáció nem sikerült.');
    }

    if (verifyData.token && verifyData.user) {
      onLogin(verifyData.user, verifyData.token);
      return true;
    }

    return false;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleResendVerificationCode = async () => {
    if (!formData.email) {
      setError('Add meg az email címet a kód újraküldéséhez.');
      return;
    }

    setResendingCode(true);
    setError('');
    setInfo('');

    try {
      const response = await fetch(apiUrl('/api/auth/resend-login-code'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'A kód újraküldése nem sikerült.');
        return;
      }

      if (data.emailDeliveryFallback && data.developmentCode) {
        setFormData((prev) => ({ ...prev, verificationCode: data.developmentCode }));
        setInfo(`Fejlesztői belépési kód: ${data.developmentCode}`);
        return;
      }

      setInfo('Belépési kód újraküldve emailben.');
    } catch (_error) {
      setError('A kód újraküldése közben hiba történt.');
    } finally {
      setResendingCode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');

    try {
      let endpoint = '/api/auth/login';
      let payload = {};

      if (mode === 'register') {
        endpoint = '/api/auth/register';
        payload = {
          username: formData.username,
          email: formData.email,
          password: formData.password
        };
      } else if (mode === 'verify') {
        endpoint = '/api/auth/verify-login';
        payload = {
          email: formData.email,
          code: formData.verificationCode
        };
      } else if (mode === 'forgot') {
        endpoint = '/api/auth/forgot-password';
        payload = { email: formData.email };
      } else if (mode === 'reset') {
        endpoint = '/api/auth/reset-password';
        payload = {
          email: formData.email,
          code: formData.resetCode,
          newPassword: formData.newPassword
        };
      } else {
        payload = {
          email: formData.email,
          password: formData.password
        };
      }

      const response = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requiresVerification) {
          if (data.emailDeliveryFallback && data.developmentCode) {
            try {
              const loggedIn = await verifyLoginCode(data.email || formData.email, data.developmentCode);
              if (!loggedIn) {
                setMode('verify');
                setFormData((prev) => ({ ...prev, verificationCode: data.developmentCode }));
                setInfo('Automatikus beléptetés nem sikerült, add meg a kódot kézzel.');
              }
            } catch (verifyError) {
              setMode('verify');
              setFormData((prev) => ({ ...prev, verificationCode: data.developmentCode }));
              setError(verifyError.message || 'A verifikáció nem sikerült.');
            }
          } else {
            setMode('verify');
            setInfo('Verifikációs kódot küldtünk az emailedre.');
            setFormData((prev) => ({ ...prev, email: data.email || prev.email }));
          }
        } else if (mode === 'forgot') {
          if (data.emailDeliveryFallback && data.developmentCode) {
            setMode('reset');
            setInfo(`Fejlesztői reset kód: ${data.developmentCode}`);
            setFormData((prev) => ({ ...prev, resetCode: data.developmentCode }));
          } else if (data.emailSent === true) {
            setMode('reset');
            setInfo('Elküldtük a jelszó-visszaállító kódot emailben.');
          } else if (data.emailSent === false) {
            setError(data.message || 'A reset kód küldése sikertelen volt.');
          } else {
            setInfo('Ha létezik ilyen fiók, elküldtük a jelszó-visszaállító kódot emailben.');
          }
        } else if (mode === 'reset') {
          setMode('login');
          setInfo('Jelszó sikeresen módosítva. Jelentkezz be az új jelszóval.');
          setFormData((prev) => ({ ...prev, password: '', verificationCode: '', resetCode: '', newPassword: '' }));
        } else if (data.token && data.user) {
          onLogin(data.user, data.token);
        } else if (data.message) {
          setInfo(data.message);
        }
      } else {
        if (mode === 'login' && response.status === 401) {
          setError('Hibás email vagy jelszó. Ha elfelejtetted a jelszót, kattints az Elfelejtett jelszó gombra.');
        } else if (mode === 'verify' && response.status === 400) {
          setError('Érvénytelen vagy lejárt verifikációs kód. Kérj új kódot bejelentkezéssel.');
        } else if (mode === 'reset' && response.status === 400) {
          setError('A reset kód hibás vagy lejárt. Kérj új reset kódot.');
        } else {
          setError(data.message || 'A kérés sikertelen volt.');
        }
      }
    } catch (error) {
      setError('Hiba történt a kérés során');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card">
          <div className="card-body">
            <h3 className="card-title text-center mb-4">
              {mode === 'login' && 'Bejelentkezés'}
              {mode === 'register' && 'Regisztráció'}
              {mode === 'verify' && 'Email verifikáció'}
              {mode === 'forgot' && 'Elfelejtett jelszó'}
              {mode === 'reset' && 'Jelszó visszaállítás'}
            </h3>

            {error && (
              <div className="alert alert-danger">{error}</div>
            )}

            {info && (
              <div className="alert alert-warning">{info}</div>
            )}

            <form onSubmit={handleSubmit}>
              {mode === 'register' && (
                <div className="mb-3">
                  <label className="form-label">Felhasználónév</label>
                  <input
                    type="text"
                    className="form-control"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required={mode === 'register'}
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {(mode === 'login' || mode === 'register') && (
                <div className="mb-3">
                  <label className="form-label">Jelszó</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? 'Elrejt' : 'Mutat'}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'verify' && (
                <div className="mb-3">
                  <label className="form-label">Verifikációs kód</label>
                  <input
                    type="text"
                    className="form-control"
                    name="verificationCode"
                    value={formData.verificationCode}
                    onChange={handleChange}
                    maxLength={6}
                    required
                  />
                </div>
              )}

              {mode === 'reset' && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Reset kód</label>
                    <input
                      type="text"
                      className="form-control"
                      name="resetCode"
                      value={formData.resetCode}
                      onChange={handleChange}
                      maxLength={6}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Új jelszó</label>
                    <div className="input-group">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        className="form-control"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                      >
                        {showNewPassword ? 'Elrejt' : 'Mutat'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {(mode === 'login' || mode === 'register' || mode === 'verify' || mode === 'forgot' || mode === 'reset') && (
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? 'Feldolgozás...' : (
                    mode === 'login' ? 'Belépési kód küldése' :
                    mode === 'register' ? 'Regisztráció' :
                    mode === 'verify' ? 'Belépés megerősítése' :
                    mode === 'forgot' ? 'Reset kód küldése' :
                    'Jelszó visszaállítása'
                  )}
                </button>
              )}

            </form>

            <div className="text-center mt-3">
              {mode === 'login' && (
                <>
                  <button type="button" className="btn btn-link" onClick={() => setMode('register')}>
                    Még nincs fiókod? Regisztrálj!
                  </button>
                  <button type="button" className="btn btn-link" onClick={() => setMode('forgot')}>
                    Elfelejtett jelszó
                  </button>
                </>
              )}

              {mode === 'register' && (
                <button type="button" className="btn btn-link" onClick={() => setMode('login')}>
                  Már van fiókod? Jelentkezz be!
                </button>
              )}

              {mode === 'verify' && (
                <>
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={handleResendVerificationCode}
                    disabled={resendingCode}
                  >
                    {resendingCode ? 'Kód küldése...' : 'Kód újraküldése'}
                  </button>
                  <button type="button" className="btn btn-link" onClick={() => setMode('login')}>
                    Vissza bejelentkezéshez
                  </button>
                </>
              )}

              {mode === 'forgot' && (
                <button type="button" className="btn btn-link" onClick={() => setMode('login')}>
                  Vissza bejelentkezéshez
                </button>
              )}

              {mode === 'reset' && (
                <button type="button" className="btn btn-link" onClick={() => setMode('login')}>
                  Vissza bejelentkezéshez
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;