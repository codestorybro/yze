import { View } from "react-native"
import { useSharedValue } from "react-native-reanimated"

import { AttributeType } from "@/types/attributeType"
import { normalizeAttributes } from "@/utils/normalizeAttributes"

import { SingleAttribute } from "./SingleAttribute"
import { ElementsList } from "../ElementsList"
import { Text } from "@/components"

// constants
export const _spacing = 8

type Props = {
  attributes: AttributeType[]
}

export default function Leaderboard({ attributes }: Props) {
  const normalizedAttributes = normalizeAttributes(attributes)

  return (
    <ElementsList
      items={normalizedAttributes.map((attribute) => ({
        id: attribute.id,
        icon: attribute.icon,
        content: <Text>{attribute.label}</Text>,
        onPress: () => {
          // Handle press
        },
      }))}
    />
    // <View style={{ gap: _spacing }}>
    //   {normalizedAttributes.map((attribute, index) => (
    //     <SingleAttribute
    //       key={attribute.id}
    //       attribute={attribute}
    //       index={index}
    //       anim={_anim}
    // onFinish={
    //   index === attributes.length - 1
    //     ? () => {
    //         _anim.value = 1
    //       }
    //     : null
    // }
    //     />
    //   ))}
    // </View>
  )
}
