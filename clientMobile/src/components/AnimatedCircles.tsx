import React from "react";
import { View } from "react-native";
import Animated, { SharedValue } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { COLORS } from "../styles/appStyles";

type AnimatedCirclesProps = {
  activeCircleFill: SharedValue<string>;
  activeCircleRadius: SharedValue<number>;
  standbyCircleRadius: SharedValue<number>;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const AnimatedCircles = ({
  activeCircleFill,
  activeCircleRadius,
  standbyCircleRadius,
}: AnimatedCirclesProps) => (
  <View style={{ position: "relative" }}>
    {/* ACTIVE CIRCLE */}
    <Svg
      style={{
        height: 320,
        width: 320,
        position: "relative",
      }}
    >
      <AnimatedCircle
        cx="50%"
        cy="50%"
        fill={activeCircleFill.value}
        r={activeCircleRadius}
      />
    </Svg>

    {/* STANDBY CIRCLE */}
    <Svg
      style={{
        height: 320,
        width: 320,
        position: "absolute",
      }}
    >
      <AnimatedCircle
        cx="50%"
        cy="50%"
        fill={COLORS.SILVER}
        r={standbyCircleRadius}
      />
    </Svg>
  </View>
);

export default AnimatedCircles;
