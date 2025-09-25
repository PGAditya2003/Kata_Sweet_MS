import { useEffect, useState } from "react";
import axios from "axios";

export default function Catalog({ user }) {
  const [sweets, setSweets] = useState([]);
  const [quantities, setQuantities] = useState({}); // store quantity per sweet
  const [loading, setLoading] = useState(true);
  const gstRate = 0.18;

  // Fetch all sweets from backend
  useEffect(() => {
    const fetchSweets = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/sweets");
        setSweets(res.data);
        // Initialize quantities to 1 for each sweet
        const initialQuantities = {};
        res.data.forEach(s => initialQuantities[s._id] = 1);
        setQuantities(initialQuantities);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSweets();
  }, []);

  const handleQuantityChange = (id, value) => {
    if (value < 1) value = 1;
    const sweet = sweets.find(s => s._id === id);
    if (value > sweet.stock) value = sweet.stock;
    setQuantities({ ...quantities, [id]: value });
  };

  const handlePurchase = async (sweet) => {
    const quantity = quantities[sweet._id];
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `http://localhost:5000/api/sweets/${sweet._id}/purchase`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update stock locally
      setSweets(sweets.map(s => 
        s._id === sweet._id ? { ...s, stock: res.data.stock } : s
      ));

      alert(`Purchase successful! Total price (incl GST): ₹${(quantity * sweet.price * (1 + gstRate)).toFixed(2)}`);
    } catch (err) {
      alert(err.response?.data?.message || "Purchase failed");
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this sweet?");
    if (!confirm) return;

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
        {sweets.map((sweet) => {
          const totalPrice = (quantities[sweet._id] * sweet.price * (1 + gstRate)).toFixed(2);

          return (
            <div key={sweet._id} className="bg-beige p-4 rounded-lg shadow-md flex flex-col">
              <img src={sweet.imageUrl} alt={sweet.name} className="h-40 w-full object-cover rounded-md mb-4"/>
              <h3 className="text-xl font-semibold text-brown-700">{sweet.name}</h3>
              <p className="text-brown-600 mb-2">Price: ₹{sweet.price}</p>
              <p className="text-brown-500 mb-2">Stock: {sweet.stock}</p>

              <div className="mb-2">
                <label className="text-brown-600">Quantity:</label>
                <input
                  type="number"
                  min={1}
                  max={sweet.stock}
                  value={quantities[sweet._id]}
                  onChange={(e) => handleQuantityChange(sweet._id, parseInt(e.target.value))}
                  className="border px-2 py-1 rounded w-full mt-1"
                />
              </div>

              <p className="text-brown-700 font-semibold mb-2">Total (incl 18% GST): ₹{totalPrice}</p>

              <button
                disabled={sweet.stock === 0 || !user}
                onClick={() => handlePurchase(sweet)}
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
          );
        })}
      </div>
    </div>
  );
}
