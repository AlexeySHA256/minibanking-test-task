import { api } from "@/shared/lib/api"
import { User } from "./types"

export const getMe = async () => {
  let user: User | null = null

  try {
    const response = await api.get<User>("/auth/me")
    user = response.data
  } catch (error) {
    console.log(error)
  }

  return user
}
