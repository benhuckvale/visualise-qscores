import './App.css';
import React, { useState, useEffect } from 'react';
import seedrandom from 'seedrandom';

const setFavicon = (qScore) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100%" height="100%" fill="#fff"/>
      <text x="50%" y="50%" font-family="Arial" font-size="50"
            fill="black" dominant-baseline="middle" text-anchor="middle">
        Q${qScore}
      </text>
    </svg>
  `;

  const url = `data:image/svg+xml;base64,${btoa(svg)}`;
  const link = document.createElement('link');
  const oldLink = document.getElementById('dynamic-favicon');
  link.id = 'dynamic-favicon';
  link.rel = 'icon';
  link.href = url;

  if (oldLink) {
    document.head.removeChild(oldLink);
  }

  document.head.appendChild(link);
};

function App() {
  const getUrlParams = () => {
      const params = new URLSearchParams(window.location.search);
      return {
          qScore: parseInt(params.get('qScore'), 10) || 30,
          sequenceLength: parseInt(params.get('sequenceLength'), 10) || 100000,
          fontSize: parseInt(parseFloat(params.get('fontSize'), 10)*2)/2.0 || 16
      };
  };

  const [qScore, setQScore] = useState(getUrlParams().qScore);
  const [sequenceLength, setSequenceLength] = useState(getUrlParams().sequenceLength);
  const [fontSize, setFontSize] = useState(getUrlParams().fontSize);
  const [sequence, setSequence] = useState("");
  const [errorPositions, setErrorPositions] = useState([]);

  useEffect(() => {
    // Update page title in the browser tab and print header
    document.title = `${sequenceLength} bases`;
  }, [sequenceLength]);

  useEffect(() => {
    setFavicon(qScore);
  }, [qScore]);

  const handleSliderChangeComplete = () => {
    const newUrl = `?qScore=${qScore}&sequenceLength=${sequenceLength}&fontSize=${fontSize}`;
    window.history.pushState({qScore, sequenceLength, fontSize}, '', newUrl);
  };

  useEffect(() => {
    const onPopState = (event) => {
      if (event.state) {
        const params = getUrlParams();
        setQScore(event.state.qScore ?? params.qScore);
        setSequenceLength(event.state.sequenceLength ?? params.sequenceLength);
        setFontSize(event.state.fontSize ?? params.fontSize);
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
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

  function generateSequenceAndErrors(length) {
    const newSequence = generateRandomSequence(length);
    setSequence(newSequence);
    generateErrorPositions(length);
  }

  useEffect(() => {
    generateSequenceAndErrors(sequenceLength);
  }, [sequenceLength]); // Regenerate sequence and errors when sequence length changes

  function calculateExpectedErrors(qScore, length) {
    // For example:
    // If qScore is 10: 10^(-10/10) = 0.1
    // If qScore is 20: 10^(-20/10) = 0.01
    const probabilityOfError = Math.pow(10, -qScore / 10);
    return Math.floor(length * probabilityOfError);
  }

  function calculateErrorRate(qScore) {
    return Math.pow(10, -qScore / 10) * 100;
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
            errorSequence += `<span class="highlight">`;
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
      <div className="slider-box">
        <div className="slider-container">
          <input
            type="range"
            min="1"
            max="60"
            value={qScore}
            onChange={(e) => setQScore(parseInt(e.target.value, 10))}
            onMouseUp={handleSliderChangeComplete}
            onTouchEnd={handleSliderChangeComplete}
            style={{ width: "100%" }}
          />
          <div className="slider-label">Q{qScore}; Error Rate: {calculateErrorRate(qScore).toFixed(4)}%</div>
        </div>
        <div className="slider-container">
          <input
            type="range"
            min="100"
            max="1000000"
            value={sequenceLength}
            onChange={(e) => setSequenceLength(parseInt(e.target.value, 10))}
            onMouseUp={handleSliderChangeComplete}
            onTouchEnd={handleSliderChangeComplete}
            style={{ width: "100%" }}
          />
          <div className="slider-label">Sequence Length: {sequenceLength}</div>
        </div>
        <div className="slider-container">
          <input
              type="range"
              min="3"
              max="20"
              step="0.5"
              value={fontSize}
              onChange={e => setFontSize(parseInt(e.target.value*2)/2.0)}
              onMouseUp={handleSliderChangeComplete}
              onTouchEnd={handleSliderChangeComplete}
              style={{ width: "100%" }}
          />
          <div className="slider-label">Font Size: {fontSize.toFixed(1)}px</div>
        </div>
      </div>
      <div className="sequence-box">
        <div className="sequence-container"
             style={{
                 fontSize: `${fontSize}px`,
                 fontFamily: 'monospace'
             }}
             contentEditable="true" // Make it editable like textarea
             dangerouslySetInnerHTML={renderSequenceWithErrors(sequence, qScore)}
        />
      </div>
    </div>
  );
}

export default App;
