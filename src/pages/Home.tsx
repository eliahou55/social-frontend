import '../style/Home.css';
import Navbar from '../components/Navbar';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');

    // Sécurité : si pas de token, redirection vers login
    if (!token) {
      navigate('/login');
    }

    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear(); // Supprime le token, username, etc.
    navigate('/login');   // Redirige vers la page login
  };

  return (
    <>
      <Navbar />
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Bonjour {username || 'utilisateur'} </h1>
        <button onClick={handleLogout} style={{ marginTop: '20px' }}>
          Se déconnecter
        </button>
      </div>
    </>
  );
}

export default Home;
