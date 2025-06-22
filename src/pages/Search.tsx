import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../style/Search.css';

interface User {
  id: number;
  username: string;
  avatarUrl?: string;
  bio?: string;
}

function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const currentUsername = localStorage.getItem('username');
  const navigate = useNavigate();

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchTerm]);

  const searchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:3000/api/users/search?q=${searchTerm}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Erreur lors de la recherche des utilisateurs');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page">
      <Navbar />
      <div className="background-animated"></div>
      <div className="search-container">
        <h2>🔍 Rechercher des utilisateurs</h2>
        <p className="subtitle">“Trouve de nouvelles connexions, découvre des profils uniques.”</p>

        <div className="search-box">
          <input
            type="text"
            placeholder="Nom d'utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading && <p className="loading">Chargement...</p>}
        {error && <p className="error">{error}</p>}

        <div className="users-list">
          {users.map((user) => (
            <div
              key={user.id}
              className="user-card"
              onClick={() =>
                navigate(user.username === currentUsername ? '/profile' : `/profile/${user.username}`)
              }
            >
              <div className="user-info">
                <img
                  src={user.avatarUrl || '/default-avatar.png'}
                  alt={`Avatar de ${user.username}`}
                  className="avatar"
                />
                <div>
                  <strong>@{user.username}</strong>
                  <p>{user.bio || 'Profil privé'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {searchTerm.length >= 2 && users.length === 0 && !loading && !error && (
          <p className="no-result">Aucun utilisateur trouvé</p>
        )}
      </div>
    </div>
  );
}

export default Search;
