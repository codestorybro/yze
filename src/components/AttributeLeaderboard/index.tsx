import { View } from "react-native"
import { useSharedValue } from "react-native-reanimated"

import { AttributeType } from "@/types/attributeType"
import { normalizeAttributes } from "@/utils/normalizeAttributes"

import { SingleAttribute } from "./SingleAttribute"

// constants
export const _spacing = 8

type Props = {
  attributes: AttributeType[]
}

export default function Leaderboard({ attributes }: Props) {
  const _anim = useSharedValue(0)
  const normalizedAttributes = normalizeAttributes(attributes)

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
