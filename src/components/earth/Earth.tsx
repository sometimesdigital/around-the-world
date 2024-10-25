import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { HTMLAttributes, useEffect, useState } from "react";

const Content = () => {
  const { gl, scene } = useThree();
  const map = useTexture("./assets/map.svg");
  const background = useTexture("./assets/background.svg");

  map.anisotropy = gl.capabilities.getMaxAnisotropy();
  scene.background = background;

  useEffect(() => {
    const handleContextMenu = (e: Event) => {
      e.stopPropagation();
    };

    gl.domElement.addEventListener("contextmenu", handleContextMenu);

    return () => gl.domElement.removeEventListener("contextmenu", handleContextMenu);
  }, [gl]);

  const size = 2.25;
  const scale = [1, 0.99, 1] as const;
  const offset = [0, 0.32] as const;

  return (
    <group position={[...offset, 0]} scale={scale}>
      <mesh>
        <sphereGeometry args={[size, 64, 64]} />
        <meshBasicMaterial map={map} transparent />
      </mesh>
      <OrbitControls
        autoRotate
        enablePan={false}
        enableZoom={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
      />
    </group>
  );
};

export const Earth = () => {
  const [style, setStyle] = useState<HTMLAttributes<HTMLElement>["style"]>({
    background: "url(./assets/background-lazy.png)",
    backgroundSize: "contain",
  });

  const dpr = Math.max(window.devicePixelRatio, 2);

  return (
    <div className="earth" style={style}>
      <Canvas
        className="canvas"
        dpr={dpr}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        onCreated={() => setStyle(undefined)}
      >
        <Content />
      </Canvas>
    </div>
  );
};
