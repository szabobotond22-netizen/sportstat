import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const TeamPlayers = ({ token }) => {
  const { id } = useParams();
  const [players, setPlayers] = useState([]);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState({});

  useEffect(() => {
    fetchTeamPlayers();
  }, [id]);

  const fetchTeamPlayers = async () => {
    try {
      const teamResponse = await fetch(`http://localhost:5000/api/teams/${id}`);
      if (teamResponse.ok) {
        setTeam(await teamResponse.json());
      }

      const playersResponse = await fetch(`http://localhost:5000/api/players?teamId=${id}`);
      if (playersResponse.ok) {
        const data = await playersResponse.json();
        setPlayers(data);
      }
    } catch (error) {
      console.error('Error fetching team players:', error);
    } finally {
      setLoading(false);
    }
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
      <Link to="/teams" className="btn btn-outline-primary mb-3">← Vissza a csapatokhoz</Link>
      <h2 className="mb-4">{team?.name || 'Csapat'} - Játékosok</h2>

      <div className="row">
        {players.length > 0 ? (
          players.map(player => (
            <div key={player._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">
                    {player.name}
                    {player.jerseyNumber && <span className="badge bg-primary ms-2">#{player.jerseyNumber}</span>}
                  </h5>
                  <p className="card-text">
                    <strong>Pozíció:</strong> {player.position}<br />
                    <strong>Kor:</strong> {player.age}<br />
                    <strong>Nemzetiség:</strong> {player.nationality}
                  </p>

                  <div className="mt-3">
                    <button
                      className="btn btn-outline-info btn-sm"
                      onClick={() => toggleStats(player._id)}
                    >
                      {showStats[player._id] ? '📊 Rejtés' : '📊 Statisztikák'}
                    </button>
                  </div>

                  {showStats[player._id] && (
                    <div className="mt-3 p-3 bg-light rounded">
                      <small>
                        <strong>Mérkőzések:</strong> {player.stats.gamesPlayed}<br />
                        <strong>Gólok:</strong> {player.stats.goals}<br />
                        <strong>Asszisztok:</strong> {player.stats.assists}<br />
                        <strong>Pontok:</strong> {player.stats.points}<br />
                        <strong>Sárga lapok:</strong> {player.stats.yellowCards}<br />
                        <strong>Piros lapok:</strong> {player.stats.redCards}<br />
                        {player.stats.saves > 0 && <><strong>Védések:</strong> {player.stats.saves}<br /></>}
                        <strong>Szerelések:</strong> {player.stats.tackles}<br />
                        <strong>Értékelés:</strong> {player.stats.rating}/10
                      </small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center">
            <p className="text-muted">Nincsenek játékosok ehhez a csapathoz.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPlayers;
