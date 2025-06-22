import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import '../style/Profile.css';

const apiUrl = import.meta.env.VITE_API_URL;

interface Media {
  id: number;
  url: string;
  type: 'image' | 'video';
}

interface UserProfile {
  username: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  isPrivate: boolean;
  medias?: Media[];
  followersCount?: number;
  followingCount?: number;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    avatarUrl: '',
    isPrivate: false,
  });

  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [showMediaForm, setShowMediaForm] = useState(false);
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProfile(data);
      setFormData({
        username: data.username || '',
        bio: data.bio || '',
        avatarUrl: data.avatarUrl || '',
        isPrivate: data.isPrivate || false,
      });
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (avatarFile) {
      const uploadForm = new FormData();
      uploadForm.append('file', avatarFile);

      const resUpload = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        body: uploadForm,
      });

      const data = await resUpload.json();
      if (data.url) {
        formData.avatarUrl = data.url;
      } else {
        alert("Échec de l'upload de l'avatar");
        return;
      }
    }

    const res = await fetch(`${apiUrl}/api/user/update`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Erreur lors de la mise à jour du profil");
      return;
    }

    setProfile(data.user);
    setIsEditing(false);
    setAvatarFile(null);
  };

  const handleMediaUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFile) return;

    const token = localStorage.getItem('token');
    const formDataUpload = new FormData();
    formDataUpload.append('file', mediaFile);

    const uploadRes = await fetch(`${apiUrl}/api/upload`, {
      method: 'POST',
      body: formDataUpload,
    });

    const { url } = await uploadRes.json();

    const res = await fetch(`${apiUrl}/api/user/media/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url, type: newMediaType }),
    });

    if (res.ok) {
      const media = await res.json();
      setProfile((prev) =>
        prev ? { ...prev, medias: [...(prev.medias || []), media] } : prev
      );
      setShowMediaForm(false);
      setMediaFile(null);
    } else {
      alert('Erreur lors de l’ajout du média');
    }
  };

  if (!profile) return <div>Chargement...</div>;

  return (
    <>
      <Navbar />
      <div className="p-4 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Mon Profil</h1>

        {!isEditing ? (
          <div className="profile-glass">
            <div className="profile-header">
              <div className="avatar-wrapper">
                <img src={profile.avatarUrl || '/default-avatar.png'} alt="avatar" />
              </div>
              <div className="profile-info">
                <p><strong>Email :</strong> {profile.email}</p>
                <p><strong>Nom d'utilisateur :</strong> {profile.username}</p>
                <p><strong>Bio :</strong> {profile.bio || 'Aucune bio renseignée'}</p>
                <p><strong>Privé :</strong> {profile.isPrivate ? 'Oui' : 'Non'}</p>

                <div className="flex gap-6 mt-3 text-center text-gray-700">
                  <div>
                    <div className="text-xl font-bold">{profile.followersCount ?? 0}</div>
                    <div className="text-sm">Abonnés</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold">{profile.followingCount ?? 0}</div>
                    <div className="text-sm">Abonnements</div>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Modifier
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="profile-glass space-y-4">
            <div>
              <label className="block mb-1">Nom d'utilisateur</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block mb-1">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block mb-1">Avatar</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPrivate"
                checked={formData.isPrivate}
                onChange={handleChange}
                className="mr-2"
              />
              <label>Profil privé</label>
            </div>

            <div className="flex gap-2 mt-4">
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Enregistrer
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        <div className="gallery-section mt-6">
          <div className="media-toggle mb-3">
            <button className={mediaType === 'image' ? 'active' : ''} onClick={() => setMediaType('image')}>
              🖼️ Photos
            </button>
            <button className={mediaType === 'video' ? 'active' : ''} onClick={() => setMediaType('video')}>
              🎥 Vidéos
            </button>
          </div>

          <div className="media-grid">
            {profile.medias
              ?.filter((media) => media.type === mediaType)
              .map((media) =>
                media.type === 'image' ? (
                  <img key={media.id} src={media.url} alt="" className="media-item" />
                ) : (
                  <video key={media.id} controls className="media-item">
                    <source src={media.url} />
                  </video>
                )
              )}
          </div>
        </div>

        <div className="add-media-section mt-6">
          {!showMediaForm ? (
            <button
              onClick={() => setShowMediaForm(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              ➕ Ajouter un média
            </button>
          ) : (
            <form onSubmit={handleMediaUpload} className="bg-gray-100 p-4 rounded space-y-2">
              <label className="block mb-1">Fichier média</label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
              />

              <div className="flex items-center gap-2">
                <label>Type :</label>
                <select
                  value={newMediaType}
                  onChange={(e) => setNewMediaType(e.target.value as 'image' | 'video')}
                >
                  <option value="image">📸 Image</option>
                  <option value="video">🎥 Vidéo</option>
                </select>
              </div>

              <div className="flex gap-2 mt-2">
                <button type="submit" className="bg-green-500 text-white px-4 py-1 rounded">
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => setShowMediaForm(false)}
                  className="bg-gray-500 text-white px-4 py-1 rounded"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
