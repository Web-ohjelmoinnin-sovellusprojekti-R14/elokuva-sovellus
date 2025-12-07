import React, { useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

function StarRaiting({ rating, setRating }) {
const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="d-flex align-items-center mb-2">
      {[...Array(10)].map((_, i) => {
        const value = i + 1;
        const displayRating = hoverRating || rating;
        const isHalf = displayRating >= value - 0.5 && displayRating < value;
        const isFull = displayRating >= value;

        return (
          <span
            key={i}
            style={{ cursor: "pointer", fontSize: "1.5rem", color: "#ffc107" }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              let newHover = x < rect.width / 2 ? value - 0.5 : value;
              if (newHover < 1) newHover = 1;
              setHoverRating(newHover);
              setRating(newHover);
            }}
            onMouseLeave={() => setHoverRating(0)}
          >
            {isFull ? <FaStar /> : isHalf ? <FaStarHalfAlt /> : <FaRegStar />}
          </span>
        );
      })}
      <span className="ms-2">{Math.max(rating, 1).toFixed(1)}</span>
    </div>
  );
}

export default StarRaiting;