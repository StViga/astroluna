import { Response } from 'express';
import { GeminiService } from '../services/GeminiService';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types/auth';
import { 
  horoscopeGenerationSchema,
  tarotGenerationSchema,
  zodiacGenerationSchema,
  validate
} from '../utils/validation';
import { SystemLogger } from '../services/LoggingService';

export class AiController {
  private geminiService = new GeminiService();
  private userModel = new User();

  // Generate horoscope using Gemini AI
  generateHoroscope = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const validation = validate(horoscopeGenerationSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: validation.errors,
          code: 'VALIDATION_ERROR'
        });
      }

      const userId = req.user!.id;
      const requestData = validation.data;
      const creditsRequired = 15;

      // Generate horoscope
      const startTime = Date.now();
      const horoscopeResult = await this.geminiService.generateHoroscope(requestData);
      const processingTime = Date.now() - startTime;

      // Deduct credits and log generation
      const { success, newBalance } = await this.userModel.deductCredits(userId, creditsRequired);
      if (!success) {
        return res.status(402).json({
          success: false,
          error: 'Insufficient credits',
          code: 'INSUFFICIENT_CREDITS',
          required: creditsRequired,
          available: newBalance
        });
      }

      // Log the generation
      await this.logGeneration(userId, 'horoscope', requestData, horoscopeResult, creditsRequired, processingTime);

      SystemLogger.aiGeneration(userId, 'horoscope', creditsRequired, processingTime);

      res.json({
        success: true,
        data: horoscopeResult,
        creditsUsed: creditsRequired,
        remainingCredits: newBalance,
        processingTime
      });

    } catch (error: any) {
      console.error('Horoscope generation error:', error);
      SystemLogger.apiError('ai-horoscope', 'POST', 500, error.message);
      
      res.status(500).json({
        success: false,
        error: 'Failed to generate horoscope',
        code: 'AI_GENERATION_ERROR'
      });
    }
  };

  // Generate tarot reading using Gemini AI
  generateTarotReading = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const validation = validate(tarotGenerationSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: validation.errors,
          code: 'VALIDATION_ERROR'
        });
      }

      const userId = req.user!.id;
      const requestData = validation.data;
      const creditsRequired = 20;

      // Generate tarot reading
      const startTime = Date.now();
      const tarotResult = await this.geminiService.generateTarotReading(requestData);
      const processingTime = Date.now() - startTime;

      // Deduct credits
      const { success, newBalance } = await this.userModel.deductCredits(userId, creditsRequired);
      if (!success) {
        return res.status(402).json({
          success: false,
          error: 'Insufficient credits',
          code: 'INSUFFICIENT_CREDITS',
          required: creditsRequired,
          available: newBalance
        });
      }

      // Log the generation
      await this.logGeneration(userId, 'tarot', requestData, tarotResult, creditsRequired, processingTime);

      SystemLogger.aiGeneration(userId, 'tarot', creditsRequired, processingTime);

      res.json({
        success: true,
        data: tarotResult,
        creditsUsed: creditsRequired,
        remainingCredits: newBalance,
        processingTime
      });

    } catch (error: any) {
      console.error('Tarot generation error:', error);
      SystemLogger.apiError('ai-tarot', 'POST', 500, error.message);
      
      res.status(500).json({
        success: false,
        error: 'Failed to generate tarot reading',
        code: 'AI_GENERATION_ERROR'
      });
    }
  };

  // Generate zodiac insights using Gemini AI
  generateZodiacInsight = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const validation = validate(zodiacGenerationSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: validation.errors,
          code: 'VALIDATION_ERROR'
        });
      }

      const userId = req.user!.id;
      const requestData = validation.data;
      const creditsRequired = 10;

      // Generate zodiac insight
      const startTime = Date.now();
      const zodiacResult = await this.geminiService.generateZodiacInsight(requestData);
      const processingTime = Date.now() - startTime;

      // Deduct credits
      const { success, newBalance } = await this.userModel.deductCredits(userId, creditsRequired);
      if (!success) {
        return res.status(402).json({
          success: false,
          error: 'Insufficient credits',
          code: 'INSUFFICIENT_CREDITS',
          required: creditsRequired,
          available: newBalance
        });
      }

      // Log the generation
      await this.logGeneration(userId, 'zodiac', requestData, zodiacResult, creditsRequired, processingTime);

      SystemLogger.aiGeneration(userId, 'zodiac', creditsRequired, processingTime);

      res.json({
        success: true,
        data: zodiacResult,
        creditsUsed: creditsRequired,
        remainingCredits: newBalance,
        processingTime
      });

    } catch (error: any) {
      console.error('Zodiac generation error:', error);
      SystemLogger.apiError('ai-zodiac', 'POST', 500, error.message);
      
      res.status(500).json({
        success: false,
        error: 'Failed to generate zodiac insight',
        code: 'AI_GENERATION_ERROR'
      });
    }
  };

  // Get user's AI generation history
  getGenerationHistory = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const service = req.query.service as string;

      let query = `
        SELECT id, service, input_data, output_data, credits_used, processing_time_ms, created_at
        FROM ai_generations 
        WHERE user_id = $1
      `;
      const params: any[] = [userId];

      if (service && ['horoscope', 'tarot', 'zodiac'].includes(service)) {
        query += ` AND service = $${params.length + 1}`;
        params.push(service);
      }

      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, (page - 1) * limit);

      const result = await this.userModel.query(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM ai_generations WHERE user_id = $1';
      const countParams = [userId];
      if (service && ['horoscope', 'tarot', 'zodiac'].includes(service)) {
        countQuery += ' AND service = $2';
        countParams.push(service);
      }
      const countResult = await this.userModel.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: {
          generations: result.rows,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error: any) {
      console.error('Get generation history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch generation history'
      });
    }
  };

  // Get user's AI usage statistics
  getUsageStats = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      const stats = await this.userModel.query(`
        SELECT 
          service,
          COUNT(*) as total_generations,
          SUM(credits_used) as total_credits_used,
          AVG(processing_time_ms) as avg_processing_time,
          COUNT(*) FILTER (WHERE created_at > CURRENT_DATE - INTERVAL '7 days') as last_7_days,
          COUNT(*) FILTER (WHERE created_at > CURRENT_DATE - INTERVAL '30 days') as last_30_days
        FROM ai_generations 
        WHERE user_id = $1 
        GROUP BY service
      `, [userId]);

      // Get overall stats
      const overallStats = await this.userModel.query(`
        SELECT 
          COUNT(*) as total_generations,
          SUM(credits_used) as total_credits_used,
          AVG(processing_time_ms) as avg_processing_time
        FROM ai_generations 
        WHERE user_id = $1
      `, [userId]);

      // Get current credits balance
      const balance = await this.userModel.getCreditsBalance(userId);

      res.json({
        success: true,
        data: {
          overall: overallStats.rows[0] || { total_generations: 0, total_credits_used: 0, avg_processing_time: 0 },
          byService: stats.rows,
          currentBalance: balance
        }
      });

    } catch (error: any) {
      console.error('Get usage stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch usage statistics'
      });
    }
  };

  // Test AI connection
  testAiConnection = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const connected = await this.geminiService.testConnection();
      
      res.json({
        success: true,
        data: {
          connected,
          service: 'Gemini AI',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error: any) {
      console.error('AI connection test error:', error);
      res.status(500).json({
        success: false,
        error: 'AI connection test failed',
        details: error.message
      });
    }
  };

  // Helper method to log AI generations
  private async logGeneration(
    userId: number,
    service: string,
    inputData: any,
    outputData: any,
    creditsUsed: number,
    processingTime: number
  ) {
    try {
      await this.userModel.query(`
        INSERT INTO ai_generations (user_id, service, input_data, output_data, credits_used, processing_time_ms)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [userId, service, JSON.stringify(inputData), JSON.stringify(outputData), creditsUsed, processingTime]);

      // Also log credit transaction
      await this.userModel.query(`
        INSERT INTO credit_transactions (user_id, type, amount, description, service_used)
        VALUES ($1, $2, $3, $4, $5)
      `, [userId, 'spent', creditsUsed, `AI generation: ${service}`, service]);

    } catch (error) {
      console.error('Failed to log AI generation:', error);
      // Don't throw error, as the main generation was successful
    }
  }
}