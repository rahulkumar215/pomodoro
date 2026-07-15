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
import { resetPasswordSchema, type ResetPasswordData } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ClockCheckIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Link, useParams } from "react-router";
import { toast } from "sonner";

export function ResetPasswordForm() {
  const { token } = useParams();
  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  const mutation = useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      return await api.post(`/auth/reset-password/${token}`, data);
    },
    onSuccess: (data) => {
      toast.success(data.data.message);
    },
    onError: (error) => {
      handleError(error);
    },
  });

  async function onSubmit(data: ResetPasswordData) {
    mutation.mutate(data);
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 justify-center">
        <ClockCheckIcon />
        <span className="text-2xl font-bold">Pomodoro</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Set New Password</CardTitle>
          <CardDescription>
            Set new password below for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="password"
                      type="password"
                    />
                    <FieldDescription>
                      Must be at least 8 characters long.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="confirm-password"
                      type="password"
                    />
                    <FieldDescription>
                      Please confirm your password.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <FieldGroup>
                <Field>
                  <Button type="submit">Reset Password</Button>
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
