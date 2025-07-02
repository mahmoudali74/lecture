"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Spinner from "./components/Spinner"; // عدل المسار حسب مكان مكون Spinner عندك

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkStudentProfile = async () => {
      const token = localStorage.getItem("token");
      console.log("التوكن الموجود في localStorage:", token);

      // تحقق أولاً من الفلاج لو بيانات الطالب مكتملة مسبقًا
      const isComplete = localStorage.getItem("studentDataComplete");
      if (isComplete === "true") {
        console.log("البيانات مكتملة حسب الفلاج المحلي، التوجيه إلى /main");
        router.replace("/main");
        return;
      }

      if (!token) {
        console.log("مافيش توكن، رايح لصفحة اللوجين");
        router.replace("/login");
        return;
      }

      try {
        console.log("جارٍ انتظار 1 ثانية قبل طلب التحقق من بيانات الطالب");
        await new Promise((r) => setTimeout(r, 1000)); // تأخير 1 ثانية

        console.log("جارٍ إرسال طلب التحقق من بيانات الطالب");
        const res = await fetch(
          "https://eng-mohamedkhalf.shop/api/Students/CheckStudentData",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              accept: "application/json",
            },
          }
        );

        console.log("استجابة السيرفر للتحقق من البيانات، الحالة:", res.status);

        if (!res.ok) {
          console.error("الرد من السيرفر غير ناجح:", res.status);
          router.replace("/login");
          return;
        }

        const result = await res.json();

        console.log("الرد من API:", result);

        if (result?.data === true) {
          console.log("البيانات كاملة، سيتم التوجيه إلى /main");
          // حدد الفلاج هنا لو حبيت:
          localStorage.setItem("studentDataComplete", "true");
          router.replace("/main");
        } else {
          console.log("البيانات ناقصة، سيتم التوجيه إلى /more-info");
          localStorage.setItem("studentDataComplete", "false");
          router.replace("/more-info");
        }
      } catch (error) {
        console.error("خطأ في طلب التحقق من بيانات الطالب:", error);
        router.replace("/login");
      }
    };

    checkStudentProfile();
  }, [router]);

  return <Spinner />;
}
