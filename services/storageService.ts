import { supabase } from './supabaseClient';
import { SavedItem, SubjectProgress } from '../types';

// Save an item to the 'saved_items' table
export const saveItemToLibrary = async (item: SavedItem) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error("No user logged in");
        return;
    }

    const { error } = await supabase
      .from('saved_items')
      .insert({
        user_id: user.id,
        type: item.type,
        title: item.title,
        content: item.content, 
        client_id: item.id, // storing original ID to prevent duplicates if logic enhanced later
      });
    
    if (error) throw error;
  } catch (e) {
    console.error("Supabase Save Error", e);
  }
};

// Fetch items from 'saved_items' table
export const fetchLibraryItems = async (): Promise<SavedItem[]> => {
  try {
    const { data, error } = await supabase
      .from('saved_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map((row: any) => ({
        id: row.client_id || row.id,
        type: row.type,
        title: row.title,
        content: row.content,
        timestamp: new Date(row.created_at).getTime()
    }));
  } catch (e) {
    console.error("Supabase Fetch Error", e);
    return [];
  }
};

// Save user stats (Upsert)
export const saveUserStats = async (stats: SubjectProgress[]) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('user_stats')
            .upsert({ 
                user_id: user.id, 
                stats: stats 
            });
        
        if (error) throw error;
    } catch (e) {
        console.error("Stats Save Error", e);
    }
}

// Fetch user stats
export const fetchUserStats = async (): Promise<SubjectProgress[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('user_stats')
            .select('stats')
            .eq('user_id', user.id)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "Row not found" which is fine for new users
        
        return data?.stats || [];
    } catch (e) {
        console.error("Stats Fetch Error", e);
        return [];
    }
}
