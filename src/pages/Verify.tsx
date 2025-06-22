import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL;

export default function Verify() {
  const navigate = useNavigate();
  const email = localStorage.getItem('pendingEmail') || '';
  const [digits, setDigits] = useState(['', '', '', '']);
  const [msg, setMsg] = useState('');
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (idx: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const copy = [...digits];
    copy[idx] = value;
    setDigits(copy);
    if (value && idx < 3) inputs.current[idx + 1]?.focus();
  };

  const code = digits.join('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 4) return setMsg('Veuillez entrer les 4 chiffres');

    try {
      const res = await fetch(`${apiUrl}/api/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(`❌ ${data.error || 'Code incorrect'}`);
      } else {
        localStorage.removeItem('pendingEmail');
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.user.username);
        setMsg('✅ Code validé, redirection...');
        setTimeout(() => navigate('/home'), 1200);
      }
    } catch {
      setMsg('❌ Erreur serveur');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', textAlign: 'center' }}>
      <h2>Vérification de votre compte</h2>
      <p style={{ fontSize: 14 }}>{email}</p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
          {[0, 1, 2, 3].map(i => (
            <input
              key={i}
              ref={el => {
                inputs.current[i] = el;
              }}
              type="text"
              maxLength={1}
              value={digits[i]}
              onChange={e => handleChange(i, e.target.value)}
              style={{
                width: 50,
                height: 60,
                fontSize: 32,
                textAlign: 'center',
              }}
            />
          ))}
        </div>
        <button type="submit" style={{ width: '100%' }}>Valider</button>
      </form>

      {msg && <p style={{ marginTop: 20 }}>{msg}</p>}
    </div>
  );
}
