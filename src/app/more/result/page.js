"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NoItem from "../../NoItem";

function Spinner() {
  return (
    <div className="flex justify-center mt-10">
      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function Page() {
  const router = useRouter();

  const [examResult, setExamResult] = useState(null);
  const [loadingExam, setLoadingExam] = useState(true);

  const getToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) return `Bearer ${parts.pop().split(";").shift()}`;
    return "";
  };

  useEffect(() => {
    const fetchExamResult = async () => {
      try {
        const res = await fetch(
          "https://eng-mohamedkhalf.shop/api/Exams/GetExam/1",
          {
            headers: {
              Authorization: getToken(),
              Accept: "application/json",
            },
          }
        );

        const data = await res.json();
        console.log("📥 استجابة الامتحان:", data);

        if (data?.data) {
          setExamResult(data.data);
        } else {
          setExamResult(null);
        }
      } catch (err) {
        console.error("❌ فشل في جلب بيانات الامتحان:", err);
        setExamResult(null);
      } finally {
        setLoadingExam(false);
      }
    };

    fetchExamResult();
  }, []);

  return (
    <div className="p-4">
      <div className="relative mb-6">
        <button
          onClick={() => router.back()}
          className="absolute right-4 top-0 cursor-pointer text-[#bf9916] text-2xl"
          aria-label="رجوع"
        >
          <i className="fa-solid fa-arrow-right"></i>
        </button>

        <div className="flex justify-end mt-8">
          <p className="text-[#bf9916] text-2xl font-bold mt-10">
            نتائج الاختبارات
          </p>
        </div>
      </div>

      {loadingExam ? (
        <Spinner />
      ) : !examResult ? (
        <NoItem text="لا توجد نتائج اختبارات حتى الان" />
      ) : (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow border-r-4 border-[#bf9916]">
            <p className="text-gray-800 font-semibold">
              {examResult.name || "اسم الامتحان غير متوفر"}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              عدد الأسئلة: {examResult.questions?.length || 0}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;
