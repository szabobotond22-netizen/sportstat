import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl } from '../api';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    teams: [],
    players: [],
    results: [],
    injuries: [],
    coaches: [],
    stadiums: []
  });

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      const [teamsRes, playersRes, resultsRes, injuriesRes, coachesRes, stadiumsRes] = await Promise.all([
        fetch(apiUrl('/api/teams')),
        fetch(apiUrl('/api/players')),
        fetch(apiUrl('/api/games')),
        fetch(apiUrl('/api/injuries?activeOnly=true')),
        fetch(apiUrl('/api/coaches')),
        fetch(apiUrl('/api/stadiums'))
      ]);

      const teams = teamsRes.ok ? await teamsRes.json() : [];
      const players = playersRes.ok ? await playersRes.json() : [];
      const results = resultsRes.ok ? await resultsRes.json() : [];
      const injuries = injuriesRes.ok ? await injuriesRes.json() : [];
      const coaches = coachesRes.ok ? await coachesRes.json() : [];
      const stadiums = stadiumsRes.ok ? await stadiumsRes.json() : [];

      setData({ teams, players, results, injuries, coaches, stadiums });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5">Betöltés...</div>;
  }

  const latestResults = [...data.results]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  const topPlayers = [...data.players]
    .sort((a, b) => (b.stats?.rating || 0) - (a.stats?.rating || 0))
    .slice(0, 3);

  return (
    <div className="py-3">
      <div className="home-hero">
        <div className="row g-3 align-items-center">
          <div className="col-lg-8">
            <span className="hero-kicker">NB1 Live Data Hub</span>
            <h1>SportStat Dashboard</h1>
            <p className="hero-copy">
              Modern NB1 központ valós meccsadatokkal, tabellával, játékos- és sérülésfigyeléssel.
            </p>
            <div className="hero-actions">
              <Link to="/results" className="btn btn-primary">Tabella és Eredmények</Link>
              <Link to="/players" className="btn btn-outline-primary">Játékosok</Link>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="row g-2">
              <div className="col-6 col-lg-12">
                <div className="metric-pill">
                  <div className="label">Aktív csapatok</div>
                  <div className="value">{data.teams.length}</div>
                </div>
              </div>
              <div className="col-6 col-lg-12">
                <div className="metric-pill">
                  <div className="label">Aktív sérülések</div>
                  <div className="value">{data.injuries.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4 col-lg-2">
          <div className="card h-100 text-center">
            <div className="card-body">
              <h6 className="text-muted mb-1">Csapatok</h6>
              <h3 className="mb-2">{data.teams.length}</h3>
              <Link to="/teams" className="btn btn-sm btn-outline-primary">Megnyit</Link>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <div className="card h-100 text-center">
            <div className="card-body">
              <h6 className="text-muted mb-1">Játékosok</h6>
              <h3 className="mb-2">{data.players.length}</h3>
              <Link to="/players" className="btn btn-sm btn-outline-primary">Megnyit</Link>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <div className="card h-100 text-center">
            <div className="card-body">
              <h6 className="text-muted mb-1">Eredmények</h6>
              <h3 className="mb-2">{data.results.length}</h3>
              <Link to="/results" className="btn btn-sm btn-outline-primary">Megnyit</Link>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <div className="card h-100 text-center">
            <div className="card-body">
              <h6 className="text-muted mb-1">Sérülések</h6>
              <h3 className="mb-2">{data.injuries.length}</h3>
              <Link to="/injuries" className="btn btn-sm btn-outline-primary">Megnyit</Link>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <div className="card h-100 text-center">
            <div className="card-body">
              <h6 className="text-muted mb-1">Edzők</h6>
              <h3 className="mb-2">{data.coaches.length}</h3>
              <Link to="/coaches" className="btn btn-sm btn-outline-primary">Megnyit</Link>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <div className="card h-100 text-center">
            <div className="card-body">
              <h6 className="text-muted mb-1">Stadionok</h6>
              <h3 className="mb-2">{data.stadiums.length}</h3>
              <Link to="/stadiums" className="btn btn-sm btn-outline-primary">Megnyit</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Legutóbbi mérkőzések</h5>
              {latestResults.length > 0 ? (
                latestResults.map((game) => (
                  <p key={game._id} className="mb-2 small">
                    <strong>{game.homeTeam?.name || 'Hazai'}</strong> {game.homeTeamGoals} - {game.awayTeamGoals} <strong>{game.awayTeam?.name || 'Vendég'}</strong>
                  </p>
                ))
              ) : (
                <p className="text-muted mb-0">Nincs mérkőzés adat.</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Top játékosok (értékelés)</h5>
              {topPlayers.length > 0 ? (
                topPlayers.map((player) => (
                  <p key={player._id} className="mb-2 small">
                    <strong>{player.name}</strong> - {player.team?.name || 'N/A'} - {player.stats?.rating || 0}/10
                  </p>
                ))
              ) : (
                <p className="text-muted mb-0">Nincs játékos adat.</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Aktív sérülések röviden</h5>
              {data.injuries.slice(0, 3).length > 0 ? (
                data.injuries.slice(0, 3).map((injury) => (
                  <p key={injury._id} className="mb-2 small">
                    <strong>{injury.player?.name || 'Ismeretlen'}</strong>: {injury.injuryType}
                  </p>
                ))
              ) : (
                <p className="text-muted mb-0">Nincs aktív sérülés.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;