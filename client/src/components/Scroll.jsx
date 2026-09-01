import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Scroll = () => {
  const countdownRef = useRef(null);

  useEffect(() => {
    if (window.innerWidth < 1024) return; // Only for desktop/laptop

    const ctx = gsap.context(() => {
      gsap.from(countdownRef.current, {
        opacity: 0,
        y: 50,
        scale: 0.8,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: countdownRef.current,
          start: "top 80%", // When top of countdown hits 80% of viewport
          toggleActions: "play none none none",
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return <div ref={countdownRef}></div>; // placeholder div before countdown
};

export default Scroll;
