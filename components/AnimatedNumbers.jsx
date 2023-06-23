import { useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

const AnimatedNumbers = ({ value }) => {
  const ref = useRef(null);

  const motionvalue = useMotionValue(1);

  const springvalue = useSpring(motionvalue, { duration: 4200 });

  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      motionvalue.set(value);
    }
  }, [isInView, value, motionvalue]);

  useEffect(() => {
    springvalue.on("change", (latest) => {
      if (ref.current && latest.toFixed(0) <= value) {
        ref.current.textContent = latest.toFixed(0);
      }
    });
  }, [springvalue, value]);

  return <span ref={ref}></span>;
};

export default AnimatedNumbers;
