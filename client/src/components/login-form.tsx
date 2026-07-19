import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ClockCheckIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleError } from "@/lib/handleError";
import api from "@/lib/api";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  signinSchema,
  type LoginResponse,
  type SigninFormData,
} from "@/schemas/auth";
import { DemoCredentials } from "@/components/demo-credentials";

export function LoginForm() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const form = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const login = async (data: SigninFormData): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/signin", data, {
      withCredentials: true,
    });
    return response.data;
  };

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data: LoginResponse) => {
      const { token } = data;

      localStorage.setItem("token", token || "");
      qc.invalidateQueries({
        queryKey: ["user"],
      });
      toast.success("Successfully Logged in");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    },
    onError: (error) => {
      handleError(error);
    },
  });

  const onSubmit = async (data: SigninFormData) => {
    console.log(data);
    mutation.mutate(data);
  };

  return (
    <div className={cn("flex flex-col gap-6")}>
      <div className="flex items-center gap-2 justify-center">
        <ClockCheckIcon />
        <span className="text-2xl font-bold">Pomodoro</span>
      </div>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your email and password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Link
                        to="/forgot-password"
                        className="ms-auto text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="password"
                      type="password"
                      required
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Field>
                <Button type="submit">Login</Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <Link to="/signup">Sign up</Link>
                </FieldDescription>
              </Field>
              <DemoCredentials
                onUse={({ email, password }) => {
                  form.setValue("email", email, { shouldValidate: true });
                  form.setValue("password", password, {
                    shouldValidate: true,
                  });
                }}
              />
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
