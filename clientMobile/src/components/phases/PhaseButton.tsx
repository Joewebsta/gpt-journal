import { ReactNode } from "react";
import { Pressable, StyleProp, Text, View, ViewStyle } from "react-native";
import { styles } from "../../styles/appStyles";

type PhaseButtonProps = {
  onPress: () => Promise<void>;
  children: ReactNode;
  buttonStyle?: StyleProp<ViewStyle>;
};

const PhaseButton = ({ onPress, children, buttonStyle }: PhaseButtonProps) => (
  <View>
    <Pressable style={[styles.button, buttonStyle]} onPress={onPress}>
      <Text>{children}</Text>
    </Pressable>
  </View>
);

export default PhaseButton;
