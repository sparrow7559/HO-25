import React from "react";
import background from "../assets/background.jpg";

function Rules() {
  const rules = [
    "Please play the games on a laptop for the best experience.",
    "Respect all players – no harassment, hate speech, or discrimination.",
    "No cheating or exploiting – avoid hacks, bots, or unfair advantages.",
    "Play fair – follow the intended game mechanics.",
    "Keep content appropriate – no offensive usernames, avatars, or messages.",
    "Respect moderators and admins – their decisions help keep the community safe.",
    "One account per person – no multiple or fake accounts.",
    "Report suspicious activity – help prevent scams and abuse.",
    "Constructive criticism only – respect developers and other players’ efforts.",
    "Follow game-specific rules – each game may have its own guidelines."
  ];

  return (
    <div
      className="relative min-h-screen pt-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/80" />

      {/* Rules Card */}
      <div className="relative z-10 max-w-4xl w-full bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl p-8 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-8 text-red-500 tracking-wide">
          Community <span className="text-white">Rules</span>
        </h1>

        {/* Apply white/50 background behind all rules */}
        <div className="bg-white/10 rounded-xl p-6 sm:p-8">
          <div className="grid sm:grid-cols-1 gap-3 text-white">
            {rules.map((rule, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-2 hover:border-[#09D8C7]/40 transition-all duration-300"
              >
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-lg shadow-md">
                  {index + 1}
                </div>
                <p className="font-medium text-lg sm:text-lg leading-relaxed">
                  {rule}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Rules;