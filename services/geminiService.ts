import { GoogleGenAI, Modality, Type } from "@google/genai";

// Lazy initialization helper
let aiInstance: GoogleGenAI | null = null;

const getAi = (): GoogleGenAI => {
  if (!aiInstance) {
    // We access process.env.API_KEY here, inside the function, 
    // ensuring the environment/polyfills are ready.
    const apiKey = process.env.API_KEY || ''; 
    aiInstance = new GoogleGenAI({ apiKey: apiKey });
  }
  return aiInstance;
};

// Helper to clean markdown JSON
const cleanJSON = (text: string) => {
  if (!text) return "";
  
  // Locate the first { or [
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  
  let start = -1;
  // If both exist, pick the earlier one
  if (firstBrace !== -1 && firstBracket !== -1) start = Math.min(firstBrace, firstBracket);
  else if (firstBrace !== -1) start = firstBrace;
  else if (firstBracket !== -1) start = firstBracket;

  if (start === -1) return text.trim();

  // Determine matching closing character based on start
  const isObject = text[start] === '{';
  const end = text.lastIndexOf(isObject ? '}' : ']');

  if (end !== -1 && end > start) {
      return text.substring(start, end + 1);
  }
  
  // Fallback cleanup if structure detection fails
  let cleaned = text.trim();
  if (cleaned.includes("```")) {
    cleaned = cleaned.replace(/```(?:json)?/g, "").replace(/```/g, "").trim();
  }
  return cleaned;
};

// Audio Helper Functions
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generateTextResponse = async (
  prompt: string,
  systemInstruction?: string,
  modelName: string = 'gemini-2.5-flash'
): Promise<string> => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while processing your request.";
  }
};

export const generateImageResponse = async (
  prompt: string,
  base64Image: string,
  mimeType: string
): Promise<string> => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return "Failed to analyze the image.";
  }
};

export const generateFlashcards = async (topic: string): Promise<any[]> => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate 5 flashcards for the topic: "${topic}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING },
              back: { type: Type.STRING },
            },
            required: ['front', 'back']
          },
        },
      },
    });
    const jsonStr = cleanJSON(response.text || "[]");
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Flashcard Error:", error);
    return [];
  }
};

export const generateQuiz = async (topic: string): Promise<any[]> => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a multiple choice quiz with 3 questions about: "${topic}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Array of 4 possible answers" 
              },
              correctAnswer: { 
                type: Type.INTEGER, 
                description: "Index of the correct answer (0-3)" 
              },
              explanation: { type: Type.STRING, description: "Short explanation of why the answer is correct" }
            },
            required: ['question', 'options', 'correctAnswer', 'explanation']
          },
        },
      },
    });
    const jsonStr = cleanJSON(response.text || "[]");
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    return [];
  }
};

export const generateNotes = async (topic: string): Promise<any> => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Create detailed study notes for: "${topic}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            details: { type: Type.STRING },
            examples: { type: Type.STRING },
          },
          required: ['summary', 'details', 'examples']
        },
      },
    });
    const jsonStr = cleanJSON(response.text || "{}");
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Notes Error:", error);
    return null;
  }
};

export const generateEssayFeedback = async (essay: string): Promise<any> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Grade this essay and provide feedback: "${essay}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        grade: { type: Type.STRING, description: "Letter grade (A, B+, C, etc)" },
                        feedback: { type: Type.STRING, description: "General summary feedback" },
                        improvements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of specific improvements" }
                    },
                    required: ['grade', 'feedback', 'improvements']
                }
            }
        });
        const jsonStr = cleanJSON(response.text || "{}");
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Essay Grading Error", e);
        return null;
    }
}

export const generateStudyPlan = async (subjects: string, hours: string): Promise<string> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Create a weekly study schedule (Markdown format table) for these subjects: ${subjects}. I have ${hours} hours available per day. Be realistic and include breaks.`,
        });
        return response.text || "Could not generate plan.";
    } catch (e) {
        console.error("Planning Error", e);
        return "Error generating plan.";
    }
}

export const generateCodeExplanation = async (code: string): Promise<string> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Explain this code snippet in simple terms. Identify any potential bugs or improvements: \n\n${code}`,
        });
        return response.text || "Could not explain code.";
    } catch (e) {
        return "Error analyzing code.";
    }
}

export const generateSimplification = async (topic: string): Promise<string> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Explain "${topic}" like I am 5 years old. Use analogies.`,
        });
        return response.text || "Could not simplify.";
    } catch (e) {
        return "Error generating simplification.";
    }
}

export const generateDiagramCode = async (topic: string, type: string): Promise<string> => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Create a ${type} for "${topic}" using Mermaid.js syntax. Return ONLY the code, starting with 'graph', 'flowchart', 'mindmap' etc. Do not include markdown backticks.`,
    });
    let text = response.text || "";
    // Clean up if markdown blocks are included
    text = text.replace(/```mermaid/g, '').replace(/```/g, '').trim();
    return text;
  } catch (e) {
    return "graph TD; A[Error] --> B[Could not generate diagram];";
  }
}

export const generateFormulas = async (subject: string): Promise<any[]> => {
  try {
     const ai = getAi();
     const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `List 10 essential formulas for ${subject}. For each, provide the formula, a brief explanation, and a simple practice example with solution.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              formula: { type: Type.STRING },
              explanation: { type: Type.STRING },
              example: { type: Type.STRING }
            },
            required: ['name', 'formula', 'explanation', 'example']
          }
        }
      }
    });
    const jsonStr = cleanJSON(response.text || "[]");
    return JSON.parse(jsonStr);
  } catch (e) {
    return [];
  }
}

export const generateCitation = async (text: string, style: string): Promise<string> => {
   try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a ${style} citation for the following source/text: "${text}".`,
        });
        return response.text || "Could not generate citation.";
    } catch (e) {
        return "Error generating citation.";
    }
}

export const analyzeHomework = async (base64Image: string, mimeType: string): Promise<string> => {
     try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: "Identify all questions in this homework image. Solve each one step-by-step. If there are diagrams, explain them.",
          },
        ],
      },
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return "Failed to analyze the homework.";
  }
}

export const analyzeProgress = async (stats: any): Promise<string> => {
     try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Here are my study stats: ${JSON.stringify(stats)}. Give me 3 specific tips to improve.`,
        });
        return response.text || "Keep studying!";
    } catch (e) {
        return "Error analyzing progress.";
    }
}

export const generateSpeech = async (text: string): Promise<AudioBuffer | null> => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Aoede' }, 
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) return null;

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      outputAudioContext,
      24000,
      1,
    );
    return audioBuffer;

  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return null;
  }
};

export const playAudioBuffer = async (buffer: AudioBuffer) => {
   const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
   if (audioContext.state === 'suspended') {
     await audioContext.resume();
   }
   const source = audioContext.createBufferSource();
   source.buffer = buffer;
   // Set playback rate to 1.5x for faster speech
   source.playbackRate.value = 1.5; 
   source.connect(audioContext.destination);
   source.start();
}
