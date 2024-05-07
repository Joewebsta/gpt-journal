import { IconMicrophone, IconRefresh } from "@tabler/icons-react-native";
import OpenAI from "openai";
import { View } from "react-native";
import { SharedValue } from "react-native-reanimated";
import { COLORS } from "../../styles/appStyles";
import CustomButton from "../CustomButton";

type StandbyPhaseProps = {
  startSpeaking: () => Promise<void>;
  resetConversation: () => Promise<void>;
  messages: OpenAI.ChatCompletionMessageParam[];
  activeCircleFill: SharedValue<string>;
};

const StandbyPhase = ({
  startSpeaking,
  resetConversation,
  messages,
  activeCircleFill,
}: StandbyPhaseProps) => (
  <View>
    <CustomButton
      onPress={startSpeaking}
      buttonStyle={{
        backgroundColor: activeCircleFill.value,
      }}
    >
      <IconMicrophone color={COLORS.SILVER} size={30} />
    </CustomButton>

    {messages.length > 1 && (
      <CustomButton
        onPress={resetConversation}
        buttonStyle={{
          backgroundColor: COLORS.SILVER,
          position: "absolute",
          top: -74,
          left: 104,
        }}
      >
        <IconRefresh color={COLORS.SLATE} size={30} />
      </CustomButton>
    )}
  </View>
);

export default StandbyPhase;
