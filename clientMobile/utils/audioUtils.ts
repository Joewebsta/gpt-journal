import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";
import { ConversationPhase } from "../App";

export const writeAudioToFile = async (path: string, audioData: string) => {
  await FileSystem.writeAsStringAsync(path, audioData, {
    encoding: FileSystem.EncodingType.Base64,
  });
};

export async function playAudioFromPath(
  path: string,
  setPhase: React.Dispatch<React.SetStateAction<ConversationPhase>>,
) {
  try {
    // const { sound } = await Audio.Sound.createAsync();
    const soundObject = new Audio.Sound();
    soundObject.setOnPlaybackStatusUpdate((status) => {
      if (status.isPlaying) {
        setPhase("speaking");
      }

      if (status.didJustFinish) {
        setPhase("standby");
      }
      // console.log("DID JUST FINISH?", status.didJustFinish);
      // console.log("AUDIO STATUS:", status);
    });
    await soundObject.loadAsync({ uri: path });
    await soundObject.playAsync();
  } catch (error) {
    console.log("An error occurred while playing the audio:", error);
  }
}
