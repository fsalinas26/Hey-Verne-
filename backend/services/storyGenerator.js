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
      return { panel1: null, panel2: null }; // No images for intro/photo page
    }

    const pageKey = `page${pageNumber}`;
    const prompts = IMAGE_PROMPTS[pageKey];

    if (!prompts) {
      throw new Error(`No image prompts for page: ${pageNumber}`);
    }

    return {
      panel1: typeof prompts.panel1 === 'function' ? prompts.panel1(chosenPlanet) : prompts.panel1,
      panel2: typeof prompts.panel2 === 'function' ? prompts.panel2(chosenPlanet) : prompts.panel2
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
}

module.exports = new StoryGenerator();

