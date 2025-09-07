import { AttributeType } from "@/types/attributeType"

const rankImages: Record<number, any> = {
  1: require("../../assets/images/home/gold.png"),
  2: require("../../assets/images/home/silver.png"),
  3: require("../../assets/images/home/bronze.png"),
}

export const normalizeAttributes = (attributes: AttributeType[]) => {
  const maxScore = Math.max(...attributes.map((a) => a.score))

  const uniqueScores = [...new Set(attributes.map((a) => a.score))]
    .filter((score) => score > 0)
    .sort((a, b) => b - a)

  const scoreToRank = new Map<number, number>()

  let currentRank = 1
  for (let i = 0; i < uniqueScores.length; i++) {
    const score = uniqueScores[i]
    scoreToRank.set(score, currentRank)

    const tiedCount = attributes.filter((a) => a.score === score).length
    currentRank += tiedCount
  }

  return attributes.map((attr) => {
    if (attr.score === 0) {
      return {
        ...attr,
        widthPercent: maxScore > 0 ? (attr.score / maxScore) * 100 : 0,
        rank: null,
        rankImage: null,
      }
    }

    const rank = scoreToRank.get(attr.score)!
    return {
      ...attr,
      widthPercent: (attr.score / maxScore) * 100,
      rank: rank <= 3 ? rank : null,
      rankImage: rank <= 3 ? rankImages[rank] : null,
    }
  })
}
