import React, { useEffect, useState } from "react";
import axios from "axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/orders/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading)
    return (
      <div className="text-center py-10 text-lg font-semibold text-gray-700">
        Loading orders...
      </div>
    );

  if (!orders.length)
    return (
      <div className="text-center py-10 text-lg font-semibold text-gray-700">
        No orders found
      </div>
    );

  return (
    <div className="mt-10 max-w-7xl mx-auto px-4 md:px-16 py-6">
      <h2 className="text-4xl font-bold text-white mt-10 mb-6 text-center">
        Recent Orders
      </h2>

      <div className="flex flex-col space-y-4">
        {/* Header row */}
        <div className="hidden md:flex bg-gray-100 font-semibold text-gray-700 px-4 py-2 rounded-t-lg">
          <div className="w-1/4">Sweet Name</div>
          <div className="w-1/4">Username</div>
          <div className="w-1/6">Quantity</div>
          <div className="w-1/6">Total Price</div>
          <div className="w-1/6">Date</div>
        </div>

        {orders.map((order) => (
          <div
            key={order._id}
            className="flex flex-col md:flex-row bg-white shadow-md rounded-lg overflow-hidden px-4 py-3 md:items-center"
          >
            <div className="md:w-1/4 font-medium text-yellow-600">{order.sweetName}</div>
            <div className="md:w-1/4 text-gray-700">{order.username}</div>
            <div className="md:w-1/6 text-gray-700">{order.quantity}</div>
            <div className="md:w-1/6 text-gray-700">₹{order.totalPrice.toFixed(2)}</div>
            <div className="md:w-1/6 text-gray-500 text-sm">
              {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
