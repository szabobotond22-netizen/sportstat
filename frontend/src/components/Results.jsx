import React, { useState, useEffect } from 'react';
import { apiUrl } from '../api';

const Results = ({ token }) => {
  const [results, setResults] = useState([]);
  const [standings, setStandings] = useState([]);
  const [finishedGameCount, setFinishedGameCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, homeWin, awayWin, draw

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const [resultsResponse, standingsResponse] = await Promise.all([
        fetch(apiUrl('/api/games')),
        fetch(apiUrl('/api/games/standings')),
      ]);

      if (resultsResponse.ok) {
        const data = await resultsResponse.json();
        setResults(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }

      if (standingsResponse.ok) {
        const standingsData = await standingsResponse.json();
        setStandings(standingsData.standings || []);
        setFinishedGameCount(standingsData.finishedGames || 0);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResultType = (game) => {
    if (game.homeTeamGoals > game.awayTeamGoals) return 'homeWin';
    if (game.homeTeamGoals < game.awayTeamGoals) return 'awayWin';
    return 'draw';
  };

  const getResultBadge = (game) => {
    const type = getResultType(game);
    if (type === 'homeWin') return <span className="badge bg-success">Hazai győzelem</span>;
    if (type === 'awayWin') return <span className="badge bg-danger">Vendég győzelem</span>;
    return <span className="badge bg-warning">Döntetlen</span>;
  };

  const filteredResults = results.filter(game => {
    if (filter === 'all') return true;
    return getResultType(game) === filter;
  });

  if (loading) {
    return <div className="text-center">Betöltés...</div>;
  }

  return (
    <div>
      <h2 className="mb-4">Mérkőzések Eredményei</h2>

      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">NB1 Tabella (jelenlegi állás)</h4>
            <small className="text-muted">Lejátszott meccsek: {finishedGameCount}</small>
          </div>

          {standings.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Csapat</th>
                    <th>M</th>
                    <th>GY</th>
                    <th>D</th>
                    <th>V</th>
                    <th>LG</th>
                    <th>KG</th>
                    <th>GK</th>
                    <th>P</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row) => (
                    <tr key={row.teamId}>
                      <td>{row.position}</td>
                      <td><strong>{row.teamName}</strong></td>
                      <td>{row.played}</td>
                      <td>{row.won}</td>
                      <td>{row.drawn}</td>
                      <td>{row.lost}</td>
                      <td>{row.goalsFor}</td>
                      <td>{row.goalsAgainst}</td>
                      <td>{row.goalDifference}</td>
                      <td><strong>{row.points}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted mb-0">Még nincs elég lejátszott meccs a tabellához.</p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="btn-group" role="group">
          <input type="radio" className="btn-check" name="resultFilter" id="allResults" autoComplete="off" defaultChecked onChange={() => setFilter('all')} />
          <label className="btn btn-outline-primary" htmlFor="allResults">Összes</label>

          <input type="radio" className="btn-check" name="resultFilter" id="homeWins" autoComplete="off" onChange={() => setFilter('homeWin')} />
          <label className="btn btn-outline-success" htmlFor="homeWins">Hazai győzelmek</label>

          <input type="radio" className="btn-check" name="resultFilter" id="awayWins" autoComplete="off" onChange={() => setFilter('awayWin')} />
          <label className="btn btn-outline-danger" htmlFor="awayWins">Vendég győzelmek</label>

          <input type="radio" className="btn-check" name="resultFilter" id="draws" autoComplete="off" onChange={() => setFilter('draw')} />
          <label className="btn btn-outline-warning" htmlFor="draws">Döntetlen</label>
        </div>
      </div>

      <div className="row">
        {filteredResults.length > 0 ? (
          filteredResults.map(game => (
            <div key={game._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>{getResultBadge(game)}</div>
                    <small className="text-muted">{new Date(game.date).toLocaleDateString('hu-HU')}</small>
                  </div>

                  <div className="text-center mb-3">
                    <div className="row">
                      <div className="col-5">
                        <p className="mb-1"><strong>{game.homeTeam?.name || 'Hazai csapat'}</strong></p>
                        <h3 className="mb-0">{game.homeTeamGoals}</h3>
                      </div>
                      <div className="col-2 d-flex align-items-center justify-content-center">
                        <strong>:</strong>
                      </div>
                      <div className="col-5">
                        <p className="mb-1"><strong>{game.awayTeam?.name || 'Vendég csapat'}</strong></p>
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
          ))
        ) : (
          <div className="col-12 text-center">
            <p className="text-muted">Nincsenek mérkőzések a kiválasztott szűrőhöz.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
