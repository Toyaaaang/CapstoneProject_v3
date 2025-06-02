"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react"; 
import { toast } from "sonner"; // Import toast from sonner
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import useRegister from "@/hooks/useRegister";
import zxcvbn from "zxcvbn";


export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { isLoading, register } = useRegister();
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "", // Default to empty for placeholder "Role"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const passwordStrength = zxcvbn(formData.password);
  const passwordScore = passwordStrength.score;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (passwordScore < 2) {
      toast.error("Password is too weak. Try adding numbers, symbols, or more characters.");
      return;
    }

    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      first_name: formData.firstName,
      last_name: formData.lastName,
    };

    try {
      await register(payload);
      toast.success("Registration successful! Please wait for admin verification.");
      router.push("/login");
    } catch (error: any) {
      const detail = error?.response?.data;
      if (typeof detail === "object") {
        const firstError = Object.values(detail)[0];
        toast.error(firstError as string);
      } else {
        toast.error("An error occurred during registration.");
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div
        className="relative z-10 p-8 w-full max-w-md"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          boxShadow: "0 8px 32px 0 rgba(23, 23, 23, 0.37)",
          backdropFilter: "blur(4.5px)",
          WebkitBackdropFilter: "blur(3.5px)",
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.18)",
        }}
      >
        <Card className="bg-transparent shadow-none border-none">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-white">Register</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="firstName" className="text-white">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Enter your first name..."
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="text-white placeholder-white bg-transparent border-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName" className="text-white">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Enter your last name..."
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="text-white placeholder-white bg-transparent border-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username" className="text-white">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username..."
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="text-white placeholder-white bg-transparent border-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="text-white placeholder-white bg-transparent border-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password..."
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="text-white placeholder-white bg-transparent border-white"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Strength:{" "}
                  <span
                    className={
                      passwordScore < 2 ? "text-red-600" :
                      passwordScore < 4 ? "text-yellow-600" : "text-green-600"
                    }
                  >
                    {["Very Weak", "Weak", "Fair", "Good", "Strong"][passwordScore]}
                  </span>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password..."
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="text-white placeholder-white bg-transparent border-white"
                  />
                </div>
                <Select
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, role: value }))
                  }
                  value={formData.role}
                  required
                >
                  <SelectTrigger className="w-full text-white border-white bg-transparent">
                    <SelectValue placeholder="Role" className="text-white" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warehouse_staff">Warehouse Staff</SelectItem>
                    <SelectItem value="budget_analyst">Budget Analyst</SelectItem>
                    <SelectItem value="engineering">Engineering Dept.</SelectItem>
                    <SelectItem value="operations_maintenance">Operations & Maintenance Dept.</SelectItem>
                    <SelectItem value="warehouse_admin">Warehouse Admin</SelectItem>
                    <SelectItem value="manager">General Manager</SelectItem>
                    <SelectItem value="sub_office">Sub Office</SelectItem>
                    <SelectItem value="finance">Finance Dept.</SelectItem>
                    <SelectItem value="audit">Audit Dept.</SelectItem>
                  </SelectContent>
                </Select>
                <button
                  type="submit"
                  className="w-full px-6 py-2 rounded-xl bg-green-500 bg-opacity-80 text-white font-semibold transition-colors duration-300 border-2 border-transparent
                    hover:bg-green-800 hover:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-300"
                  disabled={isLoading}
                >
                  {isLoading ? "Registering..." : "Register"}
                </button>
                <button
                  type="button"
                  className="w-full px-6 py-2 rounded-xl border-2 border-white text-white font-semibold transition-colors duration-300
                    hover:bg-white hover:text-green-700 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-300"
                  onClick={() => signIn("google")}
                >
                  Continue with Google
                </button>
              </div>
              <div className="mt-4 text-center text-sm text-white">
                Already have an account?{" "}
                <a href="login" className="underline underline-offset-4">
                  Sign in
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
