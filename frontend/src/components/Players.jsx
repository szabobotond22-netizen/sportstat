import React, { useState, useEffect } from 'react';
import { apiUrl } from '../api';

const Players = ({ token }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [injuriesByPlayer, setInjuriesByPlayer] = useState({});
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favoritePlayers');
    return saved ? JSON.parse(saved) : [];
  });
  const [showStats, setShowStats] = useState({});
  const [filter, setFilter] = useState('allPlayers');

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch(apiUrl('/api/players'));
      if (response.ok) {
        const data = await response.json();
        setPlayers(data);

        const injuriesResponse = await fetch(apiUrl('/api/injuries?activeOnly=true'));
        if (injuriesResponse.ok) {
          const injuries = await injuriesResponse.json();
          const mapped = injuries.reduce((acc, injury) => {
            const playerId = injury.player?._id;
            if (!playerId) {
              return acc;
            }

            if (!acc[playerId]) {
              acc[playerId] = [];
            }

            acc[playerId].push(injury);
            return acc;
          }, {});

          setInjuriesByPlayer(mapped);
        }
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (playerId) => {
    const newFavorites = favorites.includes(playerId)
      ? favorites.filter(id => id !== playerId)
      : [...favorites, playerId];
    setFavorites(newFavorites);
    localStorage.setItem('favoritePlayers', JSON.stringify(newFavorites));
  };

  const toggleStats = (playerId) => {
    setShowStats(prev => ({
      ...prev,
      [playerId]: !prev[playerId]
    }));
  };

  if (loading) {
    return <div className="text-center">Betöltés...</div>;
  }

  return (
    <div>
      <h2 className="mb-4">NB1 Játékosok</h2>

      {/* Kedvenc játékosok szűrő */}
      <div className="mb-4">
        <div className="btn-group" role="group">
          <input
            type="radio"
            className="btn-check"
            name="playerFilter"
            id="allPlayers"
            autoComplete="off"
            checked={filter === 'allPlayers'}
            onChange={() => setFilter('allPlayers')}
          />
          <label className="btn btn-outline-primary" htmlFor="allPlayers">Összes játékos</label>

          <input
            type="radio"
            className="btn-check"
            name="playerFilter"
            id="favoritePlayers"
            autoComplete="off"
            checked={filter === 'favoritePlayers'}
            onChange={() => setFilter('favoritePlayers')}
          />
          <label className="btn btn-outline-primary" htmlFor="favoritePlayers">
            Kedvenceim ({favorites.length})
          </label>
        </div>
      </div>

      <div className="row">
        {players
          .filter(player => {
            if (filter === 'favoritePlayers') {
              return favorites.includes(player._id);
            }
            return true;
          })
          .map(player => (
            <div key={player._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="card-title">
                      {player.name}
                      {player.jerseyNumber && <span className="badge bg-primary ms-2">#{player.jerseyNumber}</span>}
                    </h5>
                    <button
                      className={`btn btn-sm ${favorites.includes(player._id) ? 'btn-warning' : 'btn-outline-warning'}`}
                      onClick={() => toggleFavorite(player._id)}
                      title={favorites.includes(player._id) ? 'Eltávolítás a kedvencekből' : 'Hozzáadás a kedvencekhez'}
                    >
                      {favorites.includes(player._id) ? 'Mentve' : 'Kedvenc'}
                    </button>
                  </div>
                  <p className="card-text">
                    <strong>Pozíció:</strong> {player.position}<br />
                    <strong>Csapat:</strong> {player.team?.name || 'N/A'}<br />
                    <strong>Kor:</strong> {player.age}<br />
                    <strong>Nemzetiség:</strong> {player.nationality}
                  </p>

                  {!!injuriesByPlayer[player._id]?.length && (
                    <div className="alert alert-warning py-2 px-3 mb-2">
                      <small>
                        <strong>Sérülés:</strong> {injuriesByPlayer[player._id][0].injuryType}
                        {injuriesByPlayer[player._id][0].expectedReturn && (
                          <>
                            <br />
                            <strong>Várható visszatérés:</strong>{' '}
                            {new Date(injuriesByPlayer[player._id][0].expectedReturn).toLocaleDateString('hu-HU')}
                          </>
                        )}
                      </small>
                    </div>
                  )}

                  {/* Részletes statisztikák */}
                  <div className="mt-3">
                    <button
                      className={`btn btn-sm me-2 stats-toggle ${showStats[player._id] ? 'stats-toggle-open' : 'btn-outline-info'}`}
                      onClick={() => toggleStats(player._id)}
                    >
                      {showStats[player._id] ? 'Statisztikák elrejtése' : 'Részletes statisztikák'}
                    </button>
                  </div>

                  {showStats[player._id] && (
                    <div className="mt-3 stats-panel">
                      <h6 className="stats-title">Teljes statisztikák</h6>
                      <div className="row g-2">
                        <div className="col-6">
                          <div className="stat-item"><span>Mérkőzések</span><strong>{player.stats.gamesPlayed}</strong></div>
                          <div className="stat-item"><span>Gólok</span><strong>{player.stats.goals}</strong></div>
                          <div className="stat-item"><span>Asszisztok</span><strong>{player.stats.assists}</strong></div>
                          <div className="stat-item"><span>Pontok</span><strong>{player.stats.points}</strong></div>
                          <div className="stat-item"><span>Faultok</span><strong>{player.stats.faults}</strong></div>
                          <div className="stat-item"><span>Sárga lapok</span><strong>{player.stats.yellowCards}</strong></div>
                          <div className="stat-item"><span>Piros lapok</span><strong>{player.stats.redCards}</strong></div>
                        </div>
                        <div className="col-6">
                          <div className="stat-item"><span>Passzok</span><strong>{player.stats.passes}</strong></div>
                          <div className="stat-item"><span>Akciók</span><strong>{player.stats.actions}</strong></div>
                          <div className="stat-item"><span>Szerelések</span><strong>{player.stats.tackles}</strong></div>
                          {player.stats.saves > 0 && <div className="stat-item"><span>Védések</span><strong>{player.stats.saves}</strong></div>}
                          <div className="stat-item"><span>Játszott percek</span><strong>{player.stats.minutesPlayed}</strong></div>
                          <div className="stat-item"><span>Értékelés</span><strong>{player.stats.rating}/10</strong></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Players;