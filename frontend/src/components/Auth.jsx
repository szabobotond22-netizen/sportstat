import React, { useState } from 'react';
import { apiUrl } from '../api';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.user, data.token);
      } else {
        setError(data.message);
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
              {isLogin ? 'Bejelentkezés' : 'Regisztráció'}
            </h3>

            {error && (
              <div className="alert alert-danger">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="mb-3">
                  <label className="form-label">Felhasználónév</label>
                  <input
                    type="text"
                    className="form-control"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required={!isLogin}
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

              <div className="mb-3">
                <label className="form-label">Jelszó</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? 'Feldolgozás...' : (isLogin ? 'Bejelentkezés' : 'Regisztráció')}
              </button>
            </form>

            <div className="text-center mt-3">
              <button
                className="btn btn-link"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Még nincs fiókod? Regisztrálj!' : 'Már van fiókod? Jelentkezz be!'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;