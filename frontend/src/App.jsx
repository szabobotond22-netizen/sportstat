import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Teams from './components/Teams';
import Players from './components/Players';
import Results from './components/Results';
import Auth from './components/Auth';
import Profile from './components/Profile';
import TeamResults from './components/TeamResults';
import TeamPlayers from './components/TeamPlayers';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/teams" element={<Teams token={token} />} />
            <Route path="/teams/:id/players" element={<TeamPlayers token={token} />} />
            <Route path="/teams/:id/results" element={<TeamResults token={token} />} />
            <Route path="/players" element={<Players token={token} />} />
            <Route path="/results" element={<Results token={token} />} />
            <Route path="/auth" element={<Auth onLogin={handleLogin} />} />
            <Route path="/profile" element={<Profile user={user} token={token} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;