import { SharedValue } from "react-native-reanimated";
import CustomButton from "../CustomButton";
import SpinningIconLoader from "../SpinningIconLoader";

type ProcessingPhaseProps = {
  activeCircleFill: SharedValue<string>;
};

const ProcessingPhase = ({ activeCircleFill }: ProcessingPhaseProps) => (
  <CustomButton
    onPress={() => Promise.resolve()}
    buttonStyle={{ backgroundColor: activeCircleFill.value }}
  >
    <SpinningIconLoader />
  </CustomButton>
);

export default ProcessingPhase;
