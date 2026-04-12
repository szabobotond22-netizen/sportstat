import React, { useState, useEffect } from 'react';

const Results = ({ token }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, homeWin, awayWin, draw

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/games');
      if (response.ok) {
        const data = await response.json();
        setResults(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
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
