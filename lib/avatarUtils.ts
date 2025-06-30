/**
 * Generates initials from a name
 * @param name The full name to generate initials from
 * @returns The initials (up to 2 characters)
 */
export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.trim().split(' ');
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generates a background color based on a string (name)
 * @param name The string to generate a color from
 * @returns A hex color code
 */
export function getAvatarColor(name: string): string {
  if (!name) return '#3B82F6'; // Default blue
  
  // List of pleasant colors for avatars
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6366F1', // Indigo
  ];
  
  // Simple hash function to get a consistent color for the same name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use the hash to pick a color
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * Creates a data URL for an avatar with initials
 * @param name The name to generate initials from
 * @param size The size of the avatar in pixels
 * @returns A data URL for the avatar
 */
export function generateInitialsAvatar(name: string, size: number = 200): string {
  const initials = getInitials(name);
  const backgroundColor = getAvatarColor(name);
  
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  
  const context = canvas.getContext('2d');
  if (!context) return '';
  
  // Draw background
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, size, size);
  
  // Draw text
  context.fillStyle = '#FFFFFF';
  context.font = `bold ${size / 2}px Inter, Arial, sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(initials, size / 2, size / 2);
  
  // Convert to data URL
  return canvas.toDataURL('image/png');
}

/**
 * Gets an avatar URL, either from the provided URL or generates one with initials
 * @param name The name to use for initials if no avatar URL is provided
 * @param avatarUrl The optional avatar URL
 * @returns An avatar URL or data URL with initials
 */
export function getAvatarUrl(name: string, avatarUrl?: string | null): string {
  if (avatarUrl) return avatarUrl;
  
  // For web, we can generate a data URL
  if (typeof document !== 'undefined') {
    return generateInitialsAvatar(name);
  }
  
  // For native, we would need a different approach
  // This is a placeholder - in a real app, you might use a service like UI Avatars
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${getAvatarColor(name).substring(1)}&color=fff&size=200`;
}