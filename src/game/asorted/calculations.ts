import { GameSingletons } from "@game/app/GameSingletons";

export function calculateTrainLuckPercent({ conductorLuckPerkBoostPercent = 0, locomotiveLuckBoostPercent = 0 }) {
  const { conductorLuckBasePercent, conductorLuckMultiplier } = GameSingletons.getGameContext().gameConfigData.gameplay;
  return (
    conductorLuckBasePercent + locomotiveLuckBoostPercent + conductorLuckPerkBoostPercent * conductorLuckMultiplier
  );
}

export function calculateHaulingPower({ conductorHaulingPower = 0, locomotiveHaulingPowerBase = 0 }) {
  return locomotiveHaulingPowerBase * (1.0 + 0.01 * conductorHaulingPower);
}

export function calculateTrainMaxWeight({ conductorHaulingPower = 0, locomotiveHaulingPowerBase = 0 }) {
  const locoHaulingPower = calculateHaulingPower({ conductorHaulingPower, locomotiveHaulingPowerBase });

  const { gameConfigData } = GameSingletons.getDataHolders();
  const globalHaulingPowerCoefficient = gameConfigData.vars.hp_m * 0.01;
  const maxWeight = Math.floor(locoHaulingPower * globalHaulingPowerCoefficient);
  return maxWeight;
}
