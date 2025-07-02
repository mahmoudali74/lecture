"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Spinner from "@/app/components/Spinner";
import { FiSend, FiArrowRight } from "react-icons/fi";
import { FaRegCommentDots } from "react-icons/fa";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ar";
import Image from "next/image";

dayjs.extend(relativeTime);
dayjs.locale("ar");

function getTokenFromCookies() {
  const cookieString = document.cookie;
  const cookies = cookieString.split("; ").reduce((acc, current) => {
    const [name, value] = current.split("=");
    acc[name] = value;
    return acc;
  }, {});
  return cookies.token || null;
}

function getEmbedUrl(url) {
  try {
    const urlObj = new URL(url);
    let videoId = "";

    if (urlObj.hostname === "youtu.be") {
      videoId = urlObj.pathname.slice(1);
    } else if (
      urlObj.hostname === "www.youtube.com" ||
      urlObj.hostname === "youtube.com"
    ) {
      videoId = urlObj.searchParams.get("v");
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

export default function QrLectureVideoPage() {
  const { lectureId } = useParams();
  const [token, setToken] = useState(null);
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [hasTriedFetching, setHasTriedFetching] = useState(false);

  useEffect(() => {
    document.documentElement.lang = "ar";
    setToken(getTokenFromCookies());
  }, []);

  useEffect(() => {
    if (!token || !lectureId) return;

    async function fetchLecture() {
      setLoading(true);
      setHasTriedFetching(true);
      try {
        const res = await fetch(
          `https://eng-mohamedkhalf.shop/api/QrLectures/GetQrLecture/${lectureId}`,
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
          setLecture(json.data);
          setComments(json.data.comments || []);
        } else {
          setLecture(null);
        }
      } catch (e) {
        console.error(e);
        setLecture(null);
      } finally {
        setLoading(false);
      }
    }

    fetchLecture();
  }, [token, lectureId]);

  const videoEmbedUrl = getEmbedUrl(lecture?.videoUrl);

  const handleSendComment = async () => {
    if (!commentInput.trim()) return;

    setSending(true);
    setError(null);
    try {
      const res = await fetch(
        "https://eng-mohamedkhalf.shop/api/QrLectures/AddComment",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Accept-Language": "ar",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lectureId: lecture.id,
            comment: commentInput.trim(),
          }),
        }
      );
      const json = await res.json();
      if (json.errorCode === 0) {
        setComments((prev) => [
          ...prev,
          {
            fullName: "أنت",
            content: commentInput.trim(),
            createdAt: new Date().toISOString(),
          },
        ]);
        setCommentInput("");
      } else {
        setError(json.errorMessage || "حدث خطأ أثناء الإرسال");
      }
    } catch (e) {
      setError("حدث خطأ أثناء الإرسال");
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      {/* زر الرجوع */}
      <div className="flex justify-end mb-4 fixed top-4 right-4 sm:right-8 z-10">
        <button
          onClick={() => history.back()}
          className="text-[#bf9916] text-2xl hover:text-[#a77f14] transition"
          title="رجوع"
        >
          <FiArrowRight />
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 text-right" dir="rtl">
        {lecture ? (
          <>
            {videoEmbedUrl ? (
              <div className="mb-2 w-full aspect-video">
                <iframe
                  src={videoEmbedUrl}
                  title="Qr Lecture Video"
                  className="w-full h-full rounded-lg border"
                  allowFullScreen
                />
              </div>
            ) : (
              <p className="text-center text-[#bf9916]">لا يوجد فيديو</p>
            )}

            <h2 className="text-xl font-bold text-[#bf9916] mb-6">
              {lecture.name}
            </h2>

            <div className="mb-6 flex flex-row-reverse items-center gap-2">
              <div className="relative flex-grow">
                <FaRegCommentDots className="absolute right-3 top-3 text-black" />
                <input
                  type="text"
                  className="w-full pr-10 pl-4 py-2 border border-purple-500 rounded-lg focus:outline-none text-sm placeholder:text-right placeholder:text-gray-500"
                  placeholder="اكتب تعليقك هنااا"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                />
              </div>

              <button
                onClick={handleSendComment}
                disabled={sending}
                className="text-[#bf9916] text-xl p-2 hover:text-[#a77f14] transition"
                title="إرسال"
              >
                <FiSend />
              </button>
            </div>

            {error && <p className="text-[#bf9916] mt-2">{error}</p>}

            <div className="mb-4">
              <h3 className="text-2xl font-medium mb-4 text-[#bf9916]">
                التعليقات
              </h3>
              {comments.length === 0 ? (
                <p className="text-gray-600">لا توجد تعليقات بعد.</p>
              ) : (
                <ul className="space-y-4">
                  {comments.map((c, i) => (
                    <li
                      key={i}
                      className="flex flex-row-reverse items-center gap-3 border-b border-gray-200 pb-3"
                    >
                      <div>
                        <Image
                          src={"/56.png"}
                          alt="Avatar"
                          width={30}
                          height={30}
                          className="rounded-full object-fill"
                        />
                      </div>

                      <div className="flex-1">
                        <p className="font-bold text-[#bf9916] mb-1">
                          🧑‍🎓 {c.fullName}
                        </p>
                        <p className="text-black text-base break-words">
                          {c.content}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : hasTriedFetching ? (
          <p className="text-[#bf9916] font-bold text-center">
            لم يتم العثور على المحاضرة
          </p>
        ) : null}
      </div>
    </div>
  );
}
