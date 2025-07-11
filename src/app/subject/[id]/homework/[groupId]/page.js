"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Spinner from "@/app/components/Spinner";
import { FiArrowRight } from "react-icons/fi";
import { useUser } from "@/app/context/UserContext";

function getTokenFromCookies() {
  const cookieString = document.cookie;
  const cookies = cookieString.split("; ").reduce((acc, current) => {
    const [name, value] = current.split("=");
    acc[name] = value;
    return acc;
  }, {});
  return cookies.token || null;
}

export default function HomeworkGroupPage() {
  const { id: subjectId, groupId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const subjectTeacherId = searchParams.get("subjectTeacherId");

  const [token, setToken] = useState(null);
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedHomeworkId, setSelectedHomeworkId] = useState(null);
  const [paidMessage, setPaidMessage] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [feedbackColor, setFeedbackColor] = useState("");

  const { money, setMoney, subscribedGroups, addSubscribedGroup } = useUser();

  useEffect(() => {
    setToken(getTokenFromCookies());
  }, []);

  useEffect(() => {
    if (!token || !subjectTeacherId || !groupId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `https://eng-mohamedkhalf.shop/api/HomeWorks/GetHomeWorkLectures/${subjectTeacherId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              lang: "ar",
            },
          }
        );
        const json = await res.json();
        if (json.errorCode === 0) {
          const group = json.data.find((g) => g.id.toString() === groupId);
          setGroupData(group);
        }
      } catch (err) {
        console.error("Error fetching homework lectures:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, subjectTeacherId, groupId]);

  const isGroupSubscribed = subscribedGroups.includes(groupId?.toString());

  const handleHomeworkClick = (hwId) => {
    const price = groupData?.price || 0;

    if (price === 0 || isGroupSubscribed) {
      router.push(
        `/subject/${subjectId}/homework/${groupId}/video/${hwId}?subjectTeacherId=${subjectTeacherId}`
      );
    } else {
      setSelectedHomeworkId(hwId);
      setShowModal(true);
      setPaidMessage("");
    }
  };

  const handleSubscribeGroup = () => {
    setPaidMessage("باستخدام المحفظة");
  };

  const handleConfirmPayment = async () => {
    const price = groupData?.price || 0;
    setPaidMessage("");
    setShowModal(false);

    if (money >= price) {
      try {
        const res = await fetch(
          "https://eng-mohamedkhalf.shop/api/OnlineSubSubjects/PayOnlineSubSubjectLectures",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              lang: "ar",
              "Content-Type": "application/json-patch+json",
              accept: "text/plain",
            },
            body: JSON.stringify({
              onlineSubSubjectId: parseInt(groupId, 10),
            }),
          }
        );

        if (!res.ok) {
          throw new Error("فشل في الدفع");
        }

        const updatedBalance = money - price;
        setMoney(updatedBalance);
        localStorage.setItem("money", updatedBalance);

        addSubscribedGroup(groupId.toString());

        setFeedbackMessage("تم فتح الواجب للطالب");
        setFeedbackColor("bg-green-600");

        setTimeout(() => {
          setFeedbackMessage(null);
          router.push(
            `/subject/${subjectId}/homework/${groupId}/video/${selectedHomeworkId}?subjectTeacherId=${subjectTeacherId}`
          );
        }, 2000);
      } catch (error) {
        setFeedbackMessage("حدث خطأ أثناء الدفع");
        setFeedbackColor("bg-red-600");
        setTimeout(() => setFeedbackMessage(null), 2000);
      }
    } else {
      setFeedbackMessage("رصيد المحفظة غير كافى");
      setFeedbackColor("bg-red-600");
      setTimeout(() => setFeedbackMessage(null), 2000);
    }
  };

  if (loading) return <Spinner />;

  if (!groupData)
    return <p className="text-center text-red-600 mt-10">لا توجد بيانات</p>;

  return (
    <div className="min-h-screen p-4 bg-gray-50" dir="rtl">
      {/* زر الرجوع */}
      <div className="flex justify-end mb-4 fixed top-4 right-4 sm:right-8 z-10">
        <button
          onClick={() => router.back()}
          className="text-[#bf9916] text-2xl hover:text-[#a77f14] transition"
          title="رجوع"
        >
          <FiArrowRight />
        </button>
      </div>

      <h1 className="text-2xl font-bold text-[#bf9916] mb-6">
        الواجبات - <span>{groupData.name}</span>
      </h1>

      <div className="flex flex-col gap-4">
        {groupData.homeWorks?.map((hw) => (
          <button
            key={hw.id}
            onClick={() => handleHomeworkClick(hw.id)}
            className="bg-white shadow-md rounded p-6 text-[#bf9916] font-semibold text-lg text-right hover:bg-[#fdf8ee] transition"
          >
            {hw.name}
          </button>
        ))}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">اشتراك</h2>
            <p>يجب الاشتراك في الواجب أولاً</p>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={handleSubscribeGroup}
                className="text-purple-600"
              >
                اشتراك
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="text-purple-600"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {paidMessage && (
        <div
          onClick={handleConfirmPayment}
          className="fixed bottom-0 left-0 right-0 bg-white text-[#bf9916] text-center py-4 shadow z-[999] cursor-pointer"
        >
          {paidMessage}
        </div>
      )}

      {feedbackMessage && (
        <div
          className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 scale-90 animate-pulse text-white px-6 py-3 rounded-xl z-[1000] transition-all duration-500 ${feedbackColor}`}
        >
          {feedbackMessage}
        </div>
      )}
    </div>
  );
}
