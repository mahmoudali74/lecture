"use client";

import React from "react";
import Image from "next/image";

function Rate({ teacher }) {
  if (!teacher) return null;

  return (
    <div className="shadow-lg p-8 rounded-xl bg-white max-w-sm w-[700px] flex items-center justify-center flex-col">
      <div className="img w-[60px] h-[60px] relative rounded-full overflow-hidden mb-2">
        <Image
          src={
            teacher.teacherImgUrl
              ? `https://eng-mohamedkhalf.shop${teacher.teacherImgUrl.replace(
                  /\\/g,
                  "/"
                )}`
              : "/1.png"
          }
          alt={teacher.teacherName}
          fill
          className="object-cover"
        />
      </div>

      <p className="font-semibold">{teacher.teacherName || "اسم المدرس"}</p>

      <p className="text-md text-gray-600 mb-8 mt-2">
        {teacher.teacherBiography || "لا يوجد وصف"}
      </p>

      <div className="flex gap-2 text-amber-300 text-lg">
        {Array.from({ length: teacher.evaluation || 5 }).map((_, index) => (
          <i key={index} className="fa-solid fa-star"></i>
        ))}
      </div>
    </div>
  );
}

export default Rate;
