import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Register.css';

const apiUrl = import.meta.env.VITE_API_URL;

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${apiUrl}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(`❌ ${data.error || 'Erreur lors de l’inscription'}`);
      } else {
        localStorage.setItem('pendingEmail', email);
        navigate('/verify');
      }
    } catch (err) {
      setMessage('❌ Impossible de contacter le serveur');
    }
  };

  return (
    <div className="register-container">
      <h2>Rejoins Social World 🌍</h2>
      <p className="subtitle">Crée ton compte et découvre un monde de connexions humaines.</p>

      <form onSubmit={handleRegister} className="register-form">
        <input
          type="email"
          placeholder="Adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Nom d’utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Créer mon compte</button>
      </form>

      {message && <p className="message">{message}</p>}

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Vous avez déjà un compte ? <a href="/login">Me connecter</a>
      </p>

      <p className="info-text">
        🚀 Social World te permet de partager, discuter et découvrir de nouvelles personnes en toute simplicité.
      </p>
    </div>
  );
}

export default Register;
