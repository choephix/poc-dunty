import { PotentialRailRunStats } from "@game/data/entities/PotentialRailRunStats";
import { RailRunEntity } from "@game/data/entities/RailRunEntity";
import { StationEntity } from "@game/data/entities/StationEntity";
import { TrainEntity } from "@game/data/entities/TrainEntity";
import { RailroaderDashPanelType } from "@game/ui/railroader-dash/panels/models";
import { InteractionData } from "@pixi/interaction";
import { EventBus } from "@sdk/core/EventBus";

export function makeInputService() {
  return new EventBus<{
    clickOnStation: (station: StationEntity, event: InteractionData) => void;

    enterEditTrainView: (train: TrainEntity) => void;
    enterLoadingDockView: (train: TrainEntity) => void;
    enterNextStopView: (train: TrainEntity) => void;
    enterDispatchView: (train: TrainEntity, destination: StationEntity) => void;

    selectTrain: (train: TrainEntity | null) => void;
    selectStation: (station: StationEntity | null, detailed?: boolean) => void;
    selectDestination: (station: StationEntity | null) => void;
    resetSelection: () => void;

    openStationDashboard: (station: StationEntity) => void;

    startRun: (runStats: PotentialRailRunStats) => void;
    claimRunRewards: (run: RailRunEntity) => void;

    toggleCardsDrawer: () => void;
    closeCardsDrawer: () => void;

    toggleMarketWindow: () => void;
    openMarketWindow: (options: any) => void;
    closeMarketWindow: () => void;

    toggleRailRunsWindow: () => void;
    openRailRunsWindow: () => void;
    closeRailRunsWindow: () => void;

    toggleRailRoaderDashboard: () => void;
    openRailRoaderDashboard: (panel: RailroaderDashPanelType | null) => void;
    closeRailRoaderDashboard: () => void;

    clearAndVerifyTrain: (train: TrainEntity) => void;

    confirm: () => void;

    logOut: () => void;
  }>();
}

export type InputService = ReturnType<typeof makeInputService>;
