import { SessionResults, UserProfile } from '@/types/intake';

// Placeholder API endpoint
const API_ENDPOINT = '/api/intake';

export async function sendIntakeData(
  results: SessionResults, 
  userProfile: UserProfile
): Promise<{ success: boolean; message: string }> {
  // For MVP, we'll log to console and simulate an API call
  console.log('Sending intake data to backend:');
  console.log('Endpoint:', API_ENDPOINT);
  console.log('Session Results:', JSON.stringify(results, null, 2));
  console.log('User Profile:', JSON.stringify(userProfile, null, 2));
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In production, this would be:
  // const response = await fetch(API_ENDPOINT, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ results, userProfile }),
  // });
  // return response.json();
  
  return {
    success: true,
    message: 'Intake data received successfully (MVP mock response)',
  };
}

export function validateResults(results: SessionResults): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!results.id) {
    errors.push('Missing session id');
  }
  
  if (!results.userId) {
    errors.push('Missing userId');
  }
  
  if (!results.createdAt) {
    errors.push('Missing createdAt timestamp');
  }
  
  if (!results.gradeBand) {
    errors.push('Missing gradeBand');
  }
  
  if (!results.tasks || results.tasks.length === 0) {
    errors.push('No task results recorded');
  }
  
  if (!results.flags) {
    errors.push('Missing flags');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateUserProfile(profile: UserProfile): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!profile.id) {
    errors.push('Missing profile id');
  }
  
  if (!profile.gradeLevel) {
    errors.push('Missing gradeLevel');
  }
  
  if (!profile.readingProfile) {
    errors.push('Missing readingProfile');
  }
  
  if (!profile.preferences) {
    errors.push('Missing preferences');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function downloadJson(data: object, filename: string = 'intake-data.json'): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}
