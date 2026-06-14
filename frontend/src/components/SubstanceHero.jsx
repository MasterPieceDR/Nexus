import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshTransmissionMaterial, Image, Float, Preload } from '@react-three/drei';
import * as THREE from 'three';

const HERO_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=700&q=70&auto=format&fit=crop', pos: [-3.2, 1.4, -2], scale: [2.4, 3.0] },
  { url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=700&q=70&auto=format&fit=crop', pos: [3.0, 1.7, -2.5], scale: [2.2, 2.8] },
  { url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=700&q=70&auto=format&fit=crop', pos: [-2.9, -1.8, -1.6], scale: [2.6, 1.9] },
  { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=70&auto=format&fit=crop', pos: [3.1, -1.6, -2.2], scale: [2.3, 2.3] },
  { url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=700&q=70&auto=format&fit=crop', pos: [0, 2.6, -3.2], scale: [2.6, 1.7] },
  { url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=700&q=70&auto=format&fit=crop', pos: [0, -2.7, -3.0], scale: [2.8, 1.7] },
];

function FloatingImage({ url, pos, scale }) {
  return (
    <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.6}>
      <Image
        url={url}
        position={pos}
        scale={scale}
        transparent
        opacity={0.92}
        radius={0.08}
        toneMapped={false}
      />
    </Float>
  );
}

function Crystal({ pointer }) {
  const ref = useRef();
  const inner = useRef();

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    ref.current.rotation.x += delta * 0.12;
    ref.current.rotation.y += delta * 0.18;
    inner.current.rotation.z -= delta * 0.25;
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, pointer.current.x * 0.6, 0.04);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, pointer.current.y * 0.4 + Math.sin(t * 0.5) * 0.1, 0.04);
  });

  return (
    <group ref={ref}>
      <mesh>
        <icosahedronGeometry args={[1.5, 0]} />
        <MeshTransmissionMaterial
          backside
          backsideThickness={1.2}
          samples={6}
          resolution={512}
          thickness={1.6}
          ior={1.5}
          chromaticAberration={0.45}
          anisotropy={0.3}
          distortion={0.35}
          distortionScale={0.4}
          temporalDistortion={0.15}
          iridescence={1}
          iridescenceIOR={1.3}
          iridescenceThicknessRange={[0, 1200]}
          roughness={0.05}
          color="#e8f0ff"
          attenuationColor="#2563EB"
          attenuationDistance={1.4}
        />
      </mesh>
      <mesh ref={inner} scale={0.42}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#2563EB"
          emissive="#60A5FA"
          emissiveIntensity={1.4}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

function Scene({ pointer }) {
  const { viewport } = useThree();
  const scaleFactor = useMemo(() => Math.min(1, viewport.width / 8), [viewport.width]);

  return (
    <group scale={scaleFactor}>
      {HERO_IMAGES.map((img, i) => (
        <FloatingImage key={i} {...img} />
      ))}
      <Crystal pointer={pointer} />
    </group>
  );
}

export default function SubstanceHero({ active = true }) {
  const pointer = useRef({ x: 0, y: 0 });

  const handlePointerMove = (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -((e.clientY / window.innerHeight) * 2 - 1);
    pointer.current = { x, y };
  };

  return (
    <div
      className="absolute inset-0 w-full h-full"
      onPointerMove={handlePointerMove}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 1.5]}
        frameloop={active ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={1.6} color="#ffffff" />
        <directionalLight position={[-5, -3, 2]} intensity={0.9} color="#2563EB" />
        <directionalLight position={[0, -5, 3]} intensity={0.5} color="#60A5FA" />
        <Suspense fallback={null}>
          <Scene pointer={pointer} />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
