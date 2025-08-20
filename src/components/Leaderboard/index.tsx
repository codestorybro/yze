import { Image, View } from "react-native"
import Animated, {
  FadeInUp,
  interpolate,
  interpolateColor,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated"

const users = [
  {
    name: "Alice",
    score: 1,
  },
  {
    name: "Bob",
    score: 24,
  },
  {
    name: "Charlie",
    score: 18,
  },
  {
    name: "David",
    score: 16,
  },
  {
    name: "Eve",
    score: 30,
  },
  {
    name: "Frank",
    score: 12,
  },
  {
    name: "Grace",
    score: 15,
  },
]

type PlaceProps = {
  user: (typeof users)[0]
  index: number
  onFinish?: () => void
  anim: SharedValue<number>
}

// constants
const _avatarSize = 28
const _spacing = 8
const _stagger = 200

function Place({ user, index, onFinish, anim }: PlaceProps) {
  const _anim = useDerivedValue(() => {
    return withDelay(
      _stagger * index,
      withSpring(anim.value, {
        damping: 80,
        stiffness: 200,
      }),
    )
  })

  const stylez = useAnimatedStyle(() => {
    return {
      width: interpolate(
        _anim.value,
        [0, 1],
        [_avatarSize, Math.max(user.score * 3, _avatarSize + _spacing)],
      ),
      backgroundColor:
        index === 4
          ? interpolateColor(_anim.value, [0, 1], ["rgba(0,0,0,0.1)", "turquoise"])
          : "rgba(0,0,0,0.1)",
    }
  })

  const textStylez = useAnimatedStyle(() => {
    return {
      opacity: interpolate(_anim.value, [0, 0.5, 1], [0, 0, 1]),
    }
  })

  return (
    <Animated.View
      entering={FadeInUp.delay(_stagger * index)
        .springify()
        .damping(80)
        .stiffness(200)
        .withCallback((finished) => {
          if (finished && onFinish) {
            runOnJS(onFinish)()
          }
        })}
      style={{ flexDirection: "row", alignItems: "center" }}
    >
      <Animated.View
        style={[
          {
            backgroundColor: "rgba(0,0,0,0.1)",
            alignItems: "flex-end",
            borderRadius: _avatarSize,
          },
          stylez,
        ]}
      >
        <View
          style={{
            width: _avatarSize,
            aspectRatio: 1,
          }}
        >
          <Image
            source={{ uri: `https://i.pravatar.cc/150?u=user_${user.name}` }}
            style={{ flex: 1, aspectRatio: 1, borderRadius: _avatarSize }}
          />
        </View>
      </Animated.View>
      <Animated.Text style={[{ fontSize: 7, fontWeight: "700" }, textStylez]}>
        {user.score}
      </Animated.Text>
    </Animated.View>
  )
}

export default function Leaderboard() {
  const _anim = useSharedValue(0)

  return (
    <View>
      <View style={{ gap: _spacing }}>
        {users.map((user, index) => (
          <Place
            key={index}
            user={user}
            index={index}
            anim={_anim}
            onFinish={
              index === users.length - 1
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
