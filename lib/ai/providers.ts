import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { openrouter } from '@openrouter/ai-sdk-provider';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': openrouter('anthropic/claude-sonnet-4'),
        'chat-model-reasoning': wrapLanguageModel({
          model: openrouter('anthropic/claude-sonnet-4'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': openrouter('anthropic/claude-sonnet-4'),
        'artifact-model': openrouter('anthropic/claude-sonnet-4'),
      },
      // Note: OpenRouter doesn't support image models in the same way as xAI
      // Image generation functionality will need to be handled separately
    });
