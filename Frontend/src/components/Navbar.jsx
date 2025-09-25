// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

export default function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);

  // On mount, check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username"); // optional, store username on login/register
    if (token) setUser({ token, username });
  }, []);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem("token", userData.token);
    localStorage.setItem("username", userData.username || "User");
    setUser({ token: userData.token, username: userData.username || "User" });
    setShowLogin(false);
  };

  const handleRegisterSuccess = (userData) => {
    localStorage.setItem("token", userData.token);
    localStorage.setItem("username", userData.username || "User");
    setUser({ token: userData.token, username: userData.username || "User" });
    setShowRegister(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUser(null);
  };

  return (
    <>
      <nav className="fixed top-0 w-full bg-beige shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-16 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold text-yellow-700">SweetDelights</div>
          <div className="hidden md:flex space-x-8 text-brown-700 font-medium">
            <a href="#home" className="hover:text-yellow-600 transition-colors">Home</a>
            <a href="#catalog" className="hover:text-yellow-600 transition-colors">Catalog</a>
            <a href="#contact" className="hover:text-yellow-600 transition-colors">Contact</a>
          </div>
          <div className="hidden md:flex space-x-4">
            {!user ? (
              <>
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => setShowRegister(true)}
                  className="border border-yellow-600 text-yellow-600 px-4 py-2 rounded-md hover:bg-yellow-600 hover:text-white transition-colors"
                >
                  Register
                </button>
              </>
            ) : (
              <>
              <span className="px-4 py-2">{user.username}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Modals */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onRegisterSuccess={handleRegisterSuccess}
      />
    </>
  );
}
