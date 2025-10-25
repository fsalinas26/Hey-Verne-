// Story content and image prompt generation for Space Adventure

const STORY_CONTENT = {
  introduction: {
    pageNumber: 1,
    educationalConcept: 'introduction',
    storyText: "Hi! I'm Captain Verne! Ready for a space adventure? Before we blast off, let's take a picture of you so you can be the hero!",
    agentPrompt: "Say 'ready' when you've uploaded your photo!",
    suggestedOptions: ['ready', 'yes'],
    panels: []
  },
  
  page2: {
    pageNumber: 2,
    educationalConcept: 'solar_system_planets',
    storyText: "Wow! Look at you in your space suit! We're blasting off from Earth. Whoosh! See all those colorful balls? Those are the 8 planets in our solar system! Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. They all go around the sun!",
    agentPrompt: "Which planet should we visit first? Mars, the red planet, or Jupiter, the biggest planet?",
    suggestedOptions: ['Mars', 'Jupiter', 'Saturn'],
    defaultChoice: 'Mars'
  },

  page3: {
    pageNumber: 3,
    educationalConcept: 'sun_is_a_star',
    storyText: "Amazing choice! As we zoom through space, look at that bright ball of light! That's the sun. The sun isn't just a light - it's actually a star! A giant, glowing star that gives us light and keeps us warm. Pretty cool, right?",
    agentPrompt: "Should we fly closer to learn more about the sun, or keep a safe distance?",
    suggestedOptions: ['fly closer', 'keep safe', 'stay away'],
    defaultChoice: 'keep safe'
  },

  page4: {
    pageNumber: 4,
    educationalConcept: 'gravity',
    storyText: "Good thinking! Now we're at {chosenPlanet}. Whee! Feel that? In space you float around because there's no gravity. But when we get close to a planet, gravity pulls us down! Gravity is like an invisible hug that keeps everything from floating away. It's what keeps the planets spinning around the sun!",
    agentPrompt: "Do you want to explore the planet's surface or fly around it in orbit?",
    suggestedOptions: ['explore surface', 'fly around', 'orbit'],
    defaultChoice: 'explore surface'
  },

  page5: {
    pageNumber: 5,
    educationalConcept: 'conclusion',
    storyText: "What an adventure! Time to head home. You learned so much today! Remember: our solar system has 8 planets, the sun is a bright star, and gravity keeps everything together. You're now an official space explorer! Great job!",
    agentPrompt: null,
    suggestedOptions: [],
    panels: []
  }
};

