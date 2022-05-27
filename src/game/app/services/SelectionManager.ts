import { CardEntity } from "@game/data/entities/CardEntity";
import { StationEntity } from "@game/data/entities/StationEntity";
import { TrainEntity } from "@game/data/entities/TrainEntity";
import { GameContext } from "../app";

export class SelectionManager {
  //// Trains

  selectedTrain = null as null | TrainEntity;
  //// Stations

  selectedStation = null as null | StationEntity;

  selectedDestination = null as null | StationEntity;

  hoverStation = null as null | StationEntity;

  get selectedTrainCurrentStation() {
    if (!this.selectedTrain) return null;
    if (!this.selectedTrain.currentStationId) return null;
    return this.context.mapData.stations.get(this.selectedTrain.currentStationId) || null;
  }

  isViablelDestination(station: StationEntity | StationEntity["assetId"]) {
    if (typeof station !== "string" && typeof station !== "number") {
      station = station.assetId;
    }
    return !!this.selectedStation?.getLinkTo(station);
  }

  //// TEMP //// TEMP //// TEMP //// TEMP //// TEMP //// TEMP //// TEMP //// TEMP //// TEMP ////
  get firstTrainAtSelectedStation() {
    const selectedStation = this.selectedStation;
    return selectedStation && this.context.main.faq.getFirstTrainAtStation(selectedStation);
  }
  //// TEMP //// TEMP //// TEMP //// TEMP //// TEMP //// TEMP //// TEMP //// TEMP //// TEMP ////

  hypotheticalTrainEntity = null as null | TrainEntity;

  //// Cards (for edit train & stuff)

  selectedCard = null as null | CardEntity;
  hoverCard = null as null | CardEntity;

  constructor(public readonly context: GameContext) {
    this.context.stage.enchantments.watch.array(
      () => [this.selectedTrain, this.hoverCard] as const,
      ([selectedTrain, hoverCard]) => {
        if (selectedTrain && hoverCard) {
          this.hypotheticalTrainEntity = TrainEntity.clone(selectedTrain);
          // equipTrainCard(state.hypotheticalTrainEntity, hoverCard);
        } else {
          this.hypotheticalTrainEntity = null;
        }
      },
      true
    );
  }

  clear() {
    this.hoverStation = null;
    this.selectedStation = null;
    this.selectedDestination = null;
    this.selectedTrain = null;
  }
}
