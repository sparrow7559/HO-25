import React from "react";

const FAQ = () => {
  const faqData = [
    { question: "How does the game work?", answer: "The game is designed as a 1-2 player interactive experience where each player's choices directly influence how the story unfolds. Both players will share the same screen, collaborating and competing to shape the narrative." },
    { question: "How do choices affect the game?", answer: "Choices can lead to different outcomes, alter character relationships, and influence the overall narrative direction, creating a unique experience for each player." },
    { question: "Is the game purely focused on making decisions?", answer: "The game includes several mini-games that allow players to score points and perform specific tasks. These mini-games help players pass obstacles and progress further in the game." },
    { question: "What if I get stuck on a puzzle/minigame or decision?", answer: "Depending on the game or choices you get a few tries and on some games there's just one chance. So play wisely!" },
    { question: "What platforms can I play this game on?", answer: "The game is compatible on PC. We suggest players to screencast while playing to get a better experience." },
    { question: "How will the Winner be decided or what are the constraints?", answer: "The game features several constraints that will ultimately determine how players are judged, including time, money, health, and points. Players have a total of three lives, and their choices and performance in mini-games contributes to their overall score." },
    { question: "The game froze. What should I do?", answer: "If the game freezes, refreshing the page or restarting the app usually helps. If issues persist, check your internet connection or clear your browser cache." },
    { question: "How do I track my progress in the story?", answer: "Progress is tracked through a menu, where players can see completed tasks, current challenges, and any unlocked mini-games or story elements." },
  ];

  return (
    <div className="flex justify-center py-20 px-4 max-[640px]:px-16 min-h-screen bg-transparent">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-normal text-center text-[#ffffff] mb-6 tracking-wide">
          FAQs
        </h1>

        {/* Outer Box */}
        <div className="border-2 border-gray-400 p-6 backdrop-blur-xs bg-[#000000]/20 space-y-0">
          {faqData.map((faq, idx) => (
            <details
              key={idx}
              className="group cursor-pointer rounded-lg transition-all duration-300"
            >
              <summary className="flex justify-start items-center px-4 py-1 font-[300] text-[#ffffff] text-sm sm:text-lg select-none">
                <span className="mr-1 transition-transform duration-300 group-open:rotate-90 inline-block text-2xl sm:text-3xl md:text-3xl ">
                  ▹
                </span>
                {faq.question}
              </summary>

              <div className="px-4 pt-1 pb-2 text-[#ffffff]/90 text-xs sm:text-base font-thin leading-relaxed animate-slideDown">
                {faq.answer}
                <div className="mt-2 border-b border-gray-400 opacity-0 group-open:opacity-100 transition-opacity duration-300"></div>
              </div>
            </details>
          ))}
        </div>
      </div>

      <style>
        {`
          details summary::-webkit-details-marker {
            display: none;
          }

          @keyframes slideDown {
            from { opacity: 0; max-height: 0; transform: translateY(-5px); }
            to { opacity: 1; max-height: 1000px; transform: translateY(0); }
          }

          details[open] .animate-slideDown {
            animation: slideDown 0.3s ease-in-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default FAQ;
