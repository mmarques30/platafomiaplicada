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
 * Pétala em formato folha/lens entre dois pontos cardinais — igual ao
 * símbolo flat correto da marca.
 *
 *   - As duas pontas ficam nos eixos cardinais: (1, 0) leste e (0, 1) norte
 *     (no frame local da pétala TR; as outras 3 vêm via rotação em Z).
 *   - A borda externa é um ARCO CIRCULAR centrado em (0,0) com raio 1, indo
 *     do leste pro norte passando pelo canto (1,1) — forma o contorno
 *     circular do logo.
 *   - A borda interna é uma curva côncava puxada em direção à origem mas
 *     sem chegar nela; deixa o gap em "+" no centro da flor.
 *
 * Ao rotacionar 0, π/2, π, -π/2, pétalas adjacentes compartilham as pontas
 * nos pontos (±1, 0) e (0, ±1), formando uma silhueta arredondada com
 * 4 cúspides cardinais e um gap em estrela no centro.
 */
function leafShape(): THREE.Shape {
  const shape = new THREE.Shape();
  // Inicia na ponta leste.
  shape.moveTo(1, 0);
  // Arco circular real (raio 1) do leste até o norte — esse é o "lado de fora".
  shape.absarc(0, 0, 1, 0, Math.PI / 2, false);
  // Curva interna côncava de volta para a ponta leste; o control point
  // próximo à origem deixa um pequeno gap central em formato de estrela.
  const innerBulge = 0.22;
  shape.quadraticCurveTo(innerBulge, innerBulge, 1, 0);
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

  // Posicionamento por quadrantes. Sem offset — o gap central já vem da
  // curva interna côncava do leafShape.
  const petals = [
    { color: "#7C8E2F", rotation: 0 },              // NE — verde escuro
    { color: "#D8DCB1", rotation: Math.PI / 2 },    // NW — creme claro
    { color: "#E0E1B8", rotation: Math.PI },        // SW — creme bem claro
    { color: "#9EB038", rotation: -Math.PI / 2 },   // SE — verde médio (primary)
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
