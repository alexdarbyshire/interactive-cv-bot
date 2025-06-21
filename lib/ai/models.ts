export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Claude Sonnet 4',
    description:
      'Advanced Claude model for all-purpose chat with vision capabilities',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Claude Sonnet 4 (Reasoning)',
    description:
      'Claude model with advanced reasoning and thinking capabilities',
  },
];
