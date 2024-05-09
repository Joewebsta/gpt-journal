import { SharedValue } from "react-native-reanimated";
import CustomButton from "../PhaseButton";
import SpinningIconLoader from "../SpinningIconLoader";

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
