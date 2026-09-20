import { Conversation, Message } from '../types';

const CHAT_STORAGE_KEY = 'screenmate_conversations_v1';

export class ChatStore {
  private static conversations: Conversation[] = ChatStore.loadConversations();
  private static activeId: string = ChatStore.conversations[0]?.id || ChatStore.createNewConversation().id;
  private static listeners: Set<() => void> = new Set();

  public static getConversations(): Conversation[] {
    return [...ChatStore.conversations];
  }

  public static getActiveConversation(): Conversation {
    let conv = ChatStore.conversations.find((c) => c.id === ChatStore.activeId);
    if (!conv) {
      conv = ChatStore.createNewConversation();
    }
    return conv;
  }

  public static setActiveConversation(id: string): void {
    if (ChatStore.conversations.some((c) => c.id === id)) {
      ChatStore.activeId = id;
      ChatStore.notify();
    }
  }

  public static createNewConversation(initialTitle: string = 'New Session'): Conversation {
    const newConv: Conversation = {
      id: 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: initialTitle,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        {
          id: 'welcome_' + Date.now(),
          sender: 'assistant',
          content: 'Hello! I am **ScreenMate AI**, your visual copilot. Ask me anything about your visible screen, or press **Help** for instant guidance.',
          timestamp: Date.now(),
        },
      ],
    };

    ChatStore.conversations.unshift(newConv);
    ChatStore.activeId = newConv.id;
    ChatStore.save();
    ChatStore.notify();
    return newConv;
  }

  public static addMessage(conversationId: string, message: Omit<Message, 'id' | 'timestamp'>): Message {
    const conv = ChatStore.conversations.find((c) => c.id === conversationId);
    if (!conv) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const fullMessage: Message = {
      ...message,
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: Date.now(),
    };

    conv.messages.push(fullMessage);
    conv.updatedAt = Date.now();

    // Auto update title based on first user message if title is default
    if (conv.title === 'New Session' && message.sender === 'user') {
      conv.title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
    }

    ChatStore.save();
    ChatStore.notify();
    return fullMessage;
  }

  public static renameConversation(id: string, newTitle: string): void {
    const conv = ChatStore.conversations.find((c) => c.id === id);
    if (conv) {
      conv.title = newTitle;
      conv.updatedAt = Date.now();
      ChatStore.save();
      ChatStore.notify();
    }
  }

  public static deleteConversation(id: string): void {
    ChatStore.conversations = ChatStore.conversations.filter((c) => c.id !== id);
    if (ChatStore.conversations.length === 0) {
      ChatStore.createNewConversation();
    } else if (ChatStore.activeId === id) {
      ChatStore.activeId = ChatStore.conversations[0].id;
    }
    ChatStore.save();
    ChatStore.notify();
  }

  public static clearCurrentConversation(): void {
    const conv = ChatStore.getActiveConversation();
    conv.messages = [
      {
        id: 'cleared_' + Date.now(),
        sender: 'system',
        content: 'Conversation cleared.',
        timestamp: Date.now(),
      },
    ];
    conv.updatedAt = Date.now();
    ChatStore.save();
    ChatStore.notify();
  }

  public static clearAllData(): void {
    ChatStore.conversations = [];
    ChatStore.createNewConversation();
    ChatStore.save();
    ChatStore.notify();
  }

  public static subscribe(listener: () => void): () => void {
    ChatStore.listeners.add(listener);
    return () => {
      ChatStore.listeners.delete(listener);
    };
  }

  private static loadConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(CHAT_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load conversations', e);
    }
    return [];
  }

  private static save(): void {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(ChatStore.conversations));
    } catch (e) {
      console.warn('Failed to save conversations', e);
    }
  }

  private static notify(): void {
    ChatStore.listeners.forEach((l) => l());
  }
}
