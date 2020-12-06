import React from 'react';
import { NavLink } from 'react-router-dom';

const Header = () => (
  <nav className="nav-bar">
    <ul className="header-list">
      <li>
        <NavLink className="nav-lobby" to="/">Lobby</NavLink>
      </li>
      <li>
        <NavLink to="/waitingroom">Waiting Room</NavLink>
      </li>
      <li>
        <NavLink to="/imagegame">Drawing Game</NavLink>
      </li>
    </ul>
  </nav>
);

export default Header;
