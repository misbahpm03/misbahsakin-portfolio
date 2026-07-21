import * as React from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  ContactShadows,
  Edges,
  Html,
  OrbitControls,
  Text,
  useDetectGPU,
  useTexture,
} from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { NAV_LABEL, SECTION_ORDER, type SectionId } from './content';

/** troika (drei's Text) cannot read woff2 — this is the self-hosted TTF. */
const FONT_MONO = '/fonts/dmmono-500.ttf';

/* ------------------------------------------------------------------ *
 * Palette. The room is drawn, not photographed: matte surfaces, and a
 * chalk outline on every edge so objects read as marker strokes in 3D.
 * ------------------------------------------------------------------ */
const C = {
  wall: '#131C22',
  wallBack: '#0F171D',
  floor: '#0D141A',
  chalk: '#EDE9E0',
  amber: '#F0B457',
  wood: '#2A2119',
  board: '#D9D3C4',
  cork: '#6B4E32',
  flare: '#FF6B5B',
  cool: '#6FD3E0',
  night: '#1B4257',
};

/** Where the camera sits, and what it looks at, for every focusable object. */
type Pose = { pos: [number, number, number]; target: [number, number, number] };

const HOME: Pose = { pos: [0.55, 1.66, 4.75], target: [0.45, 1.44, -2.0] };
/** Portrait screens get their own framing — see the note in Rig. */
const HOME_PORTRAIT: Pose = { pos: [-0.15, 2.7, 4.5], target: [-0.15, 1.42, -2.1] };

const POSES: Record<SectionId, Pose> = {
  whiteboard: { pos: [-1.0, 2.0, 0.5], target: [-1.0, 2.0, -2.9] },
  corkboard: { pos: [2.85, 2.25, 0.8], target: [2.85, 2.25, -2.9] },
  pegboard: { pos: [2.85, 1.1, 1.0], target: [2.85, 1.02, -2.9] },
  shelf: { pos: [-3.5, 1.38, 0.1], target: [-3.5, 1.28, -2.85] },
  bookcase: { pos: [4.3, 1.25, -0.45], target: [4.3, 1.05, -2.7] },
  camera: { pos: [-3.3, 1.02, -1.15], target: [-3.3, 0.7, -2.35] },
  polaroids: { pos: [1.05, 2.2, 0.35], target: [1.05, 2.2, -2.9] },
  laptop: { pos: [-0.35, 1.24, 0.55], target: [-0.35, 1.02, -1.02] },
  phone: { pos: [0.9, 1.1, 0.35], target: [0.9, 0.79, -0.7] },
};

/* ------------------------------------------------------------------ *
 * Building blocks
 * ------------------------------------------------------------------ */

type BoxProps = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number, number];
  color?: string;
  edge?: string | false;
  emissive?: string;
  emissiveIntensity?: number;
  roughness?: number;
  metalness?: number;
  shadow?: boolean;
};

/**
 * A box with a chalk outline — the unit the whole room is drawn from.
 *
 * Deliberately NOT bevelled. A RoundedBox has no hard edges left for
 * <Edges> to find, so the outline shatters into floating dashes across every
 * bevel facet. The outline is the whole look; the bevel was the thing that
 * had to go.
 */
function Box({
  position,
  rotation,
  size,
  color = C.wood,
  edge = C.chalk,
  emissive,
  emissiveIntensity = 1,
  roughness = 0.9,
  metalness = 0,
  shadow = false,
}: BoxProps) {
  return (
    <mesh position={position} rotation={rotation} castShadow={shadow} receiveShadow={shadow}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        emissive={emissive ?? '#000000'}
        emissiveIntensity={emissive ? emissiveIntensity : 0}
      />
      {edge && <Edges threshold={15} color={edge} />}
    </mesh>
  );
}

function Cylinder({
  position,
  rotation,
  size,
  color = C.wood,
  edge = C.chalk,
  metalness = 0,
  roughness = 0.9,
  shadow = false,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  /** [radiusTop, radiusBottom, height, segments] */
  size: [number, number, number, number];
  color?: string;
  edge?: string | false;
  metalness?: number;
  roughness?: number;
  shadow?: boolean;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow={shadow} receiveShadow={shadow}>
      <cylinderGeometry args={size} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
      {edge && <Edges threshold={20} color={edge} />}
    </mesh>
  );
}

/* ------------------------------------------------------------------ *
 * Hotspot — anything clickable in the room
 * ------------------------------------------------------------------ */

