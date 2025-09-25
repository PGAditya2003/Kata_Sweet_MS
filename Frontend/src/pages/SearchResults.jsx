// src/pages/SearchResults.jsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function SearchResults() {
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const res = await fetch(
          `http://localhost:5000/api/sweets/search?q=${encodeURIComponent(query)}`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

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
            className="border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition"
          >
            <h2 className="text-lg font-semibold text-yellow-700">{sweet.name}</h2>
            <p className="text-gray-600">₹{sweet.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
