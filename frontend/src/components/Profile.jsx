import React from 'react';

const Profile = ({ user, token }) => {
  if (!user) {
    return <div className="text-center">Jelentkezz be a profil megtekintéséhez!</div>;
  }

  return (
    <div>
      <h2 className="mb-4">Profil</h2>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">{user.username}</h5>
          <p className="card-text">
            <strong>Email:</strong> {user.email}<br />
            <strong>Szerepkör:</strong> {user.role}<br />
            <strong>Regisztráció:</strong> {new Date(user.createdAt).toLocaleDateString('hu-HU')}
          </p>

          {user.favoriteTeams && user.favoriteTeams.length > 0 && (
            <div className="mt-3">
              <h6>Kedvenc csapatok:</h6>
              <ul className="list-group">
                {user.favoriteTeams.map(team => (
                  <li key={team._id} className="list-group-item">{team.name}</li>
                ))}
              </ul>
            </div>
          )}

          {user.favoritePlayers && user.favoritePlayers.length > 0 && (
            <div className="mt-3">
              <h6>Kedvenc játékosok:</h6>
              <ul className="list-group">
                {user.favoritePlayers.map(player => (
                  <li key={player._id} className="list-group-item">{player.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;