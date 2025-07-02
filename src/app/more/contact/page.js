"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/app/components/Spinner";

function Page() {
  const [contactData, setContactData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await fetch(
          "https://eng-mohamedkhalf.shop/api/ContactUs/ContactUs"
        );
        const data = await res.json();
        setContactData(data.data);
      } catch (err) {
        console.error("❌ خطأ في جلب البيانات:", err);
      }
    };

    fetchContact();
  }, []);

  if (!contactData) {
    return <Spinner />;
  }

  const formattedWhatsApp = contactData.whatsAppNumber.replace(/^0/, "2");

  const buttonStyle =
    "flex flex-row-reverse items-center gap-3 bg-[#f7f7f7] text-black py-3 px-4 rounded-2xl font-semibold shadow-lg w-full text-base md:text-lg lg:text-xl";

  const iconStyle = "text-gray-700 text-lg md:text-xl lg:text-2xl";

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="text-[#bf9916] text-2xl absolute top-2  cursor-pointer right-5"
      >
        <i className="fa-solid fa-arrow-right"></i>
      </button>
      <div className="p-4 space-y-4 mt-14 w-full max-w-full md:w-[90%] lg:w-[80%] mx-auto">
        <a href={`tel:${contactData.phoneNumber}`} className={buttonStyle}>
          <i className={`fa-solid fa-phone ${iconStyle}`}></i>
          <span className="text-[#d2ad28]">{contactData.phoneNumber}</span>
        </a>

        <a
          href={`https://wa.me/${formattedWhatsApp}`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonStyle}
        >
          <i className={`fa-brands fa-whatsapp ${iconStyle}`}></i>
          <span className="text-[#d2ad28]">{contactData.whatsAppNumber}</span>
        </a>

        <a href={`mailto:${contactData.email}`} className={buttonStyle}>
          <i className={`fa-solid fa-envelope ${iconStyle}`}></i>
          <span className="text-[#d2ad28]">{contactData.email}</span>
        </a>

        {contactData.faceBookLink ? (
          <a
            href={contactData.faceBookLink}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyle}
          >
            <i className={`fa-brands fa-facebook ${iconStyle}`}></i>
            <span className="text-[#d2ad28]">فيسبوك</span>
          </a>
        ) : (
          <div className={`${buttonStyle} text-gray-500`}>
            <i className={`fa-brands fa-facebook ${iconStyle}`}></i>
            <span className="text-[#d2ad28]">
              لا يوجد لدينا صفحة فيسبوك للاتصال حتى الآن
            </span>
          </div>
        )}

        <a href={`tel:${contactData.phoneNumber}`} className={buttonStyle}>
          <i className={`fa-solid fa-phone-volume ${iconStyle}`}></i>
          <span className="text-[#d2ad28]">{contactData.phoneNumber}</span>
        </a>
      </div>
    </div>
  );
}

export default Page;
