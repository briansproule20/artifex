'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputSubmit,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  PromptInputAttachments,
  PromptInputAttachment,
  type PromptInputMessage,
  usePromptInputAttachments,
} from '@/components/ai-elements/prompt-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, User } from 'lucide-react';
import { criticPersonalities, type CriticPersonality } from '@/lib/critic-personalities';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

export function CritiqueChat() {
  const [critic, setCritic] = useState<CriticPersonality>('gallerist');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLFormElement>(null);

  const criticConfig = criticPersonalities[critic];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const clearForm = useCallback(() => {
    promptInputRef.current?.reset();
    const actions = window.__promptInputActions;
    if (actions) {
      actions.clear();
    }
  }, []);

  function FileInputManager() {
    const attachments = usePromptInputAttachments();

    useEffect(() => {
      window.__promptInputActions = {
        addFiles: attachments.add,
        clear: attachments.clear,
      };

      return () => {
        delete window.__promptInputActions;
      };
    }, [attachments]);

    return null;
  }

  const handleSubmit = async (message: PromptInputMessage) => {
    const userText = message.text?.trim();
    if (!userText) return;

    // Get image if attached
    let imageDataUrl: string | undefined;
    if (message.files && message.files.length > 0) {
      const imageFile = message.files[0];
      if (imageFile.mediaType?.startsWith('image/')) {
        try {
          const response = await fetch(imageFile.url);
          const blob = await response.blob();
          const reader = new FileReader();
          imageDataUrl = await new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error('Error processing image:', error);
        }
      }
    }

    // Add user message
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userText,
      imageUrl: imageDataUrl,
    };

    setMessages(prev => [...prev, userMessage]);
    clearForm();
    setIsLoading(true);

    // Create placeholder for assistant response
    const assistantId = `msg_${Date.now()}_assistant`;
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
    }]);

    try {
      console.log('🔵 STARTING API CALL');
      // Call streaming API
      const response = await fetch('/api/critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
            imageUrl: m.imageUrl,
          })),
          critic,
        }),
      });
      console.log('🟢 GOT RESPONSE:', response.status, response.ok);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Handle streaming response - Server-Sent Events format
      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        // Decode the chunk and add to accumulated text
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        console.log('TEXT CHUNK:', chunk);

        // Update UI with accumulated text
        setIsLoading(false);
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantId
              ? { ...msg, content: accumulatedText }
              : msg
          )
        );
      }

      console.log('FINAL ACCUMULATED TEXT:', accumulatedText);
    } catch (error) {
      console.error('Error getting critique:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantId
            ? { ...msg, content: 'Sorry, I encountered an error. Please try again.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#22223B]">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#22223B]">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
              <div className={cn('w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center text-4xl', criticConfig.color)}>
                {criticConfig.avatar}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#F2E9E4] mb-2">
                  Chat with {criticConfig.name}
                </h3>
                <p className="text-[#9A8C98] max-w-md px-4">
                  Share your artwork, discuss artistic movements, or ask for creative guidance.
                  You can upload images for detailed critique.
                </p>
              </div>
            </div>
          )}

          {messages.map(message => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className={cn('bg-gradient-to-br text-white', criticConfig.color)}>
                    {criticConfig.avatar}
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={cn(
                  'max-w-[85%] sm:max-w-[75%] rounded-lg p-3 sm:p-4 space-y-2',
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-[#C9ADA7] to-[#9A8C98] text-[#22223B]'
                    : 'bg-[#2a2a45] border border-[#4A4E69] text-[#F2E9E4]'
                )}
              >
                {message.imageUrl && (
                  <img
                    src={message.imageUrl}
                    alt="Uploaded artwork"
                    className="rounded-lg max-w-full h-auto mb-2"
                  />
                )}
                {message.role === 'assistant' && !message.content && isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#C9ADA7]" />
                    <span className="text-sm text-[#9A8C98]">Thinking...</span>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none prose-invert prose-headings:text-[#F2E9E4] prose-p:text-[#F2E9E4] prose-strong:text-[#C9ADA7] prose-em:text-[#9A8C98] prose-ul:text-[#F2E9E4] prose-ol:text-[#F2E9E4] prose-li:text-[#F2E9E4] prose-code:text-[#C9ADA7] prose-code:bg-[#1a1a2e] prose-pre:bg-[#1a1a2e] prose-blockquote:text-[#9A8C98] prose-blockquote:border-[#4A4E69] prose-a:text-[#C9ADA7] prose-a:underline hover:prose-a:text-[#F2E9E4] prose-img:rounded-lg prose-img:border prose-img:border-[#4A4E69]">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        img: ({ node, ...props }) => (
                          <img
                            {...props}
                            className="rounded-lg border border-[#4A4E69] max-w-full h-auto my-2"
                            loading="lazy"
                          />
                        ),
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            className="text-[#C9ADA7] underline hover:text-[#F2E9E4] transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        )
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-[#4A4E69] text-[#F2E9E4]">
                    <User size={16} />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 sm:p-6 border-t border-[#4A4E69] bg-[#1a1a2e]/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <PromptInput
            ref={promptInputRef}
            onSubmit={handleSubmit}
            globalDrop
            accept="image/*"
            className="bg-[#2a2a45] border-[#4A4E69]"
          >
            <FileInputManager />
            <PromptInputBody className="bg-[#2a2a45]">
              <PromptInputAttachments>
                {attachment => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments>
              <PromptInputTextarea
                placeholder={`Ask ${criticConfig.name} about art, upload your work for critique, or discuss creative ideas...`}
                disabled={isLoading}
                className="bg-[#2a2a45] text-[#F2E9E4] placeholder:text-[#9A8C98] border-[#4A4E69] min-h-[60px]"
              />
            </PromptInputBody>
            <PromptInputToolbar className="bg-[#2a2a45] border-[#4A4E69]">
              <PromptInputTools className="flex items-center gap-2">
                {/* Critic Selector */}
                <Select value={critic} onValueChange={(value) => setCritic(value as CriticPersonality)}>
                  <SelectTrigger className="w-auto min-w-[100px] h-8 border-[#4A4E69] bg-[#1a1a2e] text-[#F2E9E4] text-xs">
                    <div className="flex items-center gap-1.5">
                      <span>{criticConfig.avatar}</span>
                      <span className="truncate max-w-[80px] sm:max-w-none">{criticConfig.name}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#2a2a45] border-[#4A4E69]">
                    {Object.entries(criticPersonalities).map(([key, config]) => (
                      <SelectItem key={key} value={key} className="text-[#F2E9E4] hover:bg-[#4A4E69] text-sm">
                        <div className="flex items-center gap-2">
                          <span>{config.avatar}</span>
                          <span>{config.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex-1" />

                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger disabled={isLoading} className="text-[#C9ADA7] hover:text-[#F2E9E4]" />
                  <PromptInputActionMenuContent className="bg-[#2a2a45] border-[#4A4E69]">
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
              </PromptInputTools>
              <PromptInputSubmit disabled={isLoading} className="bg-[#C9ADA7] text-[#22223B] hover:bg-[#9A8C98]" />
            </PromptInputToolbar>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
