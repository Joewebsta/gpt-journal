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
    backgroundColor: "#F8F8FA",
  },
  circlesContainer: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
  },
  buttonContainer: {
    display: "flex",
    alignItems: "center",
    gap: 60,
  },
  button: {
    borderRadius: 1000,
    height: 74,
    paddingTop: 8,
    width: 74,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});
