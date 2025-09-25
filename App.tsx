import React, { useRef, useEffect, useState } from "react";
import { View, Button } from "react-native";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as THREE from "three";

export default function App() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [glReady, setGlReady] = useState(false);

  // pede permissão da câmera
  useEffect(() => {
    if (!permission || !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  // cria 3D
  const onContextCreate = async (gl: any) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 1000);
    camera.position.z = 2;

    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);

    // luz opcional (material básico não precisa, mas já deixo)
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 1);
    scene.add(light);

    // cubo vermelho
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // animação
    let mounted = true;
    const render = () => {
      if (!mounted) return;
      requestAnimationFrame(render);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();

    // cleanup ao desmontar
    return () => {
      mounted = false;
      geometry.dispose();
      material.dispose();
      (renderer as any)?.dispose?.();
    };
  };

  if (!permission || !permission.granted) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
        <Button title="Conceder acesso à câmera" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* câmera como background */}
      <CameraView
        ref={cameraRef}
        style={{ position: "absolute", width: "100%", height: "100%" }}
        facing="back"
      />

      {/* canvas WebGL sobreposto */}
      <GLView
        style={{ flex: 1 }}
        onContextCreate={async (gl) => {
          setGlReady(true);
          await onContextCreate(gl);
        }}
      />
    </View>
  );
}
