// AI Services routes for AstroLuna (AstroScope, TarotPath, ZodiacTome)

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { DatabaseService } from '../utils/database';
import { MockDatabaseService } from '../utils/mock-database';
import { GeminiService } from '../utils/gemini';
import { authMiddleware, getCurrentUser, checkCredits } from '../middleware/auth';

const aiServices = new Hono();

// Helper function to get database service
async function getDbService(env: any) {
  // In non-Cloudflare environments, always use mock database
  if (typeof env?.DB === 'undefined') {
    console.log('Using mock database (non-Cloudflare environment)');
    await MockDatabaseService.initialize();
    return new MockDatabaseService();
  }

  try {
    await env.DB.prepare('SELECT COUNT(*) FROM users LIMIT 1').first();
    return new DatabaseService(env.DB);
  } catch (error) {
    console.log('D1 database not properly configured, using mock database:', error.message);
    await MockDatabaseService.initialize();
    return new MockDatabaseService();
  }
}

// Validation schemas
const astroScopeSchema = z.object({
  type: z.enum(['quick', 'personalized']),
  zodiac_sign: z.string().optional(),
  birth_date: z.string().optional(),
  birth_time: z.string().optional(),
  birth_place: z.string().optional(),
  language: z.enum(['en', 'es', 'de']).default('en')
});

const tarotPathSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  reading_type: z.string().min(1, 'Reading type is required'),
  spread_type: z.string().min(1, 'Spread type is required'),
  selected_cards: z.array(z.number()).min(5, 'Must select 5 cards').max(5, 'Must select exactly 5 cards'),
  language: z.enum(['en', 'es', 'de']).default('en')
});

const zodiacTomeSchema = z.object({
  zodiac_sign: z.string().min(1, 'Zodiac sign is required'),
  analysis_type: z.enum(['compatibility', 'insights']),
  target_sign: z.string().optional(),
  language: z.enum(['en', 'es', 'de']).default('en')
});

