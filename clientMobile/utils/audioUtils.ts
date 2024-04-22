import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";

export const writeAudioToFile = async (path: string, audioData: string) => {
  await FileSystem.writeAsStringAsync(path, audioData, {
    encoding: FileSystem.EncodingType.Base64,
  });
};

export async function playAudioFromPath(path: string) {
  try {
    const soundObject = new Audio.Sound();
    await soundObject.loadAsync({ uri: path });
    await soundObject.playAsync();
  } catch (error) {
    console.log("An error occurred while playing the audio:", error);
  }
}
