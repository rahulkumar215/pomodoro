import { SetPasswordForm } from "@/components/set-password-form";

function SetPassword() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SetPasswordForm />
      </div>
    </div>
  );
}

export default SetPassword;
