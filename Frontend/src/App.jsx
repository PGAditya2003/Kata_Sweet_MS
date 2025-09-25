import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import SearchResults from "./pages/SearchResults";
import Orders from "./pages/Orders";

function App() {
  const [user, setUser] = useState(null);

  // On mount, check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role"); // optional
    if (token) setUser({ token, username, role });
  }, []);

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/catalog"
          element={
            <Layout>
              <Catalog user={user} />
            </Layout>
          }
        />
        <Route
          path="/orders"
          element={
            <Layout>
              <Orders user={user} />
            </Layout>
          }
        />
        <Route
          path="/search"
          element={
            <Layout>
              <SearchResults user={user} />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
