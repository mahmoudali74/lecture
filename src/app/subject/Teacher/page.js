"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Rate from "@/app/(Main)/Rate";
import Link from "next/link";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

function Spinner() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="h-10 w-10 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
    </div>
  );
}

function Page() {
  const router = useRouter();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getCookie("token");

    const fetchTeachers = async () => {
      try {
        const res = await fetch(
          "https://eng-mohamedkhalf.shop/api/Teachers/GetAllTeachers",
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              Accept: "application/json",
            },
          }
        );

        const data = await res.json();

        const mathTeachers = data.data.filter((teacher) =>
          teacher.subjectTeacher.some(
            (subject) => subject.subjectNameh === "الرياضيات"
          )
        );

        setTeachers(mathTeachers);
      } catch (err) {
        console.error("❌ Error fetching teachers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div dir="rtl" className="relative px-2 sm:px-0 md:px-2">
      <button
        onClick={() => router.back()}
        className="absolute right-4 top-2 cursor-pointer text-[#bf9916] text-2xl"
      >
        <i className="fa-solid fa-arrow-right"></i>
      </button>

      <div className="flex items-center justify-center mt-6">
        <Image src="/a.jpg" alt="logo" width={150} height={100} />
      </div>

      <div>
        <h1 className="text-2xl text-[#bf9916] font-medium mb-5 -mt-8">
          مدرسى الرياضيات
        </h1>

        <div className="mt-10 flex flex-col items-center gap-6">
          {teachers.map((teacher) => (
            <Link
              href={`/subject/${teacher.id}`}
              key={teacher.id}
              className="cursor-pointer"
            >
              <Rate teacher={teacher} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Page;
