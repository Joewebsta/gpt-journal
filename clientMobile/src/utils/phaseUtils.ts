import { ConversationPhase } from "../types";

export const startPhase = (
  phase: ConversationPhase,
  phaseText: string,
  setPhase: React.Dispatch<React.SetStateAction<ConversationPhase>>,
  setPhaseText: React.Dispatch<React.SetStateAction<string>>,
) => {
  setPhase(phase);
  setPhaseText(phaseText);
};
