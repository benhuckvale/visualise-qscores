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

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
  }

  function generateErrorPositions(length) {
    let positions = Array.from({length: length}, (_, i) => i + 1);
    shuffleArray(positions);
    setErrorPositions(positions);
  }

  function calculateExpectedErrors(qScore, length) {
    // For example:
    // If qScore is 10: 10^(-10/10) = 0.1
    // If qScore is 20: 10^(-20/10) = 0.01
    const probabilityOfError = Math.pow(10, -qScore / 10);
    return Math.floor(length * probabilityOfError);
  }


  function renderSequenceWithErrors(seq, q) {
    const numberOfErrors = calculateExpectedErrors(q, seq.length);
    const errorSet = new Set(errorPositions.slice(0, numberOfErrors));

    let errorSequence = '';
    let inErrorSpan = false;

    for (let i = 0; i < seq.length; i++) {
        const isCurrentError = errorSet.has(i + 1);
        if (isCurrentError && !inErrorSpan) {
            // Start a new error span if we encounter an error and are not already in one
            errorSequence += `<span style="background-color: red; color: white;">`;
            inErrorSpan = true;
        } else if (!isCurrentError && inErrorSpan) {
            // Close the current error span if we encounter a non-error while in an error span
            errorSequence += `</span>`;
            inErrorSpan = false;
        }

        // Add the current character to the sequence
        errorSequence += seq[i];

        // If it's the last character and we're still in an error span, close it
        if (inErrorSpan && i === seq.length - 1) {
            errorSequence += `</span>`;
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
