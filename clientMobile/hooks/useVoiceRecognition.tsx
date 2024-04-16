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

  // useCallback to memoize callback functions
  const onSpeechResults = useCallback((e: SpeechResultsEvent) => {
    if (e.value) {
      setState((s) => ({ ...s, results: e.value! }));
    }
  }, []);

  const onSpeechError = useCallback((e: SpeechErrorEvent) => {
    console.log("onSpeechError: ", e);
    setState((s) => ({ ...s, error: JSON.stringify(e.error) }));
  }, []);

  const resetRecognizerState = useCallback(() => {
    setState({
      error: "",
      results: [],
    });
  }, []);

  useEffect(() => {
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;

    // Clean up function
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [onSpeechError, onSpeechResults]);

  const startRecognizing = useCallback(async () => {
    resetRecognizerState();
    try {
      await Voice.start("en-US");
    } catch (e) {
      console.error(e);
    }
  }, [resetRecognizerState]);

  const stopRecognizing = useCallback(async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  }, []);

  const destroyRecognizer = useCallback(async () => {
    try {
      await Voice.destroy();
    } catch (e) {
      console.log(e);
    }
    resetRecognizerState();
  }, [resetRecognizerState]);

  return {
    recognizerState,
    setState,
    startRecognizing,
    stopRecognizing,
    destroyRecognizer,
    resetRecognizerState,
  };
};
