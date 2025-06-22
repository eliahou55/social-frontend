import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Feed.css';
import Navbar from '../components/Navbar';
import { FaCommentDots, FaHeart, FaRegHeart } from 'react-icons/fa';

interface Post {
  id: number;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  author: {
    username: string;
    avatarUrl?: string;
  };
  _count: {
    comments: number;
    likes: number;
  };
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: {
    username: string;
    avatarUrl?: string;
  };
}

function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const token = localStorage.getItem('token');
  const currentUsername = localStorage.getItem('username');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3000/api/posts')
      .then((res) => res.json())
      .then((data) => setPosts(data));

    if (token) {
      fetch('http://localhost:3000/api/likes', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setLikedPosts(data.likedPostIds));
    }
  }, []);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      try {
        const previewUrl = URL.createObjectURL(file);
        setMediaPreview(previewUrl);
      } catch {
        setMediaPreview(null);
      }
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() && !mediaFile) {
      setMessage("⚠️ Vous ne pouvez pas publier un post vide.");
      return;
    }

    let mediaUrl = '';

    if (mediaFile) {
      const formData = new FormData();
      formData.append('file', mediaFile);

      try {
        const uploadRes = await fetch('http://localhost:3000/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        mediaUrl = uploadData.url;
      } catch {
        setMessage("❌ Erreur lors de l'upload du fichier.");
        return;
      }
    }

    try {
      const res = await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newPost, mediaUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage('❌ Erreur lors de la publication');
      } else {
        setPosts((prev) => [data, ...prev]);
        setNewPost('');
        setMediaFile(null);
        setMediaPreview(null);
        setMessage('✅ Publication réussie');
        setShowPostModal(false);
      }
    } catch {
      setMessage('❌ Vous devez vous connecter pour poster');
    }
  };

  const openCommentModal = async (postId: number) => {
    setSelectedPostId(postId);
    const res = await fetch(`http://localhost:3000/api/posts/${postId}/comments`);
    const data = await res.json();
    setComments(data);
  };

  const submitComment = async () => {
    if (!newComment.trim() || !selectedPostId) return;

    const res = await fetch(`http://localhost:3000/api/posts/${selectedPostId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: newComment }),
    });

    const data = await res.json();
    if (res.ok) {
      setComments((prev) => [...prev, data]);
      setNewComment('');
    }
  };

  const toggleLike = async (postId: number) => {
    const liked = likedPosts.includes(postId);
    const url = `http://localhost:3000/api/likes/${postId}`;
    const method = liked ? 'DELETE' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      setLikedPosts((prev) =>
        liked ? prev.filter((id) => id !== postId) : [...prev, postId]
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
              ...post,
              _count: {
                likes: post._count.likes + (liked ? -1 : 1),
                comments: post._count.comments,
              },
            }
            : post
        )
      );
    }
  };

  return (
    <div className="feed-layout">
      <Navbar />
      <div className="post-list">
        {posts.map((post) => (
          <div className="post" key={post.id}>
            <strong
              className="post-author-link"
              onClick={() =>
                navigate(post.author.username === currentUsername ? '/profile' : `/profile/${post.author.username}`)
              }
              style={{ cursor: 'pointer' }}
            >
              @{post.author.username}
            </strong>
            <span className="time">{new Date(post.createdAt).toLocaleString()}</span>
            <p>{post.content}</p>

            {post.mediaUrl && post.mediaUrl.trim() !== '' && (
              post.mediaUrl.includes('.mp4') || post.mediaUrl.includes('/video/')
                ? (
                  <video
                    src={post.mediaUrl}
                    width="100%"
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{ borderRadius: '10px', marginTop: '10px' }}
                  />
                ) : (
                  <img
                    src={post.mediaUrl}
                    alt="media"
                    style={{ width: '100%', borderRadius: '10px', marginTop: '10px' }}
                  />
                )
            )}
            <div className="post-actions">
              <span onClick={() => toggleLike(post.id)}>
                {likedPosts.includes(post.id) ? (
                  <FaHeart className="like-icon liked" />
                ) : (
                  <FaRegHeart className="like-icon" />
                )}
              </span>
              <span className="like-count">{post._count.likes}</span>

              <FaCommentDots className="comment-icon" onClick={() => openCommentModal(post.id)} />
              <span className="comment-count">{post._count.comments}</span>
            </div>
          </div>
        ))}
      </div>

      <button className="floating-button" onClick={() => setShowPostModal(true)}>＋</button>

      {showPostModal && (
        <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Créer un post ✍️</h3>
            <textarea
              placeholder="Exprime-toi..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            />
            <input type="file" accept="image/*,video/*" onChange={handleMediaChange} />
            {mediaPreview ? (
              mediaPreview.includes('video')
                ? <video src={mediaPreview} controls width="100%" />
                : <img src={mediaPreview} alt="preview" width="100%" />
            ) : mediaFile && (
              <p className="no-preview">🔍 Aucun aperçu disponible pour ce format, mais le fichier sera bien envoyé.</p>
            )}
            <button onClick={handlePost}>Publier</button>
            {message && <p className="feedback">{message}</p>}
          </div>
        </div>
      )}

      {selectedPostId && (
        <div className="modal-overlay" onClick={() => setSelectedPostId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Commentaires 🗨️</h3>
            <div className="comment-list">
              {comments.map((comment) => (
                <div key={comment.id} className="comment">
                  <strong>@{comment.author.username}</strong>
                  <span className="time">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                  <p>{comment.content}</p>
                </div>
              ))}
            </div>
            <textarea
              placeholder="Écris un commentaire..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button onClick={submitComment}>Envoyer</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Feed;
