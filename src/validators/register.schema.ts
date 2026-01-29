import z, { type RefinementCtx } from "zod";

const RegisterSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required.")
      .min(3, "Name must be at least 3 characters long.")
      .max(50, "Name can't exceed 50 characters."),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters long.")
      .max(20, "Username can't exceed 20 characters.")
      .regex(/^[a-zA-Z0-9_\-]+$/, "Username can only contain letters, numbers, underscores, and hyphens."),
    email: z.string().email("Please enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")

      .max(20, "Password can't exceed 20 characters."),
    passwordConfirmation: z
      .string()
      .min(1, "Password confirmation is required."),
  })
  .superRefine(({ password, passwordConfirmation }, ctx: RefinementCtx) => {
    if (passwordConfirmation !== password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password confirmation must match the password.",
        path: ["passwordConfirmation"],
      });
    }
  });

export default RegisterSchema;
