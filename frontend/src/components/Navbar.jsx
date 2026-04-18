import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <span className="d-flex align-items-center gap-2">
            <span className="brand-mark" aria-hidden="true">
              <img src="/sportstat-logo.svg" alt="" className="brand-logo" />
            </span>
            <span>
              <span className="brand-main">SportStat</span>
              <span className="brand-sub">NB1 TRACKER</span>
            </span>
          </span>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/teams">Csapatok</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/players">Játékosok</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/results">Eredmények</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/injuries">Sérülések</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/coaches">Edzők</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/stadiums">Stadionok</Link>
            </li>
          </ul>
          <ul className="navbar-nav">
            {user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">{user.username}</Link>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-light ms-2" onClick={onLogout}>
                    Kijelentkezés
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="btn btn-outline-light" to="/auth">Bejelentkezés</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;