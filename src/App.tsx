import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import User from './pages/User';
import Email from './pages/Email';
import BusinessOwner from './pages/BusinessOwner';
import Registration from './pages/Registration';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import { auth, db, doc, getDoc } from './firebase';
import SolanaProvider from './solanaContext';
import DirectoryPage from './pages/DirectoryPage';
import DetailsPage from './pages/DetailsPage';
import BlogPostPage from './pages/BlogPostPage';
import RewardDetailPage from './pages/RewardDetailPage';
import UpdateBlogPost from './pages/UpdateBlogPost';
import UpdateReward from './pages/UpdateReward';
import './App.css';


const App: React.FC = () => {
  const [role, setRole] = useState<string | null>(localStorage.getItem("userRole"));

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        if (!role) {
          const docRef = doc(db, "users", authUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            setRole(userRole);
            localStorage.setItem("userRole", userRole);
          }
        }
      } else {
        setRole(null);
        localStorage.removeItem("userRole");
      }
    });
    return () => unsubscribe();
  }, [role]);

  return (
    <SolanaProvider>
      <Router>
        <NavBar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/login" element={<Login />} />
            <Route path="/directory" element={<DirectoryPage />} />
            <Route path="/business-owner/:id" element={<DetailsPage />} />
            <Route path="/blog/:id/:index" element={<BlogPostPage />} />
            <Route path="/blog/:id/:index/edit" element={<UpdateBlogPost />} />
            <Route path="/reward/:id/:index" element={<RewardDetailPage />} />
            <Route path="/reward/:id/:index/edit" element={<UpdateReward />} />
            <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
            <Route path="/user" element={<PrivateRoute element={<User />} requiredRole="user" />} />
            <Route path="/email" element={<PrivateRoute element={<Email />} />} />
            <Route path="/business-owner" element={<PrivateRoute element={<BusinessOwner />} requiredRole="business-owner" />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </SolanaProvider>
  );
};

export default App;
