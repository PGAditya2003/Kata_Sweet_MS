// src/components/Layout.jsx
import BG from "../assets/sweetsBG.jpeg"; // make sure extension is correct

export default function Layout({ children }) {
  return (
    <div className="relative min-h-screen w-full">
      {/* Fixed background */}
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center z-0"
        style={{
          backgroundImage: `url(${BG})`,
        }}
      ></div>

      {/* Optional overlay for contrast */}
      <div className="fixed inset-0 bg-black bg-opacity-20 z-0"></div>

      {/* Page content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
