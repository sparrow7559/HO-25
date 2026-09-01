import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';


// Import your minigame components
import MinigameLoader from './MinigameLoader';
import UserHUD from './UserHUD';

// --- Config ---
const TYPING_SPEED = 30;
import API_BASE from '../lib/api_endpoint';
import {
  isOfflineMode,
  getCurrentStory as offlineGetCurrentStory,
  fetchStoryById as offlineFetchStoryById,
  makeChoice as offlineMakeChoice,
  updateStoryOnLevelEnd as offlineUpdateStoryOnLevelEnd,
} from '../lib/offlineMode';
const API_STORY = `${API_BASE}/story`;

// --- Character Assets ---
const characterAssets = {
  'Player 1': { src: 'https://res.cloudinary.com/dzntiuwyr/image/upload/v1759849140/p1_we3btx.png', position: 'left' },
  'Player 2': { src: 'https://res.cloudinary.com/dzntiuwyr/image/upload/v1759849140/p2_f6igmq.png', position: 'right' },
  // Workshop heads are not included per your last request, but can be added here if needed
  'Workshop head 1': { src: 'https://res.cloudinary.com/dzntiuwyr/image/upload/v1759849140/pride_bgjd7m.png', position: 'left' },
  'Workshop head 2': { src: 'https://res.cloudinary.com/dzntiuwyr/image/upload/v1759849140/sloth_m84fg2.png', position: 'right' },
  'Spirit 1': { src: 'https://res.cloudinary.com/dzntiuwyr/image/upload/v1759948882/spirit_gqy4ag.png', position: 'left' },
  'Spirit 2': { src: 'https://res.cloudinary.com/dzntiuwyr/image/upload/v1759948882/spirit2_ov6cpv.png', position: 'left' },
  'Spirit 3': { src: 'https://res.cloudinary.com/dzntiuwyr/image/upload/v1759948882/spirit3_fi0o2l.png', position: 'left' },
  'Spirit 4': { src: 'https://res.cloudinary.com/dzntiuwyr/image/upload/v1759948883/spirit4_gd9rch.png', position: 'left' },
  'Spirit 5': { src: 'https://res.cloudinary.com/dzntiuwyr/image/upload/v1759948883/spirit5_f142jd.png', position: 'left' },
  'Spirit 6': { src: 'https://res.cloudinary.com/dzntiuwyr/image/upload/v1760097561/spirit6-removebg-preview_yosw9b.png ', position: 'left' },
  'Envy': { src: 'https://res.cloudinary.com/dzntiuwyr/image/upload/v1759948882/envy_zkt62r.png', position: 'right' },
  'Lust': { src: 'https://res.cloudinary.com/dzntiuwyr/image/upload/v1760084356/Lust_tigr7i.png', position: 'left' },
  'Greed': { src: 'https://res.cloudinary.com/dzntiuwyr/image/upload/v1759948882/greed_sqitjx.png', position: 'right' },
  'Wrath': { src: 'https://res.cloudinary.com/dzntiuwyr/image/upload/v1760084382/wrath_nykd9l.png', position: 'right' },
};

// --- Story ID List for Inverted/Italic Style ---
const INVERTED_STORY_IDS = [
  '0101', '0102', '0103',
  '1001', '1002', '1003',
  '1601', '1602', '1603',
  '2201c', '2202c',
  '2401a', '2501b',
  '3101', '3102', '3103',
  '3601', '3602', '3603',
  '4901', '4902', '4903',
  '5401', '5402', '5403', '5404', '5405',
  '6101', '6102', '6103', '6104',
  '6301', '6401a', '6401b', '6401c',
  '6501', '6601',
  '6901', '6902', '6903', '6904', '6905',
  '12401a','12402a','12401b'
];

