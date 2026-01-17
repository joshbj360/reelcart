import { useSupabaseClient } from '#imports';
import { useProductStore, useLikeStore, useCommentStore } from '~/stores';
import type { RealtimeChannel } from '@supabase/supabase-js';

let channel: RealtimeChannel | null = null;

/**
 * A composable to manage a single, app-wide real-time subscription.
 */
export const useRealtimeService = () => {
  const supabase = useSupabaseClient();
  const productStore = useProductStore();
  const likeStore = useLikeStore();
  // const commentStore = useCommentStore(); // No longer needed here

  const subscribe = () => {
    if (channel) return; // Already subscribed

    console.log("Initializing real-time service...");

    channel = supabase
      .channel('public-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ProductVariant' }, (payload) => {
        console.log('Real-time variant update received:', payload);
        // Tell the product store to handle the update
        productStore._handleRealtimeVariantUpdate(payload.new as any);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Like' }, (payload) => {
        console.log('Real-time like update received:', payload);
        // Tell the like store to handle the update
         likeStore._handleRealtimeLikeUpdate(payload);
      })
      //
      // --- THE FIX: The global listener for 'Comment' has been removed ---
      //
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
           console.log('Real-time service connected.');
        }
        if (err) {
            console.error('Real-time service error:', err);
        }
      });
  };

  const unsubscribe = () => {
    if (channel) {
      supabase.removeChannel(channel);
      channel = null;
      console.log('Real-time service disconnected.');
    }
  };

  return { subscribe, unsubscribe };
};