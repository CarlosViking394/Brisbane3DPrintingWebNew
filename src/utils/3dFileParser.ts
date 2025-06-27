import { ModelStats, ParsedModel } from "../types";
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

// Utility function to estimate material weight based on volume and material type
export const getWeightForMaterial = (volumeInCm3: number, materialType: string): number => {
  // Density values in g/cm3
  const densities: Record<string, number> = {
    'PLA': 1.25,
    'ABS': 1.04,
    'PETG': 1.27,
    'TPU': 1.21,
  };
  
  const density = densities[materialType] || 1.25; // Default to PLA density if unknown
  return volumeInCm3 * density;
};

// Utility function to format weight with appropriate units
export const formatWeight = (weightInGrams: number): string => {
  if (weightInGrams < 1000) {
    return `${weightInGrams.toFixed(1)}g`;
  } else {
    return `${(weightInGrams / 1000).toFixed(2)}kg`;
  }
};

// Calculate volume of a 3D model from its geometry
const calculateVolume = (geometry: THREE.BufferGeometry): number => {
  let volume = 0;
  const position = geometry.attributes.position;
  const faces = position.count / 3;
  
  // Create vectors for calculation
  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();
  const v3 = new THREE.Vector3();
  
  // Calculate volume using the signed volume of tetrahedrons
  for (let i = 0; i < faces; i++) {
    const index = i * 3;
    
    v1.fromBufferAttribute(position, index);
    v2.fromBufferAttribute(position, index + 1);
    v3.fromBufferAttribute(position, index + 2);
    
    // Calculate signed volume of tetrahedron formed by the triangle and the origin
    volume += signedVolumeOfTriangle(v1, v2, v3);
  }
  
  // Convert to cubic centimeters (assuming model is in millimeters)
  return Math.abs(volume) / 1000;
};

// Calculate signed volume of a tetrahedron
const signedVolumeOfTriangle = (p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3): number => {
  return p1.dot(p2.cross(p3)) / 6.0;
};

// Calculate dimensions of a 3D model
const calculateDimensions = (geometry: THREE.BufferGeometry): { width: number, height: number, depth: number } => {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  
  return {
    width: box.max.x - box.min.x,
    height: box.max.y - box.min.y,
    depth: box.max.z - box.min.z,
  };
};

// Calculate surface area of a 3D model
const calculateSurfaceArea = (geometry: THREE.BufferGeometry): number => {
  let area = 0;
  const position = geometry.attributes.position;
  const faces = position.count / 3;
  
  // Create vectors for calculation
  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();
  const v3 = new THREE.Vector3();
  
  // Calculate area of each triangle
  for (let i = 0; i < faces; i++) {
    const index = i * 3;
    
    v1.fromBufferAttribute(position, index);
    v2.fromBufferAttribute(position, index + 1);
    v3.fromBufferAttribute(position, index + 2);
    
    // Calculate area of triangle
    const sideA = v1.distanceTo(v2);
    const sideB = v2.distanceTo(v3);
    const sideC = v3.distanceTo(v1);
    
    const s = (sideA + sideB + sideC) / 2;
    area += Math.sqrt(s * (s - sideA) * (s - sideB) * (s - sideC));
  }
  
  // Convert to square centimeters (assuming model is in millimeters)
  return area / 100;
};

