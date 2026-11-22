require('dotenv').config();

const mongoose = require('mongoose');
const Game = require('./models/Game');

const sampleGames = [
  {
    title: 'Stroop Challenge',
    description: 'Ignore the word. Tap the ink color as fast as you can.',
    category: 'Pattern Recognition',
    categoryLabel: 'FOCUS + SPEED',
    mode: 'Classic',
    difficulty: 'Hard',
    instructions: 'Read the displayed color name carefully and select the actual text ink color.',
    bestScore: 380,
    iconKey: 'stroop',
    accentColor: '#8B5CF6',
    displayOrder: 1,
    isActive: true
  },
  {
    title: 'Memory Match',
    description: 'Reveal cards and remember every pair.',
    category: 'Memory Matching',
    categoryLabel: 'RECALL + FOCUS',
    mode: 'Classic',
    difficulty: 'Easy',
    instructions: 'Turn two cards at a time and find all matching pairs in the fewest attempts.',
    bestScore: 320,
    iconKey: 'memory',
    accentColor: '#EF4C70',
    displayOrder: 2,
    isActive: true
  },
  {
    title: 'Word Hunt',
    description: 'Find hidden words in a letter grid.',
    category: 'Brain Training',
    categoryLabel: 'FOCUS + RECALL',
    mode: 'Classic',
    difficulty: 'Easy',
    instructions: 'Search the grid horizontally, vertically, or diagonally to find the hidden words.',
    bestScore: 500,
    iconKey: 'word-hunt',
    accentColor: '#69A9E7',
    displayOrder: 3,
    isActive: true
  },
  {
    title: 'Quick Math',
    description: 'Solve the calculation fast and tap the right answer.',
    category: 'Logic Puzzle',
    categoryLabel: 'NUMBERS + SPEED',
    mode: 'Timed',
    difficulty: 'Easy',
    instructions: 'Solve each math problem before time runs out and choose the correct answer.',
    bestScore: 220,
    iconKey: 'quick-math',
    accentColor: '#6D74EC',
    displayOrder: 4,
    isActive: true
  },
  {
    title: 'Ball Tracker',
    description: 'Follow the cup, find the hidden ball, and track carefully.',
    category: 'Pattern Recognition',
    categoryLabel: 'TRACKING + FOCUS',
    mode: 'Classic',
    difficulty: 'Easy',
    instructions: 'Watch the cups while they move, then select the cup containing the hidden ball.',
    bestScore: 70,
    iconKey: 'ball-tracker',
    accentColor: '#E93A88',
    displayOrder: 5,
    isActive: true
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    for (const game of sampleGames) {
      await Game.updateOne(
        { title: game.title },
        { $set: game },
        { upsert: true }
      );
    }

    const games = await Game.find().sort({ displayOrder: 1 });
    console.log(`Seeded ${games.length} games successfully.`);
  } catch (error) {
    console.error(`Seed failed: ${error.message}`);
  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase();
