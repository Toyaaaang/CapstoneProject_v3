"use client"

import { useState } from "react"
import axios from "@/lib/axios"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await axios.post("authentication/password_reset/", { email })
      const data = res.data as { message?: string }
      toast.success(data.message || "Reset link sent!")
    } catch (err: any) {
      const apiError =
        err.response?.data?.error ||
        "Something went wrong. Please try again."
      toast.error(apiError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-semibold mb-4">Forgot Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
        <input
          type="email"
          placeholder="Enter your registered email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  )
}
