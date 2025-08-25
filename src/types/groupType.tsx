import { UserType } from "./userType"

export type GroupType = {
  id: string
  name: string
  members: UserType[]
  imageUri: string
}
