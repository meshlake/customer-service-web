declare namespace Conversation_API {
  type Message = {
    id: string;
    role: string;
    content: string;
    createdAt: number;
    updatedAt: number;
  };

  type Conversation = {
    id: string;
    topic: string;
    messages: Message[];
  };

  type ConversationCteate = {
    userId: string;
    topic: string;
  };

  type MessageCreate = Omit<Message, 'id' | 'createdAt' | 'updatedAt'> & {conversationId: string};
}
