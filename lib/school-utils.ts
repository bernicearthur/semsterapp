import { supabase } from './supabase';

/**
 * Validates if an email belongs to a recognized educational institution
 * @param email The email to validate
 * @returns True if the email belongs to a recognized educational institution
 */
export async function validateSchoolEmail(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('validate_school_email_domain', {
      email
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error validating school email:', error);
    return false;
  }
}

/**
 * Extracts the school name from an email domain
 * @param email The email to extract the school from
 * @returns The school name or null if not recognized
 */
export async function getSchoolFromEmail(email: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('get_school_from_email', {
      email
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting school from email:', error);
    return null;
  }
}

/**
 * Checks if a user can access data from a specific school
 * @param school The school to check access for
 * @returns True if the user can access data from the school
 */
export async function canAccessSchoolData(school: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('can_access_school_data', {
      school_param: school
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error checking school access:', error);
    return false;
  }
}

/**
 * Gets the current user's school
 * @returns The current user's school or null if not found
 */
export async function getCurrentUserSchool(): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('get_my_school');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting current user school:', error);
    return null;
  }
}