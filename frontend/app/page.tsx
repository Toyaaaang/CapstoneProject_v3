// LandingPage.jsx
import React from "react";
import Link from "next/link";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[url('/bg-warehouse.jpg')] bg-cover bg-center relative flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"></div>

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-3xl px-8 py-12 bg-white bg-opacity-10 rounded-2xl border border-white/30 backdrop-blur-md text-white shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">  
          WOMS
        </h1>
        <p className="text-center text-lg md:text-xl font-light mb-6">
          Warehouse Operations Management System
        </p>
        <p className="text-center mb-8 text-sm md:text-base max-w-xl mx-auto">
          WOMS is a web-based system designed to streamline stock tracking, procurement, and material requisition, empowering Quezelco I with real-time insights and operational efficiency.
        </p>

        <div className="flex justify-center space-x-6">
          <Link href="/login">
            <button className="px-6 py-2 rounded-xl bg-blue-500 bg-opacity-80 hover:bg-opacity-100 text-white font-semibold transition">
              Login
            </button>
          </Link>
          <Link href="/register">
            <button className="px-6 py-2 rounded-xl border border-white text-white hover:bg-white hover:text-black transition font-semibold">
              Register
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
