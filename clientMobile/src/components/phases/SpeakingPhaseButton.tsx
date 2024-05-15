import { IconPlayerStopFilled } from "@tabler/icons-react-native";
import { Audio } from "expo-av";
import { SharedValue } from "react-native-reanimated";
import { COLORS } from "../../styles/appStyles";
import { ConversationPhase } from "../../types";
import { stopAudio } from "../../utils/audioUtils";
import { updateConversationPhase } from "../../utils/phaseUtils";
import PhaseButton from "./PhaseButton";

type SpeakingPhaseButtonProps = {
  activeCircleFill: SharedValue<string>;
  soundObj: Audio.Sound | null;
  setPhase: React.Dispatch<React.SetStateAction<ConversationPhase>>;
  setPhaseText: React.Dispatch<React.SetStateAction<string>>;
};

const SpeakingPhaseButton = ({
  activeCircleFill,
  soundObj,
  setPhase,
  setPhaseText,
}: SpeakingPhaseButtonProps) => {
  const handleOnPress = async () => {
    await stopAudio(soundObj);
    updateConversationPhase(
      ConversationPhase.Standby,
      "Press button and start speaking",
      setPhase,
      setPhaseText
    );
  };

  return (
    <PhaseButton
      onPress={handleOnPress}
      buttonStyle={{ backgroundColor: activeCircleFill.value }}
    >
      <IconPlayerStopFilled
        color={COLORS.SILVER}
        fill={COLORS.SILVER}
        size={30}
      />
    </PhaseButton>
  );
};

export default SpeakingPhaseButton;
