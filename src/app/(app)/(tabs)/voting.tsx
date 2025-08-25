import { StyleSheet } from "react-native"

import { Screen } from "@/components"
import { HorizontalSlider } from "@/components/HorizontalSlider"

const mockedUsers = [
  {
    id: "1",
    name: "John Doe",
    avatarUri:
      "https://images.pexels.com/photos/1670187/pexels-photo-1670187.jpeg?_gl=1*7y2wie*_ga*MTIyNTY2ODg2Ny4xNzU2MDYxMzg0*_ga_8JE65Q40S6*czE3NTYwNjEzODMkbzEkZzEkdDE3NTYwNjE1NjckajE1JGwwJGgw",
  },
  {
    id: "2",
    name: "Jane Smith",
    avatarUri:
      "https://images.pexels.com/photos/1078983/pexels-photo-1078983.jpeg?_gl=1*siak57*_ga*MTIyNTY2ODg2Ny4xNzU2MDYxMzg0*_ga_8JE65Q40S6*czE3NTYwNjEzODMkbzEkZzEkdDE3NTYwNjE1NzUkajckbDAkaDA.",
  },
  {
    id: "3",
    name: "Alice Johnson",
    avatarUri:
      "https://images.pexels.com/photos/1366913/pexels-photo-1366913.jpeg?_gl=1*qk4j2c*_ga*MTIyNTY2ODg2Ny4xNzU2MDYxMzg0*_ga_8JE65Q40S6*czE3NTYwNjEzODMkbzEkZzEkdDE3NTYwNjE1ODUkajU4JGwwJGgw",
  },
  {
    id: "4",
    name: "Bob Brown",
    avatarUri:
      "https://images.pexels.com/photos/2310641/pexels-photo-2310641.jpeg?_gl=1*qiui1e*_ga*MTIyNTY2ODg2Ny4xNzU2MDYxMzg0*_ga_8JE65Q40S6*czE3NTYwNjEzODMkbzEkZzEkdDE3NTYwNjE1ODgkajU1JGwwJGgw",
  },
  {
    id: "5",
    name: "Charlie Davis",
    avatarUri:
      "https://images.pexels.com/photos/1226302/pexels-photo-1226302.jpeg?_gl=1*my588n*_ga*MTIyNTY2ODg2Ny4xNzU2MDYxMzg0*_ga_8JE65Q40S6*czE3NTYwNjEzODMkbzEkZzEkdDE3NTYwNjE1OTEkajUyJGwwJGgw",
  },
  {
    id: "6",
    name: "David Wilson",
    avatarUri:
      "https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?_gl=1*80ousp*_ga*MTIyNTY2ODg2Ny4xNzU2MDYxMzg0*_ga_8JE65Q40S6*czE3NTYwNjEzODMkbzEkZzEkdDE3NTYwNjE1OTQkajQ5JGwwJGgw",
  },
  {
    id: "7",
    name: "Emma Thompson",
    avatarUri:
      "https://images.pexels.com/photos/1271620/pexels-photo-1271620.jpeg?_gl=1*dxwit5*_ga*MTIyNTY2ODg2Ny4xNzU2MDYxMzg0*_ga_8JE65Q40S6*czE3NTYwNjEzODMkbzEkZzEkdDE3NTYwNjE1OTckajQ2JGwwJGgw",
  },
  {
    id: "8",
    name: "Frank Miller",
    avatarUri:
      "https://images.pexels.com/photos/1366909/pexels-photo-1366909.jpeg?_gl=1*d738uh*_ga*MTIyNTY2ODg2Ny4xNzU2MDYxMzg0*_ga_8JE65Q40S6*czE3NTYwNjEzODMkbzEkZzEkdDE3NTYwNjE1OTkkajQ0JGwwJGgw",
  },
  {
    id: "9",
    name: "Grace Lee",
    avatarUri:
      "https://images.pexels.com/photos/2397652/pexels-photo-2397652.jpeg?_gl=1*1weki17*_ga*MTIyNTY2ODg2Ny4xNzU2MDYxMzg0*_ga_8JE65Q40S6*czE3NTYwNjEzODMkbzEkZzEkdDE3NTYwNjE2MDIkajQxJGwwJGgw",
  },
]

const mockedQuestion = {
  howMuchPick: 1,
  text: "Who is your favorite?",
  attribute: "Charisma",
}

export default function Voting() {
  return (
    <Screen style={styles.container}>
      <HorizontalSlider users={mockedUsers} question={mockedQuestion} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
})
