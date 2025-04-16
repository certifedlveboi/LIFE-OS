
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://olcsrjbbwhhsvodhmqkj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sY3NyamJid2hoc3ZvZGhtcWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NzE4OTQsImV4cCI6MjA2MDM0Nzg5NH0.qDTJKjXJBDpZNa7tsIADeiqLMihIpOjrWmSquK3wYUI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const saveUserSettings = async (settings) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving user settings:', error);
    throw error;
  }
};

export const getUserSettings = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user settings:', error);
    return null;
  }
};

export const addNote = async (noteData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const { data, error } = await supabase
      .from('notes')
      .insert([{ ...noteData, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding note:', error);
    throw error;
  }
};

export const updateNote = async (noteId, updates) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', noteId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};

export const addReminder = async (reminderData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const { data, error } = await supabase
      .from('reminders')
      .insert([{ ...reminderData, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding reminder:', error);
    throw error;
  }
};

export const updateReminder = async (reminderId, updates) => {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', reminderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating reminder:', error);
    throw error;
  }
};

export const getNotes = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting notes:', error);
    return [];
  }
};

export const getReminders = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting reminders:', error);
    return [];
  }
};
