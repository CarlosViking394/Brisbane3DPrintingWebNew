import { parse3DFile } from './3dFileParser';
import { ParsedModel } from '../types';

/**
 * Send the provided model file to the Bambu Labs slicing service and return a
 * parsed model containing generated supports. If the service call fails the
 * caller can fall back to local parsing.
 */
export async function sliceWithBambu(file: File): Promise<ParsedModel> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/bambu-preview', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Bambu preview request failed');
  }

  const blob = await response.blob();
  const processedFile = new File([blob], file.name, { type: file.type });
  return parse3DFile(processedFile);
}
