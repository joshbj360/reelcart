import { serverSupabaseClient } from '#supabase/server';
import type { H3Event, EventHandlerRequest } from 'h3';
import { type Database } from './database.types';

export const useTypedSupabase = (event: H3Event<EventHandlerRequest>) => {
  return serverSupabaseClient<Database>(event);
};
