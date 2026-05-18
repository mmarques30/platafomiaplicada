import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

interface IAPLogo3DProps {
  width?: number;
  height?: number;
  scale?: number;
}

/**
 * Pétala em formato folha/amêndoa — duas curvas suaves entre (0,0) e (1,1)
 * passando por (0,1) e (1,0). Cada pétala ocupa o quadrante TR no seu
 * frame local; as 4 rotações em Z distribuem nos demais quadrantes.
 *
 * Mantida igual ao primeiro design. O ajuste fino do "+" central é feito
 * via offset radial de cada mesh, não modificando a forma em si.
 */
function leafShape(): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.quadraticCurveTo(0, 1, 1, 1);
  shape.quadraticCurveTo(1, 0, 0, 0);
  return shape;
}

const extrudeSettings: THREE.ExtrudeGeometryOptions = {
  depth: 0.18,
  bevelEnabled: true,
  bevelThickness: 0.035,
  bevelSize: 0.03,
  bevelSegments: 8,
  curveSegments: 40,
};

function Logo({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  // Geometria SEM center() — pivô fica em (0,0), as 4 rotações em Z
  // distribuem cada pétala num quadrante.
  const geometry = useMemo(() => new THREE.ExtrudeGeometry(leafShape(), extrudeSettings), []);

  // Posicionamento correto pelos quadrantes (rotação Z anti-horária).
  // O offset radial empurra cada pétala diagonalmente para fora do centro,
  // criando o espaço em "+" entre as 4 sem mexer no formato da folha.
  const radial = 0.07;
  const d = radial / Math.SQRT2;
  const petals = [
    { color: "#7C8E2F", rotation: 0,              offset: [ d,  d] }, // TR — verde escuro
    { color: "#D8DCB1", rotation: Math.PI / 2,    offset: [-d,  d] }, // TL — creme claro
    { color: "#E0E1B8", rotation: Math.PI,        offset: [-d, -d] }, // BL — creme bem claro
    { color: "#9EB038", rotation: -Math.PI / 2,   offset: [ d, -d] }, // BR — verde médio (primary)
  ] as const;

  useFrame((state) => {
    if (groupRef.current) {
      // Rotação lenta no eixo Y + oscilação suave no X
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.25;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.08;
    }
  });

  return (
    <group ref={groupRef} scale={scale} position={[0, 0, 0]}>
      {petals.map((petal, i) => (
        <mesh
          key={i}
          geometry={geometry}
          rotation={[0, 0, petal.rotation]}
          position={[petal.offset[0], petal.offset[1], 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={petal.color} roughness={0.5} metalness={0.05} />
        </mesh>
      ))}
    </group>
  );
}

export function IAPLogo3D({ width = 600, height = 600, scale = 1 }: IAPLogo3DProps) {
  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        minWidth: `${width}px`,
        minHeight: `${height}px`,
        display: "block",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 38 }}
        resize={{ scroll: false, offsetSize: true }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent", width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[3, 3, 5]} intensity={1.0} castShadow />
        <directionalLight position={[-3, -2, 2]} intensity={0.4} color="#C9D89B" />
        <pointLight position={[0, 0, 2]} intensity={0.45} color="#ffffff" />
        <Environment preset="apartment" />
        <Float
          speed={1.2}
          rotationIntensity={0.2}
          floatIntensity={0.35}
          floatingRange={[-0.05, 0.05]}
        >
          <Logo scale={scale} />
        </Float>
      </Canvas>
    </div>
  );
}
