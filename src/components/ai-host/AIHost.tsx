
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minimize2, Maximize2, Settings, Mic, MicOff } from 'lucide-react';
import HostAvatar from './HostAvatar';
import ChatInterface from './ChatInterface';
import VoiceController from './VoiceController';
import ContentManager from './ContentManager';
import { AIHostState, HostMode, ContentItem } from '@/types/aihost';

interface AIHostProps {
  mode?: HostMode;
  onModeChange?: (mode: HostMode) => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  currentTrack?: any;
}

const AIHost: React.FC<AIHostProps> = ({
  mode = 'full',
  onModeChange,
  isMinimized = false,
  onToggleMinimize,
  currentTrack
}) => {
  const [hostState, setHostState] = useState<AIHostState>({
    isActive: false,
    isSpeaking: false,
    isListening: false,
    isThinking: false,
    currentContent: null,
    mood: 'neutral',
    energy: 50
  });

  const [contentQueue, setContentQueue] = useState<ContentItem[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  // Simulate host activity based on music state
  useEffect(() => {
    if (currentTrack) {
      // Simulate song introduction
      const introContent: ContentItem = {
        id: `intro-${currentTrack.id}`,
        type: 'song_intro',
        content: `¡Excelente! Ahora suena "${currentTrack.title}" de ${currentTrack.artist}. ${getSongContext(currentTrack)}`,
        duration: 8000,
        priority: 'high'
      };
      
      setContentQueue(prev => [introContent, ...prev]);
    }
  }, [currentTrack]);

  const getSongContext = (track: any) => {
    const contexts = [
      'Una verdadera joya musical que no puedes perderte.',
      'Este artista independiente está revolucionando su género.',
      'Perfecta para este momento del día.',
      'Una canción que conecta directamente con el alma.',
      'El ritmo que necesitabas escuchar hoy.'
    ];
    return contexts[Math.floor(Math.random() * contexts.length)];
  };

  const toggleHostActivity = () => {
    setHostState(prev => ({
      ...prev,
      isActive: !prev.isActive,
      isListening: !prev.isActive
    }));
  };

  const handleNewMessage = (message: string) => {
    // Add user message to queue for host response
    const responseContent: ContentItem = {
      id: `response-${Date.now()}`,
      type: 'user_response',
      content: generateResponse(message),
      duration: 5000,
      priority: 'medium'
    };
    
    setContentQueue(prev => [...prev, responseContent]);
    setHostState(prev => ({ ...prev, isThinking: true }));
    
    // Simulate thinking time
    setTimeout(() => {
      setHostState(prev => ({ ...prev, isThinking: false, isSpeaking: true }));
    }, 1500);
  };

  const generateResponse = (message: string): string => {
    const responses = [
      '¡Qué gran pregunta! Me encanta interactuar con oyentes como tú.',
      'Interesante punto de vista. La música realmente conecta a las personas.',
      'Gracias por escribir. Es genial saber que estás disfrutando la transmisión.',
      'Me alegra que estés aquí en Radio IA. ¿Hay algún género que te gustaría escuchar?',
      'La música tiene el poder de transformar nuestro día, ¿no crees?'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const processContentQueue = () => {
    if (contentQueue.length > 0 && !hostState.isSpeaking) {
      const nextContent = contentQueue[0];
      setHostState(prev => ({
        ...prev,
        currentContent: nextContent,
        isSpeaking: true
      }));
      
      // Simulate speaking duration
      setTimeout(() => {
        setHostState(prev => ({
          ...prev,
          isSpeaking: false,
          currentContent: null
        }));
        setContentQueue(prev => prev.slice(1));
      }, nextContent.duration);
    }
  };

  useEffect(() => {
    const interval = setInterval(processContentQueue, 1000);
    return () => clearInterval(interval);
  }, [contentQueue, hostState.isSpeaking]);

  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-4 z-30">
        <Card className="glass-effect p-3 hover-lift cursor-pointer" onClick={onToggleMinimize}>
          <div className="flex items-center space-x-2">
            <HostAvatar
              state={hostState}
              size="sm"
              showWaves={hostState.isSpeaking}
            />
            <div className="text-sm">
              <div className="font-medium text-foreground">DJ IA</div>
              <div className="text-xs text-muted-foreground">
                {hostState.isSpeaking ? 'Hablando...' : hostState.isActive ? 'En vivo' : 'Inactivo'}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Card className="glass-effect border-border/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleHostActivity}
              className={`${hostState.isActive ? 'text-green-500' : 'text-muted-foreground'}`}
            >
              {hostState.isActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
            <div>
              <h3 className="font-semibold text-foreground">Locutor IA</h3>
              <p className="text-xs text-muted-foreground">
                {hostState.isSpeaking ? 'Presentando música' :
                 hostState.isThinking ? 'Pensando...' :
                 hostState.isActive ? 'En vivo' : 'Inactivo'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>
          {onToggleMinimize && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {/* Avatar & Voice Controller */}
        <div className="space-y-4">
          <HostAvatar
            state={hostState}
            size="lg"
            showWaves={hostState.isSpeaking}
            onAvatarClick={() => {/* Future: Change avatar */}}
          />
          
          <VoiceController
            isActive={hostState.isActive}
            isSpeaking={hostState.isSpeaking}
            currentContent={hostState.currentContent}
            onToggleActivity={toggleHostActivity}
          />
        </div>

        {/* Chat Interface */}
        <div className="space-y-4">
          <ChatInterface
            isActive={hostState.isActive}
            isThinking={hostState.isThinking}
            onSendMessage={handleNewMessage}
          />
          
          {showSettings && (
            <ContentManager
              contentQueue={contentQueue}
              onUpdateQueue={setContentQueue}
              hostState={hostState}
            />
          )}
        </div>
      </div>
    </Card>
  );
};

export default AIHost;
