import { RegisterForm } from "@/components/forms/register-form"

export default function Page() {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center relative"
      style={{
        backgroundImage: "url('/bg-warehouse.jpg')",
      }}
    >
      <div
        className="w-full max-w-sm m-20"
      >
        <RegisterForm />
      </div>
    </div>
  )
}
