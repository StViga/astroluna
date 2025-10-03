import express from 'express';
import { AiController } from '../controllers/AiController';
import { 
  apiRateLimit,
  aiGenerationRateLimit 
} from '../middleware/rateLimiting';
import { authenticate, checkCredits } from '../middleware/auth';

const router = express.Router();
const aiController = new AiController();

// Apply rate limiting to all AI routes
router.use(apiRateLimit);
router.use(aiGenerationRateLimit);

// All AI routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/ai/horoscope
 * @desc    Generate personalized horoscope
 * @access  Private (requires 15 credits)
 */
router.post('/horoscope', checkCredits(15), aiController.generateHoroscope);

/**
 * @route   POST /api/ai/tarot
 * @desc    Generate tarot card reading
 * @access  Private (requires 20 credits)
 */
router.post('/tarot', checkCredits(20), aiController.generateTarotReading);

/**
 * @route   POST /api/ai/zodiac
 * @desc    Generate zodiac insights and compatibility
 * @access  Private (requires 10 credits)
 */
router.post('/zodiac', checkCredits(10), aiController.generateZodiacInsight);

/**
 * @route   GET /api/ai/history
 * @desc    Get user's AI generation history
 * @access  Private
 */
router.get('/history', aiController.getGenerationHistory);

/**
 * @route   GET /api/ai/stats
 * @desc    Get user's AI usage statistics
 * @access  Private
 */
router.get('/stats', aiController.getUsageStats);

/**
 * @route   POST /api/ai/test
 * @desc    Test AI service connection (admin only)
 * @access  Private
 */
router.post('/test', aiController.testAiConnection);

export default router;