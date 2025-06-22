import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Home from './pages/Home';
import PrivateRoute from './components/PrivateRoute';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Search from './pages/Search';
import ProfilePublic from './pages/ProfilePublic';
import FriendRequests from './pages/FriendRequests';
import Messages from './pages/Messages';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirection par défaut vers /login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Pages publiques */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/profile/:username" element={<ProfilePublic />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/friends" element={<FriendRequests />} />
        <Route path="/messages" element={<Messages />} />

        {/* Pages protégées */}
        <Route element={<PrivateRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<Search />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
