import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiUrl } from '../api';

const TeamPlayers = ({ token }) => {
  const { id } = useParams();
  const [players, setPlayers] = useState([]);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState({});
  const [injuriesByPlayer, setInjuriesByPlayer] = useState({});

  useEffect(() => {
    fetchTeamPlayers();
  }, [id]);

  const fetchTeamPlayers = async () => {
    try {
      const teamResponse = await fetch(apiUrl(`/api/teams/${id}`));
      if (teamResponse.ok) {
        setTeam(await teamResponse.json());
      }

      const playersResponse = await fetch(apiUrl(`/api/players?teamId=${id}`));
      if (playersResponse.ok) {
        const data = await playersResponse.json();
        setPlayers(data);
      }

      const injuriesResponse = await fetch(apiUrl(`/api/injuries?teamId=${id}&activeOnly=true`));
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

                  <div className="mt-3">
                    <button
                      className={`btn btn-sm stats-toggle ${showStats[player._id] ? 'stats-toggle-open' : 'btn-outline-info'}`}
                      onClick={() => toggleStats(player._id)}
                    >
                      {showStats[player._id] ? 'Statisztikák elrejtése' : 'Részletes statisztikák'}
                    </button>
                  </div>

                  {showStats[player._id] && (
                    <div className="mt-3 stats-panel">
                      <h6 className="stats-title">Játékos statok</h6>
                      <div className="stat-item"><span>Mérkőzések</span><strong>{player.stats.gamesPlayed}</strong></div>
                      <div className="stat-item"><span>Gólok</span><strong>{player.stats.goals}</strong></div>
                      <div className="stat-item"><span>Asszisztok</span><strong>{player.stats.assists}</strong></div>
                      <div className="stat-item"><span>Pontok</span><strong>{player.stats.points}</strong></div>
                      <div className="stat-item"><span>Sárga lapok</span><strong>{player.stats.yellowCards}</strong></div>
                      <div className="stat-item"><span>Piros lapok</span><strong>{player.stats.redCards}</strong></div>
                      {player.stats.saves > 0 && <div className="stat-item"><span>Védések</span><strong>{player.stats.saves}</strong></div>}
                      <div className="stat-item"><span>Szerelések</span><strong>{player.stats.tackles}</strong></div>
                      <div className="stat-item"><span>Értékelés</span><strong>{player.stats.rating}/10</strong></div>
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
