import { supabase } from './supabase';

/**
 * Validates if an email belongs to a recognized educational institution
 * @param email The email to validate
 * @returns True if the email belongs to a recognized educational institution
 */
export async function validateSchoolEmail(email: string): Promise<boolean> {
  try {
    // First check if the email has a valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }

    const { data, error } = await supabase.rpc('validate_school_email_domain', {
      email
    });
    
    if (error) {
      console.error('Error validating school email:', error);
      // Fallback: check if it's a common educational domain
      return isCommonEducationalDomain(email);
    }
    
    return data || false;
  } catch (error) {
    console.error('Error validating school email:', error);
    // Fallback: check if it's a common educational domain
    return isCommonEducationalDomain(email);
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
    
    if (error) {
      console.error('Error getting school from email:', error);
      // Fallback: extract school name from domain
      return extractSchoolNameFromDomain(email);
    }
    
    return data;
  } catch (error) {
    console.error('Error getting school from email:', error);
    // Fallback: extract school name from domain
    return extractSchoolNameFromDomain(email);
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
    
    if (error) {
      console.error('Error checking school access:', error);
      return false;
    }
    
    return data || false;
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
    
    if (error) {
      console.error('Error getting current user school:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting current user school:', error);
    return null;
  }
}

/**
 * Fallback function to check common educational domains
 * @param email The email to check
 * @returns True if the domain is a common educational domain
 */
function isCommonEducationalDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;

  // Common educational domain patterns
  const eduPatterns = [
    /\.edu$/,           // US educational institutions
    /\.ac\.[a-z]{2}$/,  // Academic institutions (international)
    /\.edu\.[a-z]{2}$/  // Educational institutions (international)
  ];

  return eduPatterns.some(pattern => pattern.test(domain));
}

/**
 * Fallback function to extract school name from domain
 * @param email The email to extract from
 * @returns Extracted school name or null
 */
function extractSchoolNameFromDomain(email: string): string | null {
  const domain = email.split('@')[1];
  if (!domain) return null;

  // Remove common educational suffixes and format as school name
  const schoolPart = domain
    .replace(/\.(edu|ac\.[a-z]{2}|edu\.[a-z]{2})$/, '')
    .split('.')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  return schoolPart || null;
}