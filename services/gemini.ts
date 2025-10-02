import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import type { ChatMessage, DataPoint } from '../types';

// IMPORTANT: This check is to prevent crashes in environments where process.env is not defined.
const apiKey = typeof process !== 'undefined' && process.env.API_KEY ? process.env.API_KEY : "";
if (!apiKey) {
    console.warn("API_KEY environment variable not set. AI features will be disabled.");
}
const ai = new GoogleGenAI({ apiKey });

const generateDatasetFunctionDeclaration: FunctionDeclaration = {
    name: 'generate_new_dataset',
    parameters: {
        type: Type.OBJECT,
        description: 'Generates a 2D dataset for classification based on a user description. The coordinates should be normalized between -2 and 2.',
        properties: {
            description: {
                type: Type.STRING,
                description: 'A creative description of the desired dataset pattern. For example: "two intertwined spirals" or "a moon shape and a star shape".',
            },
        },
        required: ['description'],
    },
};

export async function getAiResponse(prompt: string, context: object, history: ChatMessage[]) {
    if (!apiKey) {
        return { text: "AI features are disabled because the API key is not configured." };
    }

    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are an expert AI Analyst integrated into a machine learning visualization tool.
Your goal is to help users understand ML concepts by analyzing the tool's current state and answering their questions.
Use Markdown for formatting your responses to improve readability. For example, use lists for steps, **bold** for important terms, and \`code blocks\` for parameters or code snippets.
You can also generate new datasets for the user to experiment with by calling the 'generate_new_dataset' function.
Be concise, helpful, and educational.

CURRENT TOOL STATE:
${JSON.stringify(context, null, 2)}
`;
    
    const contents = [...history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    })), { role: 'user', parts: [{ text: prompt }] }];


    const response = await ai.models.generateContent({
        model,
        contents,
        config: {
            systemInstruction,
            tools: [{ functionDeclarations: [generateDatasetFunctionDeclaration] }],
        },
    });

    return response;
}


export async function generateDatasetWithAi(description: string): Promise<DataPoint[] | null> {
     if (!apiKey) {
        console.error("Cannot generate dataset without API key.");
        return null;
    }
    const model = 'gemini-2.5-flash';
    const contents = `Based on the following description, generate a 2D dataset with two classes (label 0 and 1).
The dataset should contain between 100 and 200 points.
The x and y coordinates of the points must be between -2 and 2.
Description: "${description}"`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            inputs: {
                                type: Type.ARRAY,
                                items: { type: Type.NUMBER },
                                description: 'An array containing the [x, y] coordinates of the point.'
                            },
                            label: {
                                type: Type.INTEGER,
                                description: 'The class label, either 0 or 1.'
                            }
                        },
                         required: ['inputs', 'label']
                    }
                },
            },
        });
        
        const jsonStr = response.text.trim();
        const data = JSON.parse(jsonStr);
        // Basic validation
        if (Array.isArray(data) && data.length > 0 && 'inputs' in data[0] && 'label' in data[0]) {
            return data as DataPoint[];
        }
        return null;

    } catch (error) {
        console.error("Error generating dataset with AI:", error);
        return null;
    }
}