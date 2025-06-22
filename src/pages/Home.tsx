import '../style/Home.css';
import Navbar from '../components/Navbar';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL;

function Home() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Sécurité : redirige vers login si pas de token
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUsername = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUsername(data.username);
        } else {
          navigate('/login');
        }
      } catch (err) {
        console.error('Erreur serveur:', err);
        navigate('/login');
      }
    };

    fetchUsername();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
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
