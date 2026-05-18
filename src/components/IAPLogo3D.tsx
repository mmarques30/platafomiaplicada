import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

interface IAPLogo3DProps {
  /** Tamanho do canvas em px (default 600) */
  width?: number;
  /** Tamanho do canvas em px (default 600) */
  height?: number;
  /** Escala do logo dentro da cena (default 1) */
  scale?: number;
}

/**
 * Logo 3D do símbolo IAplicada — 4 pétalas em diferentes tons de verde
 * arranjadas como uma flor estilizada, com rotação suave e float.
 *
 * Replica o símbolo flat da marca em 3D extrudado. Fundo transparente.
 */
function leafShape(): THREE.Shape {
  // Forma de pétala/folha — um "diamond" curvado tipo gota larga
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0, 0.4, 0.5, 0.85, 0.95, 1);
  shape.bezierCurveTo(0.95, 1, 1, 0.95, 1, 0.95);
  shape.bezierCurveTo(0.85, 0.5, 0.4, 0, 0, 0);
  return shape;
}

const extrudeSettings: THREE.ExtrudeGeometryOptions = {
  depth: 0.18,
  bevelEnabled: true,
  bevelThickness: 0.03,
  bevelSize: 0.025,
  bevelSegments: 6,
  curveSegments: 32,
};

function Logo({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(leafShape(), extrudeSettings);
    geo.center();
    return geo;
  }, []);

  // 4 pétalas — cores fiéis ao PNG flat (creme claro / verde escuro / creme / verde médio)
  const petals = [
    { color: "#D8DCB1", rotation: 0 },       // top-left: creme-esverdeado claro
    { color: "#7C8E2F", rotation: -Math.PI / 2 }, // top-right: verde escuro
    { color: "#9EB038", rotation: Math.PI }, // bottom-right: verde médio (primary brand)
    { color: "#E0E1B8", rotation: Math.PI / 2 },  // bottom-left: creme claro
  ];

  useFrame((state) => {
    if (groupRef.current) {
      // Rotação contínua eixo Y + oscilação X visível
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.6;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.7) * 0.15;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {petals.map((petal, i) => {
        // Cada pétala apontando pro centro, rotacionada 90° em torno do eixo Z
        const offset = 0.05; // pequeno gap visual no centro pra ver o "X" interno
        const dx = Math.cos(petal.rotation + Math.PI / 4) * offset;
        const dy = Math.sin(petal.rotation + Math.PI / 4) * offset;
        return (
          <mesh
            key={i}
            geometry={geometry}
            position={[dx, dy, 0]}
            rotation={[0, 0, petal.rotation]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color={petal.color}
              roughness={0.45}
              metalness={0.1}
            />
          </mesh>
        );
      })}
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
        camera={{ position: [0, 0, 3.5], fov: 38 }}
        resize={{ scroll: false, offsetSize: true }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent", width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 5]} intensity={1.1} castShadow />
        <directionalLight position={[-3, -2, 2]} intensity={0.4} color="#C9D89B" />
        <pointLight position={[0, 0, 2]} intensity={0.5} color="#ffffff" />
        <Environment preset="apartment" />
        <Float
          speed={2}
          rotationIntensity={0.5}
          floatIntensity={0.6}
          floatingRange={[-0.08, 0.08]}
        >
          <Logo scale={scale} />
        </Float>
      </Canvas>
    </div>
  );
}
