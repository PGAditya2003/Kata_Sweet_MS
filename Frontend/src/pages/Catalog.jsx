import { useEffect, useState } from "react";
import axios from "axios";

export default function Catalog({ user }) {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchaseSweet, setPurchaseSweet] = useState(null); // sweet selected for purchase
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const gstRate = 0.18;

  // Fetch sweets
  useEffect(() => {
    const fetchSweets = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/sweets");
        setSweets(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSweets();
  }, []);

  const openPurchaseModal = (sweet) => {
    setPurchaseSweet(sweet);
    setPurchaseQuantity(1);
    setShowModal(true);
  };

  const handlePurchase = async () => {
    if (!purchaseSweet || !user) return;

    const quantity = parseInt(purchaseQuantity);
    if (isNaN(quantity) || quantity < 1) {
      alert("Enter a valid quantity");
      return;
    }

    if (quantity > purchaseSweet.stock) {
      alert("Not enough stock available");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // 1️⃣ Update stock in sweets collection
      const res = await axios.put(
        `http://localhost:5000/api/sweets/${purchaseSweet._id}/purchase`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2️⃣ Save order
  await axios.post(
  "http://localhost:5000/api/orders",
  {
    sweetId: purchaseSweet._id, // pass the sweet's ID
    quantity,                   // quantity to purchase
  },
  { headers: { Authorization: `Bearer ${token}` } }
);

      // Update stock locally
      setSweets(sweets.map(s =>
        s._id === purchaseSweet._id ? { ...s, stock: res.data.stock } : s
      ));

      alert(`Purchase successful! Total (incl GST): ₹${(quantity * purchaseSweet.price * (1 + gstRate)).toFixed(2)}`);
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Purchase failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sweet?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/sweets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSweets(sweets.filter(s => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  if (loading) return <div className="text-center py-10">Loading sweets...</div>;

  return (
    <div id="catalog" className="mt-10 max-w-7xl mx-auto px-4 md:px-16 py-12">
      <h2 className="text-3xl font-bold text-yellow-700 mb-8">Sweet Catalog</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {sweets.map((sweet) => (
          <div key={sweet._id} className="bg-white p-4 rounded-lg shadow-md flex flex-col">
            <img src={sweet.imageUrl} alt={sweet.name} className="h-40 w-full object-cover rounded-md mb-4"/>
            <h3 className="text-xl font-semibold text-brown-700">{sweet.name}</h3>
            <p className="text-brown-600 mb-2">Price: ₹{sweet.price}</p>
            <p className="text-brown-500 mb-2">In Stock: {sweet.stock}</p>

            <button
              disabled={sweet.stock === 0 || !user}
              onClick={() => openPurchaseModal(sweet)}
              className="bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700 transition-colors mb-2"
            >
              Purchase
            </button>

            {user?.role === "admin" && (
              <button
                onClick={() => handleDelete(sweet._id)}
                className="bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete (Admin)
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Purchase Modal */}
      {showModal && purchaseSweet && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-80">
            <h3 className="text-xl font-semibold mb-4">{purchaseSweet.name}</h3>
            <p className="mb-2">Available: {purchaseSweet.stock}</p>
            <input
              type="number"
              min={1}
              max={purchaseSweet.stock}
              value={purchaseQuantity}
              onChange={(e) => setPurchaseQuantity(e.target.value)}
              className="border px-2 py-1 rounded w-full mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Buy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
