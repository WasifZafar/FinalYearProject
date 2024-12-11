import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ElectoralRegister from "./components/ElectoralRegister";
import UpdateElector from "./components/UpdateElector";
import PoliticalPartiesRegister from "./components/PoliticalPartiesRegister";
import VotePage from "./components/VotePage";
import VoteCount from "./components/VoteCount";
import AdminPanel from "./components/AdminPanel";
import ElectoralPage from "./components/ElectoralPage";
import Private from "./components/Private";
import TestVote from "./components/TestVote";
import VoteRoute from "./components/VoteRoute";
import "./App.css";

const App = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };
  
  return (
    <BrowserRouter>
      <header className="navbar">
        <div className="navbar-logo">
          <h1>WZ</h1>
        </div>

        {/* Mobile menu icon */}
        <div
          className={`menu-icon ${menuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="Menu Toggle"
          aria-expanded={menuOpen}
          role="button"
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Navigation links */}
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <ul>
            <li><Link to="/FinalYearProject/" onClick={closeMenu}>Home</Link></li>
            <li><Link to="/electoral-page/" onClick={closeMenu}>Electoral Page</Link></li>
            <li><Link to="/register-parties/" onClick={closeMenu}>Political Parties </Link></li>
            <li><Link to="/vote-route/" onClick={closeMenu}>Vote</Link></li>
            <li><Link to="/private/" onClick={closeMenu}>Private</Link></li>
          </ul>
        </nav>
      </header>

      {/* Main content area */}
      <main>
        <Routes>
          <Route path="/FinalYearProject/" element={<Home />} />
          <Route path="/register-electoral/" element={<ElectoralRegister />} />
          <Route path="/update-elector/" element={<UpdateElector />} />
          <Route path="/register-parties/" element={<PoliticalPartiesRegister />} />
          <Route path="/vote/" element={<VotePage />} />
          <Route path="/vote-count/" element={<VoteCount />} />
          <Route path="/admin-panel/" element={<AdminPanel />} />
          <Route path="/electoral-page/" element={<ElectoralPage />} />
          <Route path="/private/" element={<Private />} />
          <Route path="/test-vote/" element={<TestVote />} />
          <Route path="/vote-route/" element={<VoteRoute />} />
        </Routes>
      </main>

     
      {/* Footer */}
      <footer>
        <p>&copy; 2024 Wasif Zafar. All rights reserved.</p>
      </footer>
    </BrowserRouter>
  );
};

// Home page component
const Home = () => (
  <div className="home">
    <h2>Welcome to the new election system.</h2>
    <p>Select a page from the menu to get started.</p>
  </div>
);

export default App;