function Hotspot({
  id,
  labelAt,
  active,
  onOpen,
  children,
}: {
  id: SectionId;
  /** where the floating label hangs, in world space */
  labelAt: [number, number, number];
  active: SectionId | null;
  onOpen: (id: SectionId) => void;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = React.useState(false);
  const group = React.useRef<THREE.Group>(null);
  const lit = hovered || active === id;

  // Walk the subtree and warm every outline. Cheaper than threading a
  // colour prop through every primitive, and it catches nested meshes.
  React.useEffect(() => {
    const g = group.current;
    if (!g) return;
    g.traverse((o) => {
      const line = o as THREE.LineSegments;
      if (!(line as unknown as { isLineSegments?: boolean }).isLineSegments) return;
      const mat = line.material as THREE.LineBasicMaterial;
      if (!mat?.color) return;
      mat.color.set(lit ? C.amber : C.chalk);
    });
  }, [lit]);

  React.useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);

  return (
    <group
      ref={group}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onOpen(id);
      }}
    >
      {children}
      {!active && (
        <Html position={labelAt} center zIndexRange={[20, 0]} wrapperClass="room-label-wrap">
          <span className={`room-label${lit ? ' is-lit' : ''}`}>{NAV_LABEL[id]}</span>
        </Html>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * The room
 * ------------------------------------------------------------------ */

const WALL_Z = -3;

function Shell() {
  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color={C.floor} roughness={1} />
      </mesh>
      {/* back wall */}
      <mesh position={[0, 2, WALL_Z - 0.05]} receiveShadow>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial color={C.wallBack} roughness={1} />
      </mesh>
      {/* left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-5.2, 2, 0]}>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color={C.wall} roughness={1} />
      </mesh>
      {/* right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[5.2, 2, 0]}>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color={C.wall} roughness={1} />
      </mesh>
      {/* skirting, drawn as a line the way the rest of the room is */}
      <Box position={[0, 0.06, WALL_Z]} size={[10.4, 0.12, 0.06]} color={C.wall} />
      {/* rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.2, 0.012, 0.35]}>
        <circleGeometry args={[2.9, 44]} />
        <meshStandardMaterial color="#2E211A" roughness={1} />
      </mesh>
    </group>
  );
}

/** Night city outside, so the room is somewhere and not nowhere. */
function Window() {
  const buildings = React.useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        x: -0.95 + i * 0.24,
        h: 0.25 + ((i * 37) % 11) / 16,
      })),
    [],
  );
  return (
    <group position={[-3.5, 2.35, WALL_Z + 0.04]}>
      <mesh>
        <planeGeometry args={[1.8, 1.15]} />
        <meshStandardMaterial color={C.night} emissive={C.night} emissiveIntensity={0.95} />
      </mesh>
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x * 0.74, -0.575 + (b.h * 0.7) / 2, 0.02]}>
          <planeGeometry args={[0.14, b.h * 0.7]} />
          <meshStandardMaterial color="#050B0E" />
        </mesh>
      ))}
      <mesh position={[0.52, 0.3, 0.03]}>
        <circleGeometry args={[0.14, 20]} />
        <meshStandardMaterial color="#F5E4B8" emissive="#F5E4B8" emissiveIntensity={1.8} />
      </mesh>
      {/* Frame as four bars — a solid panel here would board the window up. */}
      <Box position={[0, 0.615, 0.03]} size={[1.94, 0.09, 0.07]} color={C.wall} />
      <Box position={[0, -0.615, 0.03]} size={[1.94, 0.09, 0.07]} color={C.wall} />
      <Box position={[-0.925, 0, 0.03]} size={[0.09, 1.32, 0.07]} color={C.wall} />
      <Box position={[0.925, 0, 0.03]} size={[0.09, 1.32, 0.07]} color={C.wall} />
      {/* mullions */}
      <Box position={[0, 0, 0.03]} size={[0.05, 1.15, 0.05]} color={C.wall} />
      <Box position={[0, 0, 0.03]} size={[1.8, 0.05, 0.05]} color={C.wall} />
      {/* the city spills a little cold light back into the room */}
      <pointLight position={[0, -0.3, 1.1]} intensity={4.2} distance={7} decay={2} color="#79B0D2" />
    </group>
  );
}

/** Ink on a light surface. Shared by every label written on an object. */
function Ink({
  children,
  position,
  size = 0.05,
  color = '#1E2A31',
  anchorX = 'left',
  maxWidth,
}: {
  children: string;
  position: [number, number, number];
  size?: number;
  color?: string;
  anchorX?: 'left' | 'center' | 'right';
  maxWidth?: number;
}) {
  return (
    <Text
      font={FONT_MONO}
      position={position}
      fontSize={size}
      color={color}
      anchorX={anchorX}
      anchorY="middle"
      maxWidth={maxWidth}
      letterSpacing={0.04}
      // Text is decoration on an object that is already clickable; letting it
      // raycast separately only creates dead spots in the hotspot.
      raycast={() => null}
    >
      {children}
    </Text>
  );
}

