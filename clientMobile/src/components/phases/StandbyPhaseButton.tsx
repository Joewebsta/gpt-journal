import { IconMicrophone, IconRefresh } from "@tabler/icons-react-native";
import OpenAI from "openai";
import { View } from "react-native";
import { SharedValue } from "react-native-reanimated";
import { COLORS } from "../../styles/appStyles";
import PhaseButton from "./PhaseButton";

type StandbyPhaseButtonProps = {
  startSpeaking: () => Promise<void>;
  resetConversation: () => Promise<void>;
  messages: OpenAI.ChatCompletionMessageParam[];
  activeCircleFill: SharedValue<string>;
};

const StandbyPhaseButton = ({
  startSpeaking,
  resetConversation,
  messages,
  activeCircleFill,
}: StandbyPhaseButtonProps) => (
  <View>
    <PhaseButton
      onPress={startSpeaking}
      buttonStyle={{
        backgroundColor: activeCircleFill.value,
      }}
    >
      <IconMicrophone color={COLORS.SILVER} size={30} />
    </PhaseButton>

    {messages.length > 1 && (
      <PhaseButton
        onPress={resetConversation}
        buttonStyle={{
          backgroundColor: COLORS.SILVER,
          position: "absolute",
          top: -74,
          left: 104,
        }}
      >
        <IconRefresh color={COLORS.SLATE} size={30} />
      </PhaseButton>
    )}
  </View>
);

export default StandbyPhaseButton;
