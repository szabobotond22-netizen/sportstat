import React, { useEffect, useState } from 'react';
import { apiUrl } from '../api';

const surfaceLabels = {
  grass: 'Fű',
  artificial: 'Műfű',
  hybrid: 'Hibrid'
};

const Stadiums = () => {
  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStadiums();
  }, []);

  const fetchStadiums = async () => {
    try {
      const response = await fetch(apiUrl('/api/stadiums'));
      if (response.ok) {
        const data = await response.json();
        setStadiums(data);
      }
    } catch (error) {
      console.error('Error fetching stadiums:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Betöltés...</div>;
  }

  return (
    <div>
      <h2 className="mb-4">Stadionok</h2>
      <div className="row">
        {stadiums.length > 0 ? (
          stadiums.map((stadium) => (
            <div key={stadium._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{stadium.name}</h5>
                  <p className="card-text mb-1"><strong>Város:</strong> {stadium.city}</p>
                  <p className="card-text mb-1"><strong>Kapacitás:</strong> {stadium.capacity?.toLocaleString('hu-HU') || 0} fő</p>
                  <p className="card-text mb-1"><strong>Borítás:</strong> {surfaceLabels[stadium.surface] || stadium.surface}</p>
                  {stadium.openedYear && <p className="card-text mb-1"><strong>Átadva:</strong> {stadium.openedYear}</p>}
                  {stadium.teams?.length > 0 && (
                    <p className="card-text mb-0">
                      <strong>Csapatok:</strong> {stadium.teams.map((team) => team.name).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center">
            <p className="text-muted">Nincs megjeleníthető stadion adat.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stadiums;