function Whiteboard() {
  // Swimlanes: one bar per role, length by tenure. The wall says something
  // true about the content before you ever click it — now in words, not just
  // coloured bars.
  const lanes = [
    { w: 2.3, c: C.amber, y: 0.42, label: 'RISEUP LABS · PM B2B' },
    { w: 1.75, c: C.cool, y: 0.12, label: 'SHEBA · PRODUCT MANAGER' },
    { w: 0.85, c: C.cool, y: -0.18, label: 'SHEBA · APM' },
    { w: 0.5, c: C.flare, y: -0.48, label: 'RISEUP · QA' },
  ];
  return (
    <group position={[-1.0, 2.0, WALL_Z + 0.04]}>
      <Box
        size={[2.6, 1.5, 0.07]}
        color={C.board}
        roughness={1}
        emissive={C.board}
        emissiveIntensity={0.3}
      />
      <Ink position={[-1.12, 0.64, 0.05]} size={0.088}>
        ROADMAP
      </Ink>
      <Ink position={[-1.12, 0.545, 0.05]} size={0.04} color="#5C6C74">
        WHAT I OWNED, AND FOR HOW LONG
      </Ink>

      {lanes.map((l, i) => (
        <group key={i}>
          <Ink position={[-1.12, l.y * 0.82 + 0.085, 0.05]} size={0.045}>
            {l.label}
          </Ink>
          <mesh position={[-1.12 + (l.w * 0.86) / 2, l.y * 0.82, 0.05]}>
            <planeGeometry args={[l.w * 0.86, 0.075]} />
            <meshStandardMaterial color={l.c} emissive={l.c} emissiveIntensity={0.45} />
          </mesh>
        </group>
      ))}

      {/* time axis, so the bar lengths mean something */}
      <mesh position={[-0.1, -0.56, 0.05]}>
        <planeGeometry args={[2.04, 0.006]} />
        <meshStandardMaterial color="#8A959B" />
      </mesh>
      <Ink position={[-1.12, -0.63, 0.05]} size={0.038} color="#5C6C74">
        2023
      </Ink>
      <Ink position={[0.9, -0.63, 0.05]} size={0.038} color="#5C6C74" anchorX="right">
        2026
      </Ink>

      {/* marker tray */}
      <Box position={[0, -0.8, 0.06]} size={[0.8, 0.05, 0.12]} color={C.wall} />
    </group>
  );
}

