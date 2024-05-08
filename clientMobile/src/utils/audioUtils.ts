import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";
import { ConversationPhase } from "../types";

export const writeAudioToFile = async (path: string, audioData: string) => {
  await FileSystem.writeAsStringAsync(path, audioData, {
    encoding: FileSystem.EncodingType.Base64,
  });
};

export async function playAudioFromPath(
  path: string,
  setPhase: React.Dispatch<React.SetStateAction<ConversationPhase>>,
  setPhaseText: React.Dispatch<React.SetStateAction<string>>,
) {
  try {
    // const { sound } = await Audio.Sound.createAsync();
    const soundObject = new Audio.Sound();
    soundObject.setOnPlaybackStatusUpdate((status) => {
      if (status.isPlaying) {
        setPhase(ConversationPhase.Speaking);
        setPhaseText("Press button to interrupt");
      }

      if (status.didJustFinish) {
        setPhase(ConversationPhase.Standby);
        setPhaseText("Press button and start speaking");
      }
    });
    await soundObject.loadAsync({ uri: path });
    await soundObject.playAsync();
  } catch (error) {
    console.log("An error occurred while playing the audio:", error);
  }
}
