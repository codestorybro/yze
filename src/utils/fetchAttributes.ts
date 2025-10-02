import { AttributeType } from "@/types/attributeType"

export async function fetchAttributes(): Promise<AttributeType[]> {
  // TODO: replace with real API call

  return [
    {
      id: "flash",
      label: "Flash",
      score: 3,
    },
    {
      id: "buddy",
      label: "Buddy",
      score: 10,
    },
    {
      id: "creator",
      label: "Creator",
      score: 30,
    },
    {
      id: "guru",
      label: "Guru",
      score: 20,
    },
  ]
}
