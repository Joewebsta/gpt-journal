import { IconPlayerStopFilled } from "@tabler/icons-react-native";
import { SharedValue } from "react-native-reanimated";
import { COLORS } from "../../styles/appStyles";
import CustomButton from "../CustomButton";

type RecognizingPhaseProps = {
  stopSpeaking: () => Promise<void>;
  activeCircleFill: SharedValue<string>;
};

const RecognizingPhase = ({
  stopSpeaking,
  activeCircleFill,
}: RecognizingPhaseProps) => (
  <CustomButton
    onPress={stopSpeaking}
    buttonStyle={{ backgroundColor: activeCircleFill.value }}
  >
    <IconPlayerStopFilled
      color={COLORS.SILVER}
      fill={COLORS.SILVER}
      size={30}
    />
  </CustomButton>
);

export default RecognizingPhase;
