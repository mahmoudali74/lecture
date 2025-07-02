"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "@/app/context/UserContext";
import jsQR from "jsqr";
import Spinner from "@/app/components/Spinner";
import Cookies from "js-cookie";

function Page() {
  const router = useRouter();
  const { userName, phoneNumber: userPhoneNumber, money, setMoney } = useUser();

  const [phoneNumber, setPhoneNumber] = useState(userPhoneNumber || "");
  const [balance, setBalance] = useState(
    !isNaN(parseFloat(money)) ? parseFloat(money) : 0
  );
  const [showChargeBox, setShowChargeBox] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [qrStep, setQrStep] = useState(null);
  const [barcode, setBarcode] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setBalance(!isNaN(parseFloat(money)) ? parseFloat(money) : 0);
  }, [money]);

  useEffect(() => {
    const storedToken = Cookies.get("token") || "";
    setToken(storedToken);

    if (storedToken) {
      fetch("https://eng-mohamedkhalf.shop/api/Users/GetUserInfo", {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.data?.phoneNumber && data.errorCode === 0) {
            setPhoneNumber(data.data.phoneNumber);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let animationFrameId;

    if (cameraActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const constraints = { video: { facingMode: "environment" } };

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          video.srcObject = stream;
          video.setAttribute("playsinline", true);
          video.play();

          const tick = () => {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
              canvas.height = video.videoHeight;
              canvas.width = video.videoWidth;
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
              );
              const code = jsQR(imageData.data, canvas.width, canvas.height);
              if (code) {
                setBarcode(code.data);
                setQrStep("manual");
                setCameraActive(false);
                stream.getTracks().forEach((track) => track.stop());
                return;
              }
            }
            animationFrameId = requestAnimationFrame(tick);
          };

          tick();
        })
        .catch(() => {
          setUploadError("تعذر الوصول إلى الكاميرا.");
          setCameraActive(false);
        });

      return () => {
        cancelAnimationFrame(animationFrameId);
        if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject
            .getTracks()
            .forEach((track) => track.stop());
        }
      };
    }
  }, [cameraActive]);

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleCheckBarcode = async () => {
    setError("");
    if (!barcode) {
      setError("من فضلك أدخل رقم الباركود");
      return;
    }

    try {
      const res = await fetch(
        `https://eng-mohamedkhalf.shop/api/QRs/ReadQr/${encodeURIComponent(
          barcode
        )}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            lang: "ar",
            accept: "application/json",
          },
          body: "",
        }
      );

      const data = await res.json();

      if (data.errorCode !== 0) {
        showMessage(data.errorMessage || "حدث خطأ", "error");
        return;
      }

      // ✅ خزّن الباركود بعد نجاح الشحن فقط
      const usedBarcodes = JSON.parse(
        localStorage.getItem("used_barcodes") || "[]"
      );
      if (!usedBarcodes.includes(barcode)) {
        usedBarcodes.push(barcode);
        localStorage.setItem("used_barcodes", JSON.stringify(usedBarcodes));
      }

      // ✅ تحديث الرصيد من API
      const balanceRes = await fetch(
        "https://eng-mohamedkhalf.shop/api/Wallet/GetWalletBalance",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            lang: "ar",
          },
        }
      );

      const balanceData = await balanceRes.json();
      if (balanceData?.errorCode === 0 && balanceData?.data != null) {
        const newBalance = parseFloat(balanceData.data);
        setMoney(newBalance); // تحديث الكونتكست
        setBalance(newBalance); // تحديث المحفظة الحالية
        localStorage.setItem("money", newBalance); // حفظ جديد
        showMessage("تم الشحن بنجاح", "success");
      } else {
        showMessage("تم الشحن، لكن لم نتمكن من قراءة الرصيد", "info");
      }

      setShowQRModal(false);
      setShowChargeBox(false);
      setQrStep(null);
      setBarcode("");
    } catch (error) {
      showMessage("حدث خطأ أثناء قراءة QR", "error");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    setUploadError("");
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);
        if (code) {
          setBarcode(code.data);
          setQrStep("manual");
          setCameraActive(false);
          setUploadError("");
        } else {
          setUploadError("لم يتم التعرف على كود QR، حاول مرة أخرى بصورة أوضح");
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    localStorage.removeItem("money");
    router.push("/login");
  };

  const handleChargeBoxBackgroundClick = (e) => {
    if (e.target.id === "chargeBoxBg") {
      setShowChargeBox(false);
      setQrStep(null);
      setCameraActive(false);
      setUploadError("");
      setBarcode("");
    }
  };

  const handleQRModalBackgroundClick = (e) => {
    if (e.target.id === "qrModalBg") {
      setShowQRModal(false);
      setQrStep(null);
      setCameraActive(false);
      setUploadError("");
      setBarcode("");
    }
  };

  return (
    <div className="p-4 max-w-full" dir="rtl">
      <div className="relative mt-2 mb-6">
        <button
          onClick={() => router.back()}
          className="absolute right-4 top-0 text-[#bf9916] text-2xl"
          aria-label="رجوع"
        >
          <i className="fa-solid fa-arrow-right"></i>
        </button>
        <div className="flex justify-center mt-10">
          <p className="text-[#bf9916] text-2xl font-semibold">المحفظة</p>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="relative w-full max-w-md mx-auto mb-6">
            <div className="relative bg-[#1e3a8a] rounded-3xl text-white overflow-hidden p-6 h-[220px] shadow-lg flex items-center justify-center">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#636f97] rounded-full opacity-30"></div>
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#636f97] rounded-full opacity-30"></div>
              <div className="relative z-10 text-center">
                <p className="text-2xl font-bold">{userName}</p>
                <div className="mt-3 text-3xl font-bold flex justify-center items-center gap-2">
                  <span>{balance.toFixed(2)}</span>
                  <span className="text-lg">جنيه</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center mb-20 px-4">
            <button
              onClick={() => setShowChargeBox(true)}
              className="mt-2 px-4 py-3 bg-[#bf9916] text-white rounded-xl font-bold text-lg sm:text-xl w-full max-w-md"
            >
              شحن الرصيد
            </button>
          </div>

          {showChargeBox && !showQRModal && (
            <div
              id="chargeBoxBg"
              className="fixed inset-0 bg-[rgba(0,0,0,0.4)] z-40"
              onClick={handleChargeBoxBackgroundClick}
            />
          )}

          {copied && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-xl text-lg z-[1000]">
              تم نسخ الرقم
            </div>
          )}

          {showChargeBox && !showQRModal && (
            <div
              id="chargeBoxBg"
              className="fixed inset-0 bg-[rgba(0,0,0,0.4)] z-40"
              onClick={handleChargeBoxBackgroundClick}
            />
          )}

          {showChargeBox && !showQRModal && (
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-center z-50 rounded-4xl w-[90%] max-w-md shadow-lg px-6 py-6">
              <p className="font-semibold text-xl text-[#bf9916] mb-3">
                شحن المحفظة
              </p>

              <div className="flex items-center justify-center mb-3">
                <Image
                  src={"/a.jpg"}
                  width={100}
                  height={40}
                  alt="logo"
                  unoptimized
                />
              </div>

              <div className="flex justify-between items-start">
                <div className="text-right w-full pe-2">
                  <p className="text-[#bf9916] text-xl font-semibold mb-1">
                    فودافون كاش
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-500">{phoneNumber}</p>
                    <button
                      onClick={handleCopy}
                      className="text-gray-600 text-xl"
                      aria-label="نسخ رقم الهاتف"
                    >
                      <i className="fa-regular fa-copy"></i>
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setShowQRModal(true);
                      setQrStep(null);
                      setCameraActive(false);
                    }}
                    className="text-[#bf9916] text-base font-semibold mt-2"
                  >
                    باستخدام QR Code
                  </button>
                </div>
              </div>
            </div>
          )}

          {showQRModal && (
            <div
              id="qrModalBg"
              className="fixed inset-0 bg-[rgba(0,0,0,0.4)] z-50 flex items-center justify-center px-4"
              onClick={handleQRModalBackgroundClick}
            >
              <div
                className="bg-white w-full max-w-md p-6 rounded-2xl shadow-lg text-center"
                onClick={(e) => e.stopPropagation()}
              >
                {!qrStep && (
                  <>
                    <p className="text-lg text-right font-bold mb-4">
                      : اختار من الاتى
                    </p>
                    <div className="space-y-3">
                      <button
                        className="w-full py-2 text-black rounded-lg"
                        onClick={() => {
                          setCameraActive(true);
                          setQrStep("camera");
                          setUploadError("");
                          setBarcode("");
                        }}
                      >
                        القراءة عن طريق الكاميرا
                      </button>
                      <button
                        className="w-full py-2 text-black rounded-lg"
                        onClick={openFilePicker}
                      >
                        القراءة من الاستوديو
                      </button>
                      <button
                        className="w-full py-2 text-black rounded-lg"
                        onClick={() => {
                          setQrStep("manual");
                          setCameraActive(false);
                          setBarcode("");
                          setUploadError("");
                        }}
                      >
                        القراءة عن طريق اضافة الرقم
                      </button>
                    </div>
                  </>
                )}

                {qrStep === "manual" && (
                  <div className="mt-4 text-right">
                    <label className="block mb-2 font-semibold">
                      ادخل رقم الباركود:
                    </label>
                    <input
                      placeholder="رقم الباركود"
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded mb-2"
                    />

                    {error && <p className="text-red-600 mb-2">{error}</p>}
                    <div className="flex justify-start">
                      <button
                        onClick={handleCheckBarcode}
                        className="text-purple-800 py-2 px-4 rounded bg-purple-100 hover:bg-purple-200 transition"
                      >
                        إرسال
                      </button>
                    </div>
                  </div>
                )}

                {qrStep === "camera" && (
                  <div className="mt-4">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      width={window.innerWidth > 600 ? 400 : 300}
                      height={300}
                      className="w-full rounded"
                      style={{ backgroundColor: "black" }}
                    />

                    <canvas ref={canvasRef} style={{ display: "none" }} />
                    <button
                      onClick={() => {
                        setCameraActive(false);
                        setQrStep(null);
                        setBarcode("");
                        setUploadError("");
                      }}
                      className="mt-4 text-purple-700 font-semibold"
                    >
                      إغلاق الكاميرا
                    </button>
                  </div>
                )}

                {uploadError && (
                  <p className="text-red-600 mt-4">{uploadError}</p>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
          )}
        </>
      )}

      {message && (
        <div
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl text-lg z-[1000]
            transition-transform duration-400 ease-in-out transform translate-y-0 opacity-100
            ${messageType === "error" ? "bg-red-600" : ""}
            ${messageType === "info" ? "bg-blue-600" : ""}
          `}
          style={{
            animation: "slideUpFade 0.4s ease forwards",
          }}
          role="alert"
        >
          {message}
        </div>
      )}

      <style>{`
        @keyframes slideUpFade {
          0% {
            opacity: 0;
            transform: translateY(30px) translateX(-50%);
          }
          100% {
            opacity: 1;
            transform: translateY(0) translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

export default Page;
