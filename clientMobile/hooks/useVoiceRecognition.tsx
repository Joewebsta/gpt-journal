import { useState, useEffect, useCallback } from "react";

import Voice, {
  SpeechErrorEvent,
  SpeechResultsEvent,
} from "@react-native-voice/voice";

interface RecognizerState {
  error: string;
  results: string[];
}

export const useVoiceRecognition = () => {
  const [recognizerState, setState] = useState<RecognizerState>({
    error: "",
    results: [],
  });

  useEffect(() => {
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;

    // Clean up function
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechResults = (e: SpeechResultsEvent) => {
    if (e.value) {
      // console.log("onSpeechResults: ", e);
      setState((s) => ({ ...s, results: e.value! }));
    }
  };

  const onSpeechError = (e: SpeechErrorEvent) => {
    console.log("onSpeechError: ", e);
    setState((s) => ({ ...s, error: JSON.stringify(e.error) }));
  };

  const startRecognizing = async () => {
    resetRecognizerState();

    try {
      await Voice.start("en-US");
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecognizing = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  };

  const destroyRecognizerState = async () => {
    try {
      await Voice.destroy();
    } catch (e) {
      console.log(e);
    }

    resetRecognizerState();
  };

  const resetRecognizerState = async () => {
    try {
      setState({
        error: "",
        results: [],
      });
    } catch (e) {
      console.error(e);
    }
  };

  return {
    recognizerState,
    setState,
    startRecognizing,
    stopRecognizing,
    destroyRecognizerState,
    resetRecognizerState,
  };
};
