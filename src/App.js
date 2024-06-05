import React, { useRef ,useState,useEffect, useMemo, useCallback} from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { Html,OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';
import objectData from './data/objectData';



import Bpng from './img/stars.jpg'
import earthTexture from './img/earth.jpg';
import sunTexture from './img/sun.jpg';
import plutoTexture from './img/pluto.jpg';
import mercuryTexture from './img/mercury.jpg';
import venusTexture from './img/venus.jpg';
import marsTexture from './img/mars.jpg';
import jupiterTexture from './img/jupiter.jpg';
import saturnTexture from './img/saturn.jpg';
import uranTexture from './img/uranus.jpg';
import neptuneTexture from './img/neptune.jpg';
import moonTexture from './img/moon.jpg';
import callistoTexture from './img/callisto.jpg';
import ceresTexture from './img/ceres.jpg';
import charonTexture from './img/charon.jpg';
import deimosTexture from './img/deimos.jpg';
import erisTexture from './img/eris.jpg';
import europaTexture from './img/europa.jpg';
import ganimedesTexture from './img/ganimedes.png';
import ioTexture from './img/Io.jpg';
import makemakeTexture from './img/makemake.jpg';
import phobosTexture from './img/phobos.jpg';
import trytonTexture from './img/tryton.jpg';
import titanTexture from './img/titan.jpg';



const Sun = ({ setInfo, setTarget, setSelectableObjects }) => {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const textureSun = useLoader(TextureLoader, sunTexture);

  useEffect(() => {
    setSelectableObjects((prev) => [...prev, { name: 'Słońce', ref }]);
  }, [setSelectableObjects]);

  useFrame(() => (ref.current.rotation.y += 0.01));

  return (
    <mesh
      ref={ref}
      onClick={() => {
        setInfo('Słońce');
        setTarget(ref);
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshStandardMaterial
        map={textureSun}
        emissive={hovered ? 'white' : 'yellow'}
        emissiveIntensity={hovered ? 1 : 0.5}
      />
      <pointLight intensity={4000} distance={60000} />
      <Html>
        <div style={{ color: 'white', fontSize: 20, textAlign: 'center' }}>Słońce</div>
      </Html>
    </mesh>
  );
};

const Orbit = ({ a, e, i, Ω, ω }) => {
  const orbitRef = useRef();
  const segments = 128; // Number of segments to draw the ellipse
  const points = [];

  for (let j = 0; j <= segments; j++) {
    const M = (j / segments) * 2 * Math.PI; // Mean anomaly
    const θ = M; // Approximate θ = M for simplicity
    const r = a * (1 - e * e) / (1 + e * Math.cos(θ));
    const x = r * (Math.cos(Ω) * Math.cos(θ + ω) - Math.sin(Ω) * Math.sin(θ + ω) * Math.cos(i));
    const y = r * (Math.sin(Ω) * Math.cos(θ + ω) + Math.cos(Ω) * Math.sin(θ + ω) * Math.cos(i));
    const z = r * (Math.sin(θ + ω) * Math.sin(i));
    points.push(new THREE.Vector3(x, y, z));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line ref={orbitRef} geometry={geometry}>
      <lineBasicMaterial attach="material" color="white" />
    </line>
  );
};

const Planet = ({ a, e, i, Ω, ω, realSize, texture, speed, name, setInfo, setTarget, moons, setSelectableObjects, axialTilt, rotationSpeed,isPaused,showOrbits,showAxes }) => {
  const planetRef = useRef();
  const [hovered, setHovered] = useState(false);
  const sizeScale = useMemo(() => Math.log(realSize + 1) / 2, [realSize]);
  const planetTexture = useLoader(TextureLoader, texture);
  const simTimeRef = useRef(0); // Custom simulation time as ref
  const { clock } = useThree();
  const axisRef = useRef(); // Reference for the axis line

  useEffect(() => {
    setSelectableObjects((prev) => [...prev, { name, ref: planetRef }]);
  }, [setSelectableObjects, name]);

  // Convert degrees to radians
  const degToRad = useCallback((degrees) => degrees * Math.PI / 180, []);

  useFrame(() => {
    if (!isPaused) {
      // Update simulation time only if not paused
      simTimeRef.current += clock.getDelta() * speed;
    }

    const t = simTimeRef.current;
    const M = t % (2 * Math.PI);
    const θ = M;
    const r = a * (1 - e * e) / (1 + e * Math.cos(θ));
    const x = r * (Math.cos(Ω) * Math.cos(θ + ω) - Math.sin(Ω) * Math.sin(θ + ω) * Math.cos(i));
    const y = r * (Math.sin(Ω) * Math.cos(θ + ω) + Math.cos(Ω) * Math.sin(θ + ω) * Math.cos(i));
    const z = r * (Math.sin(θ + ω) * Math.sin(i));
    planetRef.current.position.set(x, y, z);

    planetRef.current.rotation.x = degToRad(axialTilt);
    planetRef.current.rotation.y += rotationSpeed;
  });
  
  // Create a line representing the rotation axis
  const axisLength = 1; // Adjust the length of the axis line as needed
  const points = [
    new THREE.Vector3(0, -axisLength, 0),
    new THREE.Vector3(0, axisLength, 0)
  ];
  const axisGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const axisMaterial = new THREE.LineBasicMaterial({ color: 'yellow' });
  
  
  // Find planet data by name
  const planetData = objectData.find(obj => obj.name === name);

  return (
    <>
      {showOrbits && <Orbit a={a} e={e} i={i} Ω={Ω} ω={ω} />}
      <mesh
        ref={planetRef}
        onClick={() => {
          setInfo(`${planetData.name}, masa: ${planetData.mass}, średnica: ${planetData.diameter}`);
          setTarget(planetRef);
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}>
        <sphereGeometry args={[sizeScale, 32, 32]} />
        <meshStandardMaterial
          map={planetTexture}
          emissive={hovered ? 'white' : 'black'}
          emissiveIntensity={hovered ? 0.1 : 0}
        />
        <Html>
          <div style={{ color: 'white', fontSize: 14, textAlign: 'center' }}>{name}</div>
        </Html>
        {showAxes && <line ref={axisRef} geometry={axisGeometry} material={axisMaterial} />}
      </mesh>
      {moons &&
        moons.map((moon, index) => (
          <Moon
            key={index}
            planetRef={planetRef}
            {...moon}
            setInfo={setInfo}
            setTarget={setTarget}
            setSelectableObjects={setSelectableObjects}
          />
        ))}
    </>
  );
};

const OrbitMoon = ({ a, e, i, Ω, ω, planetRef }) => {
  const orbitRef = useRef();
  const segments = 64;
  const points = [];

  for (let j = 0; j <= segments; j++) {
    const M = (j / segments) * 2 * Math.PI;
    const θ = M;
    const r = a * (1 - e * e) / (1 + e * Math.cos(θ));
    const x = r * (Math.cos(Ω) * Math.cos(θ + ω) - Math.sin(Ω) * Math.sin(θ + ω) * Math.cos(i));
    const y = r * (Math.sin(Ω) * Math.cos(θ + ω) + Math.cos(Ω) * Math.sin(θ + ω) * Math.cos(i));
    const z = r * (Math.sin(θ + ω) * Math.sin(i));
    points.push(new THREE.Vector3(x, y, z));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  useFrame(() => {
    if (planetRef.current) {
      orbitRef.current.position.copy(planetRef.current.position);
    }
  });

  return (
    <line ref={orbitRef} geometry={geometry}>
      <lineBasicMaterial attach="material" color="grey" />
    </line>
  );
};

const Moon = ({ a, e, i, Ω, ω, realSize, texture, speed, name, setInfo, setTarget, planetRef, setSelectableObjects, axialTilt, rotationSpeed ,isPaused,showOrbits}) => {
  const moonRef = useRef();
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree(); // Użyj hooka useThree do dostępu do kamery
  const [showLabel, setShowLabel] = useState(false);
  const simTimeRef = useRef(0); // Custom simulation time as ref
  const { clock } = useThree();

  const sizeScale = Math.log(realSize + 1);
  const moonTexture = useLoader(TextureLoader, texture);

  // Convert degrees to radians
  const degToRad = useCallback((degrees) => degrees * Math.PI / 180, []);

  // Find planet data by name
  const moonData = objectData.find(obj => obj.name === name);

  useEffect(() => {
    setSelectableObjects((prev) => [...prev, { name, ref: moonRef }]);
  }, [setSelectableObjects, name]);

  useFrame(() => {
    if (!isPaused) {
      // Update simulation time only if not paused
      simTimeRef.current += clock.getDelta() * speed;
    }

    const t = simTimeRef.current;
    const M = t % (2 * Math.PI);
    const θ = M;
    const r = a * (1 - e * e) / (1 + e * Math.cos(θ));
    const x = r * (Math.cos(Ω) * Math.cos(θ + ω) - Math.sin(Ω) * Math.sin(θ + ω) * Math.cos(i));
    const y = r * (Math.sin(Ω) * Math.cos(θ + ω) + Math.cos(Ω) * Math.sin(θ + ω) * Math.cos(i));
    const z = r * (Math.sin(θ + ω) * Math.sin(i));
    moonRef.current.position.set(x, y, z);

    if (planetRef.current) {
      moonRef.current.position.add(planetRef.current.position);
    }

    moonRef.current.rotation.x = degToRad(axialTilt);
    moonRef.current.rotation.y += rotationSpeed;

    // Oblicz odległość między kamerą a księżycem
    const distance = moonRef.current.position.distanceTo(camera.position);
    //console.log(distance);
    //console.log(name);
    if (distance < 50) {
      setShowLabel(true); // Jeśli kamera jest wystarczająco blisko, pokaż etykietę księżyca
    } else {
      setShowLabel(false); // W przeciwnym razie ukryj etykietę księżyca
    }

    
   
    
  });

  return (
    <>
      {showOrbits &&<OrbitMoon a={a} e={e} i={i} Ω={Ω} ω={ω} planetRef={planetRef} />}
      <mesh
        ref={moonRef}
        onClick={() => {
          setInfo(`${moonData.name}, masa: ${moonData.mass}, średnica: ${moonData.diameter}`);
          setTarget(moonRef);
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}>
        <sphereGeometry args={[sizeScale, 32, 32]} />
        <meshStandardMaterial
          map={moonTexture}
          emissive={hovered ? 'white' : 'black'}
          emissiveIntensity={hovered ? 0.1 : 0}
        />
         {showLabel && ( // Dodane, aby renderować etykietę tylko wtedy, gdy kamera jest blisko księżyca
        <Html>
          <div style={{ color: 'white', fontSize: 14, textAlign: 'center' }}>{name}</div>
        </Html>
      )}
      </mesh>
    </>
  );
};



const Controls = ({ target, setTarget, speed }) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef();

  const moveSpeed = speed || 0.2;
  const rotationSpeed = 0.02;
  const moveState = useRef({ w: false, a: false, s: false, d: false });

  const onKeyDown = (event) => {
    if (event.key === 'w') moveState.current.w = true;
    if (event.key === 'a') moveState.current.a = true;
    if (event.key === 's') moveState.current.s = true;
    if (event.key === 'd') moveState.current.d = true;
    if (event.key === 'Escape') setTarget(null);

    if (!target) {
      if (event.key === 'ArrowLeft') camera.rotation.y += rotationSpeed;
      if (event.key === 'ArrowRight') camera.rotation.y -= rotationSpeed;
      if (event.key === 'ArrowUp') camera.rotation.x += rotationSpeed;
      if (event.key === 'ArrowDown') camera.rotation.x -= rotationSpeed;
    }
  };

  const onKeyUp = (event) => {
    if (event.key === 'w') moveState.current.w = false;
    if (event.key === 'a') moveState.current.a = false;
    if (event.key === 's') moveState.current.s = false;
    if (event.key === 'd') moveState.current.d = false;
  };

  useFrame(() => {
    if (target) {
      controlsRef.current.enabled = true;
      controlsRef.current.target.copy(target.current.position);
      controlsRef.current.update();
    } else {
      controlsRef.current.enabled = false;
      if (moveState.current.w) camera.translateZ(-moveSpeed);
      if (moveState.current.a) camera.translateX(-moveSpeed);
      if (moveState.current.s) camera.translateZ(moveSpeed);
      if (moveState.current.d) camera.translateX(moveSpeed);
    }
  });

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    if (target) {
      controlsRef.current.target.copy(target.current.position);
      controlsRef.current.update();
    }
  }, [target]);

  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enableZoom={true}
      enablePan={true}
      maxDistance={20}
      enabled={false} // Disable controls initially
    />
  );
};



const Background = () => {
  const texture = useLoader(TextureLoader, Bpng);
  const { camera } = useThree();
  const ref = useRef();

  useFrame(() => {
    ref.current.position.copy(camera.position);
  });

  return (
    <mesh ref={ref} renderOrder={-1}>
      <sphereGeometry args={[20, 32, 32]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
        depthTest={false}  // Disable depth testing
      />
    </mesh>
  );
};


const App = () => {
  const [info, setInfo] = useState('');
  const [target, setTarget] = useState(null);
  const [selectableObjects, setSelectableObjects] = useState([]);

  const [showOrbits, setShowOrbits] = useState(true);
  const [showAxes, setShowAxes] = useState(true);

  const [isPaused, setIsPaused] = useState(false); // Nowy stan do zarządzania pauzą

  const scalingFactor = 400 / 23; // zakładając, że orbita Plutona wynosi 32 jednostki

  const [speed, setSpeed] = useState(1); // Initial speed is 1

  const increaseSpeed = () => setSpeed((prevSpeed) => prevSpeed * 2);
  const decreaseSpeed = () => setSpeed((prevSpeed) => prevSpeed / 2);
  
  return (
    
    <div style={{ width: '100vw', height: '100vh' }}>
          <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 1, color: 'white' }}>
      <div>{info}</div>
    </div>
    <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 1 }}>
      <button className="button" onClick={() => setIsPaused(!isPaused)}>{isPaused ? 'Wznów' : 'Pauza'}</button>
      <button className="button" onClick={increaseSpeed}>Przyspiesz</button>
      <button className="button" onClick={decreaseSpeed}>Spowolnij</button>
      <span style={{ color: 'white' }}>Aktualna prędkość: {speed}x</span>
      <select
        className="select"
        onChange={(e) => {
          const selectedObject = selectableObjects.find((obj) => obj.name === e.target.value);
          if (selectedObject) {
            setTarget(selectedObject.ref);
          }
        }}>
        <option value="">Select Object</option>
        {selectableObjects.map((obj, index) => (
          <option key={index} value={obj.name}>
            {obj.name}
          </option>
        ))}
      </select>
      <div className="menu">
        <label>
          <input
            type="checkbox"
            checked={showOrbits}
            onChange={() => setShowOrbits(!showOrbits)}
          />
          Pokaż orbity
        </label>
        <label>
          <input
            type="checkbox"
            checked={showAxes}
            onChange={() => setShowAxes(!showAxes)}
          />
          Pokaż osie obrotu
        </label>
      </div>
    </div>
      {info && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: '10px',
            borderRadius: '5px',
            color: 'white',
          }}>
          {info}
        </div>
      )}
      <Canvas>
        <ambientLight intensity={0.2} />
        <Sun setInfo={setInfo} setTarget={setTarget} setSelectableObjects={setSelectableObjects}/>
        <pointLight intensity={0.6} color="white" position={[0, 0, 0]} /> {/* Sunlight */}
        <Planet
          a={6 * scalingFactor}
          e={0.2056}
          i={0.122}
          Ω={0.843}
          ω={1.351}
          realSize={0.5}
          texture={mercuryTexture}
          speed={2 * speed}
          name="Merkury"
          setInfo={setInfo}
          setTarget={setTarget}
          setSelectableObjects={setSelectableObjects}
          axialTilt={89}
          rotationSpeed={0.01}
          isPaused={isPaused}
          showOrbits={showOrbits}
          showAxes={showAxes}
        />
        <Planet
          a={8* scalingFactor}
          e={0.0067}
          i={0.059}
          Ω={1.338}
          ω={2.295}
          realSize={0.7}
          texture={venusTexture}
          speed={0.78* speed}
          name="Wenus"
          setInfo={setInfo}
          setTarget={setTarget}
          setSelectableObjects={setSelectableObjects}
          axialTilt={87.36}
          rotationSpeed={0.01}
          isPaused={isPaused}
          showOrbits={showOrbits}
          showAxes={showAxes}
        />
        <Planet
          a={10* scalingFactor}
          e={0.0167}
          i={0.000}
          Ω={0.000}
          ω={1.915}
          realSize={0.8}
          texture={earthTexture}
          speed={0.48* speed}
          name="Ziemia"
          setInfo={setInfo}
          setTarget={setTarget}
          moons={[
            {
              a: 0.5* scalingFactor,
              e: 0.0549,
              i: 0.089,
              Ω: 0,
              ω: 0,
              realSize: 0.1,
              texture: moonTexture,
              speed: 10*speed,
              name: 'Księżyc',
              axialTilt:84.8,
              rotationSpeed:0.01,
              isPaused: isPaused,
              showOrbits: showOrbits
            },
          ]}
          setSelectableObjects={setSelectableObjects}
          axialTilt={66.3}
          rotationSpeed={0.01}
          isPaused={isPaused}
          showOrbits={showOrbits}
          showAxes={showAxes}
        />
        <Planet
          a={13* scalingFactor}
          e={0.0934}
          i={0.032}
          Ω={0.865}
          ω={5.865}
          realSize={0.6}
          texture={marsTexture}
          speed={0.26* speed}
          name="Mars"
          setInfo={setInfo}
          setTarget={setTarget}
          moons={[
            {
              a: 0.4 * scalingFactor,
              e: 0.0151,
              i: 0.094,
              Ω: 0,
              ω: 0,
              realSize: 0.03,
              texture: phobosTexture,
              speed: 0.2,
              name: 'Fobos',
              axialTilt:90,
              rotationSpeed:0.01,
              isPaused: isPaused,
              showOrbits: showOrbits
            },
            {
              a: 0.7 * scalingFactor,
              e: 0.0002,
              i: 0.0002,
              Ω: 0,
              ω: 0,
              realSize: 0.02,
              texture: deimosTexture,
              speed: 0.25,
              name: 'Deimos',
              axialTilt:62.42,
              rotationSpeed:0.01,
              isPaused: isPaused,
              showOrbits: showOrbits
            },
          ]}
          setSelectableObjects={setSelectableObjects}
          axialTilt={64.81}
          rotationSpeed={0.01}
          isPaused={isPaused}
          showOrbits={showOrbits}
          showAxes={showAxes}
        />
        <Planet
          a={14.3* scalingFactor} // średnia odległość Ceres od Słońca w jednostkach astronomicznych (AU)
          e={0.0785} // mimośród orbity Ceres
          i={0.18} // nachylenie orbity Ceres do płaszczyzny ekliptyki
          Ω={80.3} // długość węzła wstępującego Ceres
          ω={73.6} // argument peryhelium Ceres
          realSize={0.9394} // rzeczywista średnica Ceres w milionach kilometrów
          texture={ceresTexture} // tekstura dla Ceres
          speed={0.10* speed} // prędkość obrotu Ceres
          name="Ceres" // nazwa planety
          setInfo={setInfo}
          setTarget={setTarget}
          setSelectableObjects={setSelectableObjects}
          axialTilt={86}
          rotationSpeed={0.01}
          isPaused={isPaused}
          showOrbits={showOrbits}
          showAxes={showAxes}
        />
        <Planet
          a={16* scalingFactor}
          e={0.0489}
          i={0.022}
          Ω={1.450}
          ω={0.257}
          realSize={1.2}
          texture={jupiterTexture}
          speed={0.04* speed}
          name="Jowisz"
          setInfo={setInfo}
          setTarget={setTarget}
          moons={[
            { a: 0.5* scalingFactor, e: 0.0151, i: 0.094, Ω: 0, ω: 0, realSize: 0.04, texture: ioTexture, speed: 0.2, name: 'Io' ,axialTilt:87.79,
            rotationSpeed:0.01,
            isPaused: isPaused,
            showOrbits: showOrbits},
            { a: 0.7* scalingFactor, e: 0.0151, i: 0.094, Ω: 0, ω: 0, realSize: 0.04, texture: europaTexture, speed: 0.15, name: 'Europa' ,axialTilt:89,
            rotationSpeed:0.01,
            isPaused: isPaused,
            showOrbits: showOrbits},
            { a: 0.9* scalingFactor, e: 0.0151, i: 0.094, Ω: 0, ω: 0, realSize: 0.04, texture: ganimedesTexture, speed: 0.12, name: 'Ganimedes' ,axialTilt:89.66,
            rotationSpeed:0.01,
            isPaused: isPaused,
            showOrbits: showOrbits},
            { a: 1.1* scalingFactor, e: 0.0151, i: 0.094, Ω: 0, ω: 0, realSize: 0.04, texture: callistoTexture, speed: 0.1, name: 'Callisto' ,axialTilt:87.83,
            rotationSpeed:0.01,
            isPaused: isPaused,
            showOrbits: showOrbits},
            // Dodaj więcej księżyców Jowisza tutaj...
          ]}
          setSelectableObjects={setSelectableObjects}
          axialTilt={86.87}
          rotationSpeed={0.01}
          isPaused={isPaused}
          showOrbits={showOrbits}
          showAxes={showAxes}
        />
        <Planet
          a={20* scalingFactor}
          e={0.0565}
          i={0.043}
          Ω={1.983}
          ω={1.613}
          realSize={1}
          texture={saturnTexture}
          speed={0.016* speed}
          name="Saturn"
          setInfo={setInfo}
          setTarget={setTarget}
          moons={[
            { a: 0.4* scalingFactor, e: 0.0151, i: 0.094, Ω: 0, ω: 0, realSize: 0.03, texture: titanTexture, speed: 0.2, name: 'Titan' ,axialTilt:90,
            rotationSpeed:0.01,
            isPaused: isPaused,
            showOrbits: showOrbits},
            { a: 0.5* scalingFactor, e: 0.0151, i: 0.094, Ω: 0, ω: 0, realSize: 0.02, texture: moonTexture, speed: 0.15, name: 'Rea' ,axialTilt:90,
            rotationSpeed:0.01,
            isPaused: isPaused,
            showOrbits: showOrbits},
            // Dodaj więcej księżyców Saturna tutaj...
          ]}
          setSelectableObjects={setSelectableObjects}
          axialTilt={63.27}
          rotationSpeed={0.01}
          isPaused={isPaused}
          showOrbits={showOrbits}
          showAxes={showAxes}
        />
        <Planet
          a={24* scalingFactor}
          e={0.0463}
          i={0.013}
          Ω={1.354}
          ω={2.408}
          realSize={0.9}
          texture={uranTexture}
          speed={0.0057* speed}
          name="Uran"
          setInfo={setInfo}
          setTarget={setTarget}
          setSelectableObjects={setSelectableObjects}
          axialTilt={7.77}
          rotationSpeed={0.01}
          isPaused={isPaused}
          showOrbits={showOrbits}
          showAxes={showAxes}
        />
        <Planet
          a={28* scalingFactor}
          e={0.0097}
          i={0.030}
          Ω={2.299}
          ω={0.716}
          realSize={0.85}
          texture={neptuneTexture}
          speed={0.0029* speed}
          name="Neptun"
          setInfo={setInfo}
          setTarget={setTarget}
          moons={[
            { a: 0.4* scalingFactor, e: 0.0151, i: 0.094, Ω: 0, ω: 0, realSize: 0.03, texture: trytonTexture, speed: 0.2, name: 'Tryton',axialTilt:90,
            rotationSpeed:0.01,
            isPaused: isPaused ,
            showOrbits: showOrbits},
          ]}
          setSelectableObjects={setSelectableObjects}
          axialTilt={61.68}
          rotationSpeed={0.01}
          isPaused={isPaused}
          showOrbits={showOrbits}
          showAxes={showAxes}
        />
        <Planet
          a={32* scalingFactor}
          e={0.2488}
          i={0.248}
          Ω={1.925}
          ω={3.973}
          realSize={0.4}
          texture={plutoTexture}
          speed={0.0019* speed}
          name="Pluton"
          setInfo={setInfo}
          setTarget={setTarget}
          moons={[
            { a: 0.4* scalingFactor, e: 0.0151, i: 0.094, Ω: 0, ω: 0, realSize: 0.03, texture: charonTexture, speed: 0.2, name: 'Charon' ,axialTilt:88,
            rotationSpeed:0.01,
            isPaused: isPaused,
            showOrbits: showOrbits},
            // Dodaj więcej księżyców Plutona tutaj...
          ]}
          setSelectableObjects={setSelectableObjects}
          axialTilt={32.53}
          rotationSpeed={0.01}
          isPaused={isPaused}
          showOrbits={showOrbits}
          showAxes={showAxes}
        />
        <Planet
          a={67.864* scalingFactor} // średnia odległość Eris od Słońca w jednostkach astronomicznych (AU)
          e={0.43607} // mimośród orbity Eris
          i={44.040} // nachylenie orbity Eris do płaszczyzny ekliptyki
          Ω={35.951} // długość węzła wstępującego Eris
          ω={151.639} // argument peryhelium Eris
          realSize={2.326} // rzeczywista średnica Eris w milionach kilometrów
          texture={erisTexture} // tekstura dla Eris
          speed={0.00086* speed} // prędkość obrotu Eris
          name="Eris" // nazwa planety
          setInfo={setInfo}
          setTarget={setTarget}
          setSelectableObjects={setSelectableObjects}
          axialTilt={11.7}
          rotationSpeed={0.01}
          isPaused={isPaused}
          showOrbits={showOrbits}
          showAxes={showAxes}
        />

          <Planet
            a={43* scalingFactor} // średnia odległość Haumea od Słońca w jednostkach astronomicznych (AU)
            e={0.19126} // mimośród orbity Haumea
            i={28.9835} // nachylenie orbity Haumea do płaszczyzny ekliptyki
            Ω={79.620} // długość węzła wstępującego Haumea
            ω={114.834} // argument peryhelium Haumea
            realSize={1.434} // rzeczywista średnica Haumea w milionach kilometrów
            texture={moonTexture} // tekstura dla Haumea
            speed={0.0017* speed} // prędkość obrotu Haumea
            name="Haumea" // nazwa planety
            setInfo={setInfo}
            setTarget={setTarget}
            setSelectableObjects={setSelectableObjects}
            axialTilt={54}
            rotationSpeed={0.01}
            isPaused={isPaused}
            showOrbits={showOrbits}
            showAxes={showAxes}
          />

        <Planet
          a={45.430* scalingFactor} // średnia odległość Makemake od Słońca w jednostkach astronomicznych (AU)
          e={0.16126} // mimośród orbity Makemake
          i={28.9835} // nachylenie orbity Makemake do płaszczyzny ekliptyki
          Ω={79.620} // długość węzła wstępującego Makemake
          ω={294.834} // argument peryhelium Makemake
          realSize={1.434} // rzeczywista średnica Makemake w milionach kilometrów
          texture={makemakeTexture} // tekstura dla Makemake
          speed={0.0016* speed} // prędkość obrotu Makemake
          name="Makemake" // nazwa planety
          setInfo={setInfo}
          setTarget={setTarget}
          setSelectableObjects={setSelectableObjects}
          axialTilt={61}
          rotationSpeed={0.01}
          isPaused={isPaused}
          showOrbits={showOrbits}
          showAxes={showAxes}
        />
        <Planet
          a={84* scalingFactor} // średnia odległość Sedny od Słońca w jednostkach astronomicznych (AU)
          e={0.84058} // mimośród orbity Sedny
          i={11.9345} // nachylenie orbity Sedny do płaszczyzny ekliptyki
          Ω={144.884} // długość węzła wstępującego Sedny
          ω={311.497} // argument peryhelium Sedny
          realSize={1.434} // rzeczywista średnica Sedny w milionach kilometrów
          texture={moonTexture} // tekstura dla Sedny
          speed={0.00043* speed} // prędkość obrotu Sedny
          name="Sedna" // nazwa planety
          setInfo={setInfo}
          setTarget={setTarget}
          setSelectableObjects={setSelectableObjects}
          axialTilt={78.07}
          rotationSpeed={0.01}
          isPaused={isPaused}
          showOrbits={showOrbits}
          showAxes={showAxes}
        />
        <Planet
          a={91.1 * scalingFactor} // średnia odległość Gonggonga od Słońca w jednostkach astronomicznych (AU)
          e={0.515} // mimośród orbity Gonggonga
          i={30.89} // nachylenie orbity Gonggonga do płaszczyzny ekliptyki
          Ω={170.883} // długość węzła wstępującego Gonggonga
          ω={296.729} // argument peryhelium Gonggonga
          realSize={1.2} // rzeczywista średnica Gonggonga w milionach kilometrów
          texture={moonTexture} // tekstura dla Gonggonga
          speed={0.0019* speed} // prędkość obrotu Gonggonga
          name="Gonggong" // nazwa planety
          setInfo={setInfo}
          setTarget={setTarget}
          setSelectableObjects={setSelectableObjects}
          axialTilt={59.3}
          rotationSpeed={0.01}
          isPaused={isPaused}
          showOrbits={showOrbits}
          showAxes={showAxes}
        />
        <Controls target={target} setTarget={setTarget} />
        <Background />
      </Canvas>
    
    </div>
  );
}

export default App;