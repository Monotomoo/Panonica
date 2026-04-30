import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useConfigStore } from '@/store/configStore';
import { toneNow } from '@/lib/toneOfDay';

/**
 * Kopanica-Beravci in 3D · ambient background for the Hero route.
 *
 * Deliberately cinematic and low-detail — more diorama than simulation.
 * Plays on a gentle orbit-cam loop; panels + sheep scale with the
 * configurator state, so as Ivan (or AI Assist) tunes capacity, the scene
 * literally grows under him.
 *
 * Design choices:
 *   · Flat plane with ≤0.5m micro-undulation · Posavina floodplain accurate
 *     (real site elevation range 86–91m, <1% slope · no hills, no bowl)
 *   · Panel rows as instanced meshes · 256 max for perf
 *   · Sheep as tiny low-poly groups · subtle wander animation
 *   · Sun as a directional light colored by toneOfDay · sync with /land sun
 *   · Fog density scales with time-of-day atmosphere
 *
 * This component is entirely optional — failing to load Three.js doesn't
 * break the Hero (existing 2D ParcelMap remains).
 */
export function HeroScene3D({ active = true, className }: { active?: boolean; className?: string }) {
  const config = useConfigStore();
  const tone = toneNow();

  // Force a resize tick after mount · R3F's ResizeObserver sometimes
  // misses the initial layout when mounted inside absolute/inset-0 + lazy.
  useEffect(() => {
    let mounted = true;
    const fire = () => {
      if (!mounted) return;
      window.dispatchEvent(new Event('resize'));
    };
    fire();
    const t1 = setTimeout(fire, 80);
    const t2 = setTimeout(fire, 400);
    return () => {
      mounted = false;
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div
      className={className}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <Canvas
        shadows={false}
        dpr={[1, 1.75]}
        camera={{ position: [24, 14, 24], fov: 46, near: 0.5, far: 220 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <color attach="background" args={[new THREE.Color(`hsl(${tone.hue}, 30%, 6%)`)]} />
        <fog attach="fog" args={[new THREE.Color(`hsl(${tone.hue}, 22%, 7%)`), 45, 130]} />

        <ambientLight intensity={0.45} color={new THREE.Color(`hsl(${tone.hue}, 50%, 70%)`)} />
        <directionalLight
          position={[Math.cos(tone.warmth * Math.PI) * 30, 22 + tone.warmth * 10, 30]}
          intensity={tone.warmth * 0.8 + 0.3}
          color={new THREE.Color(`hsl(${tone.hue}, 70%, 70%)`)}
        />

        <Suspense fallback={null}>
          <Terrain />
          <PanelField capacityMW={config.capacityMW} tracking={config.tracking} gcr={config.gcr} rowSpacing={config.rowSpacing} panelHeight={config.panelHeight} underPanel={config.underPanel} />
          {config.underPanel !== 'none' && <Flock count={config.capacityMW * 2} />}
          <Sun warmth={tone.warmth} hue={tone.hue} />
          <HorizonRing />
          <OrbitCam enabled={active} />
        </Suspense>
      </Canvas>
    </div>
  );
}

/* =============================== TERRAIN =============================== */

function Terrain() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(160, 160, 80, 80);
    // Posavina floodplain · <1% slope · 86–91m elevation range (5m delta).
    // Micro-undulation only · keeps surface visually "not a perfect sheet"
    // without lying about topology. No bowl, no hills.
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const micro =
        Math.sin(x * 0.28) * 0.06 +
        Math.cos(y * 0.23) * 0.05 +
        Math.sin((x + y) * 0.14) * 0.04;
      pos.setZ(i, micro);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <meshStandardMaterial
        color={new THREE.Color('hsl(40, 30%, 12%)')}
        roughness={0.95}
        metalness={0}
        flatShading
      />
    </mesh>
  );
}

/* ============================= PANEL FIELD ============================= */

interface PanelFieldProps {
  capacityMW: number;
  tracking: 'fixed' | '1-axis' | '2-axis';
  gcr: number;
  rowSpacing: number;
  panelHeight: number;
  underPanel: 'none' | 'sheep' | 'soy' | 'herbs';
}

function PanelField({ capacityMW, tracking, gcr, rowSpacing, panelHeight, underPanel }: PanelFieldProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Scale panel count by capacity · cap at 256 for perf
  const count = Math.min(256, Math.max(32, Math.round(capacityMW * 6)));
  const rows = Math.round(Math.sqrt(count));
  const cols = Math.round(count / rows);

  const tempObject = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const tiltBase = -Math.PI / 7; // fixed ~25°
    const tiltDelta =
      tracking === '1-axis' ? Math.sin(t * 0.18) * 0.45 : tracking === '2-axis' ? Math.sin(t * 0.18) * 0.6 : 0;

    let idx = 0;
    const gap = 2.2 * (rowSpacing / 8.5);
    const density = Math.max(0.9, gcr * 4);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (idx >= count) break;
        const x = (c - cols / 2) * gap;
        const z = (r - rows / 2) * gap * density;
        const y = panelHeight * 0.3;
        tempObject.position.set(x, y, z);
        tempObject.rotation.set(tiltBase + tiltDelta, 0, 0);
        tempObject.scale.setScalar(1);
        tempObject.updateMatrix();
        meshRef.current.setMatrixAt(idx, tempObject.matrix);
        idx++;
      }
    }
    meshRef.current.count = idx;
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Color by under-panel
  const panelColor =
    underPanel === 'sheep' ? 'hsl(200, 70%, 48%)' :
    underPanel === 'soy' ? 'hsl(180, 60%, 50%)' :
    underPanel === 'herbs' ? 'hsl(240, 65%, 58%)' :
    'hsl(210, 75%, 52%)';

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 256]}>
      <boxGeometry args={[1.6, 0.08, 0.9]} />
      <meshStandardMaterial color={panelColor} roughness={0.25} metalness={0.4} emissive={panelColor} emissiveIntensity={0.18} />
    </instancedMesh>
  );
}

