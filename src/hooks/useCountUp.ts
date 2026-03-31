import { useEffect, useState } from 'react';

export function useCountUp(end: number, duration = 700) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (end === 0) { setValue(0); return; }
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return value;
}
