"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
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
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const tokenFromCookie = getCookie("token");
    setToken(tokenFromCookie);
  }, []);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
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

        const allSubjects = data.data.flatMap((teacher) =>
          teacher.subjectTeacher.map((subject) => ({
            name: subject.subjectNameh,
            img: `https://eng-mohamedkhalf.shop${subject.imgUrl.replace(
              /\\/g,
              "/"
            )}`,
          }))
        );

        setSubjects(allSubjects);
      } catch (err) {
        console.error("❌ Error fetching subjects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) return <Spinner />;

  return (
    <div dir="rtl">
      <p className="text-3xl font-semibold text-[#bf9916] text-right px-10 mt-3">
        موادى
      </p>

      <div className="mt-5 px-5 flex flex-wrap gap-4">
        {subjects.map((subject, index) => (
          <Link
            href="/subject/Teacher"
            key={index}
            className="relative w-[200px] h-[100px] rounded overflow-hidden cursor-pointer block"
          >
            <Image
              src={subject.img || "/1.png"}
              alt={subject.name}
              fill
              className="object-cover"
            />

            <div className="absolute inset-0 bg-black/40 z-10"></div>

            <p className="text-white z-20 font-bold text-2xl absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
              {subject.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Page;
