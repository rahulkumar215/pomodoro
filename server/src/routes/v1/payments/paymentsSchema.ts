import { z } from "zod";

const orderShape = {
  planId: z.string(),
};

export const createOrderSchema = z.object(orderShape);
