"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Spinner from "@/app/components/Spinner";
import NoItem from "@/app/NoItem";

function getTokenFromCookies() {
  const cookieString = document.cookie;
  const cookies = cookieString.split("; ").reduce((acc, current) => {
    const [name, value] = current.split("=");
    acc[name] = value;
    return acc;
  }, {});
  return cookies.token || null;
}

export default function BookLinksPage() {
  const { id: subjectId, bookId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const subjectTeacherId = searchParams.get("subjectTeacherId");
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    setToken(getTokenFromCookies());
  }, []);

  useEffect(() => {
    if (!token || !bookId) return;

    async function fetchBookDetails() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://eng-mohamedkhalf.shop/api/Books/GetBookDetails/${bookId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              lang: "ar",
            },
          }
        );
        const json = await res.json();
        if (json.errorCode !== 0) {
          setLinks([]);
          setError("لا يوجد بيانات");
        } else {
          setLinks(json.data?.links || []);
        }
      } catch (e) {
        console.error(e);
        setError("حدث خطأ أثناء جلب البيانات");
        setLinks([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBookDetails();
  }, [token, bookId]);

  return (
    <div className="min-h-screen p-4 bg-gray-50" dir="rtl" lang="ar">
      {/* زر الرجوع ثابت أعلى اليمين */}
      <div className="flex justify-end fixed top-4 right-4 z-10">
        <button
          onClick={() => router.back()}
          className="text-[#bf9916] text-2xl hover:text-[#a77f14] transition"
          title="رجوع"
        >
          &#8592;
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6 text-[#bf9916]">عناوين الكتاب</h1>

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : links.length === 0 ? (
        <NoItem text="لا يوجد عناوين للكتاب" />
      ) : (
        <ul className="space-y-3">
          {links.map((linkItem, index) => (
            <li
              key={index}
              className="bg-white p-4 rounded shadow cursor-pointer hover:bg-yellow-100 transition"
              onClick={() => {
                if (linkItem.url) window.open(linkItem.url, "_blank");
              }}
            >
              <h3 className="text-[#bf9916] font-semibold text-lg mb-1">
                {linkItem.title || `رابط ${index + 1}`}
              </h3>
              {linkItem.description && (
                <p className="text-gray-700 text-sm">{linkItem.description}</p>
              )}
              <p className="text-blue-600 underline mt-1 cursor-pointer">
                اضغط لفتح الرابط
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
