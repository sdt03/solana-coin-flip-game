import { GameResult } from "./generated/prisma/enums";

import { GameChoice } from "./generated/prisma/enums";

export const calculateFees = (betAmount: number) => {
  return betAmount * 0.03;
}
export const handleGameFlip = (choice: GameChoice) => {
  const randomNumber = Math.random();
  const result =  randomNumber < 0.5 ? GameChoice.HEADS : GameChoice.TAILS;
  if (result === choice) {
    return GameResult.WIN;
  } else {
    return GameResult.LOSS;
  }
}