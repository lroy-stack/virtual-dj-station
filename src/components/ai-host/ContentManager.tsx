
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Clock,
  Play,
  Edit,
  Save
} from 'lucide-react';
import { ContentItem, AIHostState } from '@/types/aihost';

interface ContentManagerProps {
  contentQueue: ContentItem[];
  onUpdateQueue: (queue: ContentItem[]) => void;
  hostState: AIHostState;
}

const ContentManager: React.FC<ContentManagerProps> = ({
  contentQueue,
  onUpdateQueue,
  hostState
}) => {
  const [newContent, setNewContent] = useState({
    type: 'announcement',
    content: '',
    duration: 5000
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const contentTypes = [
    { value: 'announcement', label: 'Anuncio General' },
    { value: 'song_intro', label: 'Presentación de Canción' },
    { value: 'weather', label: 'Estado del Tiempo' },
    { value: 'time', label: 'Hora Actual' },
    { value: 'custom', label: 'Contenido Personalizado' }
  ];

  const addContent = () => {
    if (!newContent.content.trim()) return;

    const content: ContentItem = {
      id: `custom-${Date.now()}`,
      type: newContent.type as any,
      content: newContent.content,
      duration: newContent.duration,
      priority: 'medium'
    };

    onUpdateQueue([...contentQueue, content]);
    setNewContent({ type: 'announcement', content: '', duration: 5000 });
    setShowAddForm(false);
  };

  const removeContent = (id: string) => {
    onUpdateQueue(contentQueue.filter(item => item.id !== id));
  };

  const moveContent = (id: string, direction: 'up' | 'down') => {
    const index = contentQueue.findIndex(item => item.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === contentQueue.length - 1)
    ) return;

    const newQueue = [...contentQueue];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newQueue[index], newQueue[newIndex]] = [newQueue[newIndex], newQueue[index]];
    onUpdateQueue(newQueue);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'song_intro': return '🎵';
      case 'advertisement': return '📢';
      case 'weather': return '🌤️';
      case 'time': return '🕐';
      default: return '💬';
    }
  };

  return (
    <Card className="glass-effect border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>Gestión de Contenido</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add Content Form */}
        {showAddForm && (
          <div className="space-y-3 p-3 border border-border/50 rounded-lg bg-accent/20">
            <div className="space-y-2">
              <Label className="text-sm">Tipo de Contenido</Label>
              <select
                value={newContent.type}
                onChange={(e) => setNewContent(prev => ({ ...prev, type: e.target.value }))}
                className="w-full p-2 bg-background border border-border rounded-md text-sm"
              >
                {contentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Contenido</Label>
              <Textarea
                value={newContent.content}
                onChange={(e) => setNewContent(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Escribe el contenido que el locutor dirá..."
                className="bg-background/50"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Duración (segundos)</Label>
              <Input
                type="number"
                value={newContent.duration / 1000}
                onChange={(e) => setNewContent(prev => ({ 
                  ...prev, 
                  duration: parseInt(e.target.value) * 1000 
                }))}
                min={1}
                max={60}
                className="bg-background/50"
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={addContent} size="sm" className="radio-gradient">
                <Save className="w-4 h-4 mr-1" />
                Agregar
              </Button>
              <Button 
                onClick={() => setShowAddForm(false)} 
                variant="outline" 
                size="sm"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Content Queue */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">
              Cola de Contenido ({contentQueue.length})
            </h4>
            {hostState.isSpeaking && (
              <Badge variant="outline" className="text-xs animate-pulse">
                Reproduciendo
              </Badge>
            )}
          </div>

          {contentQueue.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-4">
              No hay contenido en cola
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
              {contentQueue.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-3 border border-border/50 rounded-lg bg-background/50 ${
                    index === 0 && hostState.isSpeaking ? 'border-primary bg-primary/10' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{getTypeIcon(item.type)}</span>
                        <Badge 
                          variant={getPriorityColor(item.priority)}
                          className="text-xs"
                        >
                          {item.priority}
                        </Badge>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          {Math.ceil(item.duration / 1000)}s
                        </div>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">
                        {item.content}
                      </p>
                    </div>

                    <div className="flex flex-col space-y-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveContent(item.id, 'up')}
                        disabled={index === 0}
                        className="w-6 h-6 p-0"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveContent(item.id, 'down')}
                        disabled={index === contentQueue.length - 1}
                        className="w-6 h-6 p-0"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContent(item.id)}
                        className="w-6 h-6 p-0 hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Acciones Rápidas</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const timeContent: ContentItem = {
                  id: `time-${Date.now()}`,
                  type: 'time',
                  content: `Son las ${new Date().toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} en Radio IA.`,
                  duration: 3000,
                  priority: 'low'
                };
                onUpdateQueue([...contentQueue, timeContent]);
              }}
              className="text-xs"
            >
              🕐 Anunciar Hora
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const weatherContent: ContentItem = {
                  id: `weather-${Date.now()}`,
                  type: 'weather',
                  content: 'El clima perfecto para disfrutar de buena música en Radio IA.',
                  duration: 4000,
                  priority: 'low'
                };
                onUpdateQueue([...contentQueue, weatherContent]);
              }}
              className="text-xs"
            >
              🌤️ Estado del Tiempo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentManager;
