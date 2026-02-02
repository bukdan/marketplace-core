import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MessageCircle, Send, Loader2, ArrowLeft, Package } from 'lucide-react';

interface Conversation {
  id: string;
  listing_id: string | null;
  buyer_id: string;
  seller_id: string;
  last_message_at: string | null;
  listing?: {
    title: string;
    listing_images: { image_url: string }[];
  };
  other_user?: {
    name: string | null;
    avatar_url: string | null;
  };
  last_message?: string;
  unread_count?: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function Messages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationId = searchParams.get('conversation');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchConversations();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) {
        setSelectedConversation(conv);
        fetchMessages(conversationId);
      }
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`messages:${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  const fetchConversations = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('conversations')
      .select(`
        *,
        listing:listings(title, listing_images(image_url))
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false });

    if (data) {
      // Fetch other user profiles
      const enriched = await Promise.all(data.map(async (conv) => {
        const otherUserId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id;
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, avatar_url')
          .eq('user_id', otherUserId)
          .single();

        // Get last message
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return {
          ...conv,
          other_user: profile,
          last_message: lastMsg?.content,
        };
      }));

      setConversations(enriched);
    }
    setLoading(false);
  };

  const fetchMessages = async (convId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', convId)
        .neq('sender_id', user?.id);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        content: newMessage.trim(),
      });

      if (error) throw error;

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-4 h-[calc(100vh-80px)]">
        <div className="flex h-full border rounded-lg overflow-hidden bg-background">
          {/* Conversations List */}
          <div className={`w-full md:w-80 border-r flex flex-col ${selectedConversation ? 'hidden md:flex' : ''}`}>
            <div className="p-4 border-b">
              <h2 className="font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Pesan
              </h2>
            </div>
            
            <ScrollArea className="flex-1">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Belum ada percakapan</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setSelectedConversation(conv);
                      fetchMessages(conv.id);
                      navigate(`/messages?conversation=${conv.id}`);
                    }}
                    className={`w-full p-4 flex gap-3 hover:bg-muted transition-colors text-left ${
                      selectedConversation?.id === conv.id ? 'bg-muted' : ''
                    }`}
                  >
                    <Avatar>
                      <AvatarImage src={conv.other_user?.avatar_url || undefined} />
                      <AvatarFallback>
                        {conv.other_user?.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-medium truncate">
                          {conv.other_user?.name || 'User'}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {conv.last_message_at && new Date(conv.last_message_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.last_message || 'Belum ada pesan'}
                      </p>
                      {conv.listing && (
                        <p className="text-xs text-primary truncate mt-1">
                          📦 {conv.listing.title}
                        </p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : ''}`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="md:hidden"
                    onClick={() => {
                      setSelectedConversation(null);
                      navigate('/messages');
                    }}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Avatar>
                    <AvatarImage src={selectedConversation.other_user?.avatar_url || undefined} />
                    <AvatarFallback>
                      {selectedConversation.other_user?.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{selectedConversation.other_user?.name || 'User'}</p>
                    {selectedConversation.listing && (
                      <p className="text-sm text-muted-foreground truncate">
                        {selectedConversation.listing.title}
                      </p>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isOwn = msg.sender_id === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                              isOwn
                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                : 'bg-muted rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                              {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Ketik pesan..."
                      disabled={sending}
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg">Pilih Percakapan</h3>
                <p className="text-muted-foreground">
                  Pilih percakapan dari daftar untuk mulai chat
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