const IMAGE_PROMPTS = {
  page2: {
    panel1: (chosenPlanet) => `A cheerful young child astronaut in a colorful orange and white space suit sitting inside a rocket ship cockpit, looking out the large window at planet Earth getting smaller below. Stars twinkling in the deep blue-black space outside. Child's face is clearly visible through the helmet visor, showing excitement and wonder. The cockpit has fun, kid-friendly control panels with colorful buttons. Children's book illustration style, vibrant colors, safe and friendly atmosphere, digital art, highly detailed.`,
    
    panel2: (chosenPlanet) => `The same young child astronaut in their space suit, now floating in zero gravity inside the spacecraft with arms spread wide in joy. Through the large observation window behind them, a beautiful view of the solar system with all 8 planets visible in their correct order - Mercury, Venus, Earth, Mars (red), Jupiter (large with stripes), Saturn (with rings), Uranus, and Neptune. The sun glowing warmly in the distance. Child expressing pure wonder and amazement. Children's book illustration style, educational, colorful, stars sparkling.`
  },

  page3: {
    panel1: (chosenPlanet) => `Young child astronaut in their space suit pointing excitedly at the bright, glowing sun through the spacecraft window. The child is wearing a protective sun visor that's reflecting golden light. The sun is depicted as a magnificent glowing golden star with beautiful rays emanating outward. ${chosenPlanet} visible in the background for scale. Child's face showing curiosity and excitement, mouth forming an "Wow!" expression. Children's book illustration style, warm golden colors, educational, magical atmosphere.`,
    
    panel2: (chosenPlanet) => `Close-up of the young child astronaut with their protective sun visor down, golden sunlight reflecting beautifully on their helmet and suit. The child looks amazed and happy, eyes wide with wonder. In the background through the window, the sun appears as a glorious glowing star with planets orbiting around it in the distance. Lens flare effects making it look magical. Children's book illustration style, warm colors, sense of awe and discovery.`
  },

  page4: {
    panel1: (chosenPlanet) => `Young child astronaut floating playfully in zero gravity inside the spacecraft, arms and legs spread out like they're swimming, with a huge smile on their face. Small toys and equipment floating around them - a teddy bear, a juice pouch, a tablet. Through the window, ${chosenPlanet} is getting closer. Child's expression is pure joy and fun. Children's book illustration style, playful, whimsical, bright colors, sense of weightlessness.`,
    
    panel2: (chosenPlanet) => `Young child astronaut standing proudly on the surface of ${chosenPlanet}, planting a colorful flag with a star on it. The child is wearing their full space suit and is striking a heroic, proud pose with one hand on their hip. The ${chosenPlanet} landscape is visible - rocky terrain if Mars (red rocks), or appropriate features for other planets. Their spacecraft is visible in the background. Earth can be seen as a small blue dot in the sky. Children's book illustration style, heroic, sense of achievement, vibrant colors.`
  },

  page5: {
    panel1: (chosenPlanet) => `Young child astronaut waving happily from the spacecraft window as Earth comes into view, growing larger as they approach home. The child's face is beaming with joy and pride. Earth is beautiful and blue-green below. Stars and the other planets visible in the background getting smaller. The spacecraft is heading toward Earth. Children's book illustration style, heartwarming, sense of returning home, beautiful colors.`,
    
    panel2: (chosenPlanet) => `Young child astronaut standing proudly on Earth, helmet off and tucked under one arm, wearing a shiny gold medal around their neck and holding a "Space Explorer Certificate". The child has a huge proud smile. Behind them is a celebration scene with colorful balloons, stars, and planet decorations. Maybe family members or friends cheering in the background. The spacecraft is visible in the distance. Children's book illustration style, celebratory, achievement theme, happy ending, vibrant festive colors.`
  }
};

class StoryGenerator {
  getPageContent(pageNumber, chosenPlanet = 'Mars') {
    const pageKey = pageNumber === 1 ? 'introduction' : 
                    pageNumber === 5 ? 'page5' : 
                    `page${pageNumber}`;
    
    const content = STORY_CONTENT[pageKey];
    
    if (!content) {
      throw new Error(`Invalid page number: ${pageNumber}`);
    }

    // Replace placeholder with chosen planet
    let storyText = content.storyText;
    if (storyText.includes('{chosenPlanet}')) {
      storyText = storyText.replace('{chosenPlanet}', chosenPlanet);
    }

    return {
      ...content,
      storyText
    };
  }

  getImagePrompts(pageNumber, chosenPlanet = 'Mars') {
    if (pageNumber === 1) {
      return { panel1: null }; // No images for intro/photo page
    }

    const pageKey = `page${pageNumber}`;
    const prompts = IMAGE_PROMPTS[pageKey];

    if (!prompts) {
      throw new Error(`No image prompts for page: ${pageNumber}`);
    }

    // Only return panel1 - one image per page
    return {
      panel1: typeof prompts.panel1 === 'function' ? prompts.panel1(chosenPlanet) : prompts.panel1
    };
  }

  processUserResponse(pageNumber, userResponse, suggestedOptions) {
    // Normalize user response
    const normalized = userResponse.toLowerCase().trim();
    
    // Check if response matches suggested options
    for (const option of suggestedOptions) {
      if (normalized.includes(option.toLowerCase())) {
        return {
          matched: true,
          choice: option,
          wasDefault: false
        };
      }
    }

    // Extract planet names if mentioned
    const planets = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
    for (const planet of planets) {
      if (normalized.includes(planet)) {
        return {
          matched: true,
          choice: planet.charAt(0).toUpperCase() + planet.slice(1),
          wasDefault: false,
          extractedPlanet: planet.charAt(0).toUpperCase() + planet.slice(1)
        };
      }
    }

    // Accept creative responses positively
    if (pageNumber === 2 && (normalized.includes('planet') || normalized.includes('space'))) {
      return {
        matched: true,
        choice: 'Mars', // Default to Mars
        wasDefault: false,
        creative: true
      };
    }

    // Return default
    const content = this.getPageContent(pageNumber);
    return {
      matched: false,
      choice: content.defaultChoice || suggestedOptions[0],
      wasDefault: true
    };
  }