// Parse 3D file (STL or 3MF)
export const parse3DFile = async (file: File): Promise<ParsedModel> => {
  console.log('Parsing 3D file:', file.name);
  const startTime = performance.now();
  
  return new Promise((resolve, reject) => {
    try {
      // Create object URL for the file
      const objectUrl = URL.createObjectURL(file);
      
      // Determine format from file extension
      const format = file.name.toLowerCase().endsWith('.stl') ? 'STL' : 
                    file.name.toLowerCase().endsWith('.3mf') ? '3MF' : 
                    'Unknown';
      
      // Use appropriate loader based on file format
      if (format === 'STL') {
        const loader = new STLLoader();
        
        loader.load(
          objectUrl,
          (geometry) => {
            try {
              console.log('STL loaded successfully');
              
              // Calculate model statistics
              const volume = calculateVolume(geometry);
              const dimensions = calculateDimensions(geometry);
              const surfaceArea = calculateSurfaceArea(geometry);
              const triangleCount = geometry.attributes.position.count / 3;
              
              // Calculate estimated weights for different materials
              const stats: ModelStats = {
                volume,
                triangleCount,
                dimensions,
                surfaceArea,
                estimatedWeight: {
                  'PLA': getWeightForMaterial(volume, 'PLA'),
                  'ABS': getWeightForMaterial(volume, 'ABS'),
                  'PETG': getWeightForMaterial(volume, 'PETG'),
                  'TPU': getWeightForMaterial(volume, 'TPU'),
                }
              };
              
              const endTime = performance.now();
              const parseTime = Math.round(endTime - startTime);
              
              // Clean up object URL
              URL.revokeObjectURL(objectUrl);
              
              resolve({
                geometry,
                stats,
                metadata: {
                  format,
                  parseTime,
                }
              });
            } catch (error) {
              console.error('Error processing STL geometry:', error);
              URL.revokeObjectURL(objectUrl);
              reject(new Error('Failed to process STL geometry'));
            }
          },
          (xhr) => {
            console.log(`STL ${(xhr.loaded / xhr.total * 100).toFixed(0)}% loaded`);
          },
          (error) => {
            console.error('Error loading STL:', error);
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Failed to load STL file'));
          }
        );
      } else if (format === '3MF') {
        // For now, we'll use a mock implementation for 3MF
        // In a real implementation, you would use ThreeJS 3MFLoader
        console.warn('3MF parsing not fully implemented, using mock data');
        
        setTimeout(() => {
          const mockGeometry = new THREE.BoxGeometry(50, 40, 30);
          const volume = 50 * 40 * 30 / 1000; // Convert to cm³
          
          const stats: ModelStats = {
            volume,
            triangleCount: 12,
            dimensions: {
              width: 50,
              height: 40,
              depth: 30,
            },
            surfaceArea: 2 * (50 * 40 + 50 * 30 + 40 * 30) / 100, // Convert to cm²
            estimatedWeight: {
              'PLA': getWeightForMaterial(volume, 'PLA'),
              'ABS': getWeightForMaterial(volume, 'ABS'),
              'PETG': getWeightForMaterial(volume, 'PETG'),
              'TPU': getWeightForMaterial(volume, 'TPU'),
            }
          };
          
          const endTime = performance.now();
          const parseTime = Math.round(endTime - startTime);
          
          URL.revokeObjectURL(objectUrl);
          
          resolve({
            geometry: mockGeometry,
            stats,
            metadata: {
              format,
              parseTime,
            }
          });
        }, 500);
      } else {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Unsupported file format'));
      }
    } catch (error) {
      console.error('Error parsing 3D file:', error);
      reject(new Error('Failed to parse 3D file'));
    }
  });
};

// Format model stats for display
export const formatModelStats = (stats: ModelStats): Record<string, string> => {
  return {
    volume: `${stats.volume.toFixed(2)} cm³`,
    triangles: stats.triangleCount.toLocaleString(),
    dimensions: `${stats.dimensions.width.toFixed(1)} × ${stats.dimensions.height.toFixed(1)} × ${stats.dimensions.depth.toFixed(1)} mm`,
    surfaceArea: `${stats.surfaceArea.toFixed(1)} cm²`,
  };
};

// Mock function to simulate sending an email
async function sendOrderConfirmationEmail(customerInfo: any, orderDetails: any) {
  console.log('Sending confirmation email to:', customerInfo.email);
  console.log('Order details:', orderDetails);
  // In a real implementation, this would use a service like SendGrid, AWS SES, etc.
  return {
    success: true,
    messageId: 'mock-email-id-' + Date.now()
  };
} 