import React from 'react';

const Home = () => {
  return (
    <div className="text-center py-5">
      <h1 className="display-4 mb-4">Üdvözöljük a SportStat-ban!</h1>
      <p className="lead mb-4">
        A magyar foci statisztikák központi helye. Kövesd nyomon kedvenc NB1 csapataidat és játékosaidat!
      </p>
      <div className="row">
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">📊 Statisztikák</h5>
              <p className="card-text">
                Részletes játékos statisztikák: gólok, asszisztok, sárga/piros lapok, szerelések és még sok más.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">👥 Csapatok</h5>
              <p className="card-text">
                Böngészd az NB1 összes csapatát, játékosaikat és mérkőzéseiket.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">⭐ Kedvencek</h5>
              <p className="card-text">
                Mentsd el kedvenc csapataidat és játékosaidat személyre szabott élményért.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;