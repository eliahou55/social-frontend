import React, { useState, useEffect } from 'react';
import axios from 'axios';

type FollowButtonProps = {
  targetUserId: number;
  isPrivate: boolean;
};

const backend = 'http://localhost:3000'; // 👈 URL du backend Express

const FollowButton: React.FC<FollowButtonProps> = ({ targetUserId, isPrivate }) => {
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔍 Vérifie si on suit déjà l'utilisateur
  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${backend}/api/follow/status/${targetUserId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setIsFollowing(res.data.isFollowing);
    } catch (err) {
      console.error('Erreur de statut de follow', err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [targetUserId]);

  const handleFollow = async () => {
    setLoading(true);
    try {
      if (isPrivate) {
        await axios.post(`${backend}/api/friend-request/send`, { targetUserId }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        alert("Demande d'ami envoyée !");
      } else {
        await axios.post(`${backend}/api/follow`, { targetUserId }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('❌ Erreur lors du follow', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async () => {
    setLoading(true);
    try {
      await axios.delete(`${backend}/api/follow`, {
        data: { targetUserId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setIsFollowing(false);
    } catch (err) {
      console.error('❌ Erreur lors du unfollow', err);
    } finally {
      setLoading(false);
    }
  };

  if (isFollowing === null) return <button disabled>Chargement...</button>;

  return (
    <button
      onClick={isFollowing ? handleUnfollow : handleFollow}
      disabled={loading}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        backgroundColor: isFollowing ? '#e74c3c' : '#3498db',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        width: '100%',
      }}
    >
      {loading
        ? 'Chargement...'
        : isFollowing
        ? 'Ne plus suivre'
        : isPrivate
        ? 'Demander en ami'
        : 'Suivre'}
    </button>
  );
};

export default FollowButton;