const VisualNovelInterface = () => {
  const [storyData, setStoryData] = useState(null);
  const [userState, setUserState] = useState({ points: 0, inventory: {} });
  const [fullDialogue, setFullDialogue] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isSkipping, setIsSkipping] = useState(false);
  
  // --- NEW STATE FOR CHARACTER HANDLING ---
  const [dialogueLines, setDialogueLines] = useState([]);
  const [currentSpeaker, setCurrentSpeaker] = useState(null);

  // Minigame state
  const [activeMinigame, setActiveMinigame] = useState(null);
  const [minigameConfig, setMinigameConfig] = useState(null);
  const [pendingStory, setPendingStory] = useState(null);
  const [awardMessage, setAwardMessage] = useState(null);
  const [sceneVisible, setSceneVisible] = useState(true);
  const navigate = useNavigate();
  const [isLaptop, setIsLaptop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);
  

  const getToken = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const processStoryNode = (storyNode) => {
    if (!storyNode) return;
    setStoryData(storyNode);
    setFullDialogue(storyNode.text.join("\n"));
    setDisplayedText("");
    setIsSkipping(false);
    setSelectedChoice(null);

    // Also process lines for character speaker tracking
    const lines = storyNode.text.map((line, index) => ({
      speaker: storyNode.characters?.[index] || null,
      text: line,
    }));
    setDialogueLines(lines);
  };


  useEffect(() => {
    const fetchCurrentStory = async () => {
      try {
        const { story, userState: serverUserState } = isOfflineMode()
          ? offlineGetCurrentStory()
          : (await axios.get(`${API_STORY}/current/me`, getToken())).data;
        if (story) {
  if (story.storyID?.startsWith("M")) {
    // 🚀 Directly launch minigame if story ID begins with "M"
    setStoryData(story);
    setActiveMinigame(story.storyID);
    setMinigameConfig(story.minigameConfig || null);
  } else {
    // Normal story processing
    processStoryNode(story);
  }

  if (serverUserState) setUserState(serverUserState);
}

      } catch (err) {
        // console.error("Error fetching current story:", err);
      }
    };
    fetchCurrentStory();
  }, []);

  // Original typing effect remains unchanged
  useEffect(() => {
    if (isSkipping || !fullDialogue) return;

    if (displayedText.length < fullDialogue.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(fullDialogue.substring(0, displayedText.length + 1));
      }, TYPING_SPEED);
      return () => clearTimeout(timeout);
    }
  }, [displayedText, isSkipping, fullDialogue]);

  // --- NEW useEffect to determine the current speaker based on typing progress ---
  useEffect(() => {
    if (!dialogueLines.length) return;

    let cumulativeLength = 0;
    let speakerForCurrentText = dialogueLines[0]?.speaker || null;

    for (let i = 0; i < dialogueLines.length; i++) {
      const line = dialogueLines[i];
      const lineLengthWithNewline = line.text.length + (i < dialogueLines.length - 1 ? 1 : 0);

      if (displayedText.length <= cumulativeLength + lineLengthWithNewline) {
        speakerForCurrentText = line.speaker;
        break;
      }
      cumulativeLength += lineLengthWithNewline;
    }
    
    setCurrentSpeaker(speakerForCurrentText);
  }, [displayedText, dialogueLines]);

  const fetchStoryById = async (storyId) => {
    try {
      if (isOfflineMode()) return offlineFetchStoryById(storyId);
      const res = await axios.get(`${API_STORY}/${storyId}`, getToken());
      return res.data;
    } catch (err) {
      // console.error("Error fetching story by ID:", err);
      return null;
    }
  };

  const handleChoiceClick = async (id, index) => {
    setSelectedChoice(id);
    try {
      const { nextStory, minigame, userState: serverUserState } = isOfflineMode()
        ? (offlineMakeChoice(storyData.storyID, index) || {})
        : (await axios.post(
            `${API_STORY}/current/choice`,
            { storyId: storyData.storyID, choiceIndex: index },
            getToken()
          )).data;
      if (serverUserState) setUserState(serverUserState);

      if (minigame) {
        setActiveMinigame(minigame.id);
        setMinigameConfig(minigame.config[minigame.id]);
        setPendingStory(nextStory);
      } else if (nextStory) {
        processStoryNode(nextStory);
      }
    } catch (err) {
      // console.error("Error making choice:", err);
    }
  };

  useEffect(() => {
    setSceneVisible(false);
    const t = setTimeout(() => setSceneVisible(true), 60);
    return () => clearTimeout(t);
  }, [storyData?.storyID]);

  const handleMinigameComplete = async (success) => {
    setActiveMinigame(null);
    setMinigameConfig(null);

    // Update story on minigame completion
    try {
      if (isOfflineMode()) {
        offlineUpdateStoryOnLevelEnd(activeMinigame, success);
      } else {
        await axios.post(`${API_STORY}/level-end`, { storyId: activeMinigame, success }, getToken());
      }
    } catch (e) {
      // console.error('Failed to update story on level end', e);
    }

    // Refresh user state and story
    try {
      const { story, userState: serverUserState } = isOfflineMode()
        ? offlineGetCurrentStory()
        : (await axios.get(`${API_STORY}/current/me`, getToken())).data;
      if (story) {
        processStoryNode(story);
      }
      if (serverUserState) setUserState(serverUserState);
    } catch (e) {
      // console.error('Failed to fetch updated story after minigame', e);
    }

    setPendingStory(null);
  };

  // Original handleSkip and handleNext logic is preserved
  const handleSkip = () => {
    setDisplayedText(fullDialogue);
    setIsSkipping(true);
  };

  const handleNext = async () => {
    if (!storyData) return;
    try {
      let nextStory = null;
      if (storyData.levelEnd) {
        if (isOfflineMode()) {
          nextStory = offlineUpdateStoryOnLevelEnd(storyData.storyID)?.nextStory || null;
        } else {
          const res = await axios.post(
            `${API_STORY}/level-end`,
            { storyId: storyData.storyID },
            getToken()
          );
          nextStory = res.data.nextStory;
        }
      } else if (storyData.nextID?.length > 0) {
        nextStory = await fetchStoryById(storyData.nextID[0]);
      }
      if (nextStory) {
        if (nextStory.storyID?.startsWith('M')) {
          setStoryData(nextStory);
          setActiveMinigame(nextStory.storyID);
          setMinigameConfig(nextStory.minigameConfig || null);
        } else {
          processStoryNode(nextStory);
        }
      }
    } catch (err) {
      console.error("Error updating user story on level end:", err);
    }
  };

  const renderChoiceButtons = () => (
    <div className="flex flex-col space-y-3 w-full">
      {storyData?.choice?.map((choiceText, idx) => (
        <button
          key={idx}
          onClick={() => handleChoiceClick(idx + 1, idx)}
          className={`
            relative flex items-center justify-start py-1.5 px-4 rounded-3xl text-white text-base
            font-thin italic shadow-xl transition-all duration-200 ease-in-out border border-gray-600/50
            bg-white/40 backdrop-blur-sm w-80
            hover:scale-[1.02] hover:bg-white/60
            ${selectedChoice === idx + 1 ? 'ring-4 ring-blue-500 ring-opacity-70' : ''}
          `}
        >
          <span className=" ">{choiceText}</span>
        </button>
      ))}
    </div>
  );

  const renderDialogue = () => {
    // Use the comprehensive list defined globally
    const isSpecialStory = storyData?.storyID && INVERTED_STORY_IDS.includes(storyData.storyID);

    // Dynamic Tailwind classes for the text div
    const textClasses = isSpecialStory 
        ? 'text-black italic' // Black text, italic for inverted box
        : 'text-gray-200';    // Default: Gray-200 text for dark box

    return (
      <div className="relative">
        {displayedText.length === fullDialogue.length && storyData?.nextID?.length > 0 && !storyData?.choice?.length && (
          <div className="flex justify-end mb-2">
            <button
              onClick={handleNext}
              className="text-lg italic px-4 py-2 text-white rounded-xl hover:bg-gray-600/25 transition"
            >
              Next &gt;&gt;
            </button>
          </div>
        )}
        <div
          // outer scrollable wrapper: will show scrollbar when text gets large
          className="w-full"
          style={{ maxHeight: '28vh', overflowY: 'auto' }}
        >
          <div 
            // Apply dynamic text color and italic style
            className={`text-xl font-light whitespace-pre-line ${textClasses}`}
          >
            {displayedText}
            {displayedText.length < fullDialogue.length && (
              // Ensure the typing cursor color matches the current text color
              <span className={`animate-pulse ${isSpecialStory ? 'text-black' : 'text-white'}`}>_</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- Enhanced Function to render character sprites with RPG-style effects ---
  const renderCharacters = () => {
    const charactersInScene = [...new Set(dialogueLines.map(line => line.speaker).filter(Boolean))];

    return (
      <AnimatePresence>
        {charactersInScene.map(charName => {
          const asset = characterAssets[charName];
          if (!asset) return null;

          const isActive = currentSpeaker === charName;
          const baseTransform = asset.position === 'right' ? 'scaleX(-1)' : '';
          const xPosition = asset.position === 'left' ? '-5%' : undefined;
          const rightPosition = asset.position === 'right' ? '-5%' : undefined;

          return (
            <motion.div
              key={charName}
              initial={{ 
                opacity: 0, 
                y: 50,
                x: asset.position === 'left' ? -100 : 100 
              }}
              animate={{ 
                opacity: isActive ? 1 : 0.8,
                y: 0,
                x: asset.position === 'left' ? 0 : asset.position === 'right' ? 0 : 0,
                scale: isActive ? 1 : 0.95,
              }}
              exit={{ 
                opacity: 0,
                y: 50,
                x: asset.position === 'left' ? -100 : 100 
              }}
              transition={{
                duration: 0.5,
                ease: "easeInOut"
              }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: xPosition,
                right: rightPosition,
                height: '85vh',
                maxHeight: '800px',
                filter: isActive ? 'brightness(1)' : 'brightness(0.6)',
                transform: baseTransform,
                zIndex: isActive ? 2 : 1,
              }}
              className="character-container"
            >
              {/* Character highlight effect for active speaker */}
              {isActive && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3) 0%, transparent 70%)',
                    pointerEvents: 'none'
                  }}
                />
              )}

              {/* Active speaker indicator */}
              {isActive && (
                <motion.div
                  className="absolute left-1/2 bottom-[-20px] transform -translate-x-1/2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none'
                  }}
                />
              )}

              {/* Character image with floating animation */}
              <motion.img
                src={asset.src}
                alt={charName}
                className="w-full h-full object-contain relative z-10"
                animate={isActive ? {
                  y: [0, -10, 0],
                } : {}}
                transition={isActive ? {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                } : {}}
                style={{
                  filter: `drop-shadow(0 0 10px rgba(255,255,255,${isActive ? 0.3 : 0}))`
                }}
              />

              {/* RPG-style active speaker effects */}
              {isActive && (
                <>
                  {/* Sparkle effects */}
                  <motion.div
                    className="absolute inset-0"
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      background: `
                        radial-gradient(circle at 30% 40%, rgba(255,255,255,0.2) 0%, transparent 20%),
                        radial-gradient(circle at 70% 60%, rgba(255,255,255,0.2) 0%, transparent 20%),
                        radial-gradient(circle at 40% 80%, rgba(255,255,255,0.2) 0%, transparent 20%)
                      `,
                      pointerEvents: 'none'
                    }}
                  />

                  {/* Energy aura effect */}
                  <motion.div
                    className="absolute inset-0"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      background: 'linear-gradient(to top, rgba(255,255,255,0.1), transparent)',
                      borderRadius: '50%',
                      pointerEvents: 'none'
                    }}
                  />
                </>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    );
  };

  useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      if (displayedText.length === fullDialogue.length && !storyData?.choice?.length) {
        handleNext();
      }
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [displayedText, fullDialogue, storyData]);

