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
 * Pétala em formato "quarto de círculo" igual ao símbolo flat da marca:
 * dois lados retos internos (formando o "+" no centro) e um arco curvo
 * externo (a borda arredondada que fica de frente para o canto).
 *
 * Construção (vista de cima, sentido anti-horário):
 *   (0,0)  → ponto central da flor (origem)
 *   (1,0)  → ponta da pétala no eixo X
 *   arco até (0,1) → borda externa arredondada
 *   volta a (0,0)  → ponta da pétala no eixo Y
 *
 * Quando as 4 pétalas são rotacionadas em Z (0, 90°, 180°, 270°),
 * as quatro arestas retas se encontram no centro formando uma cruz
 * com um pequeno espaço — exatamente como no PNG flat da marca.
 */
function leafShape(): THREE.Shape {
  const shape = new THREE.Shape();
  // Pequeno offset interno para criar o "+" gap entre as pétalas no centro.
  const innerGap = 0.06;
  shape.moveTo(innerGap, innerGap);
  shape.lineTo(1, innerGap);
  // Arco circular convexo da ponta X até a ponta Y, formando o "quarto de círculo"
  // típico da marca. Ponto de controle em (1,1) puxa a curva pra fora.
  shape.quadraticCurveTo(1, 1, innerGap, 1);
  shape.lineTo(innerGap, innerGap);
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

  // Posicionamento correto pelos quadrantes (rotação Z anti-horária):
  //   rotation 0       → quadrante TR (top-right)
  //   rotation π/2     → quadrante TL
  //   rotation π       → quadrante BL
  //   rotation -π/2    → quadrante BR
  // Cores fiéis ao PNG flat.
  const petals = [
    { color: "#7C8E2F", rotation: 0 },                 // TR — verde escuro
    { color: "#D8DCB1", rotation: Math.PI / 2 },       // TL — creme claro
    { color: "#E0E1B8", rotation: Math.PI },           // BL — creme bem claro
    { color: "#9EB038", rotation: -Math.PI / 2 },      // BR — verde médio (primary)
  ];

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
