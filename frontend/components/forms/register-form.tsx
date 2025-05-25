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

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { isLoading, register } = useRegister();
  const router = useRouter(); // Initialize useRouter
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "employee",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      first_name: formData.firstName, // ✅ map to backend format
      last_name: formData.lastName,   // ✅ map to backend format
    };

    try {
      await register(payload); // ✅ use mapped payload
      toast.success("Registration successful!");
      router.push("/login");
    } catch {
      toast.error("An error occurred during registration.");
    }
  };


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Enter your first name..."
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Enter your last name..."
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username..."
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password..."
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password..."
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <Select
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warehouse_staff">Warehouse Staff</SelectItem>
                  <SelectItem value="budget_analyst">Budget Analyst</SelectItem>
                  <SelectItem value="engineering">Engineering Dept.</SelectItem>
                  <SelectItem value="operations_maintenance">Operations & Maintenance Dept.</SelectItem>
                  <SelectItem value="warehouse_admin">Warehouse Admin</SelectItem>
                  <SelectItem value="manager">General Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="sub_office">Sub Office</SelectItem> 
                  <SelectItem value="finance">Finance Dept.</SelectItem> 
                  <SelectItem value="audit">Audit Dept.</SelectItem> 
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full">
                {isLoading ? "Registering..." : "Register"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => signIn("google")}
              >
                Continue with Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <a href="login" className="underline underline-offset-4">
                Sign in
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