// ✅ now safe to return conditionally
if (activeMinigame) {
  return (
    <div className="w-screen h-screen relative">
      <UserHUD userState={userState} activeMinigame={activeMinigame} />
      <div style={{ opacity: sceneVisible ? 1 : 0, transition: 'opacity 260ms ease' }}>
        <MinigameLoader id={activeMinigame} config={minigameConfig} onComplete={handleMinigameComplete} />
        {awardMessage && (
          <div className="absolute top-16 right-4 z-50 px-3 py-2 bg-yellow-500 text-black rounded shadow">
            {awardMessage}
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ Handle V1 video story
  // Logic based on the new, extensive list of IDs
  const isInvertedBox = storyData?.storyID && INVERTED_STORY_IDS.includes(storyData.storyID);

  // Dynamic Tailwind classes for the dialogue container
  const dialogueContainerClasses = isInvertedBox
    // Inverted colors: white background, black border
    ? 'bg-white/90 backdrop-blur-md border-[3px] border-black'
    // Default colors: black background, gray border
    : 'bg-black/50 backdrop-blur-sm border-[3px] border-gray-500';


  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-black flex items-end justify-center font-inter"
      style={{
        backgroundImage: storyData?.backgroundImg ? `url(${storyData.backgroundImg})` : 'linear-gradient(to bottom, #1a1a2e, #16213e)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.85)'
      }}
    >
  <UserHUD userState={userState} activeMinigame={activeMinigame} />

      <div style={{ opacity: sceneVisible ? 1 : 0, transition: 'opacity 260ms ease' }} className="absolute inset-0">
        
        {/* Call to render characters */}
        {renderCharacters()}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

        <div className="absolute bottom-[5vh] left-[5%] w-[90%] z-10 flex flex-col items-start space-y-2">

  {/* Speaker Name now flexes above dialogue box */}
  <div 
    className={`text-3xl italic font-bold ${isInvertedBox ? 'text-black' : 'text-white'}`} 
    style={{ 
      textShadow: isInvertedBox 
        ? '0 0 8px rgba(255, 255, 255, 0.9)' 
        : '0 0 8px rgba(0, 0, 0, 0.9)' 
    }}
  >
    {currentSpeaker || " "}
  </div>

  {/* Dialogue Box */}
  <div className={`relative w-full p-6 rounded-xl min-h-[150px] ${dialogueContainerClasses}`}>
    {renderDialogue()}
    
    {displayedText.length < fullDialogue.length && (
      <button
        onClick={handleSkip}
        className={`absolute bottom-4 right-6 text-lg italic px-4 py-2 rounded-xl transition 
          ${isInvertedBox ? 'text-black hover:bg-gray-200/50' : 'text-white hover:bg-gray-600/25'}`}
      >
        Skip &gt;&gt;
      </button>
    )}
  </div>

  {/* Choices stay aligned to right */}
  {displayedText.length === fullDialogue.length && (
    <div className="flex justify-end w-full mt-3">
      {renderChoiceButtons()}
    </div>
  )}
</div>

      </div>
    </div>
  );
};

export default VisualNovelInterface;