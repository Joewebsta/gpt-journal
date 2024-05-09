import { IconPlayerStopFilled } from "@tabler/icons-react-native";
import { SharedValue } from "react-native-reanimated";
import { COLORS } from "../../styles/appStyles";
import CustomButton from "./PhaseButton";

type SpeakingPhaseButtonProps = {
  activeCircleFill: SharedValue<string>;
};

const SpeakingPhaseButton = ({
  activeCircleFill,
}: SpeakingPhaseButtonProps) => (
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

export default SpeakingPhaseButton;
