import { View } from "react-native"
import { useSharedValue } from "react-native-reanimated"

import { AttributeType } from "@/types/attributeType"

import { SingleAttribute } from "./SingleAttribute"

// constants
export const _spacing = 8

type Props = {
  attributes: AttributeType[]
}

export default function Leaderboard({ attributes }: Props) {
  const _anim = useSharedValue(0)
  const maxScore = Math.max(...attributes.map((attr) => attr.score))
  const sorted = [...attributes].sort((a, b) => b.score - a.score)
  const normalizedAttributes = attributes.map((attr) => {
    const rank = sorted.findIndex((el) => el.id === attr.id) + 1
    return {
      ...attr,
      widthPercent: (attr.score / maxScore) * 100,
      rank: rank <= 3 ? rank : null,
    }
  })

  return (
    <View>
      <View style={{ gap: _spacing }}>
        {normalizedAttributes.map((attribute, index) => (
          <SingleAttribute
            key={attribute.id}
            attribute={attribute}
            index={index}
            anim={_anim}
            onFinish={
              index === attributes.length - 1
                ? () => {
                    _anim.value = 1
                  }
                : null
            }
          />
        ))}
      </View>
    </View>
  )
}
