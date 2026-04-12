import React, { useState, useEffect } from 'react';

const Players = ({ token }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favoritePlayers');
    return saved ? JSON.parse(saved) : [];
  });
  const [showStats, setShowStats] = useState({});

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/players');
      if (response.ok) {
        const data = await response.json();
        setPlayers(data);
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
          <input type="radio" className="btn-check" name="playerFilter" id="allPlayers" autoComplete="off" defaultChecked />
          <label className="btn btn-outline-primary" htmlFor="allPlayers">Összes játékos</label>

          <input type="radio" className="btn-check" name="playerFilter" id="favoritePlayers" autoComplete="off" />
          <label className="btn btn-outline-primary" htmlFor="favoritePlayers">
            Kedvenceim ({favorites.length})
          </label>
        </div>
      </div>

      <div className="row">
        {players
          .filter(player => {
            const filterType = document.querySelector('input[name="playerFilter"]:checked')?.id;
            if (filterType === 'favoritePlayers') {
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
                      {favorites.includes(player._id) ? '★' : '☆'}
                    </button>
                  </div>
                  <p className="card-text">
                    <strong>Pozíció:</strong> {player.position}<br />
                    <strong>Csapat:</strong> {player.team?.name || 'N/A'}<br />
                    <strong>Kor:</strong> {player.age}<br />
                    <strong>Nemzetiség:</strong> {player.nationality}
                  </p>

                  {/* Részletes statisztikák */}
                  <div className="mt-3">
                    <button
                      className="btn btn-outline-info btn-sm me-2"
                      onClick={() => toggleStats(player._id)}
                    >
                      {showStats[player._id] ? '📊 Statisztikák elrejtése' : '📊 Teljes statisztikák'}
                    </button>
                  </div>

                  {showStats[player._id] && (
                    <div className="mt-3 p-3 bg-light rounded">
                      <h6>Teljes statisztikák:</h6>
                      <div className="row">
                        <div className="col-6">
                          <small>
                            <strong>Mérkőzések:</strong> {player.stats.gamesPlayed}<br />
                            <strong>Gólok:</strong> {player.stats.goals}<br />
                            <strong>Asszisztok:</strong> {player.stats.assists}<br />
                            <strong>Pontok:</strong> {player.stats.points}<br />
                            <strong>Faultok:</strong> {player.stats.faults}<br />
                            <strong>Sárga lapok:</strong> {player.stats.yellowCards}<br />
                            <strong>Piros lapok:</strong> {player.stats.redCards}
                          </small>
                        </div>
                        <div className="col-6">
                          <small>
                            <strong>Passzok:</strong> {player.stats.passes}<br />
                            <strong>Akciók:</strong> {player.stats.actions}<br />
                            <strong>Szerelések:</strong> {player.stats.tackles}<br />
                            {player.stats.saves > 0 && <><strong>Védések:</strong> {player.stats.saves}<br /></>}
                            <strong>Játszott percek:</strong> {player.stats.minutesPlayed}<br />
                            <strong>Értékelés:</strong> {player.stats.rating}/10
                          </small>
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