import { Transcript } from "assemblyai";

export const calculateDurationFromWords = (transcript: Transcript) => {

    let totalDuration = 0;

    if (!transcript || !transcript.words) {
        return totalDuration;
    }
    transcript.words.forEach(sentence => {
        if (sentence.start) {
            totalDuration += (sentence.end - sentence.start);
        }
    });

    return totalDuration;
};
