"use client";
import React, { useEffect, useState } from "react";
import NoItem from "../../NoItem";
import { useRouter } from "next/navigation";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

function Spinner() {
  return (
    <div className="flex justify-center items-center h-screen relative">
      <div className="w-10 h-10 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getCookie("token");
    if (!token) {
      setOrders([]);
      setLoading(false);
      return;
    }

    fetch("https://eng-mohamedkhalf.shop/api/Order/GetOrders", {
      method: "GET",
      headers: {
        accept: "text/plain",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Response from server:", data);
        setOrders(data.data || []);
      })
      .catch(() => {
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  if (!orders || orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen relative">
        <button
          onClick={() => router.back()}
          className="text-[#bf9916] text-3xl absolute top-5 right-5 hover:text-yellow-600 transition"
          aria-label="الرجوع للخلف"
        >
          <i className="fa-solid fa-arrow-right"></i>
        </button>
        <NoItem text="لا توجد طلبات حتى الان" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 relative">
      <button
        onClick={() => router.back()}
        className="text-[#bf9916] text-3xl absolute top-5 right-5 hover:text-yellow-600 transition"
        aria-label="الرجوع للخلف"
      >
        <i className="fa-solid fa-arrow-right"></i>
      </button>

      <h2 className="text-2xl font-semibold mb-6 text-center">الطلبات</h2>
      <ul className="max-w-4xl mx-auto space-y-4">
        {orders.map((order) => (
          <li
            key={order.id}
            className="p-4 border border-gray-300 rounded-lg hover:shadow-lg transition cursor-pointer"
          >
            الطلب رقم <span className="text-[#bf9916]">{order.id}</span> -
            التاريخ: <span className="text-gray-700">{order.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
