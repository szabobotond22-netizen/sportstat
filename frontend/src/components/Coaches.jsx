import React, { useEffect, useState } from 'react';
import { apiUrl } from '../api';

const specializationLabels = {
  head_coach: 'Vezetőedző',
  assistant: 'Asszisztens',
  goalkeeper_coach: 'Kapusedző',
  fitness_coach: 'Erőnléti edző',
  technical_director: 'Technikai igazgató'
};

const Coaches = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      const response = await fetch(apiUrl('/api/coaches'));
      if (response.ok) {
        const data = await response.json();
        setCoaches(data);
      }
    } catch (error) {
      console.error('Error fetching coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Betöltés...</div>;
  }

  return (
    <div>
      <h2 className="mb-4">Edzők</h2>
      <div className="row">
        {coaches.length > 0 ? (
          coaches.map((coach) => (
            <div key={coach._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{coach.name}</h5>
                  <p className="card-text mb-1">
                    <strong>Csapat:</strong> {coach.currentTeam?.name || 'Nincs hozzárendelve'}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Szerepkör:</strong> {specializationLabels[coach.specialization] || coach.specialization}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Tapasztalat:</strong> {coach.experience || 0} év
                  </p>
                  {coach.nationality && (
                    <p className="card-text mb-1"><strong>Nemzetiség:</strong> {coach.nationality}</p>
                  )}
                  <p className="card-text mb-0">
                    <strong>Státusz:</strong> {coach.isActive ? 'Aktív' : 'Inaktív'}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center">
            <p className="text-muted">Nincs megjeleníthető edző adat.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Coaches;