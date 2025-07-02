"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Spinner from "@/app/components/Spinner";
import { FaVideo, FaBook } from "react-icons/fa";

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
  const { id } = useParams();
  const router = useRouter();

  const [teacher, setTeacher] = useState(null);
  const [bookCount, setBookCount] = useState(0);
  const [lectureCount, setLectureCount] = useState(0);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [token, setToken] = useState(null);

  useEffect(() => {
    const tokenFromCookie = getTokenFromCookies();
    setToken(tokenFromCookie);
  }, []);

  useEffect(() => {
    if (!token) return;

    async function fetchStudent() {
      try {
        const res = await fetch(
          "https://eng-mohamedkhalf.shop/api/Students/GetStudentData",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        const json = await res.json();
        if (json.errorCode === 0 && json.data) {
          setStudentData(json.data);
        } else {
          setStudentData(null);
          console.error("خطأ في جلب بيانات الطالب:", json);
        }
      } catch (e) {
        setStudentData(null);
        console.error("فشل في جلب بيانات الطالب:", e);
      }
    }
    fetchStudent();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (!id) return;

    async function fetchTeacher() {
      try {
        setLoading(true);
        const res = await fetch(
          `https://eng-mohamedkhalf.shop/api/Teachers/GetTeacher/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("فشل في جلب بيانات المدرس");

        const data = await res.json();

        if (data?.data?.teacher) {
          setTeacher(data.data.teacher);
          setBookCount(data.data.bookCount || 0);
          setLectureCount(data.data.lectureCount || 0);
          setError(null);
        } else {
          setError("لم يتم العثور على بيانات المدرس");
        }
      } catch (err) {
        setError(err.message);
        setTeacher(null);
      } finally {
        setLoading(false);
      }
    }

    fetchTeacher();
  }, [token, id]);

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-600 text-center mt-20">{error}</p>;
  if (!teacher) return null;

  return (
    <div dir="rtl">
      <button
        onClick={() => router.back()}
        className="absolute right-4 top-2 cursor-pointer text-[#bf9916] text-2xl"
        aria-label="رجوع"
      >
        <i className="fa-solid fa-arrow-right"></i>
      </button>

      <div className="mt-20 flex flex-col justify-center items-center">
        <div className="img w-[60px] h-[60px] relative rounded-full overflow-hidden mb-2">
          <Image
            src={`https://eng-mohamedkhalf.shop${teacher.teacherImgUrl.replace(
              /\\/g,
              "/"
            )}`}
            alt={teacher.teacherName}
            fill
            className="object-cover"
          />
        </div>

        <p className="font-semibold">{teacher.teacherName}</p>

        <div className="flex gap-2 text-amber-300 text-lg">
          {Array.from({ length: teacher.evaluation || 5 }).map((_, i) => (
            <i key={i} className="fa-solid fa-star"></i>
          ))}
        </div>

        <p className="text-md text-gray-600 mb-8 mt-2 text-center px-4">
          {teacher.teacherBiography}
        </p>

        <div className="flex gap-10">
          <div className="flex flex-col items-center rounded-full px-6 py-3 w-[80px]">
            <div className="bg-green-300 rounded-full p-3">
              <FaVideo className="text-green-400 text-3xl mb-1" />
            </div>
            <span className="text-green-600 font-bold text-2xl">
              {lectureCount}
            </span>
            <p className="text-gray-700 text-sm mt-1">المحاضرات</p>
          </div>
          <div className="flex flex-col items-center  rounded-full px-6 py-3 w-[80px]">
            <div className="bg-amber-200 rounded-full p-3">
              {" "}
              <FaBook className="text-orange-400 text-3xl mb-1" />
            </div>
            <span className="text-orange-500 font-bold text-2xl">
              {bookCount}
            </span>
            <p className="text-gray-700 text-sm mt-1">الكتب</p>
          </div>
        </div>
      </div>

      <div dir="rtl" className="mt-8 flex flex-col px-6">
        <p className="mb-5 text-2xl text-[#bf9916] font-bold">المواد</p>

        {teacher.subjectTeacher?.map((subject, i) => (
          <Link
            key={i}
            href={`/subject/${subject.subjectId}/details?subjectTeacherId=${subject.id}`}
            className="relative w-[200px] h-[100px] rounded overflow-hidden cursor-pointer block mb-4"
          >
            <Image
              src={`https://eng-mohamedkhalf.shop${subject.imgUrl.replace(
                /\\/g,
                "/"
              )}`}
              alt={subject.subjectNameh}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
            <p className="text-white z-10 font-bold text-2xl absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2">
              {subject.subjectNameh}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Page;
