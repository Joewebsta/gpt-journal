import { IconPlayerStopFilled } from "@tabler/icons-react-native";
import { SharedValue } from "react-native-reanimated";
import { COLORS } from "../../styles/appStyles";
import PhaseButton from "./PhaseButton";

type RecognizingPhaseButtonProps = {
  stopSpeaking: () => Promise<void>;
  activeCircleFill: SharedValue<string>;
};

const RecognizingPhaseButton = ({
  stopSpeaking,
  activeCircleFill,
}: RecognizingPhaseButtonProps) => (
  <PhaseButton
    onPress={stopSpeaking}
    buttonStyle={{ backgroundColor: activeCircleFill.value }}
  >
    <IconPlayerStopFilled
      color={COLORS.SILVER}
      fill={COLORS.SILVER}
      size={30}
    />
  </PhaseButton>
);

export default RecognizingPhaseButton;
