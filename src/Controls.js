import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Autosuggest from 'react-autosuggest';
import './Controls.css'; // Dodaj CSS do stylizacji autosugestii

const Controls = ({ objects, target, setTarget, speed }) => {
  const { camera } = useThree();
  const moveState = useRef({ w: false, a: false, s: false, d: false });
  const moveSpeed = speed || 0.2;
  const rotationSpeed = 0.02;
  const smoothness = 0.1;
  const [distance, setDistance] = useState(2);
  const orbitAngle = useRef({ x: 0, y: 0 });

  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);

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

  const updateCameraPosition = () => {
    const spherical = new THREE.Spherical(
      distance,
      THREE.MathUtils.degToRad(orbitAngle.current.x),
      THREE.MathUtils.degToRad(orbitAngle.current.y)
    );

    const offset = new THREE.Vector3();
    offset.setFromSpherical(spherical);

    if (target) {
      camera.position.copy(target.current.position).add(offset);
      camera.lookAt(target.current.position);
    }
  };

  useFrame(() => {
    if (target) {
      if (moveState.current.w) orbitAngle.current.x -= rotationSpeed;
      if (moveState.current.a) orbitAngle.current.y -= rotationSpeed;
      if (moveState.current.s) orbitAngle.current.x += rotationSpeed;
      if (moveState.current.d) orbitAngle.current.y += rotationSpeed;
      updateCameraPosition();
    } else {
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
      setDistance(3);
      orbitAngle.current = { x: 30, y: 45 };
      updateCameraPosition();
    }
  }, [target]);

  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    return inputLength === 0 ? [] : objects.filter(obj =>
      obj.name.toLowerCase().slice(0, inputLength) === inputValue
    );
  };

  const getSuggestionValue = (suggestion) => suggestion.name;

  const renderSuggestion = (suggestion) => (
    <div>
      {suggestion.name}
    </div>
  );

  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const onChange = (event, { newValue }) => {
    setValue(newValue);
  };

  const onSuggestionSelected = (event, { suggestion }) => {
    setTarget(suggestion.ref);
  };

  const inputProps = {
    placeholder: 'Wpisz nazwę planety, księżyca lub Słońca',
    value,
    onChange
  };

  return (
    <div>
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        onSuggestionSelected={onSuggestionSelected}
        inputProps={inputProps}
      />
    </div>
  );
};

export default Controls;