/* ================================ FLOCK ================================ */

function Flock({ count }: { count: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const actualCount = Math.min(80, Math.max(12, Math.round(count / 3)));

  const seeds = useMemo(
    () =>
      Array.from({ length: actualCount }, (_, i) => ({
        baseX: (Math.random() - 0.5) * 40,
        baseZ: (Math.random() - 0.5) * 40,
        speed: 0.3 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
      })),
    [actualCount],
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((sheep, i) => {
      const s = seeds[i];
      if (!s) return;
      sheep.position.x = s.baseX + Math.sin(t * s.speed + s.phase) * 2.5;
      sheep.position.z = s.baseZ + Math.cos(t * s.speed * 0.7 + s.phase) * 2.5;
    });
  });

  return (
    <group ref={groupRef}>
      {seeds.map((_, i) => (
        <mesh key={i} position={[seeds[i].baseX, 0.25, seeds[i].baseZ]}>
          <sphereGeometry args={[0.32, 8, 6]} />
          <meshStandardMaterial color="#fafaf7" roughness={0.9} emissive="#fafaf7" emissiveIntensity={0.1} />
        </mesh>
      ))}
    </group>
  );
}

/* ================================= SUN ================================= */

function Sun({ warmth, hue }: { warmth: number; hue: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const progress = warmth;
    const angle = progress * Math.PI;
    ref.current.position.set(Math.cos(angle) * 60 + Math.sin(t * 0.05) * 2, 12 + progress * 18, Math.sin(angle) * 60 - 30);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2.4, 24, 18]} />
      <meshBasicMaterial color={new THREE.Color(`hsl(${hue}, 95%, 70%)`)} />
    </mesh>
  );
}

/* ============================ HORIZON RING ============================ */

function HorizonRing() {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <ringGeometry args={[28, 29, 64]} />
      <meshBasicMaterial color="#7C5CFF" transparent opacity={0.18} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ============================== ORBIT CAM ============================== */

function OrbitCam({ enabled }: { enabled: boolean }) {
  const camRef = useRef<any>(null);
  useFrame(({ camera, clock }) => {
    if (!enabled) return;
    const t = clock.getElapsedTime() * 0.06;
    const r = 28;
    camera.position.x = Math.cos(t) * r;
    camera.position.z = Math.sin(t) * r;
    camera.position.y = 8 + Math.sin(t * 0.4) * 3;
    camera.lookAt(0, 2, 0);
  });
  return null;
}