  getNextPageContext(currentPage, userChoice) {
    // Track chosen planet across pages
    const context = {
      chosenPlanet: 'Mars'
    };

    if (currentPage === 2) {
      // User chose a planet
      context.chosenPlanet = userChoice;
    }

    return context;
  }

  // Generate dynamic image prompt based on kid's actual response
  getDynamicImagePrompt(pageNumber, kidResponse, chosenPlanet = 'Mars') {
    // Extract celestial bodies or locations mentioned in the response (case-insensitive)
    const response = kidResponse.toLowerCase();
    
    // Common space destinations with vivid descriptions
    const spaceDestinations = {
      'moon': { name: 'the Moon', desc: 'grey cratered surface with deep craters and mountains', color: 'silver-grey' },
      'sun': { name: 'the Sun', desc: 'massive glowing golden sphere with solar flares (viewed from safe distance)', color: 'bright yellow-orange' },
      'mars': { name: 'Mars', desc: 'rusty red desert planet with enormous canyons and volcanoes', color: 'rusty red' },
      'jupiter': { name: 'Jupiter', desc: 'giant striped gas planet with the Great Red Spot storm', color: 'orange and brown stripes' },
      'saturn': { name: 'Saturn', desc: 'beautiful ringed planet with icy rings surrounding it', color: 'pale yellow with white rings' },
      'venus': { name: 'Venus', desc: 'bright cloudy planet with thick yellow atmosphere', color: 'pale yellow' },
      'mercury': { name: 'Mercury', desc: 'small grey rocky planet covered in craters', color: 'dark grey' },
      'uranus': { name: 'Uranus', desc: 'tilted blue-green ice giant with faint rings', color: 'cyan blue' },
      'neptune': { name: 'Neptune', desc: 'deep blue windy planet with swirling storms', color: 'deep blue' },
      'pluto': { name: 'Pluto', desc: 'small icy dwarf planet with a heart-shaped ice region', color: 'tan and white' },
      'earth': { name: 'Earth', desc: 'beautiful blue marble with swirling white clouds and green continents', color: 'blue and green' },
      'asteroid': { name: 'asteroid belt', desc: 'field of rocky space rocks tumbling through space', color: 'grey and brown' },
      'comet': { name: 'comet', desc: 'bright glowing comet with a spectacular tail of ice and dust', color: 'white and blue glow' },
      'star': { name: 'stars', desc: 'countless twinkling stars of different colors filling the cosmos', color: 'white, blue, red sparkles' },
      'space station': { name: 'space station', desc: 'futuristic orbital station with spinning modules and solar panels', color: 'silver and white' },
      'black hole': { name: 'black hole', desc: 'mysterious dark void with swirling accretion disk (at safe distance)', color: 'dark with orange glow' },
      'galaxy': { name: 'galaxy', desc: 'beautiful spiral galaxy with billions of stars swirling', color: 'purple and white spiral' },
      'nebula': { name: 'nebula', desc: 'colorful glowing cloud of gas and stardust in vibrant colors', color: 'pink, purple, and blue' }
    };

    // Find what the kid mentioned (case-insensitive)
    let destination = null;
    for (const [key, data] of Object.entries(spaceDestinations)) {
      if (response.includes(key)) {
        destination = { name: data.name, desc: data.desc, color: data.color, keyword: key };
        break;
      }
    }

    // If no specific destination found, use the chosen planet
    if (!destination) {
      const planetKey = chosenPlanet.toLowerCase();
      const planetData = spaceDestinations[planetKey] || { name: chosenPlanet, desc: 'a fascinating planet', color: 'colorful' };
      destination = { name: planetData.name, desc: planetData.desc, color: planetData.color, keyword: planetKey };
    }

    // Varied character descriptions for diversity
    const poses = [
      'waving excitedly with both arms up',
      'floating with arms spread wide in amazement',
      'pressing hands and face against the window in wonder',
      'pointing enthusiastically toward space',
      'doing a happy floating spin',
      'giving a big thumbs up with a huge smile'
    ];
    
    const emotions = [
      'eyes wide with wonder and amazement',
      'laughing with pure joy',
      'gasping in awe with mouth open',
      'beaming with excitement',
      'filled with curiosity and delight',
      'radiating happiness and adventure'
    ];
    
    // Random elements for variety (using page number as seed)
    const poseIndex = pageNumber % poses.length;
    const emotionIndex = (pageNumber + 1) % emotions.length;
    
    let prompt = '';
    
    if (pageNumber === 2) {
      // First exploration page - Through window view
      prompt = `A young child astronaut in a brightly colored space suit (${destination.color} accents visible), ${poses[poseIndex]}, ${emotions[emotionIndex]}. Viewing ${destination.name} through a large curved spacecraft window. ${destination.name} fills the window view showing ${destination.desc}. The window frame has fun glowing buttons and controls. Spectacular space vista. MUST BE UNIQUE: Include unique details like floating star-shaped toys or planet stickers on the window. Children's book illustration, Pixar animation style, vibrant ${destination.color} color scheme, ultra detailed, whimsical, 4K quality.`;
    } else if (pageNumber === 3) {
      // Second exploration page - Zero gravity fun
      prompt = `A young child astronaut ${poses[poseIndex]} in zero gravity inside a colorful spacecraft, ${emotions[emotionIndex]}. ${destination.name} visible through background window showing ${destination.desc}. Floating around: a plush teddy bear, colorful juice pouches, crayons, and small books. Spacecraft has ${destination.color} accent lighting. MUST BE UNIQUE: Add specific objects like floating bubbles or a toy rocket ship. The scene captures the magic of weightlessness. Children's book illustration, Pixar style, playful composition, rich ${destination.color} palette, highly detailed, sense of wonder.`;
    } else if (pageNumber === 4) {
      // Landing/arrival page - Epic destination view
      prompt = `A young child astronaut standing on ${destination.name} surface or floating near it, ${poses[poseIndex]}, ${emotions[emotionIndex]}. ${destination.name} landscape dominates the view with ${destination.desc} prominently featured. Their small spacecraft visible in the distance. Earth as a tiny blue dot far away in the black star-filled sky. MUST BE UNIQUE: Include distinctive ${destination.keyword} features (like ${destination.color} terrain or unique formations). Epic hero shot. Children's book illustration, cinematic composition, breathtaking ${destination.color} vista, Pixar animation quality, inspirational, educational, 4K detailed.`;
    } else {
      // Fallback - General adventure
      prompt = `A young child astronaut on an incredible space adventure near ${destination.name}, ${poses[poseIndex]}, ${emotions[emotionIndex]}. ${destination.desc} creates a stunning backdrop. The scene shows ${destination.color} cosmic beauty. MUST BE UNIQUE: Include whimsical space elements specific to this moment. Children's book illustration, vibrant Pixar style, ${destination.color} color palette, magical, inspiring, highly detailed.`;
    }

    console.log(`🎨 DYNAMIC IMAGE PROMPT for page ${pageNumber}:`);
    console.log(`   📍 Destination: ${destination.name} (${destination.keyword})`);
    console.log(`   🎨 Color theme: ${destination.color}`);
    console.log(`   💬 Kid mentioned: "${kidResponse}"`);
    console.log(`   🖼️ Pose: ${poses[poseIndex]}`);
    console.log(`   😊 Emotion: ${emotions[emotionIndex]}`);

    return {
      prompt,
      destination: destination.name,
      context: kidResponse,
      colorTheme: destination.color
    };
  }
}

module.exports = new StoryGenerator();

