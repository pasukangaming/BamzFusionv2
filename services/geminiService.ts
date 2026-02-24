import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AspectRatio } from "../types";

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const suggestLogoDescription = async (logoName: string, slogan: string = ''): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest a highly detailed and creative visual description for a logo design for a brand named "${logoName}" ${slogan ? `with slogan "${slogan}"` : ''}. Focus on symbols, metaphors, and artistic elements. Return ONLY the description.`,
  });
  return response.text || "A modern and clean logo design.";
};

export const generateCopywriting = async (
  productName: string,
  features: string,
  audience: string,
  tone: string,
  platform: string,
  imageFile?: File
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const parts: any[] = [];
  if (imageFile) {
    const base64 = await fileToBase64(imageFile);
    parts.push({
      inlineData: {
        mimeType: imageFile.type,
        data: base64,
      },
    });
  }
  
  parts.push({
    text: `Tulis copywriting ${platform} yang menarik dan memiliki konversi tinggi dalam Bahasa Indonesia yang natural untuk produk bernama "${productName}". 
    Fitur/Keunggulan: ${features}. 
    Target Audiens: ${audience}. 
    Nada Bicara (Tone): ${tone}. 
    
    Struktur tulisan harus mencakup:
    1. Headline (Judul) yang maut dan menarik perhatian.
    2. Body copy yang persuasif, menjelaskan solusi dan emosi.
    3. Call to Action (CTA) yang kuat dan jelas.
    4. Daftar Hashtag yang relevan.
    
    PENTING: Gunakan Bahasa Indonesia yang baik, santai namun profesional, dan hindari terjemahan kaku. Jika ada foto produk, gunakan detail visual dari foto tersebut untuk memperkuat deskripsi.`
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
  });

  return response.text || "Gagal menghasilkan copywriting.";
};

export const magicProductDetails = async (imageFile: File): Promise<{ name: string; features: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const base64 = await fileToBase64(imageFile);
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: imageFile.type,
            data: base64,
          },
        },
        { text: "Analisis gambar produk ini dan ekstrak nama produk serta fitur/manfaat utamanya dalam Bahasa Indonesia. Kembalikan hasil dalam format JSON." },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "Nama produk.",
          },
          features: {
            type: Type.STRING,
            description: "Ringkasan fitur dan manfaat produk.",
          },
        },
        required: ["name", "features"],
      },
    },
  });

  const text = response.text || '{"name": "", "features": ""}';
  try {
    return JSON.parse(text);
  } catch (e) {
    return { name: "Produk Tidak Dikenal", features: "Tidak ada fitur yang terdeteksi." };
  }
};

export const describeImage = async (imageFile: File): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const base64 = await fileToBase64(imageFile);
  
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: imageFile.type,
            data: base64,
          },
        },
        { text: "Describe this image in high detail for an AI image generator prompt. Focus on composition, lighting, style, and subject. Return ONLY the descriptive prompt text, no extra conversation." },
      ],
    },
  });

  return response.text || "Failed to generate description.";
};

export const enhancePromptGrok = async (userPrompt: string, images: File[] = []): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const parts: any[] = [];
  
  if (images.length > 0) {
    const base64s = await Promise.all(images.map(f => fileToBase64(f)));
    base64s.forEach((data, i) => {
      parts.push({
        inlineData: {
          mimeType: images[i].type,
          data: data,
        },
      });
    });
  }

  parts.push({ 
    text: `You are Grok Cinematic Intelligence. Your mission is to take the user's idea "${userPrompt}" and the provided images, and weave them into a ONE HIGH-DETAIL VISUAL PROMPT. 
    Analyze the characters, environment, and objects in the images. 
    Return ONLY the enhanced prompt.` 
  });

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: { 
      thinkingConfig: { thinkingBudget: 4000 },
      systemInstruction: "You are the Grok-3 AI Engine integrated with Google/Chrome ecosystem. You act as a world-class cinematographer and prompt engineer."
    }
  });

  return response.text || userPrompt;
};

export const transformImages = async (
  images: File[],
  prompt: string,
  aspectRatio: AspectRatio,
  keepFace: boolean = false
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const imageParts = await Promise.all(
    images.map(async (file) => {
      const base64 = await fileToBase64(file);
      return {
        inlineData: {
          mimeType: file.type,
          data: base64,
        },
      };
    })
  );

  const generateSingleVariation = async (i: number): Promise<string> => {
    let finalPrompt = "";
    if (keepFace) {
      finalPrompt = `[CORE INSTRUCTION: ABSOLUTE FACIAL FIDELITY]
      MANDATORY: Preserve the 100% exact facial identity and structural features of the individuals from the source images. 
      ZERO-TOLERANCE for facial alteration: Do not change bone structure, eye shape, nose bridge, or mouth characteristics. 
      TEXTURE: Maintain natural skin grain. Remove any artificial 'beautify' or smoothing effects. The face must look real and authentic to the source.
      ${prompt} (Variation ${i + 1})`;
    } else {
      finalPrompt = `${prompt} (Variation ${i + 1})`;
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          ...imageParts,
          { text: finalPrompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Variation generation failed.");
  };

  return Promise.all([
    generateSingleVariation(0),
    generateSingleVariation(1),
    generateSingleVariation(2),
    generateSingleVariation(3)
  ]);
};

export const transformImagesPro = async (
  images: File[],
  prompt: string,
  aspectRatio: AspectRatio,
  imageSize: '1K' | '2K' | '4K' = '1K',
  keepFace: boolean = false
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const imageParts = await Promise.all(
    images.map(async (file) => {
      const base64 = await fileToBase64(file);
      return {
        inlineData: {
          mimeType: file.type,
          data: base64,
        },
      };
    })
  );

  const generateSingleVariation = async (i: number): Promise<string> => {
    let finalPrompt = "";
    if (keepFace) {
      finalPrompt = `[ULTRA-HIGH FIDELITY IDENTITY ANCHOR]
      CRITICAL: You are a professional master photographer. YOU MUST PRESERVE 100% of the biometric identity from the source images.
      NO-MORPHING POLICY: Each person in the output must uniquely and accurately represent ONE of the source images. Do not blend faces.
      REALISM: Maintain original skin tone, natural facial lines, unique moles, and eye geometry. The faces in the result must be indistinguishable from the source images in terms of identity.
      Only transform the hair, costume, and background environment.
      ${prompt} (Variation ${i + 1})`;
    } else {
      finalPrompt = `${prompt} (Variation ${i + 1})`;
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          ...imageParts,
          { text: finalPrompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: imageSize,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Variation generation failed.");
  };

  return Promise.all([
    generateSingleVariation(0),
    generateSingleVariation(1),
    generateSingleVariation(2),
    generateSingleVariation(3)
  ]);
};

export const generateImagesFromText = async (
  prompt: string,
  aspectRatio: AspectRatio = '1:1'
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const generateSingle = async (i: number) => {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `${prompt} (Variation ${i + 1})` }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Generation failed.");
  };

  return Promise.all([
    generateSingle(0),
    generateSingle(1),
    generateSingle(2),
    generateSingle(3)
  ]);
};

export const generateVideo = async (
  prompt: string,
  images: File[],
  resolution: '720p' | '1080p',
  aspectRatio: '16:9' | '9:16',
  model: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  const payload: any = {
    model,
    prompt,
    config: {
      numberOfVideos: 1,
      resolution,
      aspectRatio,
    },
  };

  if (images.length > 0) {
    if (model === 'veo-3.1-generate-preview') {
      payload.config.referenceImages = await Promise.all(
        images.slice(0, 3).map(async (file) => ({
          image: {
            imageBytes: await fileToBase64(file),
            mimeType: file.type,
          },
          referenceType: 'ASSET',
        }))
      );
    } else {
      payload.image = {
        imageBytes: await fileToBase64(images[0]),
        mimeType: images[0].type,
      };
      if (images.length > 1) {
        payload.config.lastFrame = {
          imageBytes: await fileToBase64(images[images.length - 1]),
          mimeType: images[images.length - 1].type,
        };
      }
    }
  }

  let operation = await ai.models.generateVideos(payload);

  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("Video generation failed - no video URI returned.");
  }

  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.statusText}`);
  }
  
  const videoBlob = await response.blob();
  return URL.createObjectURL(videoBlob);
};