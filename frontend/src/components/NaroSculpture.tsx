import { useEffect, useRef, useState } from "react";
import { useI18n } from "../context";

// Decorative asset: no wallet, account or chain state enters the WebGL scene.
export function NaroSculpture() {
  const host = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null);
  const paused = useRef(false),
    wake = useRef<() => void>(() => {});
  const [isPaused, setPaused] = useState(false),
    [ready, setReady] = useState(false);
  const { t } = useI18n();
  useEffect(() => {
    let disposed = false,
      cleanup = () => {};
    void import("three")
      .then((THREE) => {
        if (disposed) return;
        const element = host.current!,
          node = canvas.current!;
        let renderer: InstanceType<typeof THREE.WebGLRenderer>;
        try {
          renderer = new THREE.WebGLRenderer({
            canvas: node,
            alpha: true,
            antialias: true,
            powerPreference: "low-power",
          });
        } catch {
          return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        const scene = new THREE.Scene(),
          camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
        camera.position.set(0, 1.2, 7.8);
        camera.lookAt(0, 0, 0);
        const group = new THREE.Group();
        scene.add(group);
        const shape = new THREE.Shape();
        shape.moveTo(-1.1, -1.1);
        shape.lineTo(1.1, -1.1);
        shape.lineTo(1.1, 1.1);
        shape.lineTo(-1.1, 1.1);
        shape.closePath();
        const hole = new THREE.Path();
        hole.moveTo(-0.53, -0.53);
        hole.lineTo(-0.53, 0.53);
        hole.lineTo(0.53, 0.53);
        hole.lineTo(0.53, -0.53);
        hole.closePath();
        shape.holes.push(hole);
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth: 0.38,
          bevelEnabled: true,
          bevelSegments: 3,
          steps: 1,
          bevelSize: 0.055,
          bevelThickness: 0.055,
          curveSegments: 2,
        });
        geometry.center();
        const face = new THREE.MeshStandardMaterial({
            color: 0x01fea3,
            metalness: 0.38,
            roughness: 0.25,
          }),
          side = new THREE.MeshStandardMaterial({
            color: 0x0d7555,
            metalness: 0.62,
            roughness: 0.3,
          });
        const mark = new THREE.Mesh(geometry, [face, side]);
        group.add(mark);
        const wireGeometry = new THREE.EdgesGeometry(geometry, 35),
          wireMaterial = new THREE.LineBasicMaterial({
            color: 0x7dffcb,
            transparent: true,
            opacity: 0.22,
          });
        mark.add(new THREE.LineSegments(wireGeometry, wireMaterial));
        const orbitalGeometry = new THREE.TorusGeometry(1.86, 0.008, 4, 80),
          orbitalMaterial = new THREE.MeshBasicMaterial({
            color: 0x62796d,
            transparent: true,
            opacity: 0.36,
          });
        const rail = new THREE.Mesh(orbitalGeometry, orbitalMaterial);
        rail.rotation.x = Math.PI / 2.25;
        rail.position.y = -0.6;
        scene.add(rail);
        const satelliteGeometry = new THREE.BoxGeometry(0.105, 0.105, 0.105),
          satelliteMaterial = new THREE.MeshStandardMaterial({
            color: 0x7dffcb,
            metalness: 0.5,
            roughness: 0.25,
          });
        const satellites = Array.from({ length: 3 }, (_, index) => {
          const mesh = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
          scene.add(mesh);
          return mesh;
        });
        scene.add(new THREE.HemisphereLight(0xe8fff5, 0x061b13, 1.4));
        const key = new THREE.DirectionalLight(0xf2fff9, 3);
        key.position.set(-3, 4, 5);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x01fea3, 4);
        rim.position.set(4, -1, -2);
        scene.add(rim);
        const motion = matchMedia("(prefers-reduced-motion: reduce)");
        let contextLost = false;
        let visible = true,
          frame = 0,
          last = 0,
          time = 0,
          previous = 0,
          targetX = 0,
          targetY = 0;
        const draw = (now: number) => {
          frame = 0;
          if (disposed || contextLost) return;
          const animate =
            visible && !document.hidden && !motion.matches && !paused.current;
          if (now - last >= 1000 / 30 || !animate) {
            const delta = previous
              ? Math.min((now - previous) / 1000, 0.05)
              : 0;
            previous = now;
            last = now;
            if (animate) time += delta;
            group.rotation.set(
              -0.2 + targetY * 0.09,
              -0.38 + Math.sin(time * 0.3) * 0.18 + targetX * 0.13,
              -0.15,
            );
            group.position.y = animate ? Math.sin(time * 0.7) * 0.08 : 0;
            satellites.forEach((mesh, index) => {
              const angle = time * 0.16 + (index * Math.PI * 2) / 3;
              mesh.position.set(
                Math.cos(angle) * 1.86,
                -0.6 + Math.sin(angle) * 0.4,
                Math.sin(angle) * 1.3,
              );
              mesh.rotation.set(time * 0.3, index, time * 0.2);
            });
            renderer.render(scene, camera);
          }
          if (animate) frame = requestAnimationFrame(draw);
        };
        const resume = () => {
          cancelAnimationFrame(frame);
          if (contextLost) return;
          previous = 0;
          frame = requestAnimationFrame(draw);
        };
        wake.current = resume;
        const resize = () => {
          const { width, height } = element.getBoundingClientRect();
          renderer.setSize(width, height, false);
          camera.aspect = width / Math.max(height, 1);
          camera.updateProjectionMatrix();
          resume();
        };
        const observer = new ResizeObserver(resize);
        observer.observe(element);
        const intersection = new IntersectionObserver((entries) => {
          visible = entries[0].isIntersecting;
          resume();
        });
        intersection.observe(element);
        const pointer = (event: PointerEvent) => {
          if (motion.matches || paused.current || event.pointerType === "touch")
            return;
          const rect = element.getBoundingClientRect();
          targetX = (event.clientX - rect.left) / rect.width - 0.5;
          targetY = (event.clientY - rect.top) / rect.height - 0.5;
        };
        const leave = () => {
          targetX = 0;
          targetY = 0;
        };
        const lost = (event: Event) => {
          event.preventDefault();
          contextLost = true;
          cancelAnimationFrame(frame);
          setReady(false);
        };
        const restored = () => {
          contextLost = false;
          resize();
          setReady(true);
        };
        node.addEventListener("webglcontextlost", lost);
        node.addEventListener("webglcontextrestored", restored);
        element.addEventListener("pointermove", pointer);
        element.addEventListener("pointerleave", leave);
        document.addEventListener("visibilitychange", resume);
        motion.addEventListener("change", resume);
        resize();
        setReady(true);
        cleanup = () => {
          cancelAnimationFrame(frame);
          observer.disconnect();
          intersection.disconnect();
          node.removeEventListener("webglcontextlost", lost);
          node.removeEventListener("webglcontextrestored", restored);
          element.removeEventListener("pointermove", pointer);
          element.removeEventListener("pointerleave", leave);
          document.removeEventListener("visibilitychange", resume);
          motion.removeEventListener("change", resume);
          geometry.dispose();
          face.dispose();
          side.dispose();
          wireGeometry.dispose();
          wireMaterial.dispose();
          orbitalGeometry.dispose();
          orbitalMaterial.dispose();
          satelliteGeometry.dispose();
          satelliteMaterial.dispose();
          renderer.dispose();
          renderer.forceContextLoss();
          wake.current = () => {};
        };
      })
      .catch(() => {});
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);
  return (
    <div className="naro-sculpture" ref={host} data-ready={ready}>
      <div className="sculpture-halo" aria-hidden="true" />
      <svg
        className="sculpture-fallback"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <path
          d="M16 16h68v68H16zM34 34v32h32V34z"
          fill="currentColor"
          fillRule="evenodd"
        />
      </svg>
      <canvas ref={canvas} aria-hidden="true" />
      {ready && (
        <button
          className="sculpture-control"
          onClick={() => {
            paused.current = !paused.current;
            setPaused(paused.current);
            wake.current();
          }}
          aria-label={t(
            isPaused ? "product.playMotion" : "product.pauseMotion",
          )}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
            {isPaused ? (
              <path d="m5 3 8 5-8 5z" fill="currentColor" />
            ) : (
              <path d="M5 3v10M11 3v10" stroke="currentColor" strokeWidth="2" />
            )}
          </svg>
        </button>
      )}
    </div>
  );
}
