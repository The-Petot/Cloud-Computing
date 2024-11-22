import { t } from "elysia"

export const registerDto = {
  body: t.Object({
    username: t.String(),
    password: t.String(),
    email: t.String(),
    firstName: t.String(),
    lastName: t.String(),
  }),  
  response: t.Object({
    // 201: t.Object({ data: t.Optional(t.Object({ userId: t.Number() })), message: t.String() }),
    // 400: t.Object({ error: t.String() }),
    // 409: t.Object({ error: t.String() }),
    // 500: t.Object({ error: t.String() }),
    a: t.String()
  })
}


