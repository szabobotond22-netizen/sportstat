import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiUrl } from '../api';

const TeamStats = () => {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamStats();
  }, [id]);

  const fetchTeamStats = async () => {
    try {
      const [teamResponse, playersResponse, gamesResponse] = await Promise.all([
        fetch(apiUrl(`/api/teams/${id}`)),
        fetch(apiUrl(`/api/players?teamId=${id}`)),
        fetch(apiUrl(`/api/games?teamId=${id}`))
      ]);

      if (teamResponse.ok) {
        setTeam(await teamResponse.json());
      }

      if (playersResponse.ok) {
        setPlayers(await playersResponse.json());
      }

      if (gamesResponse.ok) {
        setGames(await gamesResponse.json());
      }
    } catch (error) {
      console.error('Error fetching team stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const totals = players.reduce(
    (acc, player) => {
      const stats = player.stats || {};
      acc.goals += Number(stats.goals || 0);
      acc.assists += Number(stats.assists || 0);
      acc.points += Number(stats.points || 0);
      acc.yellowCards += Number(stats.yellowCards || 0);
      acc.redCards += Number(stats.redCards || 0);
      return acc;
    },
    { goals: 0, assists: 0, points: 0, yellowCards: 0, redCards: 0 }
  );

  const gameSummary = games.reduce(
    (acc, game) => {
      const isHome = game.homeTeam?._id === id;
      const scored = isHome ? game.homeTeamGoals : game.awayTeamGoals;
      const conceded = isHome ? game.awayTeamGoals : game.homeTeamGoals;

      acc.goalsScored += scored;
      acc.goalsConceded += conceded;

      if (scored > conceded) acc.wins += 1;
      else if (scored < conceded) acc.losses += 1;
      else acc.draws += 1;

      return acc;
    },
    { wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsConceded: 0 }
  );

  if (loading) {
    return <div className="text-center">Betöltés...</div>;
  }

  return (
    <div>
      <Link to="/teams" className="btn btn-outline-primary mb-3">← Vissza a csapatokhoz</Link>
      <h2 className="mb-4">{team?.name || 'Csapat'} - Statisztikák</h2>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Mérkőzés statisztika</h5>
              <p className="mb-1"><strong>Lejátszott:</strong> {games.length}</p>
              <p className="mb-1"><strong>Győzelem:</strong> {gameSummary.wins}</p>
              <p className="mb-1"><strong>Döntetlen:</strong> {gameSummary.draws}</p>
              <p className="mb-0"><strong>Vereség:</strong> {gameSummary.losses}</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Csapat támadó mutatók</h5>
              <p className="mb-1"><strong>Lőtt gól:</strong> {gameSummary.goalsScored}</p>
              <p className="mb-1"><strong>Kapott gól:</strong> {gameSummary.goalsConceded}</p>
              <p className="mb-1"><strong>Játékos gólok:</strong> {totals.goals}</p>
              <p className="mb-0"><strong>Asszisztok:</strong> {totals.assists}</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Fegyelmi mutatók</h5>
              <p className="mb-1"><strong>Sárga lapok:</strong> {totals.yellowCards}</p>
              <p className="mb-1"><strong>Piros lapok:</strong> {totals.redCards}</p>
              <p className="mb-1"><strong>Össz pont:</strong> {totals.points}</p>
              <p className="mb-0"><strong>Keret méret:</strong> {players.length} fő</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Gyors áttekintés</h5>
          <p className="mb-1">A csapat statisztikái automatikusan frissülnek a játékosok és mérkőzések adatai alapján.</p>
          <p className="mb-0 text-muted">Ha új játékost vagy mérkőzés eredményt viszel fel, ezen az oldalon megjelenik megnyitáskor.</p>
        </div>
      </div>
    </div>
  );
};

export default TeamStats;