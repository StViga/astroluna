import Database from '../config/database.js';

export interface LibraryItem {
  id: number;
  user_id: number;
  generation_id: number;
  title: string;
  service_type: 'astroscope' | 'tarotpath' | 'zodiac';
  content_preview: string;
  is_favorite: boolean;
  tags: string[];
  created_at: Date;
  updated_at: Date;
  // Joined fields from generation
  full_content?: string;
  prompt_data?: Record<string, any>;
}

export interface CreateLibraryItem {
  user_id: number;
  generation_id: number;
  title: string;
  service_type: 'astroscope' | 'tarotpath' | 'zodiac';
  content_preview: string;
  tags?: string[];
}

export interface LibraryFilters {
  service_type?: string;
  is_favorite?: boolean;
  tags?: string[];
  search?: string;
}

export class Library {
  private db = Database;

  async addToLibrary(data: CreateLibraryItem): Promise<LibraryItem> {
    const { user_id, generation_id, title, service_type, content_preview, tags = [] } = data;

    const query = `
      INSERT INTO library (user_id, generation_id, title, service_type, content_preview, tags)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      user_id, generation_id, title, service_type, content_preview, tags
    ]);

    return result.rows[0];
  }

  async findByUserId(userId: number, filters?: LibraryFilters, limit = 50, offset = 0): Promise<LibraryItem[]> {
    let query = `
      SELECT 
        l.*,
        g.response_text as full_content,
        g.prompt_data
      FROM library l
      LEFT JOIN generations g ON l.generation_id = g.id
      WHERE l.user_id = $1
    `;
    
    const params: any[] = [userId];
    let paramCount = 1;

    // Apply filters
    if (filters?.service_type) {
      paramCount++;
      query += ` AND l.service_type = $${paramCount}`;
      params.push(filters.service_type);
    }

    if (filters?.is_favorite !== undefined) {
      paramCount++;
      query += ` AND l.is_favorite = $${paramCount}`;
      params.push(filters.is_favorite);
    }

    if (filters?.tags && filters.tags.length > 0) {
      paramCount++;
      query += ` AND l.tags && $${paramCount}`;
      params.push(filters.tags);
    }

    if (filters?.search) {
      paramCount++;
      query += ` AND (l.title ILIKE $${paramCount} OR l.content_preview ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
    }

    query += ` ORDER BY l.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await this.db.query(query, params);
    return result.rows;
  }

  async findById(id: number, userId: number): Promise<LibraryItem | null> {
    const query = `
      SELECT 
        l.*,
        g.response_text as full_content,
        g.prompt_data
      FROM library l
      LEFT JOIN generations g ON l.generation_id = g.id
      WHERE l.id = $1 AND l.user_id = $2
    `;
    
    const result = await this.db.query(query, [id, userId]);
    return result.rows[0] || null;
  }

  async toggleFavorite(id: number, userId: number): Promise<boolean> {
    const query = `
      UPDATE library 
      SET is_favorite = NOT is_favorite, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING is_favorite
    `;
    
    const result = await this.db.query(query, [id, userId]);
    return result.rows[0]?.is_favorite || false;
  }

  async updateItem(id: number, userId: number, updates: Partial<LibraryItem>): Promise<LibraryItem | null> {
    const allowedFields = ['title', 'tags', 'is_favorite'];
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (fields.length === 0) return null;

    const setClause = fields.map((field, index) => `${field} = $${index + 3}`).join(', ');
    const values = [id, userId, ...fields.map(field => updates[field as keyof LibraryItem])];

    const query = `
      UPDATE library 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  async deleteItem(id: number, userId: number): Promise<boolean> {
    const query = 'DELETE FROM library WHERE id = $1 AND user_id = $2';
    const result = await this.db.query(query, [id, userId]);
    return (result.rowCount || 0) > 0;
  }

  async getFavorites(userId: number, limit = 20): Promise<LibraryItem[]> {
    return this.findByUserId(userId, { is_favorite: true }, limit);
  }

  async getByServiceType(userId: number, serviceType: string, limit = 20): Promise<LibraryItem[]> {
    return this.findByUserId(userId, { service_type: serviceType }, limit);
  }

  async getAllTags(userId: number): Promise<string[]> {
    const query = `
      SELECT DISTINCT unnest(tags) as tag
      FROM library 
      WHERE user_id = $1 AND tags IS NOT NULL
      ORDER BY tag
    `;
    
    const result = await this.db.query(query, [userId]);
    return result.rows.map(row => row.tag);
  }

  async getLibraryStats(userId: number): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_items,
        COUNT(*) FILTER (WHERE is_favorite) as favorites_count,
        service_type,
        COUNT(*) as service_count
      FROM library 
      WHERE user_id = $1
      GROUP BY service_type
    `;

    const result = await this.db.query(query, [userId]);
    
    const stats = {
      total_items: 0,
      favorites_count: 0,
      by_service: {} as Record<string, number>
    };

    result.rows.forEach(row => {
      stats.total_items += parseInt(row.service_count);
      stats.favorites_count = parseInt(row.favorites_count) || 0;
      stats.by_service[row.service_type] = parseInt(row.service_count);
    });

    return stats;
  }

  async searchLibrary(userId: number, searchTerm: string, limit = 20): Promise<LibraryItem[]> {
    return this.findByUserId(userId, { search: searchTerm }, limit);
  }

  async getRecentItems(userId: number, days = 7, limit = 10): Promise<LibraryItem[]> {
    const query = `
      SELECT 
        l.*,
        g.response_text as full_content,
        g.prompt_data
      FROM library l
      LEFT JOIN generations g ON l.generation_id = g.id
      WHERE l.user_id = $1 
      AND l.created_at >= CURRENT_DATE - INTERVAL '${days} days'
      ORDER BY l.created_at DESC
      LIMIT $2
    `;
    
    const result = await this.db.query(query, [userId, limit]);
    return result.rows;
  }

  async autoSaveGeneration(generationId: number): Promise<LibraryItem | null> {
    // Auto-save generation to library with default title
    const generationQuery = `
      SELECT g.*, u.id as user_id
      FROM generations g
      JOIN users u ON g.user_id = u.id
      WHERE g.id = $1 AND g.status = 'completed'
    `;
    
    const generationResult = await this.db.query(generationQuery, [generationId]);
    const generation = generationResult.rows[0];
    
    if (!generation) return null;

    // Check if already saved
    const existsQuery = 'SELECT id FROM library WHERE generation_id = $1';
    const existsResult = await this.db.query(existsQuery, [generationId]);
    
    if (existsResult.rows.length > 0) {
      return this.findById(existsResult.rows[0].id, generation.user_id);
    }

    // Generate auto title based on service type
    let title = '';
    const date = new Date().toLocaleDateString();
    
    switch (generation.service_type) {
      case 'astroscope':
        title = `AstroScope Reading - ${date}`;
        break;
      case 'tarotpath':
        title = `Tarot Reading - ${date}`;
        break;
      case 'zodiac':
        const zodiacSign = generation.prompt_data?.zodiacSign || 'Unknown';
        title = `${zodiacSign} Analysis - ${date}`;
        break;
    }

    // Create preview (first 200 characters)
    const preview = generation.response_text.substring(0, 200) + '...';

    return this.addToLibrary({
      user_id: generation.user_id,
      generation_id: generationId,
      title,
      service_type: generation.service_type,
      content_preview: preview
    });
  }
}