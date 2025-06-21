
import { createDocumentHandler } from '@/lib/artifacts/server';

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',
  onCreateDocument: async ({ title, dataStream }) => {
    // TODO: Implement image generation with OpenRouter or alternative provider
    // For now, return a placeholder message
    const placeholderMessage = `Image generation temporarily unavailable. Requested: "${title}"`;

    dataStream.writeData({
      type: 'image-delta',
      content: btoa(placeholderMessage), // Base64 encode the placeholder
    });

    return btoa(placeholderMessage);
  },
  onUpdateDocument: async ({ description, dataStream }) => {
    // TODO: Implement image generation with OpenRouter or alternative provider
    // For now, return a placeholder message
    const placeholderMessage = `Image generation temporarily unavailable. Requested: "${description}"`;

    dataStream.writeData({
      type: 'image-delta',
      content: btoa(placeholderMessage), // Base64 encode the placeholder
    });

    return btoa(placeholderMessage);
  },
});
