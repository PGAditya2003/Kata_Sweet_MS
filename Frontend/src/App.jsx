// src/App.jsx
import Navbar from "./components/Navbar";
import Catalog from "./pages/Catalog";
import { useState } from "react";

function App() {
  const [user, setUser] = useState(null);

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      {/* <div id="home" className="h-screen flex items-center justify-center">
        <h1 className="text-5xl font-bold text-yellow-700">Welcome to SweetDelights</h1>
      </div> */}
      <Catalog user={user} />
    </>
  );
}

export default App;
