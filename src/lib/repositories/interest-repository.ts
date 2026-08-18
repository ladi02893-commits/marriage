import { insforgeAdmin } from '@/lib/insforge/server';
import { InterestStatus } from '@/lib/types';

export class InterestRepository {
  static async sendInterest(senderId: string, senderProfileId: string, receiverId: string, receiverProfileId: string, message?: string) {
    const { data, error } = await insforgeAdmin.database
      .from('interest_requests')
      .insert([{
        sender_id: senderId,
        sender_profile_id: senderProfileId,
        receiver_id: receiverId,
        receiver_profile_id: receiverProfileId,
        message: message || '',
        status: 'PENDING',
      }])
      .select()
      .single();

    if (error) {
      console.error('Error in sendInterest:', error);
    }

    return data;
  }

  static async updateStatus(interestId: string, status: InterestStatus) {
    const { data, error } = await insforgeAdmin.database
      .from('interest_requests')
      .update({ status })
      .eq('id', interestId)
      .select()
      .single();

    if (error) {
      console.error('Error in updateStatus:', error);
    }

    return data;
  }

  static async getUserInterests(userId: string) {
    const [receivedRes, sentRes] = await Promise.all([
      insforgeAdmin.database
        .from('interest_requests')
        .select('*, sender:users!sender_id(id, name, avatar_url, is_verified)')
        .eq('receiver_id', userId)
        .order('created_at', { ascending: false }),
      insforgeAdmin.database
        .from('interest_requests')
        .select('*, receiver:users!receiver_id(id, name, avatar_url, is_verified)')
        .eq('sender_id', userId)
        .order('created_at', { ascending: false }),
    ]);

    return {
      received: receivedRes.data || [],
      sent: sentRes.data || [],
    };
  }
}
