import { SharedValue } from "react-native-reanimated";
import SpinningIconLoader from "../SpinningIconLoader";
import PhaseButton from "./PhaseButton";

type ProcessingPhaseButtonProps = {
  activeCircleFill: SharedValue<string>;
};

const ProcessingPhaseButton = ({
  activeCircleFill,
}: ProcessingPhaseButtonProps) => (
  <PhaseButton
    onPress={() => Promise.resolve()}
    buttonStyle={{ backgroundColor: activeCircleFill.value }}
  >
    <SpinningIconLoader />
  </PhaseButton>
);

export default ProcessingPhaseButton;
