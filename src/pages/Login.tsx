import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(`❌ ${data.error || 'Erreur lors de la connexion'}`);
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.user.username);
        setMessage(`✅ Connexion réussie`);
        setEmail('');
        setPassword('');
        navigate('/home');
      }
    } catch (err) {
      setMessage('❌ Erreur de connexion au serveur');
    }
  };

  return (
    <div className="login-container">
      <h2>Bienvenue sur Social World 👋</h2>
      <p className="subtitle">Connecte-toi pour retrouver ta communauté ✨</p>

      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="Adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Se connecter</button>
      </form>

      {message && <p className="message">{message}</p>}

      <p className="extra-text">
        Pas encore de compte ? <a href="/register">Inscris-toi gratuitement</a>
      </p>

      <p className="quote">🌍 “Le monde est plus petit quand on est connecté.”</p>
    </div>
  );
}

export default Login;
