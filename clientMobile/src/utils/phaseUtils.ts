import { ConversationPhase } from "../types";

export const startRecognizingPhase = (
  setPhase: React.Dispatch<React.SetStateAction<ConversationPhase>>,
  setPhaseText: React.Dispatch<React.SetStateAction<string>>,
) => {
  setPhase(ConversationPhase.Recognizing);
  setPhaseText("Press button when finished speaking");
};
