import React, { useState } from 'react';
import './Info.css';

const Info = () => {
  // Using the useState hook to handle the visibility state
  const [isOpen, setIsOpen] = useState(false);

  // Function to toggle the visibility
  const toggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="info-container">
      <span className="info-icon" onClick={toggle}>i</span>
      {isOpen && (
        <div className="info-content">
          <p>
            This is a simple page with some sliders to help you get a feel for
            what a Q score accuracy for genomic data means. The sequence
            generated below is entirely random, and all that is happening is that
            some of the bases are being highlighted as supposed errors according
            to the error rate implied by the selected Q score.  There are more
            complex biological and technical factors that influence error rates
            in real sequencing scenarios.
          </p>
        </div>
      )}
    </div>
  );
}

export default Info;
