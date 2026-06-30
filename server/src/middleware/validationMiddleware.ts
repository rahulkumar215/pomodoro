import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { ValidationError } from "@/errors";

export function validateData(schema: z.ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // const errorMessage = error.issues.map((issue: any) => ({
        //   message: `${issue.path.join(".")} is ${issue.message}`,
        // }));

        const errorMessages = error.issues.map(
          (issue: any) => `${issue.message}`,
        );

        throw new ValidationError("Invalid data received", { errorMessages });
      }

      throw error;
    }
  };
}
