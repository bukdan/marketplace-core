import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUnreadMessages = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    fetchUnreadCount();

    // Subscribe to new messages
    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          // Check if the message is for the current user and not from them
          if ((payload.new as { sender_id: string }).sender_id !== user.id) {
            checkIfMessageIsForUser(payload.new as { conversation_id: string });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        () => {
          // Re-fetch count when messages are marked as read
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const checkIfMessageIsForUser = async (message: { conversation_id: string }) => {
    if (!user) return;

    const { data: conversation } = await supabase
      .from('conversations')
      .select('buyer_id, seller_id')
      .eq('id', message.conversation_id)
      .single();

    if (conversation && (conversation.buyer_id === user.id || conversation.seller_id === user.id)) {
      setUnreadCount((prev) => prev + 1);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user) return;

    // Get all conversations for the user
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

    if (!conversations || conversations.length === 0) {
      setUnreadCount(0);
      return;
    }

    const conversationIds = conversations.map((c) => c.id);

    // Count unread messages not sent by the user
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .eq('is_read', false)
      .neq('sender_id', user.id);

    setUnreadCount(count || 0);
  };

  return { unreadCount, refetchUnread: fetchUnreadCount };
};
