import { AxiosError } from "axios";
import { toast } from "sonner";

export function handleError(error: unknown) {
  console.error(error);

  let errMsg = "Something went wrong!";

  if (error instanceof AxiosError) {
    errMsg =
      error.response?.data.message ||
      "Cannot connect to server, Is it running?";
  } else if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    Number(error.status) === 204
  ) {
    errMsg = "Content not found!";
  }

  toast.error(errMsg);
}
