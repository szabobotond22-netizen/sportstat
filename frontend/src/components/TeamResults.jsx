import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiUrl } from '../api';

const TeamResults = ({ token }) => {
  const { id } = useParams();
  const [results, setResults] = useState([]);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamResults();
  }, [id]);

  const fetchTeamResults = async () => {
    try {
      const teamResponse = await fetch(apiUrl(`/api/teams/${id}`));
      if (teamResponse.ok) {
        setTeam(await teamResponse.json());
      }

      const gamesResponse = await fetch(apiUrl(`/api/games?teamId=${id}`));
      if (gamesResponse.ok) {
        const data = await gamesResponse.json();
        setResults(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
    } catch (error) {
      console.error('Error fetching team results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResultBadge = (game, teamId) => {
    const isHomeTeam = game.homeTeam?._id === teamId;
    const teamGoals = isHomeTeam ? game.homeTeamGoals : game.awayTeamGoals;
    const opponentGoals = isHomeTeam ? game.awayTeamGoals : game.homeTeamGoals;

    if (teamGoals > opponentGoals) return <span className="badge bg-success">Győzelem</span>;
    if (teamGoals < opponentGoals) return <span className="badge bg-danger">Vereség</span>;
    return <span className="badge bg-warning">Döntetlen</span>;
  };

  if (loading) {
    return <div className="text-center">Betöltés...</div>;
  }

  return (
    <div>
      <Link to="/teams" className="btn btn-outline-primary mb-3">← Vissza a csapatokhoz</Link>
      <h2 className="mb-4">{team?.name || 'Csapat'} - Eredmények</h2>

      <div className="row">
        {results.length > 0 ? (
          results.map(game => {
            const isHomeTeam = game.homeTeam?._id === id;
            return (
              <div key={game._id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>{getResultBadge(game, id)}</div>
                      <small className="text-muted">{new Date(game.date).toLocaleDateString('hu-HU')}</small>
                    </div>

                    <div className="text-center mb-3">
                      <div className="row">
                        <div className="col-5">
                          <p className="mb-1"><strong>{game.homeTeam?.name}</strong></p>
                          <h3 className="mb-0">{game.homeTeamGoals}</h3>
                        </div>
                        <div className="col-2 d-flex align-items-center justify-content-center">
                          <strong>:</strong>
                        </div>
                        <div className="col-5">
                          <p className="mb-1"><strong>{game.awayTeam?.name}</strong></p>
                          <h3 className="mb-0">{game.awayTeamGoals}</h3>
                        </div>
                      </div>
                    </div>

                    <div className="text-muted small">
                      {game.stadium && <p><strong>Stadion:</strong> {game.stadium}</p>}
                      {game.referee && <p><strong>Játékvezető:</strong> {game.referee}</p>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-12 text-center">
            <p className="text-muted">Nincsenek mérkőzések ehhez a csapathoz.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamResults;
