import { Transcript } from "assemblyai";

export const calculateDurationFromWords = (transcript: Transcript) => {
    if (!transcript || !transcript.words) {
        throw new Error("Invalid transcript data");
    }

    let totalDuration = 0;

    transcript.words.forEach(sentence => {
        if (sentence.start) {
            totalDuration += (sentence.end - sentence.start);
        }
    });

    return totalDuration;
};
