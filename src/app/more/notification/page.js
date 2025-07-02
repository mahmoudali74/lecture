"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NoItem from "../../NoItem";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

function Spinner() {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="w-10 h-10 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function NotificationPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = getCookie("token");
        if (!token) {
          setNotifications([]);
          setLoading(false);
          return;
        }

        const res = await fetch(
          "https://eng-mohamedkhalf.shop/api/Notification/GetAllNotifications",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              accept: "*/*",
            },
          }
        );

        const data = await res.json();
        console.log("الرد من السيرفر:", data);

        if (data?.data) {
          setNotifications(data.data);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error("حدث خطأ:", error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="p-5 min-h-[60vh] flex flex-col">
      <div className="flex items-center justify-center mt-2 relative">
        <p className="text-[#bf9916] text-center text-2xl font-semibold">
          الإشعارات
        </p>
        <button
          onClick={() => router.back()}
          className="text-[#bf9916] text-2xl absolute right-0 top-0"
          aria-label="رجوع"
        >
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : notifications.length === 0 ? (
        <div className="flex-grow flex items-center justify-center mt-15">
          <NoItem text="لا توجد اشعارات الان " />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {notifications.map((item, index) => (
            <div
              key={index}
              className="bg-white border shadow-md rounded-xl p-4 text-right"
            >
              <p className="font-bold text-[#bf9916] text-lg mb-1">
                {item.title}
              </p>
              <p className="text-gray-700">{item.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationPage;
