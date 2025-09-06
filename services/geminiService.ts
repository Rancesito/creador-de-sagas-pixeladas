
import { GoogleGenAI, Type } from "@google/genai";
import type { Page, Story, Tone } from "../types";

/**
 * Obtiene una instancia del cliente de GoogleGenAI.
 * Lanza un error si la clave de la API no está configurada en las variables de entorno.
 * Esto asegura que la app no se bloquee al cargar, sino cuando se intente usar la API.
 * @returns Una instancia de GoogleGenAI.
 */
function getAiClient() {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    throw new Error("API key not valid. Asegúrate de que la variable de entorno API_KEY esté configurada correctamente en tu entorno de despliegue (ej. Vercel).");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
}

const storySchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "Un título creativo y evocador para la historia, en español."
    },
    coverImagePrompt: {
        type: Type.STRING,
        description: "Un aviso puramente visual para una imagen de portada de pixel art épica. No incluyas el título ni ningún otro texto en la descripción. Debe resumir el tono de la historia visualmente."
    },
    pages: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: {
            type: Type.STRING,
            description: "El texto de la historia para esta página, escrito en un estilo cautivador y en español.",
          },
          imagePrompt: {
            type: Type.STRING,
            description: "Un aviso puramente visual para una imagen de pixel art que capture la escena. No incluyas texto, letras ni descripciones de texto. Describe solo la acción, los personajes y el entorno con un estilo coherente de RPG de fantasía de 16 bits.",
          },
        },
        required: ["text", "imagePrompt"],
      },
    }
  },
  required: ["title", "coverImagePrompt", "pages"]
};

type StoryGenerationResponse = {
  title: string;
  coverImagePrompt: string;
  pages: Omit<Page, 'imageUrl'>[];
}


async function generateStory(idea: string, tone: Tone, numPages: number): Promise<StoryGenerationResponse> {
  const toneDescriptions: Record<Tone, string> = {
      'epic-medieval': 'una fantasía épica medieval con caballeros y dragones',
      'sweet-family': 'una historia familiar tierna y conmovedora',
      'sad': 'una historia triste, melancólica y conmovedora',
      'happy': 'una historia alegre y optimista',
      'dark': 'una historia oscura, misteriosa y de suspense'
  };

  const prompt = `
    Eres un maestro narrador y director de arte para juegos de rol retro de pixel-art.
    Basado en la siguiente idea, crea un cuento corto ilustrado con un tono de ${toneDescriptions[tone]}.
    La historia debe tener un título, una imagen de portada y dividirse en exactamente ${numPages} páginas. Todo debe estar completamente en español.
    Para cada página, proporciona el texto de la historia y un aviso de imagen (imagePrompt) puramente visual.

    **Instrucciones cruciales para 'imagePrompt':**
    1.  **Solo visual:** Los prompts deben describir ÚNICAMENTE elementos visuales (personajes, escenarios, acciones, colores, atmósfera).
    2.  **Sin texto:** Es vital que los prompts NO pidan incluir texto, letras, carteles o cualquier tipo de tipografía en la imagen.
    3.  **Consistencia:** Mantén un estilo artístico consistente en todos los prompts (ej: "El mismo caballero con armadura plateada...").

    Idea: "${idea}"

    Devuelve el resultado como un objeto JSON único.
    Ejemplo de un buen imagePrompt: "Un majestuoso castillo de pixel art bajo un cielo nocturno estrellado, un caballero solitario en el puente levadizo. Estilo RPG de fantasía de 16 bits, paleta de colores sombría."
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: storySchema,
      },
    });

    const storyData = JSON.parse(response.text) as StoryGenerationResponse;
    if (!storyData.title || !Array.isArray(storyData.pages) || storyData.pages.length === 0) {
        throw new Error("Formato de historia no válido recibido de la API.");
    }
    return storyData;

  } catch (error) {
    console.error("Error generando la historia:", error);
    throw error;
  }
}

async function generateImage(prompt: string): Promise<string> {
    const fullPrompt = `Ilustración de pixel art detallada de: "${prompt}". Estilo visual consistente con los JRPG de la era SNES (como Chrono Trigger o Secret of Mana), paleta de colores rica y cálida, fondos vibrantes. La composición debe ser cinematográfica. **Instrucción Absolutamente Crítica e Inviolable: LA IMAGEN FINAL NO DEBE CONTENER, BAJO NINGUNA CIRCUNSTANCIA, NINGÚN TIPO DE TEXTO, LETRAS, NÚMEROS, INTERFAZ DE USUARIO, LOGOTIPOS O SÍMBOLOS ESCRITOS. Debe ser una escena puramente visual y pictórica.**`;
    try {
        const ai = getAiClient();
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        throw new Error("No se generó ninguna imagen.");

    } catch (error) {
        console.error("Error generando la imagen:", error);
        throw error;
    }
}


export async function generateStoryAndImages(idea: string, tone: Tone, numPages: number): Promise<Story> {
    const storyData = await generateStory(idea, tone, numPages);

    const allPrompts = [storyData.coverImagePrompt, ...storyData.pages.map(p => p.imagePrompt)];

    const imageGenerationPromises = allPrompts.map(prompt => generateImage(prompt));

    const imageUrls = await Promise.all(imageGenerationPromises);

    const coverImageUrl = imageUrls[0];
    const pageImageUrls = imageUrls.slice(1);

    const finalStory: Story = {
        title: storyData.title,
        coverImageUrl: coverImageUrl,
        pages: storyData.pages.map((page, index) => ({
            ...page,
            imageUrl: pageImageUrls[index],
        })),
    };

    return finalStory;
}
