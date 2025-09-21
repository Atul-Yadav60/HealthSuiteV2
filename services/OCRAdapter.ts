import TextRecognition from "@react-native-ml-kit/text-recognition";

/**
 * Takes a local image path and uses ML Kit to recognize text in it.
 * @param imagePath The local file path to the image (e.g., 'file:///path/to/image.jpg').
 * @returns A promise that resolves to the full recognized text as a single string.
 */
export async function recognizeTextInImage(imagePath: string): Promise<string> {
  try {
    const result = await TextRecognition.recognize(imagePath);
    return result.text;
  } catch (error) {
    console.error("Failed to recognize text:", error);
    throw new Error("Could not read text from the image.");
  }
}

/**
 * A simple parser to find common prescription-related keywords from raw text.
 * This can be expanded with more sophisticated logic and NLP in the future.
 * @param text The raw text extracted from the OCR process.
 * @returns An object containing the raw text and arrays of potential medications and frequencies.
 */
export function parsePrescriptionText(text: string) {
  const lines = text.split("\n");
  const medicationKeywords = [
    "tablet",
    "capsule",
    "mg",
    "ml",
    "oint",
    "cream",
    "drops",
  ];
  const frequencyKeywords = [
    "daily",
    "twice",
    "thrice",
    "morning",
    "noon",
    "night",
    "hour",
    "day",
    "week",
    "sos",
  ];

  const foundMedications: string[] = [];
  const foundFrequencies: string[] = [];

  lines.forEach((line) => {
    const lowerLine = line.toLowerCase();
    if (medicationKeywords.some((keyword) => lowerLine.includes(keyword))) {
      foundMedications.push(line.trim());
    }
    if (frequencyKeywords.some((keyword) => lowerLine.includes(keyword))) {
      foundFrequencies.push(line.trim());
    }
  });

  return {
    rawText: text,
    medications: foundMedications,
    frequencies: foundFrequencies,
  };
}
