import { Link, useNavigate } from 'react-router-dom';
import '../style/Navbar.css';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/feed">🌍 Fil</Link>
        <Link to="/profile">👤 Profil</Link>
        <Link to="/search">🔍 Recherche</Link>
        <Link to="/messages">💬 Messages</Link>
        <Link to="/friends">🤝 Amis</Link>
      </div>
      <div className="nav-right">
        <button onClick={handleLogout}>🚪 Déconnexion</button>
      </div>
    </nav>
  );
}

export default Navbar;
