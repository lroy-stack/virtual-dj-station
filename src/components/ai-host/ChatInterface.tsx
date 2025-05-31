
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, Zap, Music, Heart } from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'host';
  timestamp: Date;
  type?: 'message' | 'suggestion' | 'system';
}

interface ChatInterfaceProps {
  isActive: boolean;
  isThinking: boolean;
  onSendMessage: (message: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  isActive,
  isThinking,
  onSendMessage
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: '¡Hola! Soy tu locutor IA. ¿En qué puedo ayudarte hoy?',
      sender: 'host',
      timestamp: new Date(),
      type: 'system'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickSuggestions = [
    { text: '¿Qué canción está sonando?', icon: Music },
    { text: '¿Puedes recomendar música similar?', icon: Heart },
    { text: '¿Quién es este artista?', icon: MessageCircle },
    { text: '¡Me encanta esta canción!', icon: Zap }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !isActive) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    onSendMessage(inputValue);
    setInputValue('');
    setShowSuggestions(false);

    // Simulate host response
    setTimeout(() => {
      const hostResponse: ChatMessage = {
        id: `host-${Date.now()}`,
        content: generateHostResponse(inputValue),
        sender: 'host',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, hostResponse]);
    }, 2000);
  };

  const generateHostResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('canción') || message.includes('música')) {
      return 'Esta es una increíble canción de un artista independiente talentoso. ¿Te gustaría que busque más música similar?';
    }
    if (message.includes('artista')) {
      return 'Los artistas independientes son el corazón de Radio IA. Cada uno tiene una historia única que contar a través de su música.';
    }
    if (message.includes('encanta') || message.includes('gusta')) {
      return '¡Me alegra que te guste! La música tiene el poder de conectarnos de maneras increíbles.';
    }
    
    const responses = [
      'Interesante pregunta. Como locutor IA, estoy aquí para hacer tu experiencia musical más rica.',
      'Me encanta interactuar contigo. ¿Hay algo específico sobre la música que te gustaría saber?',
      'Gracias por participar en la conversación. Tu feedback ayuda a mejorar la experiencia de Radio IA.',
      'Es genial tenerte aquí. ¿Qué tipo de música te emociona más?'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Card className="glass-effect border-border/50 h-80 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center space-x-2">
          <MessageCircle className="w-4 h-4" />
          <span>Chat con el Locutor</span>
          {!isActive && (
            <Badge variant="secondary" className="text-xs">Inactivo</Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 space-y-3 scrollbar-hide">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : message.type === 'system'
                    ? 'bg-accent/50 text-accent-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm">Escribiendo...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {showSuggestions && isActive && (
          <div className="px-4 py-2 border-t border-border/50">
            <div className="grid grid-cols-2 gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="text-xs h-auto p-2 flex items-center space-x-1 justify-start"
                >
                  <suggestion.icon className="w-3 h-3" />
                  <span className="truncate">{suggestion.text}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-border/50">
          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isActive ? "Escribe tu mensaje..." : "Activa el locutor para chatear"}
              disabled={!isActive}
              className="flex-1 bg-background/50"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || !isActive}
              size="sm"
              className="radio-gradient"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
