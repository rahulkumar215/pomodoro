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
import api from "@/lib/api";
import { handleError } from "@/lib/handleError";
import { forgetPasswordScehma, type ForgetPasswordData } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ClockCheckIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router";
import { toast } from "sonner";

export function ForgotPasswordForm() {
  const form = useForm<ForgetPasswordData>({
    resolver: zodResolver(forgetPasswordScehma),
    mode: "onBlur",
  });

  const mutation = useMutation({
    mutationFn: async (data: ForgetPasswordData) => {
      return await api.post("/auth/forgot-password", data);
    },
    onSuccess: (data) => {
      toast.success(data.data.message);
    },
    onError: (error) => {
      handleError(error);
    },
  });

  async function onSubmit(data: ForgetPasswordData) {
    mutation.mutate(data);
  }
  return (
    <div className="flex flex-col  gap-6">
      <div className="flex items-center gap-2 justify-center">
        <ClockCheckIcon />
        <span className="text-2xl font-bold">Pomodoro</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>Enter your registered email</CardDescription>
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
                      id="email"
                      type="email"
                      aria-invalid={fieldState.invalid}
                      placeholder="m@example.com"
                    />
                    <FieldDescription>
                      We&apos;ll use this to contact you. We will not share your
                      email with anyone else.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <FieldGroup>
                <Field>
                  <Button type="submit">Forgot Password</Button>
                  <FieldDescription className="px-6 text-center">
                    Remember your password? <Link to="/signin">Sign in</Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
