import z, { type RefinementCtx } from "zod";

const RegisterSchema = z
  .object({
    name: z
      .string()
      .min(1, "First name is required.")
      .min(3, "First name must be at least 3 characters long.")
      .max(50, "First name can't exceed 50 characters."),
    email: z.email("Please enter a valid email address."),
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
