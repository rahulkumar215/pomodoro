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
import { setPasswordSchema, type SetPasswordData } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ClockCheckIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Link, useParams } from "react-router";
import { toast } from "sonner";

export function SetPasswordForm() {
  const { token } = useParams();
  const form = useForm<SetPasswordData>({
    resolver: zodResolver(setPasswordSchema),
    mode: "onBlur",
  });

  const mutation = useMutation({
    mutationFn: async (data: SetPasswordData) => {
      return await api.post(`/auth/set-password/${token}`, data);
    },
    onSuccess: (data) => {
      toast.success(data.data.message);
    },
    onError: (error) => {
      handleError(error);
    },
  });

  async function onSubmit(data: SetPasswordData) {
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
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Set your password below to create your account
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
                  <Button type="submit">Set Password</Button>
                  <FieldDescription className="px-6 text-center">
                    Already have an account? <Link to="/signin">Sign in</Link>
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
