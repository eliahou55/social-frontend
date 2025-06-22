import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FollowButton from '../components/FollowButton';
import '../style/Profile.css';

const apiUrl = import.meta.env.VITE_API_URL;

interface Media {
  id: number;
  url: string;
  type: 'image' | 'video';
}

interface UserProfile {
  id: number;
  username: string;
  bio?: string | null;
  avatarUrl?: string | null;
  isPrivate: boolean;
  isFriend?: boolean;
  hasPendingFriendRequest?: boolean;
  followersCount?: number;
  followingCount?: number;
  medias?: Media[];
}

const ProfilePublic: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestSent, setRequestSent] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [error, setError] = useState('');
  const [canMessage, setCanMessage] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${apiUrl}/api/user/user/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || !contentType.includes('application/json')) {
          const text = await res.text();
          throw new Error(`Erreur ${res.status} : ${text.slice(0, 100)}`);
        }

        const data = await res.json();
        setProfile(data);
        setHasPendingRequest(data.hasPendingFriendRequest || false);

        if (!data.isPrivate || data.isFriend) {
          setCanMessage(true);
        }
      } catch (err: any) {
        console.error('❌ Erreur récupération profil :', err.message || err);
        setError(err.message || 'Erreur inconnue');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const sendFriendRequest = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${apiUrl}/api/friends/request`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ toUsername: username }),
      });

      if (res.ok) {
        setRequestSent(true);
      } else {
        const err = await res.json();
        alert(err.error || 'Erreur lors de la demande d’ami');
      }
    } catch (error) {
      alert('Erreur réseau ou serveur.');
    }
  };

  if (loading) return <div>Chargement du profil...</div>;
  if (error) return <div className="text-red-500 text-center mt-4">❌ {error}</div>;
  if (!profile) return <div>Profil introuvable.</div>;

  return (
    <>
      <Navbar />
      <div className="p-4 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">Profil de @{profile.username}</h1>

        <div className="profile-glass space-y-4">
          <div className="avatar-wrapper">
            <img src={profile.avatarUrl || '/default-avatar.png'} alt="avatar" />
          </div>

          <div className="flex justify-center gap-6 text-center text-gray-700">
            <div>
              <div className="text-xl font-bold">{profile.followersCount ?? 0}</div>
              <div className="text-sm">Abonnés</div>
            </div>
            <div>
              <div className="text-xl font-bold">{profile.followingCount ?? 0}</div>
              <div className="text-sm">Abonnements</div>
            </div>
          </div>

          {canMessage && (
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
              onClick={() => window.location.href = `/messages?userId=${profile.id}`}
            >
              💬 Envoyer un message
            </button>
          )}

          {!profile.isPrivate && !profile.isFriend && (
            <FollowButton targetUserId={profile.id} isPrivate={false} />
          )}

          {profile.isPrivate && !canMessage && !requestSent && !hasPendingRequest && (
            <button
              onClick={sendFriendRequest}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
            >
              ➕ Envoyer une demande d’ami
            </button>
          )}

          {profile.isPrivate && !canMessage && (requestSent || hasPendingRequest) && (
            <p className="text-yellow-500 text-center italic">Demande en attente... ⏳</p>
          )}

          {profile.bio && (
            <p><strong>Bio :</strong> {profile.bio}</p>
          )}

          <div className="media-grid">
            {profile.medias?.map((media) =>
              media.type === 'image' ? (
                <img key={media.id} src={media.url} alt="" className="media-item" />
              ) : (
                <video key={media.id} src={media.url} controls className="media-item" />
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePublic;
