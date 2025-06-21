import { generateUUID } from '@/lib/utils';
import { tool, type DataStreamWriter, type UIMessage } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';
import {
  extractResumeDataFromConversation,
  enhanceResumeData,
} from '@/lib/resume/extractor';

interface GenerateResumeProps {
  session: Session;
  dataStream: DataStreamWriter;
  messages: UIMessage[];
  selectedChatModel: string;
}

export const generateResume = ({
  session,
  dataStream,
  messages,
  selectedChatModel,
}: GenerateResumeProps) =>
  tool({
    description:
      'Generate a professional PDF resume based on the conversation history. This tool extracts personal information, work experience, education, skills, and other relevant details from the chat to create a structured resume.',
    parameters: z.object({
      title: z.string().describe('Title for the resume document'),
      includeProjects: z
        .boolean()
        .optional()
        .describe('Whether to include projects section'),
      includeCertifications: z
        .boolean()
        .optional()
        .describe('Whether to include certifications section'),
    }),
    execute: async ({
      title,
      includeProjects = true,
      includeCertifications = true,
    }) => {
      const id = generateUUID();

      try {
        dataStream.writeData({
          type: 'kind',
          content: 'resume',
        });

        dataStream.writeData({
          type: 'id',
          content: id,
        });

        dataStream.writeData({
          type: 'title',
          content: title,
        });

        dataStream.writeData({
          type: 'clear',
          content: '',
        });

        dataStream.writeData({
          type: 'text',
          content: 'Analyzing conversation to extract resume information...',
        });

        // Get system context from prompts
        const { regularPrompt } = await import('@/lib/ai/prompts');

        // Extract resume data from conversation
        const extractionResult = await extractResumeDataFromConversation({
          messages,
          selectedChatModel,
          systemContext: regularPrompt,
        });

        if (!extractionResult.success || !extractionResult.data) {
          throw new Error(
            extractionResult.error ||
              'Failed to extract resume data from conversation',
          );
        }

        dataStream.writeData({
          type: 'text',
          content: 'Enhancing and formatting resume data...',
        });

        // Enhance the extracted data
        let enhancedData = enhanceResumeData(extractionResult.data);

        // Filter sections based on parameters
        if (!includeProjects) {
          enhancedData = { ...enhancedData, projects: [] };
        }
        if (!includeCertifications) {
          enhancedData = { ...enhancedData, certifications: [] };
        }

        // Convert to JSON string for the artifact content
        const resumeContent = JSON.stringify(enhancedData, null, 2);

        dataStream.writeData({
          type: 'text-delta',
          content: resumeContent,
        });

        dataStream.writeData({
          type: 'text',
          content:
            'Resume generated successfully! You can now preview and download your PDF resume.',
        });

        dataStream.writeData({
          type: 'finish',
          content: '',
        });

        // Save the resume document
        if (session?.user?.id) {
          try {
            const { saveDocument } = await import('@/lib/db/queries');
            await saveDocument({
              id,
              title,
              content: resumeContent,
              kind: 'resume' as any, // Type assertion for now
              userId: session.user.id,
            });
          } catch (dbError) {
            console.warn('Failed to save resume to database:', dbError);
            // Continue without saving to database
          }
        }

        return {
          id,
          title,
          kind: 'resume' as const,
          content: `Resume "${title}" has been generated successfully. The resume includes:
- Personal information: ${enhancedData.personalInfo.name || 'Not provided'}
- Professional summary: ${enhancedData.summary ? 'Included' : 'Not provided'}
- Work experience: ${enhancedData.experience.length} position${enhancedData.experience.length !== 1 ? 's' : ''}
- Education: ${enhancedData.education.length} degree${enhancedData.education.length !== 1 ? 's' : ''}
- Skills: ${enhancedData.skills.length} categor${enhancedData.skills.length !== 1 ? 'ies' : 'y'}
${includeProjects && enhancedData.projects ? `- Projects: ${enhancedData.projects.length} project${enhancedData.projects.length !== 1 ? 's' : ''}` : ''}
${includeCertifications && enhancedData.certifications ? `- Certifications: ${enhancedData.certifications.length} certification${enhancedData.certifications.length !== 1 ? 's' : ''}` : ''}

You can now preview the resume and download it as a PDF.`,
        };
      } catch (error) {
        console.error('Error generating resume:', error);

        dataStream.writeData({
          type: 'text',
          content: `Error generating resume: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        });

        dataStream.writeData({
          type: 'finish',
          content: '',
        });

        // Return error information
        return {
          id,
          title,
          kind: 'resume' as const,
          content: `Failed to generate resume: ${error instanceof Error ? error.message : 'Unknown error occurred'}. Please try again or provide more information about your background, experience, and skills in the conversation.`,
        };
      }
    },
  });
