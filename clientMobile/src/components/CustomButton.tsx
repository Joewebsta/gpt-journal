import { ReactNode } from "react";
import { Pressable, Text, View, StyleProp, ViewStyle } from "react-native";
import { styles } from "../styles/appStyles";

type ButtonProps = {
  onPress: () => Promise<void>;
  children: ReactNode;
  buttonStyle?: StyleProp<ViewStyle>;
};

const CustomButton = ({ onPress, children, buttonStyle }: ButtonProps) => (
  <View>
    <Pressable style={[styles.button, buttonStyle]} onPress={onPress}>
      <Text>{children}</Text>
    </Pressable>
  </View>
);

export default CustomButton;
