"use client";

export default function Spinner() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="h-10 w-10 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
    </div>
  );
}
