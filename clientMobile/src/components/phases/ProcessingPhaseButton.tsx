import { SharedValue } from "react-native-reanimated";
import SpinningIconLoader from "../SpinningIconLoader";
import CustomButton from "./PhaseButton";

type ProcessingPhaseButtonProps = {
  activeCircleFill: SharedValue<string>;
};

const ProcessingPhaseButton = ({
  activeCircleFill,
}: ProcessingPhaseButtonProps) => (
  <CustomButton
    onPress={() => Promise.resolve()}
    buttonStyle={{ backgroundColor: activeCircleFill.value }}
  >
    <SpinningIconLoader />
  </CustomButton>
);

export default ProcessingPhaseButton;
