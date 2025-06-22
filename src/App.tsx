import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Home from './pages/Home';
import PrivateRoute from './components/PrivateRoute';  // ← nouveau
import Feed from './pages/Feed'; 
import Profile from './pages/Profile';
import Search from './pages/Search';
import ProfilePublic  from './pages/ProfilePublic';
import FriendRequests from './pages/FriendRequests';
import Messages from './pages/Messages';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/profile/:username" element={<ProfilePublic />} /> 
        <Route path="/friends" element={<FriendRequests />} />
        <Route path="/messages" element={<Messages />} />




        {/* Toutes les routes protégées passent par PrivateRoute */}
        <Route element={<PrivateRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<Search />} />
          {/* Ajoute ici d'autres pages privées si besoin */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
