import { insforgeAdmin } from '@/lib/insforge/server';

export class MessageRepository {
  static async getConversationsForUser(userId: string) {
    const { data, error } = await insforgeAdmin.database
      .from('conversations')
      .select('*, participantA:users!participant_a_id(id, name, avatar_url, is_verified), participantB:users!participant_b_id(id, name, avatar_url, is_verified), messages(id, text, sender_id, is_read, created_at)')
      .or(`participant_a_id.eq.${userId},participant_b_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error in getConversationsForUser:', error);
      return [];
    }

    return data || [];
  }

  static async getMessagesByConversationId(conversationId: string) {
    const { data, error } = await insforgeAdmin.database
      .from('messages')
      .select('*, sender:users(id, name, avatar_url)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error in getMessagesByConversationId:', error);
      return [];
    }

    return data || [];
  }

  static async sendMessage(conversationId: string, senderId: string, text: string) {
    const { data: message, error: msgError } = await insforgeAdmin.database
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        sender_id: senderId,
        text,
      }])
      .select()
      .single();

    if (msgError) {
      console.error('Error in sendMessage message insert:', msgError);
    }

    await insforgeAdmin.database
      .from('conversations')
      .update({
        last_message_text: text,
        last_message_time: new Date().toISOString(),
      })
      .eq('id', conversationId);

    return message;
  }
}
