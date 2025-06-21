import { generateText } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import type { UIMessage } from 'ai';
import type { ResumeData } from './schema';
import { validateResumeData, mergeWithDefaults } from './schema';

interface ExtractResumeDataProps {
  messages: UIMessage[];
  selectedChatModel: string;
  systemContext?: string;
}

const EXTRACTION_PROMPT = `
You are a resume data extraction specialist. Analyze the conversation history and any provided system context to extract structured resume information.

You will be provided with:
1. **System Context**: Background information about the person (if available)
2. **Conversation History**: User interactions and discussions

Extract the following information, prioritizing conversation-specific details while using system context as baseline information:

1. **Personal Information**:
   - Full name
   - Email address
   - Phone number
   - Location (city, state/country)
   - LinkedIn profile URL
   - Personal website URL

2. **Professional Summary**:
   - A concise 2-3 sentence professional summary based on the person's background and goals

3. **Work Experience**:
   - Job title
   - Company name
   - Location
   - Start and end dates (format as "Month Year" or "Present")
   - Key responsibilities and achievements (as bullet points)

4. **Education**:
   - Degree type and field of study
   - Institution name
   - Location
   - Graduation date
   - GPA (if mentioned)

5. **Skills**:
   - Group skills into categories (e.g., "Technical Skills", "Programming Languages", "Tools", "Soft Skills")
   - List specific skills under each category

6. **Projects** (if mentioned):
   - Project name
   - Description
   - Technologies used
   - URL (if available)

7. **Certifications** (if mentioned):
   - Certification name
   - Issuing organization
   - Date obtained

**Important Guidelines**:
- **Prioritize conversation content**: Use specific details mentioned in the conversation over general system context
- **Use system context as baseline**: When conversation lacks specific details, use information from system context
- **Merge intelligently**: Combine conversation-specific details with system context background information
- Use "Present" for current positions
- If dates are vague, make reasonable estimates (e.g., "about 2 years ago" → calculate approximate date)
- Group similar skills together logically
- Write achievement-focused bullet points for experience
- If information is missing from both sources, omit those fields rather than making assumptions
- **Conversation overrides system**: If conversation provides conflicting information, prioritize the conversation

Return the data as a valid JSON object matching this exact structure:

\`\`\`json
{
  "personalInfo": {
    "name": "string",
    "email": "string",
    "phone": "string (optional)",
    "location": "string (optional)",
    "linkedin": "string (optional)",
    "website": "string (optional)"
  },
  "summary": "string",
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string (optional)",
      "startDate": "string",
      "endDate": "string (optional, use 'Present' for current)",
      "description": ["string", "string", ...]
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "location": "string (optional)",
      "graduationDate": "string (optional)",
      "gpa": "string (optional)"
    }
  ],
  "skills": [
    {
      "category": "string",
      "items": ["string", "string", ...]
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string", "string", ...] (optional),
      "url": "string (optional)"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string (optional)"
    }
  ]
}
\`\`\`

Respond with ONLY the JSON object, no additional text or formatting.
`;

export async function extractResumeDataFromConversation({
  messages,
  selectedChatModel,
  systemContext,
}: ExtractResumeDataProps): Promise<{
  success: boolean;
  data?: ResumeData;
  error?: string;
}> {
  try {
    // Filter out system messages and format conversation for analysis
    const conversationText = messages
      .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
      .map((msg) => {
        const content =
          msg.parts
            ?.map((part) =>
              part.type === 'text' ? part.text : '[Non-text content]',
            )
            .join(' ') || '';
        return `${msg.role.toUpperCase()}: ${content}`;
      })
      .join('\n\n');

    if (!conversationText.trim()) {
      return {
        success: false,
        error: 'No conversation content found to extract resume data from',
      };
    }

    // Construct the full prompt with both system context and conversation
    let fullPrompt = EXTRACTION_PROMPT;

    if (systemContext?.trim()) {
      fullPrompt += `\n\n## System Context (Background Information):\n${systemContext}`;
    }

    fullPrompt += `\n\n## Conversation History:\n${conversationText}`;

    if (systemContext?.trim()) {
      fullPrompt += `\n\n**Instructions**: Use the system context as baseline information about the person, but prioritize any specific details mentioned in the conversation. If the conversation provides conflicting information, use the conversation details.`;
    }

    // Use AI to extract structured data
    const result = await generateText({
      model: myProvider.languageModel(selectedChatModel),
      prompt: fullPrompt,
      temperature: 0.1, // Low temperature for consistent extraction
    });

    // Parse the JSON response
    let extractedData: unknown;
    try {
      // Clean the response to extract just the JSON
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }
      extractedData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      return { success: false, error: 'Failed to parse extracted resume data' };
    }

    // Validate the extracted data
    const validation = validateResumeData(extractedData);
    if (!validation.success) {
      console.error('Resume data validation failed:', validation.errors);
      // Try to merge with defaults and validate again
      const mergedData = mergeWithDefaults(
        extractedData as Partial<ResumeData>,
      );
      const secondValidation = validateResumeData(mergedData);

      if (!secondValidation.success) {
        return {
          success: false,
          error: `Invalid resume data structure: ${validation.errors?.join(', ')}`,
        };
      }

      return { success: true, data: secondValidation.data };
    }

    return { success: true, data: validation.data };
  } catch (error) {
    console.error('Error extracting resume data:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error occurred during extraction',
    };
  }
}

// Helper function to enhance extracted data with additional processing
export function enhanceResumeData(data: ResumeData): ResumeData {
  // Ensure experience descriptions are properly formatted
  const enhancedExperience = data.experience.map((exp) => ({
    ...exp,
    description: exp.description.map((desc) =>
      desc.startsWith('•') || desc.startsWith('-') ? desc : `• ${desc}`,
    ),
  }));

  // Sort experience by start date (most recent first)
  const sortedExperience = enhancedExperience.sort((a, b) => {
    if (a.endDate === 'Present' && b.endDate !== 'Present') return -1;
    if (b.endDate === 'Present' && a.endDate !== 'Present') return 1;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  // Sort education by graduation date (most recent first)
  const sortedEducation = data.education.sort((a, b) => {
    if (!a.graduationDate) return 1;
    if (!b.graduationDate) return -1;
    return (
      new Date(b.graduationDate).getTime() -
      new Date(a.graduationDate).getTime()
    );
  });

  return {
    ...data,
    experience: sortedExperience,
    education: sortedEducation,
  };
}

// Helper function to generate a professional summary if one wasn't extracted
export async function generateProfessionalSummary(
  data: Partial<ResumeData>,
  selectedChatModel: string,
): Promise<string> {
  if (data.summary && data.summary.length > 10) {
    return data.summary;
  }

  const summaryPrompt = `
Based on the following resume information, write a concise 2-3 sentence professional summary:

Experience: ${data.experience?.map((exp) => `${exp.title} at ${exp.company}`).join(', ') || 'Not specified'}
Education: ${data.education?.map((edu) => `${edu.degree} from ${edu.institution}`).join(', ') || 'Not specified'}
Skills: ${data.skills?.map((skill) => skill.category).join(', ') || 'Not specified'}

Write a professional summary that highlights key strengths and career focus. Keep it concise and impactful.
`;

  try {
    const result = await generateText({
      model: myProvider.languageModel(selectedChatModel),
      prompt: summaryPrompt,
      temperature: 0.3,
    });

    return result.text.trim();
  } catch (error) {
    console.error('Error generating professional summary:', error);
    return 'Experienced professional with a strong background in their field and a passion for delivering high-quality results.';
  }
}
