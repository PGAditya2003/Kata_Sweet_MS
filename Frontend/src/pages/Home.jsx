// src/pages/Home.jsx
import { useNavigate } from "react-router-dom";
import BG from "../assets/sweetsBG.jpeg"

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="relative w-full h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:`url(${BG})`,
      }}
    >
      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>

      {/* Central button */}
      <button
        onClick={() => navigate("/catalog")}
        className="z-10 px-8 py-4 bg-yellow-600 text-white font-bold text-3xl rounded-full shadow-lg hover:bg-yellow-700 transition-all"
      >
        Check out our sweets
      </button>
    </div>
  );
}
