import React, { useRef, useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CardSlider = React.forwardRef(({ onIntersection = () => {} }, forwardedRef) => {
  const [ref, inView] = useInView({
    onChange: (inView) => {
      if (inView) {
        onIntersection();
      }
    },
  });

  const horizontalScrollingSection = useRef(null);

  useGSAP(() => {
    let mm = gsap.matchMedia();
    mm.add("(min-width: 760px)", () => {
      let eventCards = gsap.utils.toArray(".eventCard");
      gsap.to(eventCards, {
        xPercent: -110 * eventCards.length,
        ease: "none",
        scrollTrigger: {
          trigger: horizontalScrollingSection.current,
          pin: true,
          scrub: 1,
          end: () => "+=" + horizontalScrollingSection.current.offsetWidth,
        },
      });
    });
  });

  const [events] = useState([
    {
      ID: 100,
      Name: "Game Schedule",
      Desc: `October 8th: 6:30 PM - 11:30 PM<br />
        October 9th: 12:00 PM - 12:00 AM<br />
        October 10th: 7:30 PM - 11:30 PM<br /><br/>Don't miss out on the action!`,
    },
    {
      ID: 200,
      Name: "Prizes",
      Desc: `1st Place: Rs 5000<br />2nd Place: Rs 3000<br />3rd Place: Rs 2000<br/><br/><b>Grand Prize Pool: Rs 10000<b> `,
    },
    {
      ID: 300,
      Name: "How to Win",
      Desc: `Accumulate Points: Participate in minigames and make strategic choices.<br/>
Climb the Leaderboard: Track your progress on the live leaderboard<br/>
Are you ready to take the top spot?`,
    },
    {
      ID: 400,
      Name: "How It Works",
      Desc: `Each minigame has points up for grabs. Your performance directly impacts your story path.<br/>
Prepare for a thrilling adventure where your fate lies in your hands!<br/>
Are you ready to see where your skills will lead you?`,
    },
    {
      ID: 500,
      Name: "Ready For A Win?",
      Desc: "Prepare for a thrilling adventure where your fate lies in your hands!<br/>Are you ready to see where your skills will lead you?",
    },
    {
      ID: 600,
      Name: "Join the Adventure!",
      Desc: `Dive into Hopeless Opus and create your own epic tale!`,
    },
  ]);

  return (
    <section id="event" className="max-[500px]:px-0">
      <div ref={horizontalScrollingSection}>
        <div className="overflow-x-hidden">
          <div
            className="
              mt-26 ml-[50%] mb-20 w-fit flex justify-center gap-16
              max-[760px]:ml-0 max-[760px]:px-16     
              max-[760px]:flex-col max-[760px]:gap-10 max-[760px]:overflow-hidden
            "
          >
            {events.map((event) => (
              <div
                key={event.ID}
                className="
                  eventCard flex flex-col justify-between 
                  w-96 h-96 rounded-xl border border-gray-400
                  backdrop-blur-xs bg-[#000000]/40 
                  p-12 pt-12
                  max-[760px]:w-full max-[760px]:h-[22rem]  
                  max-[760px]:p-8
                "
              >
                <div className="text-white font-normal text-2xl max-[760px]:text-xl">
                  {event.Name}
                </div>

                <div
                  className="
                    text-white font-thin text-lg mt-4 pt-5 border-t-2 border-white/20 leading-relaxed
                    max-[760px]:text-base
                  "
                  dangerouslySetInnerHTML={{ __html: event.Desc }}
                />

                <div className="mt-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

export default CardSlider;
