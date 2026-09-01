import React, { useState, useEffect } from "react";

const Countdown = ({ targetDateProp }) => {
  const [time, setTime] = useState(0);

  const targetDate = targetDateProp || new Date("2025-10-08T18:30:00");

  useEffect(() => {
    const updateTimer = () => {
      const currentTime = new Date().getTime();
      const targetTime = targetDate.getTime();
      const timeDiff = targetTime - currentTime;
      setTime(Math.max(timeDiff, 0));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const formatTime = (time) => {
    const days = Math.floor(time / (1000 * 60 * 60 * 24));
    const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  };

  const { days, hours, minutes, seconds } = formatTime(time);

  const unitBlock = (value, label) => (
  <div
    className="
      relative flex items-center justify-center
      backdrop-blur-xs bg-[#000000]/40
      w-28 h-28            /* bigger on mobile */
      sm:w-28 sm:h-28       /* keep original for sm+ */
      md:w-32 md:h-32
      lg:w-36 lg:h-36
      rounded-lg shadow-lg px-2
    "
  >
    <div
      className="absolute top-3 sm:top-3 md:top-4 lg:top-5 w-full text-white font-mono
                 text-3xl sm:text-4xl md:text-6xl lg:text-7xl flex justify-center"
    >
      {value.toString().padStart(2, "0")}
    </div>

    <div
      className="absolute bottom-3 text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 text-center w-full"
    >
      {label}
    </div>
  </div>
);


  const colon = (
    <div className="hidden sm:flex text-white font-mono text-2xl sm:text-4xl md:text-6xl lg:text-7xl mx-1 sm:mx-2.5 items-center justify-center select-none">
      :
    </div>
  );

  return (
  <div
    className="
      w-full flex justify-center items-center
      px-4 
      pt-8 pb-8
      sm:pt-20 sm:pb-20
    "
  >
    <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:justify-center sm:gap-6 md:gap-7 lg:gap-6 overflow-x-auto items-center">
  {unitBlock(days, "Days")}
  <div className="hidden sm:flex justify-center items-center">{colon}</div>
  {unitBlock(hours, "Hours")}
  <div className="hidden sm:flex justify-center items-center">{colon}</div>
  {unitBlock(minutes, "Minutes")}
  <div className="hidden sm:flex justify-center items-center">{colon}</div>
  {unitBlock(seconds, "Seconds")}
</div>

  </div>
);

};

export default Countdown;
