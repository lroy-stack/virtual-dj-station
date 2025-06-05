
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minimize2, Maximize2, Settings, Mic, MicOff, MessageSquare, Volume2 } from 'lucide-react';
import HostAvatar from './HostAvatar';
import ChatInterface from './ChatInterface';
import VoiceController from './VoiceController';
import ContentManager from './ContentManager';
import { AIHostState, HostMode, ContentItem } from '@/types/aihost';
import { useRadioContext } from '@/contexts/RadioContext';

interface AIHostProps {
  mode?: HostMode;
  onModeChange?: (mode: HostMode) => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  currentTrack?: any;
  djState?: AIHostState;
  onToggleDJ?: () => void;
  onCustomAnnouncement?: (message: string) => void;
}

const AIHost: React.FC<AIHostProps> = ({
  mode = 'full',
  onModeChange,
  isMinimized = false,
  onToggleMinimize,
  currentTrack,
  djState,
  onToggleDJ,
  onCustomAnnouncement
}) => {
  const { state: radioState } = useRadioContext();
  const [showSettings, setShowSettings] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  // Use the synced DJ state if provided, otherwise use local state
  const [localHostState, setLocalHostState] = useState<AIHostState>({
    isActive: false,
    isSpeaking: false,
    isListening: false,
    isThinking: false,
    currentContent: null,
    mood: 'neutral',
    energy: 50
  });

  const hostState = djState || localHostState;

  const [contentQueue, setContentQueue] = useState<ContentItem[]>([]);

  const handleSendCustomMessage = () => {
    if (customMessage.trim() && onCustomAnnouncement) {
      onCustomAnnouncement(customMessage.trim());
      setCustomMessage('');
    }
  };

  const handleNewMessage = (message: string) => {
    if (onCustomAnnouncement) {
      onCustomAnnouncement(`Respuesta del locutor: ${message}`);
    }
  };

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
              onClick={onToggleDJ}
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
          {/* DJ Volume Control */}
          {hostState.isActive && (
            <div className="flex items-center space-x-1 mr-2">
              <Volume2 className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">DJ: {Math.round(radioState.djVolume * 100)}%</span>
            </div>
          )}
          
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

      {/* Sync Status Bar */}
      <div className="px-4 py-2 bg-accent/30 border-b border-border/30">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <span className="text-muted-foreground">
              Estado: {radioState.isPlaying ? '▶️ Reproduciendo' : '⏸️ Pausado'}
            </span>
            {radioState.currentTrack && (
              <span className="text-muted-foreground truncate max-w-48">
                🎵 {radioState.currentTrack.title} - {radioState.currentTrack.artist}
              </span>
            )}
            <span className="text-muted-foreground">
              📻 {radioState.queue.length} en cola
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {hostState.isActive && (
              <div className={`w-2 h-2 rounded-full ${hostState.isSpeaking ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
            )}
            <span className="text-muted-foreground">
              {hostState.isActive ? 'Sincronizado' : 'Desconectado'}
            </span>
          </div>
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
            onToggleActivity={onToggleDJ}
          />

          {/* Custom Message Input */}
          {hostState.isActive && onCustomAnnouncement && (
            <div className="p-3 bg-accent/30 rounded-lg space-y-2">
              <label className="text-sm font-medium">Anuncio personalizado:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Escribe un mensaje para que anuncie el DJ..."
                  className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-md"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendCustomMessage()}
                />
                <Button
                  size="sm"
                  onClick={handleSendCustomMessage}
                  disabled={!customMessage.trim()}
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
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

      {/* Current Content Display */}
      {hostState.currentContent && (
        <div className="px-4 pb-4">
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary">🎙️ En vivo ahora:</span>
              <span className="text-xs text-muted-foreground">{hostState.currentContent.type}</span>
            </div>
            <p className="text-sm">{hostState.currentContent.content}</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AIHost;
