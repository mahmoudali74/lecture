"use client";

import React, { useEffect, useState } from "react";

import NoItem from "../NoItem";
import Spinner from "../components/Spinner";

function getTokenFromCookies() {
  const cookieString = document.cookie;
  const cookies = cookieString.split("; ").reduce((acc, current) => {
    const [name, value] = current.split("=");
    acc[name] = value;
    return acc;
  }, {});
  return cookies.token || null;
}

export default function MyPaidLectures() {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getTokenFromCookies();
    if (!token) {
      setError("لم يتم العثور على التوكن.");
      setLoading(false);
      return;
    }

    async function fetchLectures() {
      try {
        const res = await fetch(
          "https://eng-mohamedkhalf.shop/api/Students/GetStudentLectures",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              accept: "application/json",
              lang: "ar",
            },
          }
        );

        const data = await res.json();
        console.log("📦 الرد الكامل:", data);

        if (data.errorCode !== 0) {
          setError(data.errorMessage || "حدث خطأ في جلب البيانات");
        } else {
          setLectures(data.data || []);
        }
      } catch (e) {
        console.error("❌ خطأ في الاتصال:", e);
        setError("خطأ في الاتصال بالخادم");
      } finally {
        setLoading(false);
      }
    }

    fetchLectures();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-600 font-bold">{error}</p>;
  if (lectures.length === 0) return <NoItem text=" لا توجد محاضررات مدفوعة" />;

  return (
    <div dir="rtl" className="p-4">
      <h2 className="text-2xl font-medium  mb-4 text-[#bf9916]">
        الدورات المشترك بها
      </h2>
      <ul className="space-y-4">
        {lectures.map((lecture) => (
          <li
            key={lecture.id}
            className="bg-[#f3f3f3] rounded-xl shadow-md p-4 border border-gray-200"
          >
            <p className="text-sm mb-1">
              <span className="text-[#bf9916] font-bold"> </span>
              <span className="text-[#bf9916] text-2xl">
                {lecture.lectureName}
              </span>
            </p>
            <p className="text-sm mb-1">
              <span className="text-[#bf9916] font-bold"> </span>
              <span className="text-black">{lecture.lectureType}</span>
            </p>
            <p className="text-sm mb-1">
              <span className="text-[#bf9916] font-bold">من: </span>
              <span className="text-black">
                {new Date(lecture.paidIn).toLocaleDateString()}
              </span>
            </p>
            <p className="text-sm mb-1">
              <span className="text-[#bf9916] font-bold">إلى: </span>
              <span className="text-black">
                {new Date(lecture.expire).toLocaleDateString()}
              </span>
            </p>
            <p className="text-sm mb-1">
              <span className="text-[#bf9916] font-bold">السعر: </span>
              <span className="text-green-600 font-bold">
                {lecture.price} جنيه
              </span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
