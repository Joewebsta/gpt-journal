import React, { useRef } from "react";
import { Animated, Easing } from "react-native";
import { IconLoader } from "@tabler/icons-react-native";

export default function SpinningIconLoader() {
  const spinValue = useRef(new Animated.Value(0)).current;

  Animated.loop(
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 2000,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  ).start();

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <IconLoader color="#F8F8FA" size={30} />
    </Animated.View>
  );
}
