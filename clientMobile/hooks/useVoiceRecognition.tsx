import { useState, useEffect, useCallback } from "react";

import Voice, {
  SpeechErrorEvent,
  SpeechResultsEvent,
} from "@react-native-voice/voice";

export const useVoiceRecognition = () => {
  const [state, setState] = useState({
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
    resetState();

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

  const resetState = () => {
    setState({
      error: "",
      results: [],
    });
  };

  return {
    state,
    setState,
    resetState,
    startRecognizing,
    stopRecognizing,
  };
};
