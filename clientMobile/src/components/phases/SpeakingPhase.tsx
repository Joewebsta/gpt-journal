import { IconPlayerStopFilled } from "@tabler/icons-react-native";
import { SharedValue } from "react-native-reanimated";
import { COLORS } from "../../styles/appStyles";
import CustomButton from "../CustomButton";

type SpeakingPhaseProps = {
  activeCircleFill: SharedValue<string>;
};

const SpeakingPhase = ({ activeCircleFill }: SpeakingPhaseProps) => (
  <CustomButton
    onPress={() => Promise.resolve()}
    buttonStyle={{ backgroundColor: activeCircleFill.value }}
  >
    <IconPlayerStopFilled
      color={COLORS.SILVER}
      fill={COLORS.SILVER}
      size={30}
    />
  </CustomButton>
);

export default SpeakingPhase;
