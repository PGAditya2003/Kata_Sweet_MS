// src/pages/SearchResults.jsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

export default function SearchResults({ user }) {
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedSweet, setSelectedSweet] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Extract query parameter from URL
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("q") || "";

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/sweets/search?q=${encodeURIComponent(query)}`
        );
        setResults(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const openPurchaseModal = (sweet) => {
    setSelectedSweet(sweet);
    setQuantity(1);
    setShowModal(true);
  };

  const handlePurchase = async () => {
    if (!selectedSweet) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/orders",
        {
          sweetId: selectedSweet._id,
          quantity,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Purchased ${quantity} x ${selectedSweet.name}!`);
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Purchase failed");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 pt-24">
      <h1 className="text-2xl font-bold mb-6 text-brown-700">
        Search results for: <span className="text-yellow-700">"{query}"</span>
      </h1>

      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!loading && !error && results.length === 0 && (
        <p className="text-gray-600">No sweets found.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {results.map((sweet) => (
          <div
            key={sweet._id}
            className="flex flex-col bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition"
          >
            <img
              src={sweet.imageUrl}
              alt={sweet.name}
              className="h-40 w-full object-cover rounded-md mb-4"
            />
            <h2 className="text-lg font-semibold text-yellow-700">{sweet.name}</h2>
            <p className="text-gray-600 mb-1">Price: ₹{sweet.price}</p>
            <p className="text-gray-500 mb-2">In stock: {sweet.stock}</p>
            <button
              disabled={sweet.stock === 0 || !user}
              onClick={() => openPurchaseModal(sweet)}
              className="bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700 transition-colors mt-auto"
            >
              Purchase
            </button>
          </div>
        ))}
      </div>

      {/* Purchase Modal */}
      {showModal && selectedSweet && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4 text-yellow-700">
              Purchase {selectedSweet.name}
            </h2>
            <p className="mb-2">Price: ₹{selectedSweet.price}</p>
            <p className="mb-2">Available: {selectedSweet.stock}</p>
            <input
              type="number"
              min={1}
              max={selectedSweet.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.min(Math.max(1, parseInt(e.target.value)), selectedSweet.stock))}
              className="border px-2 py-1 rounded w-full mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                className="px-4 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-700 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
