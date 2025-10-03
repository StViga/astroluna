import Database from '../config/database.js';

export interface GenerationData {
  id: number;
  user_id: number;
  service_type: 'astroscope' | 'tarotpath' | 'zodiac';
  prompt_data: Record<string, any>;
  response_text: string;
  credits_used: number;
  generation_time_ms: number;
  ai_provider: string;
  ai_model: string;
  status: 'completed' | 'failed';
  error_message?: string;
  created_at: Date;
}

export interface CreateGenerationData {
  user_id: number;
  service_type: 'astroscope' | 'tarotpath' | 'zodiac';
  prompt_data: Record<string, any>;
  response_text: string;
  credits_used: number;
  generation_time_ms: number;
  ai_provider?: string;
  ai_model?: string;
}

export interface GenerationStats {
  total_generations: number;
  total_credits_used: number;
  avg_generation_time: number;
  success_rate: number;
  by_service: Record<string, number>;
}

export class Generation {
  private db = Database;

  async create(data: CreateGenerationData): Promise<GenerationData> {
    const {
      user_id,
      service_type,
      prompt_data,
      response_text,
      credits_used,
      generation_time_ms,
      ai_provider = 'gemini',
      ai_model = 'gemini-1.5-flash'
    } = data;

    const query = `
      INSERT INTO generations (
        user_id, service_type, prompt_data, response_text, 
        credits_used, generation_time_ms, ai_provider, ai_model, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'completed')
      RETURNING *
    `;

    const result = await this.db.query(query, [
      user_id, service_type, JSON.stringify(prompt_data), response_text,
      credits_used, generation_time_ms, ai_provider, ai_model
    ]);

    return result.rows[0];
  }

  async recordFailure(
    user_id: number,
    service_type: string,
    prompt_data: Record<string, any>,
    error_message: string
  ): Promise<GenerationData> {
    const query = `
      INSERT INTO generations (
        user_id, service_type, prompt_data, response_text,
        credits_used, generation_time_ms, status, error_message
      )
      VALUES ($1, $2, $3, '', 0, 0, 'failed', $4)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      user_id, service_type, JSON.stringify(prompt_data), error_message
    ]);

    return result.rows[0];
  }

  async findByUserId(userId: number, limit = 50, offset = 0): Promise<GenerationData[]> {
    const query = `
      SELECT * FROM generations 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const result = await this.db.query(query, [userId, limit, offset]);
    return result.rows;
  }

  async findByUserAndService(
    userId: number, 
    serviceType: string, 
    limit = 20
  ): Promise<GenerationData[]> {
    const query = `
      SELECT * FROM generations 
      WHERE user_id = $1 AND service_type = $2 
      ORDER BY created_at DESC 
      LIMIT $3
    `;
    
    const result = await this.db.query(query, [userId, serviceType, limit]);
    return result.rows;
  }

  async findById(id: number): Promise<GenerationData | null> {
    const query = 'SELECT * FROM generations WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return result.rows[0] || null;
  }

  async getUserStats(userId: number): Promise<GenerationStats> {
    const query = `
      SELECT 
        COUNT(*) as total_generations,
        SUM(credits_used) as total_credits_used,
        AVG(generation_time_ms) as avg_generation_time,
        AVG(CASE WHEN status = 'completed' THEN 1.0 ELSE 0.0 END) as success_rate,
        service_type,
        COUNT(*) as service_count
      FROM generations 
      WHERE user_id = $1
      GROUP BY service_type
    `;

    const result = await this.db.query(query, [userId]);
    
    const stats: GenerationStats = {
      total_generations: 0,
      total_credits_used: 0,
      avg_generation_time: 0,
      success_rate: 0,
      by_service: {}
    };

    if (result.rows.length > 0) {
      // Aggregate totals
      stats.total_generations = result.rows.reduce((sum, row) => sum + parseInt(row.service_count), 0);
      stats.total_credits_used = result.rows.reduce((sum, row) => sum + parseInt(row.total_credits_used || 0), 0);
      stats.avg_generation_time = result.rows.reduce((sum, row) => sum + parseFloat(row.avg_generation_time || 0), 0) / result.rows.length;
      stats.success_rate = result.rows.reduce((sum, row) => sum + parseFloat(row.success_rate || 0), 0) / result.rows.length;

      // By service breakdown
      result.rows.forEach(row => {
        stats.by_service[row.service_type] = parseInt(row.service_count);
      });
    }

    return stats;
  }

  async getRecentActivity(userId: number, days = 7): Promise<GenerationData[]> {
    const query = `
      SELECT * FROM generations 
      WHERE user_id = $1 
      AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
      ORDER BY created_at DESC
    `;
    
    const result = await this.db.query(query, [userId]);
    return result.rows;
  }

  async deleteByUser(userId: number): Promise<number> {
    const query = 'DELETE FROM generations WHERE user_id = $1';
    const result = await this.db.query(query, [userId]);
    return result.rowCount || 0;
  }

  async getSystemStats(days = 30): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_generations,
        SUM(credits_used) as total_credits,
        AVG(generation_time_ms) as avg_time,
        service_type,
        DATE(created_at) as date,
        COUNT(*) as daily_count
      FROM generations 
      WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY service_type, DATE(created_at)
      ORDER BY date DESC
    `;

    const result = await this.db.query(query);
    return result.rows;
  }
}