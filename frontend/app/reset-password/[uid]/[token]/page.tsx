"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import axios from "@/lib/axios"
import { toast } from "sonner"

export default function ResetPasswordPage() {
  const router = useRouter()
  const params = useParams()
  const { uid, token } = params as { uid: string; token: string }

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      await axios.post(`authentication/reset/${uid}/${token}/`, {
        new_password1: newPassword,
        new_password2: confirmPassword,
      })

      toast.success("Password reset successful! Redirecting to login...")
      setTimeout(() => router.push("/login"), 2500)
    } catch (err: any) {
      const errors = err?.response?.data?.errors as Record<string, string[]> | undefined
      const errorMsg =
        err?.response?.data?.error ||
        (errors && Object.values(errors)[0]?.[0]) ||
        "Invalid or expired reset link."

      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-semibold mb-4">Reset Your Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
        <input
          type="password"
          placeholder="New Password"
          className="w-full p-2 border rounded"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full p-2 border rounded"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  )
}
