"use client";
import React, { useEffect, useState } from "react";
import NoItem from "@/app/NoItem";
import Spinner from "../components/Spinner";

function getTokenFromCookies() {
  const cookieString = document.cookie;
  const cookies = cookieString.split("; ").reduce((acc, current) => {
    const [name, value] = current.split("=");
    acc[name] = value;
    return acc;
  }, {});
  return cookies.token || null;
}

export default function BooksList() {
  const [studentData, setStudentData] = useState(null);
  const [books, setBooks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const tokenFromCookie = getTokenFromCookies();
    if (tokenFromCookie) {
      setToken(tokenFromCookie);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    console.log("Fetching student data...");
    fetch("https://eng-mohamedkhalf.shop/api/Students/GetStudentData", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => {
        console.log("Student API response status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Student API response data:", data);
        if (data.errorCode === 0 && data.data) {
          setStudentData(data.data);
        } else {
          console.error("خطأ في جلب بيانات الطالب:", data);
          setStudentData(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("فشل في جلب بيانات الطالب:", err);
        setStudentData(null);
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    if (!studentData || !token) return;

    console.log("Fetching books data with studentData:", studentData);

    setLoading(true);
    fetch("https://eng-mohamedkhalf.shop/api/Books/GetAllBooks", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => {
        console.log("Books API response status:", res.status);
        if (res.status === 401) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        console.log("Books API response data:", data);
        if (data.errorCode === 0 && data.data) {
          let booksData = [];

          if (typeof data.data === "string") {
            try {
              booksData = JSON.parse(data.data);
            } catch (e) {
              console.error("فشل في تحويل بيانات الكتب:", e);
              booksData = [];
            }
          } else if (Array.isArray(data.data)) {
            booksData = data.data;
          }

          setBooks(booksData);
        } else {
          setBooks([]);
        }
      })
      .catch((err) => {
        console.error("فشل في جلب الكتب:", err);
        setBooks([]);
      })
      .finally(() => setLoading(false));
  }, [studentData, token]);

  if (loading) return <Spinner />;

  if (!books || books.length === 0) {
    return <NoItem text={"لا يوجد كتب الان"} />;
  }

  return (
    <div>
      {books.map((book, idx) => (
        <div key={idx}>
          <h3>{book.title}</h3>
        </div>
      ))}
    </div>
  );
}
