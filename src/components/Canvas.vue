<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  Scene,
  Engine,
  Vector3,
  FreeCamera,
  HemisphericLight,
  MeshBuilder,
  Mesh,
} from "babylonjs";

const canvas = ref(null);

onMounted(() => {
  const engine = new Engine(canvas.value, true, {
    preserveDrawingBuffer: true,
    stencil: true,
  });

  const CreateScene = () => {
    const scene = new Scene(engine);

    const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);

    // Target the camera to scene origin
    camera.setTarget(Vector3.Zero());
    // Attach the camera to the canvas
    camera.attachControl(canvas, false);
    // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
    new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
    // Create a built-in "sphere" shape using the SphereBuilder
    const sphere = MeshBuilder.CreateSphere(
      "sphere1",
      { segments: 16, diameter: 2, sideOrientation: Mesh.FRONTSIDE },
      scene
    );
    // Move the sphere upward 1/2 of its height
    sphere.position.y = 1;
    // Create a built-in "ground" shape;
    MeshBuilder.CreateGround(
      "ground1",
      { width: 6, height: 6, subdivisions: 2, updatable: false },
      scene
    );
    // Return the created scene
    return scene;
  };

  const scene = CreateScene();

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", () => {
    engine.resize();
  });
});
</script>

<template>
  <div class="wrapper">
    <canvas id="babylon-canvas" ref="canvas"></canvas>
  </div>
</template>

<style lang="scss">
#babylon-canvas {
  width: 100%;
  height: 100%;
}
</style>
