import z from 'zod'

export const verifyJWTSchema = z.object({
  authorization: z
    .string()
    .refine(
      (value) => {
        const [type, token] = value.split(' ')
        return type === 'Bearer' && token && token.length > 0
      },
      { message: "Invalid Authorization format. Expected 'Bearer <token>'" },
    )
    .optional(),
})
