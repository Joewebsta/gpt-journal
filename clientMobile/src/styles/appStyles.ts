import { StyleSheet } from "react-native";

export const COLORS = {
  SILVER: "#F8F8FA",
  SLATE: "#6F7291",
  LAVENDER: "#A28EA8",
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: 100,
    paddingBottom: 120,
    backgroundColor: COLORS.SILVER,
  },
  circlesContainer: {
    flex: 1,
    justifyContent: "center",
  },
  buttonContainer: {
    alignItems: "center",
    gap: 60,
  },
  phaseText: {
    fontWeight: "500",
  },
  button: {
    borderRadius: 1000,
    height: 74,
    paddingTop: 8,
    width: 74,
    alignItems: "center",
    justifyContent: "center",
  },
});
