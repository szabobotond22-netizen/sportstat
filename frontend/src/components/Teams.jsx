import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl } from '../api';

const Teams = ({ token }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteTeams');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch(apiUrl('/api/teams'));
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (teamId) => {
    const newFavorites = favorites.includes(teamId)
      ? favorites.filter(id => id !== teamId)
      : [...favorites, teamId];
    setFavorites(newFavorites);
    localStorage.setItem('favoriteTeams', JSON.stringify(newFavorites));
  };

  if (loading) {
    return <div className="text-center">Betöltés...</div>;
  }

  return (
    <div>
      <h2 className="mb-4">NB1 Csapatok</h2>

      {/* Kedvenc csapatok szűrő */}
      <div className="mb-4">
        <div className="btn-group" role="group">
          <input type="radio" className="btn-check" name="teamFilter" id="allTeams" autoComplete="off" defaultChecked />
          <label className="btn btn-outline-primary" htmlFor="allTeams">Összes csapat</label>

          <input type="radio" className="btn-check" name="teamFilter" id="favorites" autoComplete="off" />
          <label className="btn btn-outline-primary" htmlFor="favorites">
            Kedvenceim ({favorites.length})
          </label>
        </div>
      </div>

      <div className="row">
        {teams
          .filter(team => {
            const filterType = document.querySelector('input[name="teamFilter"]:checked')?.id;
            if (filterType === 'favorites') {
              return favorites.includes(team._id);
            }
            return true;
          })
          .map(team => (
            <div key={team._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="card-title">{team.name}</h5>
                    <button
                      className={`btn btn-sm ${favorites.includes(team._id) ? 'btn-warning' : 'btn-outline-warning'}`}
                      onClick={() => toggleFavorite(team._id)}
                      title={favorites.includes(team._id) ? 'Eltávolítás a kedvencekből' : 'Hozzáadás a kedvencekhez'}
                    >
                      {favorites.includes(team._id) ? '★' : '☆'}
                    </button>
                  </div>
                  <p className="card-text">
                    <strong>Város:</strong> {team.city}<br />
                    <strong>Alapítva:</strong> {team.founded}<br />
                    <strong>Sport:</strong> {team.sport}
                  </p>
                  <div className="mt-3">
                    <Link to={`/teams/${team._id}/stats`} className="btn btn-primary btn-sm me-2">
                      📊 Statisztikák
                    </Link>
                    <Link to={`/teams/${team._id}/players`} className="btn btn-secondary btn-sm me-2">
                      👥 Játékosok
                    </Link>
                    <Link to={`/teams/${team._id}/results`} className="btn btn-info btn-sm">
                      🏆 Eredmények
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Teams;