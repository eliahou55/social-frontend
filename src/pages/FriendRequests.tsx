import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import '../style/FriendRequests.css';

const apiUrl = import.meta.env.VITE_API_URL;

interface RequestUser {
  id: number;
  username: string;
  avatarUrl?: string;
}

interface FriendRequest {
  id: number;
  sender?: RequestUser;
  receiver?: RequestUser;
}

const FriendRequests: React.FC = () => {
  const [received, setReceived] = useState<FriendRequest[]>([]);
  const [sent, setSent] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<RequestUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem('token');
      const [reqRes, friendsRes] = await Promise.all([
        fetch(`${apiUrl}/api/friends/requests`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${apiUrl}/api/friends/list`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const reqData = await reqRes.json();
      const friendsData = await friendsRes.json();
      setReceived(reqData.received);
      setSent(reqData.sent);
      setFriends(friendsData);
      setLoading(false);
    };

    fetchAll();
  }, []);

  const respondToRequest = async (id: number, action: 'accept' | 'decline') => {
    const token = localStorage.getItem('token');

    const res = await fetch(`${apiUrl}/api/friends/respond`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requestId: id, action }),
    });

    if (res.ok) {
      setReceived((prev) => prev.filter((r) => r.id !== id));
    } else {
      alert('Erreur lors du traitement de la demande');
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <>
      <Navbar />
      <div className="friend-container">
        {/* Colonne gauche */}
        <div className="requests-column">
          <h2>📥 Demandes reçues</h2>
          {received.length === 0 ? (
            <p>Aucune demande reçue.</p>
          ) : (
            received.map((req) => (
              <div key={req.id} className="request-card">
                <div className="request-info">
                  <img src={req.sender?.avatarUrl || '/default-avatar.png'} alt="avatar" />
                  <span>@{req.sender?.username}</span>
                </div>
                <div className="request-actions">
                  <button className="accept" onClick={() => respondToRequest(req.id, 'accept')}>
                    ✅ Accepter
                  </button>
                  <button className="decline" onClick={() => respondToRequest(req.id, 'decline')}>
                    ❌ Refuser
                  </button>
                </div>
              </div>
            ))
          )}

          <h2>📤 Demandes envoyées</h2>
          {sent.length === 0 ? (
            <p>Aucune demande envoyée.</p>
          ) : (
            sent.map((req) => (
              <div key={req.id} className="sent-card">
                <img src={req.receiver?.avatarUrl || '/default-avatar.png'} alt="avatar" />
                <span>@{req.receiver?.username}</span>
                <span className="pending">En attente...</span>
              </div>
            ))
          )}
        </div>

        {/* Colonne droite */}
        <div className="friends-column">
          <h2>👫 Amis</h2>
          {friends.length === 0 ? (
            <p>Tu n'as pas encore d'amis 🥲</p>
          ) : (
            friends.map((friend) => (
              <div key={friend.id} className="friend-card">
                <img src={friend.avatarUrl || '/default-avatar.png'} alt="avatar" />
                <span>@{friend.username}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default FriendRequests;
