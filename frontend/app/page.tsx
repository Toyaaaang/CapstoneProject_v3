// LandingPage.jsx
import React from "react";
import Link from "next/link";

const LandingPage = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center relative"
      style={{
        backgroundImage: "url('/bg-warehouse.jpg')",
      }}
    >
      {/* ✅ Glass Card above the overlay */}
      <div
        className="relative z-10 m-6 md:m-20 p-8 w-full max-w-3xl text-white text-center"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          boxShadow: "0 8px 32px 0 rgba(23, 23, 23, 0.37)",
          backdropFilter: "blur(3.5px)",
          WebkitBackdropFilter: "blur(3.5px)",
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.18)",
        }}
      >
        <div className="flex items-center justify-center mb-4 gap-4">
          <img
            src="/app-logo.png"
            alt="Quezelco I"
            className="h-16 w-16"
          />
          <span className="text-3xl md:text-4xl font-bold text-white text-left">
            QUEZELCO I
          </span>
        </div>
        <p className="text-lg md:text-xl font-light mb-6">
          Warehouse Operations Management System
        </p>
        <p className="mb-8 text-sm md:text-base max-w-xl mx-auto">
          WOMS is a web-based system designed to streamline stock tracking,
          procurement, and material requisition, empowering Quezelco I with
          real-time insights and operational efficiency.
        </p>

        <div className="flex justify-center space-x-6">
          <Link href="/login">
            <button
              className="w-32 px-6 py-2 rounded-xl bg-green-500 bg-opacity-80 text-white font-semibold transition-colors duration-300 border-2 border-transparent
                hover:bg-green-800 hover:border-green-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Login
            </button>
          </Link>
          <Link href="/register">
            <button
              className="w-32 px-6 py-2 rounded-xl border-2 border-white text-white font-semibold transition-colors duration-300
                hover:bg-white hover:text-green-700 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Register
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
