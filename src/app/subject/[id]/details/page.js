"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { FaVideo, FaQrcode, FaBook, FaPen } from "react-icons/fa";
import NoItem from "@/app/NoItem";
import Spinner from "@/app/components/Spinner";
import { motion, AnimatePresence } from "framer-motion";

const tabs = [
  {
    key: "online",
    label: "محاضرات أونلاين",
    icon: <FaVideo />,
    route: "lecture",
  },
  {
    key: "qr",
    label: "محاضرات QR",
    icon: <FaQrcode />,
    route: "qrlecture",
  },
  {
    key: "homework",
    label: "الواجبات",
    icon: <FaPen />,
    route: "homework",
  },
  {
    key: "books",
    label: "الكتب",
    icon: <FaBook />,
  },
];

function getTokenFromCookies() {
  const cookieString = document.cookie;
  const cookies = cookieString.split("; ").reduce((acc, current) => {
    const [name, value] = current.split("=");
    acc[name] = value;
    return acc;
  }, {});
  return cookies.token || null;
}

export default function DetailsPage() {
  const { id: subjectId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const subjectTeacherId = searchParams.get("subjectTeacherId");
  const [activeTab, setActiveTab] = useState("online");
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [showMsg, setShowMsg] = useState(false);
  const [msgText, setMsgText] = useState("");

  useEffect(() => {
    setToken(getTokenFromCookies());
  }, []);

  useEffect(() => {
    if (!token || !subjectTeacherId) return;

    async function fetchData(url) {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            lang: "ar",
          },
        });
        const json = await res.json();
        if (json.errorCode !== 0) {
          setData([]);
        } else {
          setData(json.data || []);
        }
      } catch (e) {
        console.error(e);
        setError("خطأ أثناء جلب البيانات");
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    if (activeTab === "online") {
      fetchData(
        `https://eng-mohamedkhalf.shop/api/OnlineSubSubjects/GetOnlineSubSubjects/${subjectTeacherId}`
      );
    } else if (activeTab === "qr") {
      fetchData(
        `https://eng-mohamedkhalf.shop/api/QrSubSubjects/GetQrSubSubjects/${subjectTeacherId}`
      );
    } else if (activeTab === "homework") {
      fetchData(
        `https://eng-mohamedkhalf.shop/api/HomeWorks/GetHomeWorkLectures/${subjectTeacherId}`
      );
    } else if (activeTab === "books") {
      fetchData(
        `https://eng-mohamedkhalf.shop/api/Books/GetBooksTeacher/${subjectTeacherId}`
      );
    } else {
      setData([]);
    }
  }, [activeTab, subjectTeacherId, token]);

  const handleNoLecturesClick = () => {
    setMsgText(
      activeTab === "online"
        ? "لا توجد محاضرات الآن"
        : activeTab === "qr"
        ? "لا توجد محاضرات QR الآن"
        : activeTab === "homework"
        ? "لا توجد واجبات الآن"
        : activeTab === "books"
        ? "لا توجد كتب لهذا المدرس"
        : "لا يوجد عناصر"
    );
    setShowMsg(true);

    setTimeout(() => {
      setShowMsg(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col min-h-screen" dir="rtl">
      <div className="bg-[#bf9916] p-4 rounded-b-3xl shadow-md relative">
        <button
          onClick={() => router.back()}
          className="text-white text-2xl absolute right-4 top-4"
          title="رجوع"
        >
          &#8594;
        </button>
        <h1 className="text-3xl text-white font-bold mt-8 mb-4 ">الرياضيات</h1>

        <div className="grid grid-cols-2 gap-8 place-items-center mt-4 w-[90%] mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center rounded w-[80px] h-[80px] text-xs justify-center ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-blue-500 text-white"
              }`}
            >
              <div className="text-xl mb-1">{tab.icon}</div>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 overflow-visible relative">
        {loading ? (
          <Spinner />
        ) : error ? (
          <p className="text-center text-red-600 font-bold">{error}</p>
        ) : data.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-center text-[#bf9916] font-bold text-xl mt-20"
          >
            {activeTab === "online"
              ? "لا توجد محاضرات الآن"
              : activeTab === "qr"
              ? "لا توجد محاضرات QR الآن"
              : activeTab === "homework"
              ? "لا توجد واجبات الآن"
              : activeTab === "books"
              ? "لا توجد كتب لهذا المدرس"
              : "لا يوجد عناصر"}
          </motion.div>
        ) : (
          <GroupGrid
            data={data}
            type={activeTab}
            routePrefix={tabs.find((t) => t.key === activeTab)?.route || ""}
            subjectId={subjectId}
            subjectTeacherId={subjectTeacherId}
            onNoLecturesClick={handleNoLecturesClick}
          />
        )}

        <AnimatePresence>
          {showMsg && (
            <motion.div
              key="msg"
              initial={{ opacity: 0, scale: 0.6, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: 20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-red-600 text-white py-3 px-6 rounded-lg shadow-lg font-bold z-50 select-none"
            >
              {msgText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function GroupGrid({
  data,
  type,
  routePrefix,
  subjectId,
  subjectTeacherId,
  onNoLecturesClick,
}) {
  const router = useRouter();

  if (!data || data.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 overflow-visible">
      {data.map((item) => {
        const hasLectures =
          (type === "online" && item.onlineLectures?.length > 0) ||
          (type === "qr" && item.qrLectures?.length > 0) ||
          (type === "homework" && item.homeWorks?.length > 0) ||
          type === "books";

        const handleClick = () => {
          if (!hasLectures) {
            onNoLecturesClick();
            return;
          }
          router.push(
            type === "books"
              ? `/subject/${subjectId}/books/${item.id}?subjectTeacherId=${subjectTeacherId}`
              : `/subject/${subjectId}/${routePrefix}/${item.id}?subjectTeacherId=${subjectTeacherId}`
          );
        };

        return (
          <div
            key={item.id}
            onClick={handleClick}
            className="cursor-pointer rounded bg-white p-3 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-[#bf9916] mb-1">
              {item.name || item.title || "بدون عنوان"}
            </h3>

            {type === "online" && (
              <p className="text-sm text-[#bf9916] mb-1">
                عدد المحاضرات: {item.onlineLectures?.length ?? 0}
              </p>
            )}

            {type === "qr" && (
              <p className="text-sm text-[#bf9916] mb-1">
                عدد المحاضرات: {item.qrLectures?.length ?? 0}
              </p>
            )}

            {type === "homework" && (
              <p className="text-sm text-[#bf9916] mb-1">
                الوصف: {item.description || "لا يوجد وصف"}
              </p>
            )}

            {type === "books" && (
              <p className="text-sm text-[#bf9916] mb-1 flex justify-between">
                <span className="text-green-600 font-bold">
                  {item.price ?? 0}
                </span>
              </p>
            )}

            {type !== "books" && (
              <p className="font-bold text-sm flex justify-between">
                <span className="text-[#bf9916]">السعر: </span>
                <span className="text-green-600">{item.price ?? 0}</span>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
