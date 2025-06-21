import { generateText } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import {
  extractResumeDataFromConversation,
  enhanceResumeData,
} from '@/lib/resume/extractor';
import { getMessagesByChatId } from '@/lib/db/queries';

export const resumeDocumentHandler = createDocumentHandler({
  kind: 'resume',
  onCreateDocument: async ({ id, title, dataStream, session }) => {
    try {
      dataStream.writeData({
        type: 'text',
        content: 'Analyzing conversation to extract resume information...',
      });

      // Get the chat ID from the session or context
      // For now, we'll need to pass this differently - this is a placeholder
      const chatId = 'current-chat-id'; // This will need to be passed from the tool

      // Get conversation messages
      const messages = await getMessagesByChatId({ id: chatId });

      if (!messages || messages.length === 0) {
        throw new Error(
          'No conversation history found to extract resume data from',
        );
      }

      dataStream.writeData({
        type: 'text',
        content: 'Extracting structured resume data...',
      });

      // Convert DB messages to UI messages format for extraction
      const uiMessages = messages.map((msg) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: '', // Required by UIMessage interface
        parts: msg.parts as any[], // Type assertion for now
        createdAt: msg.createdAt,
      }));

      // Get system context from prompts
      const { regularPrompt } = await import('@/lib/ai/prompts');

      // Extract resume data from conversation
      const extractionResult = await extractResumeDataFromConversation({
        messages: uiMessages,
        selectedChatModel: 'gpt-4o-mini', // Default model for extraction
        systemContext: regularPrompt,
      });

      if (!extractionResult.success || !extractionResult.data) {
        throw new Error(
          extractionResult.error || 'Failed to extract resume data',
        );
      }

      dataStream.writeData({
        type: 'text',
        content: 'Enhancing and formatting resume data...',
      });

      // Enhance the extracted data
      const enhancedData = enhanceResumeData(extractionResult.data);

      dataStream.writeData({
        type: 'text',
        content:
          'Resume generated successfully! You can now preview and download your PDF resume.',
      });

      // Return the resume data as JSON string for storage
      return JSON.stringify(enhancedData);
    } catch (error) {
      console.error('Error creating resume document:', error);

      dataStream.writeData({
        type: 'text',
        content: `Error generating resume: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });

      // Return a minimal resume structure as fallback
      const fallbackResume = {
        personalInfo: {
          name: 'Resume Generation Failed',
          email: '',
        },
        summary:
          'There was an error generating your resume. Please try again or provide more information in the conversation.',
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
      };

      return JSON.stringify(fallbackResume);
    }
  },

  onUpdateDocument: async ({ document, description, dataStream, session }) => {
    try {
      dataStream.writeData({
        type: 'text',
        content: 'Updating resume based on your feedback...',
      });

      // Parse existing resume data
      let currentData: any;
      try {
        currentData = JSON.parse(document.content || '{}');
      } catch {
        throw new Error('Invalid resume data format');
      }

      // Use AI to update the resume based on the description
      const updatePrompt = `
You are a resume editing assistant. Update the following resume data based on the user's request.

Current Resume Data:
${JSON.stringify(currentData, null, 2)}

User's Update Request:
${description}

Please return the updated resume data as a valid JSON object with the same structure. Only modify the parts that the user requested to change.

Important: Maintain the exact same JSON structure and only update the relevant fields based on the user's request.
`;

      const result = await generateText({
        model: myProvider.languageModel('gpt-4o-mini'),
        prompt: updatePrompt,
        temperature: 0.1,
      });

      // Parse the updated data
      let updatedData: any;
      try {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON object found in AI response');
        }
        updatedData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('Failed to parse updated resume data:', parseError);
        throw new Error('Failed to parse updated resume data');
      }

      dataStream.writeData({
        type: 'text',
        content: 'Resume updated successfully!',
      });

      return JSON.stringify(updatedData);
    } catch (error) {
      console.error('Error updating resume document:', error);

      dataStream.writeData({
        type: 'text',
        content: `Error updating resume: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });

      // Return original content if update fails
      return document.content || '{}';
    }
  },
});
