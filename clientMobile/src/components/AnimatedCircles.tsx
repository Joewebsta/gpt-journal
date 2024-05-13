import React from "react";
import { View } from "react-native";
import { COLORS } from "../styles/appStyles";
import { MotiView } from "moti";

const AnimatedCircles = ({}) => (
  <View
    style={{
      position: "relative",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    {/* ACTIVE CIRCLE */}
    <MotiView
      from={{ width: 300, height: 300 }}
      // animate={{ opacity: isLoading ? 1 : 0 }}
      animate={{ width: 300, height: 300 }}
      // transition={{
      //   type: "timing",
      //   duration: 1000,
      //   // repeat: 40,
      // }}
      // exit={{ opacity: 0 }}
      style={{
        justifyContent: "center",
        borderRadius: 150,
        backgroundColor: COLORS.SLATE,
      }}
    />

    {/* STANDBY CIRCLE */}
    <MotiView
      from={{ width: 280, height: 280 }}
      // animate={{ opacity: isLoading ? 1 : 0 }}
      animate={{ width: 280, height: 280 }}
      // transition={{
      //   type: "timing",
      //   duration: 1000,
      //   // repeat: 40,
      // }}
      // exit={{ opacity: 0 }}
      style={{
        borderRadius: 150,
        backgroundColor: COLORS.SILVER,
        position: "absolute",
      }}
    />
  </View>
);

export default AnimatedCircles;