// AstroScope - Generate Horoscope
aiServices.post('/astroscope/generate', authMiddleware, zValidator('json', astroScopeSchema), async (c) => {
  try {
    const userId = getCurrentUser(c);
    const data = c.req.valid('json');
    
    // Check if user has sufficient credits (15 credits for horoscope)
    const creditsCheck = await checkCredits(c, 15);
    if (!creditsCheck.hasCredits) {
      return c.json({
        error: 'Insufficient credits',
        required: 15,
        current: creditsCheck.currentBalance
      }, 402);
    }

    const db = await getDbService(c.env);

    // Validate required fields based on type
    if (data.type === 'personalized' && !data.birth_date) {
      return c.json({ error: 'Birth date is required for personalized horoscope' }, 400);
    }
    
    if (data.type === 'quick' && !data.zodiac_sign) {
      return c.json({ error: 'Zodiac sign is required for quick horoscope' }, 400);
    }

    // Create generation log
    const genLog = await db.createGenerationLog({
      user_id: userId,
      service_type: 'astroscope',
      params: JSON.stringify(data),
      base_cost: 15,
      total_cost: 15
    });

    try {
      // Generate horoscope using Gemini API
      const geminiApiKey = c.env?.GEMINI_API_KEY || process.env.GEMINI_API_KEY || 'AIzaSyB9QfEPqQ0yrOiMYw6bsp6-lVO6a9wCE4Q';
      if (!geminiApiKey) {
        throw new Error('Gemini API key not configured');
      }

      const horoscope = await GeminiService.generateHoroscope(data, geminiApiKey);

      // Save generated content to library
      const content = await db.saveContent({
        user_id: userId,
        content_type: 'horoscope',
        title: horoscope.title,
        content: JSON.stringify(horoscope.content),
        meta: JSON.stringify({
          type: data.type,
          zodiac_sign: data.zodiac_sign,
          birth_date: data.birth_date,
          birth_time: data.birth_time,
          birth_place: data.birth_place,
          language: data.language,
          generated_at: new Date().toISOString()
        })
      });

      // Deduct credits from user account
      await db.deductCredits(userId, 15);

      // Update generation log with success
      await db.updateGenerationLogStatus(genLog.id, 'completed', content.id.toString());

      return c.json({
        success: true,
        horoscope,
        content_id: content.id,
        credits_used: 15,
        remaining_credits: creditsCheck.currentBalance - 15
      });

    } catch (error) {
      // Update generation log with failure
      await db.updateGenerationLogStatus(genLog.id, 'failed');
      
      console.error('Horoscope generation error:', error);
      return c.json({
        error: 'Failed to generate horoscope',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 500);
    }

  } catch (error) {
    console.error('AstroScope error:', error);
    return c.json({ error: 'Service temporarily unavailable' }, 500);
  }
});

// TarotPath - Generate Tarot Reading
aiServices.post('/tarotpath/generate', authMiddleware, zValidator('json', tarotPathSchema), async (c) => {
  try {
    const userId = getCurrentUser(c);
    const data = c.req.valid('json');
    
    // Check if user has sufficient credits (20 credits for tarot reading)
    const creditsCheck = await checkCredits(c, 20);
    if (!creditsCheck.hasCredits) {
      return c.json({
        error: 'Insufficient credits',
        required: 20,
        current: creditsCheck.currentBalance
      }, 402);
    }

    const db = await getDbService(c.env);

    // Create generation log
    const genLog = await db.createGenerationLog({
      user_id: userId,
      service_type: 'tarotpath',
      params: JSON.stringify(data),
      base_cost: 20,
      total_cost: 20
    });

    try {
      // Generate tarot reading using Gemini API
      const geminiApiKey = c.env?.GEMINI_API_KEY || process.env.GEMINI_API_KEY || 'AIzaSyB9QfEPqQ0yrOiMYw6bsp6-lVO6a9wCE4Q';
      if (!geminiApiKey) {
        throw new Error('Gemini API key not configured');
      }

      const tarotReading = await GeminiService.generateTarotReading(data, geminiApiKey);

      // Save generated content to library
      const content = await db.saveContent({
        user_id: userId,
        content_type: 'tarot_reading',
        title: tarotReading.title,
        content: JSON.stringify({
          cards: tarotReading.cards,
          overall: tarotReading.overall
        }),
        meta: JSON.stringify({
          question: data.question,
          reading_type: data.reading_type,
          spread_type: data.spread_type,
          selected_cards: data.selected_cards,
          language: data.language,
          generated_at: new Date().toISOString()
        })
      });

      // Deduct credits from user account
      await db.deductCredits(userId, 20);

      // Update generation log with success
      await db.updateGenerationLogStatus(genLog.id, 'completed', content.id.toString());

      return c.json({
        success: true,
        tarot_reading: tarotReading,
        content_id: content.id,
        credits_used: 20,
        remaining_credits: creditsCheck.currentBalance - 20
      });

    } catch (error) {
      // Update generation log with failure
      await db.updateGenerationLogStatus(genLog.id, 'failed');
      
      console.error('Tarot reading generation error:', error);
      return c.json({
        error: 'Failed to generate tarot reading',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 500);
    }

  } catch (error) {
    console.error('TarotPath error:', error);
    return c.json({ error: 'Service temporarily unavailable' }, 500);
  }
});

// ZodiacTome - Generate Zodiac Analysis
aiServices.post('/zodiac-tome/generate', authMiddleware, zValidator('json', zodiacTomeSchema), async (c) => {
  try {
    const userId = getCurrentUser(c);
    const data = c.req.valid('json');
    
    // Check if user has sufficient credits (10 credits for zodiac analysis)
    const creditsCheck = await checkCredits(c, 10);
    if (!creditsCheck.hasCredits) {
      return c.json({
        error: 'Insufficient credits',
        required: 10,
        current: creditsCheck.currentBalance
      }, 402);
    }

    // Validate compatibility analysis requirements
    if (data.analysis_type === 'compatibility' && !data.target_sign) {
      return c.json({ error: 'Target sign is required for compatibility analysis' }, 400);
    }

    const db = await getDbService(c.env);

    // Create generation log
    const genLog = await db.createGenerationLog({
      user_id: userId,
      service_type: 'zodiac_tome',
      params: JSON.stringify(data),
      base_cost: 10,
      total_cost: 10
    });

    try {
      // Generate zodiac analysis using Gemini API
      const geminiApiKey = c.env?.GEMINI_API_KEY || process.env.GEMINI_API_KEY || 'AIzaSyB9QfEPqQ0yrOiMYw6bsp6-lVO6a9wCE4Q';
      if (!geminiApiKey) {
        throw new Error('Gemini API key not configured');
      }

      const zodiacAnalysis = await GeminiService.generateZodiacInfo(data, geminiApiKey);

      // Create title based on analysis type
      const title = data.analysis_type === 'compatibility' 
        ? `${data.zodiac_sign} & ${data.target_sign} Compatibility Analysis`
        : `${data.zodiac_sign} Deep Insights & Analysis`;

      // Save generated content to library
      const content = await db.saveContent({
        user_id: userId,
        content_type: 'zodiac_info',
        title,
        content: JSON.stringify(zodiacAnalysis),
        meta: JSON.stringify({
          zodiac_sign: data.zodiac_sign,
          analysis_type: data.analysis_type,
          target_sign: data.target_sign,
          language: data.language,
          generated_at: new Date().toISOString()
        })
      });

      // Deduct credits from user account
      await db.deductCredits(userId, 10);

      // Update generation log with success
      await db.updateGenerationLogStatus(genLog.id, 'completed', content.id.toString());

      return c.json({
        success: true,
        zodiac_analysis: {
          title,
          ...zodiacAnalysis
        },
        content_id: content.id,
        credits_used: 10,
        remaining_credits: creditsCheck.currentBalance - 10
      });

    } catch (error) {
      // Update generation log with failure
      await db.updateGenerationLogStatus(genLog.id, 'failed');
      
      console.error('Zodiac analysis generation error:', error);
      return c.json({
        error: 'Failed to generate zodiac analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 500);
    }

  } catch (error) {
    console.error('ZodiacTome error:', error);
    return c.json({ error: 'Service temporarily unavailable' }, 500);
  }
});

// Get user's generated content
aiServices.get('/content', authMiddleware, async (c) => {
  try {
    const userId = getCurrentUser(c);
    const contentType = c.req.query('type'); // Optional filter
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');
    
    const db = await getDbService(c.env);
    const content = await db.getUserContent(userId, contentType);
    
    // Apply pagination manually for mock database
    const paginatedContent = content.slice(offset, offset + limit);
    
    return c.json({
      success: true,
      content: paginatedContent,
      pagination: {
        limit,
        offset,
        total: content.length
      }
    });

  } catch (error) {
    console.error('Get content error:', error);
    return c.json({ error: 'Failed to retrieve content' }, 500);
  }
});

// Get specific content by ID
aiServices.get('/content/:id', authMiddleware, async (c) => {
  try {
    const userId = getCurrentUser(c);
    const contentId = parseInt(c.req.param('id'));
    
    const db = await getDbService(c.env);
    const userContent = await db.getUserContent(userId);
    const content = userContent.find(item => item.id === contentId);
    
    if (!content) {
      return c.json({ error: 'Content not found' }, 404);
    }
    
    return c.json({
      success: true,
      content
    });

  } catch (error) {
    console.error('Get content by ID error:', error);
    return c.json({ error: 'Failed to retrieve content' }, 500);
  }
});

// Get service pricing info
aiServices.get('/pricing', async (c) => {
  return c.json({
    success: true,
    services: {
      astroscope: {
        name: 'AstroScope',
        description: 'Personalized monthly horoscope',
        cost: 15,
        features: ['Personalized insights', 'Key dates', 'Multiple life areas', 'PDF download']
      },
      tarotpath: {
        name: 'TarotPath',
        description: 'AI-generated Tarot reading',
        cost: 20,
        features: ['5-card spread', 'Detailed interpretations', 'Personal guidance', 'PDF download']
      },
      zodiac_tome: {
        name: 'ZodiacTome',
        description: 'Zodiac compatibility & insights',
        cost: 10,
        features: ['Compatibility analysis', 'Deep insights', 'Multiple aspects', 'Instant results']
      }
    },
    supported_languages: ['en', 'es', 'de']
  });
});

// Test Gemini connection (development only)
aiServices.get('/test-gemini', async (c) => {
  if (c.env.NODE_ENV === 'production') {
    return c.json({ error: 'Test endpoint not available in production' }, 403);
  }

  try {
    const geminiApiKey = c.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return c.json({ 
        success: false, 
        error: 'Gemini API key not configured',
        config: {
          api_key: 'missing'
        }
      });
    }

    // Test simple generation
    const testResponse = await GeminiService.generateContent(
      'Generate a short welcome message for AstroLuna users.',
      geminiApiKey,
      { maxOutputTokens: 100 }
    );

    return c.json({
      success: true,
      message: 'Gemini API connection successful',
      test_response: testResponse,
      config: {
        api_key: 'configured'
      }
    });

  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Gemini connection test failed',
      config: {
        api_key: c.env.GEMINI_API_KEY ? 'configured' : 'missing'
      }
    });
  }
});

export default aiServices;