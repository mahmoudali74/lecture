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

export default function QrGroupsPage() {
  const { id: subjectId } = useParams();
  const searchParams = useSearchParams();
  const subjectTeacherId = searchParams.get("subjectTeacherId");
  const router = useRouter();

  const [token, setToken] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setToken(getTokenFromCookies());
  }, []);

  useEffect(() => {
    if (!token || !subjectTeacherId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `https://eng-mohamedkhalf.shop/api/QrSubSubjects/GetQrSubSubjects/${subjectTeacherId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              lang: "ar",
            },
          }
        );
        const json = await res.json();
        if (json.errorCode === 0) setGroups(json.data);
      } catch (err) {
        console.error("QR Group Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, subjectTeacherId]);

  if (loading) return <Spinner />;
  if (!groups.length) return <NoItem text="لا توجد مجموعات QR" />;

  return (
    <div className="p-4 bg-gray-50 min-h-screen" dir="rtl">
      <button
        onClick={() => router.back()}
        className="text-[#bf9916] text-3xl mb-4"
      >
        &#8594;
      </button>
      <h1 className="text-2xl font-bold text-[#bf9916] mb-6">
        مجموعات محاضرات QR
      </h1>
      <div className="flex flex-col gap-4">
        {groups.map((group) => (
          <div
            key={group.id}
            onClick={() =>
              router.push(
                `/subject/${subjectId}/qrlecture/${group.id}?subjectTeacherId=${subjectTeacherId}`
              )
            }
            className="bg-white p-6 shadow-md rounded cursor-pointer text-[#bf9916] font-semibold text-lg"
          >
            {group.name}
          </div>
        ))}
      </div>
    </div>
  );
}