function Corkboard() {
  // One note per real project, named. A wall of blank colour said nothing.
  const notes = [
    { x: -0.66, y: 0.25, c: C.amber, r: -0.05, name: 'SHEBA PAY', sub: '10 Cr+/day' },
    { x: 0.0, y: 0.28, c: C.cool, r: 0.03, name: 'SHEBA MANAGER', sub: '10k users' },
    { x: 0.66, y: 0.24, c: C.flare, r: -0.02, name: 'GRAPHOSKOP', sub: '12 modules' },
    { x: -0.66, y: -0.26, c: C.cool, r: 0.04, name: 'LOAN ENGINE', sub: '15 workflows' },
    { x: 0.0, y: -0.28, c: C.amber, r: -0.03, name: 'PMOPS', sub: 'AI workspace' },
    { x: 0.66, y: -0.25, c: C.board, r: 0.02, name: 'MIDNIGHT ARCADE', sub: '30 levels' },
  ];
  return (
    <group position={[2.85, 2.25, WALL_Z + 0.04]}>
      <Box size={[2.0, 1.15, 0.07]} color={C.cork} roughness={1} />
      {notes.map((n, i) => (
        <group key={i} position={[n.x, n.y, 0.05]} rotation={[0, 0, n.r]}>
          <mesh>
            <planeGeometry args={[0.5, 0.38]} />
            <meshStandardMaterial color={n.c} emissive={n.c} emissiveIntensity={0.3} />
          </mesh>
          <Ink position={[0, 0.02, 0.01]} size={0.038} anchorX="center" maxWidth={0.44}>
            {n.name}
          </Ink>
          <Ink position={[0, -0.11, 0.01]} size={0.03} color="#4A5A62" anchorX="center">
            {n.sub}
          </Ink>
          <mesh position={[0, 0.14, 0.01]}>
            <circleGeometry args={[0.019, 12]} />
            <meshStandardMaterial color="#1A1206" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Pegboard() {
  const holes = React.useMemo(() => {
    const out: [number, number][] = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) out.push([-0.72 + c * 0.18, 0.28 - r * 0.19]);
    return out;
  }, []);
  const tools: { x: number; y: number; w: number; h: number; c: string }[] = [
    { x: -0.62, y: 0.16, w: 0.1, h: 0.42, c: '#9AA5AC' },
    { x: -0.3, y: 0.2, w: 0.28, h: 0.09, c: '#9AA5AC' },
    { x: -0.3, y: -0.02, w: 0.06, h: 0.34, c: '#5C4633' },
    { x: 0.06, y: 0.1, w: 0.09, h: 0.5, c: '#9AA5AC' },
    { x: 0.44, y: 0.16, w: 0.34, h: 0.08, c: '#9AA5AC' },
    { x: 0.44, y: -0.12, w: 0.3, h: 0.24, c: '#6B7780' },
    { x: 0.78, y: 0.06, w: 0.08, h: 0.44, c: '#5C4633' },
    { x: -0.62, y: -0.2, w: 0.26, h: 0.1, c: '#6B7780' },
    { x: 0.06, y: -0.18, w: 0.2, h: 0.2, c: '#9AA5AC' },
  ];
  return (
    <group position={[2.85, 1.02, WALL_Z + 0.04]} scale={0.9}>
      <Box size={[2.0, 1.0, 0.07]} color="#37444C" roughness={0.85} />
      <Ink position={[-0.86, 0.42, 0.05]} size={0.055} color="#9FB0B8">
        TOOLS OF THE TRADE
      </Ink>
      {holes.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.045]}>
          <circleGeometry args={[0.014, 8]} />
          <meshStandardMaterial color="#0D1418" />
        </mesh>
      ))}
      {tools.map((t, i) => (
        <mesh key={i} position={[t.x, t.y, 0.06]}>
          <planeGeometry args={[t.w, t.h]} />
          <meshStandardMaterial color={t.c} emissive={t.c} emissiveIntensity={0.28} roughness={0.6} metalness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

function Shelf() {
  return (
    <group position={[-3.5, 1.28, WALL_Z + 0.24]}>
      {/* plank + brackets */}
      <Box size={[1.8, 0.06, 0.42]} color="#3A2E22" />
      <Box position={[-0.7, -0.11, 0]} size={[0.05, 0.16, 0.3]} color={C.wall} />
      <Box position={[0.7, -0.11, 0]} size={[0.05, 0.16, 0.3]} color={C.wall} />

      {/* trophy */}
      <group position={[-0.52, 0.03, 0]}>
        <Cylinder position={[0, 0.19, 0]} size={[0.11, 0.07, 0.2, 12]} color={C.amber} roughness={0.22} metalness={0.85} shadow />
        <Cylinder position={[0, 0.06, 0]} size={[0.022, 0.022, 0.08, 8]} color={C.amber} roughness={0.22} metalness={0.85} />
        <Box position={[0, 0.02, 0]} size={[0.16, 0.04, 0.14]} color="#5B4620" />
      </group>

      {/* books */}
      {[
        { x: 0.02, h: 0.3, c: '#B8503C' },
        { x: 0.09, h: 0.34, c: '#3F7D9E' },
        { x: 0.16, h: 0.27, c: '#6A8F4E' },
        { x: 0.23, h: 0.32, c: '#8A5BA8' },
      ].map((b, i) => (
        <Box key={i} position={[b.x, 0.03 + b.h / 2, 0]} size={[0.055, b.h, 0.26]} color={b.c} />
      ))}

      {/* framed certificate */}
      <Box position={[0.6, 0.19, -0.05]} size={[0.34, 0.26, 0.03]} color={C.board} />
    </group>
  );
}

/* ---- new objects ------------------------------------------------- */

/** Education & certifications. Fills the empty right corner with the
 *  vertical mass the composition was missing. */
function Bookcase() {
  const shelves = [0.42, 0.94, 1.46];
  const books = [
    { y: 0.42, items: [['#B8503C', 0.3], ['#3F7D9E', 0.34], ['#6A8F4E', 0.27], ['#8A5BA8', 0.32], ['#C97B3E', 0.29]] },
    { y: 0.94, items: [['#3F7D9E', 0.31], ['#B8503C', 0.26], ['#6A8F4E', 0.33], ['#D6C9A8', 0.28]] },
    { y: 1.46, items: [['#8A5BA8', 0.28], ['#C97B3E', 0.32], ['#3F7D9E', 0.3]] },
  ] as const;

  return (
    <group position={[4.3, 0, WALL_Z + 0.32]}>
      {/* carcass */}
      <Box position={[-0.46, 1.0, 0]} size={[0.05, 2.0, 0.44]} color="#3A2E22" shadow />
      <Box position={[0.46, 1.0, 0]} size={[0.05, 2.0, 0.44]} color="#3A2E22" shadow />
      <Box position={[0, 0.02, 0]} size={[0.97, 0.05, 0.44]} color="#3A2E22" shadow />
      <Box position={[0, 1.99, 0]} size={[0.97, 0.05, 0.44]} color="#3A2E22" shadow />
      <Box position={[0, 1.0, -0.21]} size={[0.97, 2.0, 0.03]} color="#241C15" />
      {shelves.map((y) => (
        <Box key={y} position={[0, y, 0]} size={[0.9, 0.04, 0.42]} color="#3A2E22" shadow />
      ))}

      {books.map((row) =>
        row.items.map(([c, h], i) => (
          <Box
            key={`${row.y}-${i}`}
            position={[-0.38 + i * 0.075, row.y + 0.02 + (h as number) / 2, 0]}
            rotation={[0, 0, i === row.items.length - 1 ? 0.14 : 0]}
            size={[0.06, h as number, 0.28]}
            color={c as string}
            shadow
          />
        )),
      )}

      {/* graduation cap, top shelf */}
      <group position={[0.24, 1.52, 0.02]}>
        <Cylinder position={[0, 0.03, 0]} size={[0.09, 0.1, 0.07, 12]} color="#1C242A" shadow />
        <Box position={[0, 0.08, 0]} rotation={[0, 0.5, 0]} size={[0.28, 0.015, 0.28]} color="#151C21" shadow />
        <Cylinder position={[0.09, 0.045, 0.09]} size={[0.006, 0.006, 0.09, 6]} color={C.amber} edge={false} />
      </group>

      {/* framed degree, leaning on the middle shelf */}
      <Box
        position={[0.22, 1.14, 0.04]}
        rotation={[0, 0, 0.04]}
        size={[0.3, 0.36, 0.025]}
        color={C.board}
        shadow
      />
      <Box position={[0.22, 1.14, 0.056]} size={[0.24, 0.29, 0.005]} color="#C9BFA6" edge={false} />
    </group>
  );
}

/** Creative & film — the other career, sitting in its own corner. */
function CameraTable() {
  return (
    <group position={[-3.3, 0, -2.35]}>
      {/* side table */}
      <Box position={[0, 0.6, 0]} size={[0.86, 0.05, 0.5]} color="#33291E" shadow />
      <Box position={[-0.37, 0.3, -0.19]} size={[0.05, 0.6, 0.05]} color={C.wood} shadow />
      <Box position={[0.37, 0.3, -0.19]} size={[0.05, 0.6, 0.05]} color={C.wood} shadow />
      <Box position={[-0.37, 0.3, 0.19]} size={[0.05, 0.6, 0.05]} color={C.wood} shadow />
      <Box position={[0.37, 0.3, 0.19]} size={[0.05, 0.6, 0.05]} color={C.wood} shadow />

      {/* camera body + lens, the one place metal belongs */}
      <group position={[-0.13, 0.72, 0.02]} rotation={[0, 0.45, 0]}>
        <Box size={[0.3, 0.19, 0.16]} color="#232A2F" roughness={0.45} metalness={0.55} shadow />
        <Box position={[0, 0.115, 0]} size={[0.13, 0.05, 0.1]} color="#232A2F" roughness={0.45} metalness={0.55} />
        <Cylinder
          position={[0.02, 0.0, 0.15]}
          rotation={[Math.PI / 2, 0, 0]}
          size={[0.078, 0.085, 0.16, 20]}
          color="#12181C"
          roughness={0.3}
          metalness={0.7}
          shadow
        />
        <Cylinder
          position={[0.02, 0.0, 0.232]}
          rotation={[Math.PI / 2, 0, 0]}
          size={[0.056, 0.056, 0.01, 20]}
          color="#7FC8DA"
          edge={false}
          roughness={0.05}
          metalness={0.2}
        />
        <Box position={[-0.1, 0.09, -0.07]} size={[0.03, 0.02, 0.02]} color={C.flare} edge={false} />
      </group>

      {/* film reel, lying flat */}
      <group position={[0.26, 0.64, -0.04]}>
        <Cylinder position={[0, 0.015, 0]} size={[0.16, 0.16, 0.025, 24]} color="#2C3439" roughness={0.4} metalness={0.5} shadow />
        <Cylinder position={[0, 0.032, 0]} size={[0.035, 0.035, 0.02, 12]} color="#151B1F" edge={false} />
        {[0, 1, 2, 3, 4].map((i) => (
          <Cylinder
            key={i}
            position={[Math.cos((i / 5) * Math.PI * 2) * 0.1, 0.033, Math.sin((i / 5) * Math.PI * 2) * 0.1]}
            size={[0.026, 0.026, 0.006, 10]}
            color="#0E1418"
            edge={false}
          />
        ))}
      </group>

      {/* a strip of film curling off the table edge */}
      <Box position={[0.3, 0.628, 0.2]} rotation={[0, 0.2, 0]} size={[0.09, 0.004, 0.3]} color="#4A2E22" />
    </group>
  );
}

/** Community & organising — pinned, not framed. These are snapshots. */
function Polaroids() {
  const shots = [
    { x: -0.46, y: 0.24, r: -0.07, c: '#7FA8B8', cap: 'HULT PRIZE' },
    { x: 0.0, y: 0.3, r: 0.05, c: '#C89A6A', cap: 'IEEE' },
    { x: 0.46, y: 0.23, r: -0.04, c: '#89A87E', cap: 'BANGLALINK' },
    { x: -0.44, y: -0.28, r: 0.06, c: '#B08398', cap: 'JOYODDHONEY' },
    { x: 0.02, y: -0.32, r: -0.05, c: '#8E96C0', cap: 'PITHA UTSHAB' },
    { x: 0.47, y: -0.27, r: 0.03, c: '#C0A05E', cap: 'SPRIHA' },
  ];
  return (
    <group position={[1.05, 2.2, WALL_Z + 0.04]}>
      {/* string the photos hang from */}
      <Box position={[0, 0.52, 0]} size={[1.34, 0.008, 0.008]} color="#6B6257" edge={false} />
      {shots.map((s, i) => (
        <group key={i} position={[s.x, s.y, 0.01]} rotation={[0, 0, s.r]}>
          {/* polaroid: white border, image inset high, caption space below */}
          <Box size={[0.36, 0.42, 0.012]} color="#EFEAE0" roughness={0.95} shadow />
          <mesh position={[0, 0.045, 0.008]}>
            <planeGeometry args={[0.3, 0.28]} />
            <meshStandardMaterial color={s.c} roughness={0.9} />
          </mesh>
          <Ink position={[0, -0.155, 0.01]} size={0.028} anchorX="center" maxWidth={0.32}>
            {s.cap}
          </Ink>
          <Box position={[0, 0.23, 0.012]} size={[0.035, 0.035, 0.012]} color={C.flare} edge={false} />
        </group>
      ))}
    </group>
  );
}

/** The one photograph in the room. Uses the profile image the old site shipped. */
function FramedPhoto() {
  const map = useTexture('/profile.jpg');
  return (
    <group position={[-1.36, 0.79, -1.16]} rotation={[0, 0.42, 0]}>
      <Box position={[0, 0.16, 0]} size={[0.26, 0.32, 0.02]} color="#3A2E22" shadow />
      <mesh position={[0, 0.17, 0.012]}>
        <planeGeometry args={[0.2, 0.24]} />
        <meshStandardMaterial map={map} roughness={0.85} toneMapped={false} />
      </mesh>
      {/* little easel leg */}
      <Box position={[0, 0.09, -0.05]} rotation={[0.34, 0, 0]} size={[0.03, 0.2, 0.012]} color="#3A2E22" />
    </group>
  );
}

function Desk() {
  return (
    <group>
      <Box position={[0, 0.75, -0.9]} size={[3.2, 0.08, 1.2]} color="#33291E" shadow />
      <Box position={[-1.5, 0.37, -0.9]} size={[0.09, 0.75, 1.1]} color={C.wood} shadow />
      <Box position={[1.5, 0.37, -0.9]} size={[0.09, 0.75, 1.1]} color={C.wood} shadow />
      <Box position={[0, 0.5, -1.38]} size={[3.0, 0.06, 0.06]} color={C.wood} shadow />
      {/* papers */}
      <Box position={[-1.15, 0.8, -0.75]} rotation={[0, 0.22, 0]} size={[0.42, 0.012, 0.3]} color={C.board} />
      <Box position={[-1.1, 0.815, -0.72]} rotation={[0, -0.1, 0]} size={[0.42, 0.012, 0.3]} color={C.board} />
      {/* mug */}
      <Cylinder position={[0.42, 0.85, -0.6]} size={[0.075, 0.065, 0.13, 14]} color="#D8D2C6" shadow />

      {/* keyboard and mouse, in front of the laptop where hands would be */}
      <group position={[-0.35, 0.795, -0.42]}>
        <Box size={[0.56, 0.018, 0.17]} color="#20272C" shadow />
        {Array.from({ length: 4 }, (_, r) =>
          Array.from({ length: 13 }, (_, c) => (
            <Box
              key={`${r}-${c}`}
              position={[-0.25 + c * 0.0417, 0.013, -0.055 + r * 0.037]}
              size={[0.032, 0.006, 0.026]}
              color="#39434A"
              edge={false}
            />
          )),
        )}
      </group>
      <Box position={[0.14, 0.807, -0.42]} size={[0.075, 0.026, 0.115]} color="#20272C" shadow />

      {/* cable, falling off the back of the desk */}
      <Box position={[1.02, 0.62, -1.44]} size={[0.012, 0.28, 0.012]} color="#171D21" edge={false} />
      <Box position={[1.02, 0.48, -1.5]} size={[0.012, 0.012, 0.14]} color="#171D21" edge={false} />

      {/* stacked books, lying flat */}
      <Box position={[1.16, 0.815, -1.12]} rotation={[0, 0.12, 0]} size={[0.3, 0.04, 0.23]} color="#3F5E77" shadow />
      <Box position={[1.16, 0.852, -1.1]} rotation={[0, -0.06, 0]} size={[0.29, 0.035, 0.22]} color="#7A4A54" shadow />
    </group>
  );
}

/** The room's only warm light, and the reason it feels like a room. */
function Lamp({ coarse }: { coarse: boolean }) {
  return (
    <group position={[1.3, 0.79, -1.25]}>
      <Cylinder position={[0, 0.02, 0]} size={[0.14, 0.16, 0.04, 16]} color="#2E3940" shadow />
      <Box position={[0, 0.28, 0]} size={[0.035, 0.52, 0.035]} color="#2E3940" shadow />
      <mesh position={[0, 0.56, 0.02]}>
        <coneGeometry args={[0.2, 0.24, 18, 1, true]} />
        <meshStandardMaterial
          color="#E8C98A"
          emissive={C.amber}
          emissiveIntensity={0.85}
          side={THREE.DoubleSide}
          roughness={0.7}
        />
      </mesh>
      {/* the bulb itself, so bloom has something small and hot to bleed from */}
      <mesh position={[0, 0.48, 0.02]}>
        <sphereGeometry args={[0.045, 12, 10]} />
        <meshStandardMaterial color="#FFF0CE" emissive="#FFD79A" emissiveIntensity={3.2} />
      </mesh>
      <pointLight
        position={[0, 0.44, 0.06]}
        intensity={5.2}
        distance={7}
        decay={2}
        color="#FFC978"
        castShadow={!coarse}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.004}
        shadow-normalBias={0.02}
      />
    </group>
  );
}

/**
 * Bloom is what makes a night scene look lit rather than merely dark: the lamp
 * bulb, the two screens and the window bleed light instead of stopping at their
 * own polygons. It is also the first thing to cost frames, so weak GPUs and
 * touch devices render the plain scene.
 */
function Glow({ coarse }: { coarse: boolean }) {
  const gpu = useDetectGPU();
  // ?fx=1 / ?fx=0 forces the effect on or off. Headless browsers report a low
  // GPU tier, so without this the screenshot tests could never see bloom at all.
  const forced =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('fx') : null;
  const enabled =
    forced === '1' || (forced !== '0' && !coarse && !gpu.isMobile && (gpu.tier ?? 0) >= 2);
  if (!enabled) return null;
  return (
    <EffectComposer disableNormalPass multisampling={0}>
      <Bloom luminanceThreshold={0.72} luminanceSmoothing={0.28} intensity={0.85} mipmapBlur />
      <Vignette offset={0.32} darkness={0.55} eskil={false} />
    </EffectComposer>
  );
}

function Plant() {
  return (
    <group position={[-4.1, 0, -0.3]}>
      <Cylinder position={[0, 0.22, 0]} size={[0.26, 0.19, 0.44, 14]} color="#7A4A32" />
      <Cylinder position={[0, 0.58, 0]} size={[0.025, 0.03, 0.32, 8]} color="#3E6B42" edge={false} />
      {[
        [0.2, 0.86, 0.34],
        [-0.22, 0.92, -0.3],
        [0.05, 1.05, 0.1],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0.4 * i, i, 0.3]}>
          <sphereGeometry args={[0.24, 8, 6]} />
          <meshStandardMaterial color="#3E6B42" flatShading roughness={1} />
          <Edges threshold={40} color="#5E9463" />
        </mesh>
      ))}
    </group>
  );
}

function Laptop() {
  return (
    <group position={[-0.35, 0.79, -1.0]}>
      <Box position={[0, 0.01, 0.1]} size={[0.62, 0.025, 0.42]} color="#242C31" shadow />
      <group position={[0, 0.22, -0.14]} rotation={[-0.22, 0, 0]}>
        <Box size={[0.62, 0.42, 0.02]} color="#242C31" shadow />
        <mesh position={[0, 0, 0.015]}>
          <planeGeometry args={[0.56, 0.36]} />
          <meshStandardMaterial color="#0E3A44" emissive={C.cool} emissiveIntensity={0.5} />
        </mesh>
        {[0.11, 0.04, -0.03, -0.1].map((y, i) => (
          <mesh key={i} position={[-0.11 + i * 0.02, y, 0.02]}>
            <planeGeometry args={[0.3 - i * 0.05, 0.022]} />
            <meshStandardMaterial color="#BFF2F7" emissive="#BFF2F7" emissiveIntensity={0.35} />
          </mesh>
        ))}
      </group>
      <pointLight position={[0, 0.3, 0.15]} intensity={1.1} distance={2} decay={2} color="#7FE0EC" />
    </group>
  );
}

function Phone() {
  return (
    <group position={[0.9, 0.79, -0.7]} rotation={[0, -0.3, 0]}>
      <Box position={[0, 0.012, 0]} size={[0.16, 0.02, 0.3]} color="#1B2227" shadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.024, 0]}>
        <planeGeometry args={[0.13, 0.26]} />
        <meshStandardMaterial color="#123A2C" emissive="#4FD199" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * Camera rig
 * ------------------------------------------------------------------ */

function Rig({
  focus,
  instant,
  controls,
}: {
  focus: SectionId | null;
  instant: boolean;
  controls: React.MutableRefObject<any>;
}) {
  const { camera, size } = useThree();
  const wantPos = React.useRef(new THREE.Vector3(...HOME.pos));
  const wantTarget = React.useRef(new THREE.Vector3(...HOME.target));
  const flying = React.useRef(false);
  const aspect = size.width / size.height;

  React.useEffect(() => {
    const portrait = aspect < 1;
    // The room is wide and short, so a landscape home pose leaves a portrait
    // screen mostly empty. Looking down the room instead spends the tall frame
    // on wall, desk and floor rather than on void.
    const pose = focus ? POSES[focus] : portrait ? HOME_PORTRAIT : HOME;
    const target = new THREE.Vector3(...pose.target);
    const pos = new THREE.Vector3(...pose.pos);

    // Focus poses are still framed for a wide screen; ease them back a little
    // when the screen is narrow so the subject is not cropped on both sides.
    if (focus) {
      const pull = THREE.MathUtils.clamp(1.5 / aspect, 1, 1.35);
      pos.sub(target).multiplyScalar(pull).add(target);
    }

    wantPos.current.copy(pos);
    wantTarget.current.copy(target);
    flying.current = true;
    if (instant) {
      camera.position.copy(wantPos.current);
      controls.current?.target.copy(wantTarget.current);
      controls.current?.update();
      flying.current = false;
    }
  }, [focus, instant, camera, controls, aspect]);

  useFrame((_, dt) => {
    if (!flying.current || !controls.current) return;
    // Frame-rate independent easing, so a 144Hz screen and a 30fps phone
    // take the same wall-clock time to arrive.
    const k = 1 - Math.pow(0.008, dt);
    camera.position.lerp(wantPos.current, k);
    controls.current.target.lerp(wantTarget.current, k);
    controls.current.update();
    if (camera.position.distanceTo(wantPos.current) < 0.01) {
      camera.position.copy(wantPos.current);
      controls.current.target.copy(wantTarget.current);
      controls.current.update();
      flying.current = false;
    }
  });

  return null;
}

/* ------------------------------------------------------------------ *
 * Scene
 * ------------------------------------------------------------------ */

export function Room({
  active,
  onOpen,
  onDismiss,
  reducedMotion,
}: {
  active: SectionId | null;
  onOpen: (id: SectionId) => void;
  onDismiss: () => void;
  reducedMotion: boolean;
}) {
  const controls = React.useRef<any>(null);
  const isCoarse =
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  return (
    <Canvas
      dpr={isCoarse ? 1 : [1, 1.8]}
      performance={{ min: 0.5 }}
      shadows={isCoarse ? false : 'soft'}
      gl={{ antialias: !isCoarse, powerPreference: 'high-performance' }}
      camera={{ position: HOME.pos, fov: 42, near: 0.1, far: 60 }}
      onPointerMissed={onDismiss}
    >
      <color attach="background" args={['#080D10']} />
      <fog attach="fog" args={['#080D10', 14, 34]} />

      {/* Three lights, no more: room fill, cool window spill, warm lamp. */}
      <ambientLight intensity={0.52} color="#8FA6B4" />
      <directionalLight position={[-5, 3.4, 2.5]} intensity={0.62} color="#7FB6DA" />

      <Shell />
      <Window />
      <Desk />
      <Lamp coarse={isCoarse} />
      <Plant />
      <React.Suspense fallback={null}>
        <FramedPhoto />
      </React.Suspense>

      {/* Grounds the furniture. Without it everything hovers a millimetre
          off the floor, which is the tell that a room is not a room. */}
      {!isCoarse && (
        <ContactShadows
          position={[0, 0.008, -0.6]}
          scale={13}
          resolution={512}
          blur={2.6}
          opacity={0.55}
          far={2.4}
          frames={1}
          color="#000000"
        />
      )}

      <Hotspot id="whiteboard" labelAt={[-1.0, 2.95, -2.9]} active={active} onOpen={onOpen}>
        <Whiteboard />
      </Hotspot>
      <Hotspot id="corkboard" labelAt={[2.85, 2.98, -2.9]} active={active} onOpen={onOpen}>
        <Corkboard />
      </Hotspot>
      <Hotspot id="pegboard" labelAt={[2.85, 0.42, -2.9]} active={active} onOpen={onOpen}>
        <Pegboard />
      </Hotspot>
      <Hotspot id="shelf" labelAt={[-3.5, 0.92, -2.7]} active={active} onOpen={onOpen}>
        <Shelf />
      </Hotspot>
      <Hotspot id="bookcase" labelAt={[4.3, 2.24, -2.7]} active={active} onOpen={onOpen}>
        <Bookcase />
      </Hotspot>
      <Hotspot id="camera" labelAt={[-3.35, 0.08, -1.95]} active={active} onOpen={onOpen}>
        <CameraTable />
      </Hotspot>
      <Hotspot id="polaroids" labelAt={[1.05, 1.5, -2.9]} active={active} onOpen={onOpen}>
        <Polaroids />
      </Hotspot>
      <Hotspot id="laptop" labelAt={[-0.35, 0.62, -0.55]} active={active} onOpen={onOpen}>
        <Laptop />
      </Hotspot>
      <Hotspot id="phone" labelAt={[0.95, 0.62, -0.3]} active={active} onOpen={onOpen}>
        <Phone />
      </Hotspot>

      <Glow coarse={isCoarse} />

      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={1.4}
        maxDistance={16}
        minPolarAngle={Math.PI * 0.16}
        maxPolarAngle={Math.PI * 0.52}
        minAzimuthAngle={-Math.PI * 0.42}
        maxAzimuthAngle={Math.PI * 0.42}
        target={HOME.target}
      />
      <Rig focus={active} instant={reducedMotion} controls={controls} />
    </Canvas>
  );
}

export { SECTION_ORDER };
