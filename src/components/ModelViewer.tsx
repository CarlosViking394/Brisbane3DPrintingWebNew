import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Center, Bounds, Environment, PresentationControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { ModelFile } from '../types';
import ViewControls from './ViewControls';
import ModelInfo from './ModelInfo';

interface ModelViewerProps {
  modelFile?: ModelFile;
  className?: string;
}

// Component to render the parsed 3D model
const Model3D: React.FC<{ geometry: THREE.BufferGeometry }> = ({ geometry }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [processedGeometry, setProcessedGeometry] = useState<THREE.BufferGeometry | null>(null);
  
  useEffect(() => {
    console.log('Model3D useEffect - geometry received:', geometry);
    
    if (geometry) {
      try {
        // Log geometry properties to help with debugging
        console.log('Geometry attributes:', geometry.attributes);
        console.log('Geometry has position attribute:', !!geometry.attributes?.position);
        console.log('Geometry has normal attribute:', !!geometry.attributes?.normal);
        console.log('Geometry index:', geometry.index);
        
        // Create a new BufferGeometry to ensure we have all required methods
        const newGeometry = new THREE.BufferGeometry();
        
        // Copy over all attributes from the original geometry
        if (geometry.attributes) {
          Object.keys(geometry.attributes).forEach(key => {
            console.log(`Copying attribute: ${key}`);
            newGeometry.setAttribute(key, geometry.attributes[key]);
          });
        }
        
        // Copy over index if it exists
        if (geometry.index) {
          console.log('Copying index');
          newGeometry.setIndex(geometry.index);
        }
        
        // Center the geometry
        console.log('Centering geometry');
        newGeometry.center();
        
        // Ensure the geometry has proper normals
        if (!newGeometry.attributes.normal) {
          console.log('Geometry has no normals, computing them');
          newGeometry.computeVertexNormals();
        }
        
        console.log('Setting processed geometry');
        setProcessedGeometry(newGeometry);
      } catch (error) {
        console.error('Error processing geometry:', error);
        // Create a simple fallback geometry if processing fails
        console.log('Using fallback box geometry');
        const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
        setProcessedGeometry(boxGeometry);
      }
    }
  }, [geometry]); // Only depend on the input geometry prop, not processedGeometry
  
  // Simple hover effect
  useFrame(() => {
    if (meshRef.current && meshRef.current.material) {
      const material = meshRef.current.material;
      if ('color' in material && material.color instanceof THREE.Color) {
        material.color.set(hovered ? '#3B82F6' : '#1E88E5');
      }
    }
  });

  if (!processedGeometry) {
    return null;
  }

  return (
    <mesh 
      ref={meshRef} 
      geometry={processedGeometry}
      castShadow 
      receiveShadow
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshPhysicalMaterial 
        color="#1E88E5"
        roughness={0.4}
        metalness={0.1}
        clearcoat={0.2}
        clearcoatRoughness={0.2}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Loading spinner component
const LoadingSpinner = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.02;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <>
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <ambientLight intensity={0.2} />
      <mesh ref={meshRef}>
        <torusGeometry args={[1.5, 0.5, 16, 100]} />
        <meshStandardMaterial 
          color="#3B82F6" 
          emissive="#3B82F6"
          emissiveIntensity={0.2}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
    </>
  );
};

// Placeholder mesh component for when no model is loaded
const PlaceholderMesh = () => {
  return (
    <group>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#3B82F6" wireframe />
      </mesh>
    </group>
  );
};

// Simple camera controller component
const CameraController: React.FC = () => {
  return (
    <OrbitControls
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={2}
      maxDistance={100}
    />
  );
};

const ModelViewer: React.FC<ModelViewerProps> = ({ modelFile, className = '' }) => {
  console.log('ModelViewer rendering with modelFile:', modelFile);
  
  return (
    <div className={`w-full h-80 md:h-96 relative rounded-xl overflow-hidden border border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100 ${className}`}>
      <Canvas 
        camera={{ position: [5, 5, 5], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]} // Responsive rendering quality
      >
        <color attach="background" args={['#f8f9fb']} />
        
        <Suspense fallback={<LoadingSpinner />}>
          {/* Lighting setup */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={0.8}
            castShadow
          />
          <pointLight position={[-10, -10, -10]} intensity={0.2} />
          
          {/* Environment */}
          <Environment preset="city" />
          
          {/* Model */}
          {modelFile?.parsedModel?.geometry ? (
            <Model3D geometry={modelFile.parsedModel.geometry as THREE.BufferGeometry} />
          ) : (
            <PlaceholderMesh />
          )}
          
          {/* Simple camera controls */}
          <CameraController />
        </Suspense>
      </Canvas>
      
      {/* Loading indicator */}
      {!modelFile && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">Upload a 3D model to preview</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelViewer; 