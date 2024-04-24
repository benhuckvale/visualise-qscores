import './App.css';
import React, { useState, useEffect } from 'react';
import seedrandom from 'seedrandom';

function App() {
  const [qScore, setQScore] = useState(30);
  const [sequence, setSequence] = useState("");
  const [errorPositions, setErrorPositions] = useState([]);

  useEffect(() => {
    const newSequence = generateRandomSequence(10000);
    setSequence(newSequence);
    generateErrorPositions(newSequence.length);
  }, []);

  function generateRandomSequence(length) {
    const bases = ['G', 'C', 'T', 'A'];
    let sequence = '';
    for (let i = 0; i < length; i++) {
      sequence += bases[Math.floor(Math.random() * 4)];
    }
    return sequence;
  }

  function generateErrorPositions(length) {
    let positions = Array.from({length: length}, (_, i) => i + 1);
    let rng = seedrandom('constantSeed'); // Ensuring consistent shuffling
    positions = positions.sort(() => 0.5 - rng());
    setErrorPositions(positions);
  }

  /**
   * If qScore is 10: 10^(-10/10) = 0.1
   * If qScore is 20: 10^(-20/10) = 0.01
   */
  function calculateExpectedErrors(qScore, length) {
    const probabilityOfError = Math.pow(10, -qScore / 10);
    return Math.floor(length * probabilityOfError);
  }


  function renderSequenceWithErrors(seq, q) {
    const numberOfErrors = calculateExpectedErrors(q, seq.length);
    const errorSet = new Set(errorPositions.slice(0, numberOfErrors));

    let errorSequence = '';
    for (let i = 0; i < seq.length; i++) {
      if (errorSet.has(i + 1)) {
        errorSequence += `<span style="color: red;">${seq[i]}</span>`;
      } else {
        errorSequence += seq[i];
      }
    }

    return {__html: errorSequence};
  }

  return (
    <div>
      <input
        type="range"
        min="1"
        max="60"
        value={qScore}
        onChange={(e) => setQScore(parseInt(e.target.value, 10))}
        style={{ width: "100%" }}
      />
      <div>Q{qScore}</div>
      <div style={{
           width: "100%",
           height: "90vh",
           overflow: "auto",
           whiteSpace: "pre-wrap",
           border: "1px solid #ccc",
           padding: "10px",
           boxSizing: "border-box",
           fontFamily: "monospace"
        }}
           contentEditable="true" // Make it editable like textarea
           dangerouslySetInnerHTML={renderSequenceWithErrors(sequence, qScore)} />
    </div>
  );
}

export default App;
