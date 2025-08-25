import { View, TextProps, StyleSheet } from "react-native"
import { MotiView } from "moti"

import { Text } from "@/components"

type TickerListProps = {
  number: number
  fontSize: number
  index: number
}

const numbersToNice = [...Array(10).keys()]
const _stagger = 50

function Tick({ children, fontSize, style, ...rest }: TextProps & { fontSize: number }) {
  return (
    <Text
      {...rest}
      style={[style, { fontSize, lineHeight: fontSize * 1.1, fontVariant: ["tabular-nums"] }]}
    >
      {children}
    </Text>
  )
}

function TickerList({ number, fontSize, index }: TickerListProps) {
  return (
    <View style={[{ height: fontSize }, styles.tickerList]}>
      <MotiView
        animate={{
          translateY: -fontSize * 1.1 * number,
        }}
        transition={{
          delay: index * _stagger,
          damping: 80,
          stiffness: 200,
        }}
      >
        {numbersToNice.map((num, index) => {
          return (
            <Tick key={`number-${num}-${index}`} fontSize={fontSize}>
              {num}
            </Tick>
          )
        })}
      </MotiView>
    </View>
  )
}

export default function Ticker({ value, fontSize = 16 }: { value: number; fontSize?: number }) {
  const splitValue = value.toString().split("")

  return (
    <View>
      <View style={styles.tickerListWrapper}>
        {splitValue.map((number, index) => {
          return (
            <TickerList key={index} number={parseInt(number)} fontSize={fontSize} index={index} />
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  tickerList: {
    overflow: "hidden",
  },
  tickerListWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
})
