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
    paddingBottom: 60,
    gap: 60,
    backgroundColor: "#F8F8FA",
  },
  button: {
    borderRadius: 1000,
    height: 74,
    paddingTop: 9,
    width: 74,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});
