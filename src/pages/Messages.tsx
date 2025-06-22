import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar'; // ✅ ajouté ici
import '../style/Messages.css';

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  createdAt: string;
}

interface Conversation {
  friend: {
    id: number;
    username: string;
    avatarUrl: string | null;
  };
  lastMessage: Message | null;
}

const Messages: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [canMessage, setCanMessage] = useState(true);
  const [searchParams] = useSearchParams();

  const token = localStorage.getItem('token');
  const userId = searchParams.get('userId');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/messages/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const data = await res.json();
        setConversations(data);

        const conv = userId
          ? data.find((c: any) => c.friend.id === parseInt(userId))
          : data[0];

        if (conv) {
          setSelected(conv);
          fetchMessages(conv.friend.id);
        }
      } catch (err: any) {
        console.error('❌ Erreur chargement conversations :', err.message);
        setError("Impossible de charger les conversations.");
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId);
      } catch (e) {
        console.error('Erreur décodage token :', e);
      }
    }
  }, []);

  useEffect(() => {
    const box = document.querySelector('.messages');
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages]);

  const fetchMessages = async (friendId: number) => {
    try {
      const res = await fetch(`http://localhost:3000/api/messages/${friendId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erreur chargement messages');
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('❌ Erreur chargement messages :', err);
      setError("Impossible de charger les messages.");
    }
  };

  const handleSelect = async (conv: Conversation) => {
    setSelected(conv);
    await fetchMessages(conv.friend.id);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selected) return;

    try {
      const res = await fetch(`http://localhost:3000/api/messages/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage, receiverId: selected.friend.id }),
      });

      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setNewMessage('');
      }
    } catch (err) {
      console.error("❌ Erreur envoi message :", err);
    }
  };

  const handleStartConversation = async () => {
    if (!search.trim()) return;

    try {
      const res = await fetch(`http://localhost:3000/api/user/user/${search}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setError("Utilisateur introuvable ou inaccessible");
        return;
      }

      const user = await res.json();

      const newConv: Conversation = {
        friend: {
          id: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl || null,
        },
        lastMessage: null,
      };

      setSelected(newConv);
      setMessages([]);
      setCanMessage(!user.isPrivate || user.isFriend);
    } catch (err) {
      console.error("❌ Erreur démarrage conversation :", err);
      setError("Impossible de démarrer la conversation");
    }
  };

  const sendFriendRequest = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`http://localhost:3000/api/user/friends/request`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ toUsername: selected.friend.username }),
      });
      if (res.ok) {
        alert("Demande envoyée ✅");
      } else {
        alert("Erreur lors de l'envoi de la demande.");
      }
    } catch (err) {
      console.error("Erreur demande ami :", err);
    }
  };

  return (
    <>
      <Navbar /> {/* ✅ On ajoute ici la navbar */}
      <div className="messaging-container">
        <aside className="sidebar">
          <h2>💬 Discussions</h2>
          {error && <p className="error-msg">{error}</p>}

          <div className="start-new-chat">
            <input
              type="text"
              placeholder="🔎 Pseudo de l'ami..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button onClick={handleStartConversation}>Démarrer</button>
          </div>

          {conversations.map((conv) => (
            <div
              key={conv.friend.id}
              className={`conversation ${selected?.friend.id === conv.friend.id ? 'active' : ''}`}
              onClick={() => handleSelect(conv)}
            >
              <img src={conv.friend.avatarUrl || '/default-avatar.png'} alt="avatar" />
              <div>
                <p className="username">@{conv.friend.username}</p>
                <p className="preview">{conv.lastMessage?.content || 'Pas encore de message'}</p>
              </div>
            </div>
          ))}
        </aside>

        <main className="chat-panel">
          {selected ? (
            <>
              <header className="chat-header">
                <img src={selected.friend.avatarUrl || '/default-avatar.png'} alt="avatar" />
                <h3>@{selected.friend.username}</h3>
              </header>

              <div className="messages">
                {messages.map((m) => {
                  const isSent = m.senderId === currentUserId;
                  return (
                    <div key={m.id} className={`bubble ${isSent ? 'sent' : 'received'}`}>
                      {!isSent && (
                        <img
                          src={selected.friend.avatarUrl || '/default-avatar.png'}
                          alt="avatar"
                          className="avatar"
                        />
                      )}
                      <div className="content">
                        <p className="text">{m.content}</p>
                        <span className="time">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {canMessage ? (
                <div className="send-bar">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Écris un message..."
                  />
                  <button onClick={handleSend}>📨</button>
                </div>
              ) : (
                <div className="locked-chat">
                  🔒 Ce profil est privé. Envoyez une demande d’ami pour discuter.
                  <br />
                  <button onClick={sendFriendRequest}>Envoyer une demande d’ami</button>
                </div>
              )}
            </>
          ) : (
            <div className="placeholder">
              <p>👉 Sélectionne une conversation à gauche</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Messages;
