import React, { useEffect, useState } from 'react';
import { apiUrl } from '../api';

const severityLabels = {
  minor: 'Enyhe',
  moderate: 'Közepes',
  severe: 'Súlyos'
};

const severityBadgeClass = {
  minor: 'bg-info',
  moderate: 'bg-warning text-dark',
  severe: 'bg-danger'
};

const Injuries = () => {
  const [injuries, setInjuries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOnly, setActiveOnly] = useState(true);

  useEffect(() => {
    fetchInjuries(activeOnly);
  }, [activeOnly]);

  const fetchInjuries = async (onlyActive) => {
    try {
      const response = await fetch(apiUrl(`/api/injuries${onlyActive ? '?activeOnly=true' : ''}`));
      if (response.ok) {
        const data = await response.json();
        setInjuries(data);
      }
    } catch (error) {
      console.error('Error fetching injuries:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Betöltés...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Sérülések</h2>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="activeOnlySwitch"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="activeOnlySwitch">
            Csak aktív sérülések
          </label>
        </div>
      </div>

      <div className="row">
        {injuries.length > 0 ? (
          injuries.map((injury) => (
            <div key={injury._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{injury.player?.name || 'Ismeretlen játékos'}</h5>
                    <span className={`badge ${severityBadgeClass[injury.severity] || 'bg-secondary'}`}>
                      {severityLabels[injury.severity] || injury.severity}
                    </span>
                  </div>

                  <p className="card-text mb-1"><strong>Sérülés:</strong> {injury.injuryType}</p>
                  {injury.bodyPart && <p className="card-text mb-1"><strong>Testrész:</strong> {injury.bodyPart}</p>}
                  <p className="card-text mb-1">
                    <strong>Kezdete:</strong> {new Date(injury.startDate).toLocaleDateString('hu-HU')}
                  </p>
                  {injury.expectedReturn && (
                    <p className="card-text mb-1">
                      <strong>Várható visszatérés:</strong> {new Date(injury.expectedReturn).toLocaleDateString('hu-HU')}
                    </p>
                  )}
                  <p className="card-text mb-0">
                    <strong>Állapot:</strong> {injury.isRecovered ? 'Felépült' : 'Sérült'}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center">
            <p className="text-muted">Nincs megjeleníthető sérülés adat.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Injuries;