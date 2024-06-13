import { useState, useEffect } from "react";

const useCountUp = (end, duration = 2000) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (end !== undefined && end !== null) {
      const start = 0;
      const increment = (end - start) / (duration / 16.67); // 60 frames per second
      let current = start;

      const handle = setInterval(() => {
        current += increment;
        if (current >= end) {
          clearInterval(handle);
          setValue(end);
        } else {
          setValue(Math.round(current));
        }
      }, 16.67); // approximately 60 frames per second

      return () => clearInterval(handle);
    }
  }, [end, duration]);

  return value;
};

export default useCountUp;
