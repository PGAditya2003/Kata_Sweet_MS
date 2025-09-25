import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import SearchResults from "./pages/SearchResults";
import Orders from "./pages/Orders";

function App() {
  return (
    <Router>
      <Navbar />
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
              <Catalog />
            </Layout>
          }
        />
        <Route
          path="/orders"
          element={
            <Layout>
              <Orders />
            </Layout>
          }
        />
        <Route
          path="/search"
          element={
            <Layout>
              <SearchResults />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
