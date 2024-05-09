import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";
import { ConversationPhase } from "../types";
import { updateConversationPhase } from "./phaseUtils";

export const storeAndPlayAudio = async (
  encodedMp3Data: string,
  setPhase: React.Dispatch<React.SetStateAction<ConversationPhase>>,
  setPhaseText: React.Dispatch<React.SetStateAction<string>>,
) => {
  try {
    const path = `${FileSystem.documentDirectory}${Date.now()}.mp3`;
    await writeAudioToFile(path, encodedMp3Data);
    await playAudioFromPath(path, setPhase, setPhaseText);
  } catch (error) {
    console.error("An error occurred while playing the audio:", error);
  }
};

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
    const soundObject = new Audio.Sound();
    soundObject.setOnPlaybackStatusUpdate((status) => {
      if (status.isPlaying) {
        updateConversationPhase(
          ConversationPhase.Speaking,
          "Press button to interrupt",
          setPhase,
          setPhaseText,
        );
      }

      if (status.didJustFinish) {
        updateConversationPhase(
          ConversationPhase.Standby,
          "Press button and start speaking",
          setPhase,
          setPhaseText,
        );
      }
    });
    await soundObject.loadAsync({ uri: path });
    await soundObject.playAsync();
  } catch (error) {
    console.log("An error occurred while playing the audio:", error);
  }
}

export const checkPermission = async (
  permissionResponse: Audio.PermissionResponse | null,
  requestPermission: () => Promise<Audio.PermissionResponse>,
) => {
  if (permissionResponse && permissionResponse.status !== "granted") {
    console.log("Requesting permission...");
    await requestPermission();
  }
};
