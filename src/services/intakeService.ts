import { IntakePayload } from '@/types/intake';

// Placeholder API endpoint
const API_ENDPOINT = '/api/intake';

export async function sendIntakeData(payload: IntakePayload): Promise<{ success: boolean; message: string }> {
  // For MVP, we'll log to console and simulate an API call
  console.log('Sending intake data to backend:', payload);
  console.log('Endpoint:', API_ENDPOINT);
  console.log('Payload JSON:', JSON.stringify(payload, null, 2));
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In production, this would be:
  // const response = await fetch(API_ENDPOINT, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // });
  // return response.json();
  
  return {
    success: true,
    message: 'Intake data received successfully (MVP mock response)',
  };
}

export function validatePayload(payload: IntakePayload): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!payload.user_id) {
    errors.push('Missing user_id');
  }
  
  if (!payload.session_id) {
    errors.push('Missing session_id');
  }
  
  if (!payload.created_at) {
    errors.push('Missing created_at timestamp');
  }
  
  if (!payload.settings) {
    errors.push('Missing settings');
  } else {
    if (!payload.settings.locale) {
      errors.push('Missing locale in settings');
    }
    if (!payload.settings.grade_band) {
      errors.push('Missing grade_band in settings');
    }
  }
  
  if (!payload.results) {
    errors.push('Missing results');
  }
  
  if (!payload.flags) {
    errors.push('Missing flags');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function downloadJson(payload: IntakePayload, filename: string = 'intake-data.json'): void {
  const jsonString = JSON.stringify(payload, null, 2);
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