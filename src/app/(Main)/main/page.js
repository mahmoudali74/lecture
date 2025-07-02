"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import Spinner from "@/app/components/Spinner";
import "swiper/css";

function getTokenFromCookies() {
  const cookieString = document.cookie;
  const cookies = cookieString.split("; ").reduce((acc, current) => {
    const [name, value] = current.split("=");
    acc[name] = value;
    return acc;
  }, {});
  return cookies.token || null;
}

function Page() {
  const [userName, setUserName] = useState("");
  const [bestRatedTeachers, setBestRatedTeachers] = useState([]);
  const [recentTeachers, setRecentTeachers] = useState([]);
  const [loadingBest, setLoadingBest] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) {
      setUserName(name);
    }
  }, []);

  useEffect(() => {
    const fetchBestRated = async () => {
      try {
        const token = getTokenFromCookies();
        const res = await fetch(
          "https://eng-mohamedkhalf.shop/api/Teachers/GetMostRecentTeachers",
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              accept: "application/json",
            },
          }
        );
        const data = await res.json();
        console.log("Best rated teachers data:", data);
        if (data?.data) {
          setBestRatedTeachers(data.data);
        } else {
          setBestRatedTeachers([]);
        }
      } catch (error) {
        console.error("Error fetching best rated teachers:", error);
        setBestRatedTeachers([]);
      } finally {
        setLoadingBest(false);
      }
    };
    fetchBestRated();
  }, []);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const token = getTokenFromCookies();
        const res = await fetch(
          "https://eng-mohamedkhalf.shop/api/Teachers/GetMostRecentTeachers",
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              accept: "application/json",
            },
          }
        );
        const data = await res.json();
        if (data?.data) {
          setRecentTeachers(data.data);
        } else {
          setRecentTeachers([]);
        }
      } catch (error) {
        console.error("Error fetching recent teachers:", error);
        setRecentTeachers([]);
      } finally {
        setLoadingRecent(false);
      }
    };
    fetchRecent();
  }, []);

  const TeacherCard = ({ teacher }) => {
    if (!teacher) return null;
    const imgSrc = teacher.teacherImgUrl
      ? `https://eng-mohamedkhalf.shop${teacher.teacherImgUrl.replace(
          /\\/g,
          "/"
        )}`
      : "/1.png";

    return (
      <div className="shadow-lg p-6 rounded-xl bg-white max-w-sm w-[700px] flex items-center justify-center flex-col mb-6">
        <div className="img w-[60px] h-[60px] relative rounded-full overflow-hidden mb-2">
          <Image
            src={imgSrc}
            alt={teacher.teacherName}
            fill
            className="object-cover"
          />
        </div>
        <p className="font-semibold">{teacher.teacherName || "اسم المدرس"}</p>
        <p className="text-md text-gray-600 mt-2">
          {teacher.teacherBiography || "لا يوجد وصف"}
        </p>
        <div className="flex gap-1 text-yellow-400 text-lg mt-2">
          {[...Array(5)].map((_, i) => (
            <i key={i} className="fa-solid fa-star"></i>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mb-10 px-4 sm:px-8 md:px-16">
      <div className="flex flex-col items-center justify-center relative mb-16">
        <div className="w-full flex justify-center mt-10 items-center">
          <Swiper
            className="mySwiper w-full max-w-[700px]"
            modules={[Autoplay]}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop={true}
          >
            {[1, 2, 3].map((i) => (
              <SwiperSlide key={i} className="flex justify-center">
                <Image
                  src="/slide.jpg"
                  width={700}
                  height={400}
                  alt={`slide${i}`}
                  className="rounded-xl w-full h-auto object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="w-2 h-8 bg-[#bf9916] absolute bottom-[-32px] left-1/2 -translate-x-1/2 rotate-90 rounded-2xl"></div>
      </div>

      <div
        dir="rtl"
        className="mt-6 flex flex-col items-center justify-center mb-10"
      >
        <p className="text-xl sm:text-2xl font-semibold self-start mb-6 sm:mb-10 px-4 sm:px-10">
          الأفضل تقييماً
        </p>
        {loadingBest ? (
          <Spinner />
        ) : bestRatedTeachers.length > 0 ? (
          bestRatedTeachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))
        ) : (
          <p>لا توجد بيانات</p>
        )}
      </div>

      <div dir="rtl" className="flex flex-col items-center justify-center">
        <p className="text-xl sm:text-2xl font-semibold self-start mb-6 sm:mb-10 px-4 sm:px-10">
          أحدث المدرسين
        </p>
        {loadingRecent ? (
          <Spinner />
        ) : recentTeachers.length > 0 ? (
          recentTeachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))
        ) : (
          <p>لا توجد بيانات</p>
        )}
      </div>
    </div>
  );
}

export default Page;
