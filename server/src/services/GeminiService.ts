import { GoogleGenerativeAI } from '@google/generative-ai';

export interface HoroscopeRequest {
  zodiacSign?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  type: 'daily' | 'weekly' | 'monthly' | 'compatibility';
  partnerSign?: string;
}

export interface TarotRequest {
  question?: string;
  spread: 'single' | 'three-card' | 'celtic-cross' | 'five-card';
  cards?: string[];
}

export interface ZodiacRequest {
  sign: string;
  query: string;
  type: 'personality' | 'compatibility' | 'career' | 'love';
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required but not provided');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  /**
   * Generate personalized horoscope using Gemini AI
   */
  async generateHoroscope(request: HoroscopeRequest): Promise<{
    horoscope: string;
    mood: string;
    luckyNumbers: number[];
    luckyColors: string[];
    advice: string;
  }> {
    let prompt = '';

    switch (request.type) {
      case 'daily':
        prompt = `Generate a personalized daily horoscope for ${request.zodiacSign || 'the person'}. ${
          request.birthDate ? `Birth date: ${request.birthDate}. ` : ''
        }${
          request.birthTime ? `Birth time: ${request.birthTime}. ` : ''
        }${
          request.birthPlace ? `Birth place: ${request.birthPlace}. ` : ''
        }

        Please provide:
        1. A detailed horoscope reading (3-4 sentences)
        2. Today's mood/energy
        3. 3 lucky numbers
        4. 2 lucky colors
        5. Practical advice for the day

        Format your response as JSON with keys: horoscope, mood, luckyNumbers (array), luckyColors (array), advice.
        Keep it positive, insightful, and personalized. Be specific about planetary influences and cosmic energies.`;
        break;

      case 'compatibility':
        prompt = `Generate a detailed compatibility reading between ${request.zodiacSign} and ${request.partnerSign}.
        
        Analyze:
        1. Overall compatibility percentage and explanation
        2. Emotional connection
        3. Communication style
        4. Challenges and strengths
        5. Advice for the relationship

        Format as JSON with keys: horoscope (main reading), mood (relationship energy), luckyNumbers (compatibility factors), luckyColors (harmony colors), advice (relationship tips).`;
        break;

      case 'weekly':
        prompt = `Generate a comprehensive weekly horoscope for ${request.zodiacSign}. Cover love, career, health, and finances.
        
        Format as JSON with keys: horoscope (detailed weekly forecast), mood (week's energy), luckyNumbers (3 numbers), luckyColors (2 colors), advice (weekly guidance).`;
        break;

      case 'monthly':
        prompt = `Create a detailed monthly horoscope for ${request.zodiacSign}. Include major planetary transits and their effects.
        
        Format as JSON with keys: horoscope (monthly overview), mood (month's theme), luckyNumbers (3 numbers), luckyColors (2 colors), advice (monthly strategy).`;
        break;
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse as JSON, fallback to structured format
      try {
        const parsed = JSON.parse(text);
        return {
          horoscope: parsed.horoscope || text,
          mood: parsed.mood || 'Balanced',
          luckyNumbers: parsed.luckyNumbers || [7, 14, 21],
          luckyColors: parsed.luckyColors || ['Blue', 'Gold'],
          advice: parsed.advice || 'Trust your intuition today.'
        };
      } catch {
        // Fallback if not proper JSON
        return {
          horoscope: text,
          mood: 'Mystical',
          luckyNumbers: [Math.floor(Math.random() * 50) + 1, Math.floor(Math.random() * 50) + 1, Math.floor(Math.random() * 50) + 1],
          luckyColors: ['Purple', 'Silver'],
          advice: 'The universe has a plan for you. Stay open to its messages.'
        };
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate horoscope. Please try again.');
    }
  }

  /**
   * Generate Tarot card reading using Gemini AI
   */
  async generateTarotReading(request: TarotRequest): Promise<{
    cards: Array<{
      name: string;
      position: string;
      meaning: string;
      interpretation: string;
      image?: string;
    }>;
    overallMessage: string;
    advice: string;
  }> {
    // Pre-defined tarot deck for consistency
    const majorArcana = [
      'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
      'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
      'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
      'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun',
      'Judgement', 'The World'
    ];

    const minorArcana = [
      // Cups
      'Ace of Cups', 'Two of Cups', 'Three of Cups', 'Four of Cups', 'Five of Cups',
      'Six of Cups', 'Seven of Cups', 'Eight of Cups', 'Nine of Cups', 'Ten of Cups',
      'Page of Cups', 'Knight of Cups', 'Queen of Cups', 'King of Cups',
      // Wands
      'Ace of Wands', 'Two of Wands', 'Three of Wands', 'Four of Wands', 'Five of Wands',
      'Six of Wands', 'Seven of Wands', 'Eight of Wands', 'Nine of Wands', 'Ten of Wands',
      'Page of Wands', 'Knight of Wands', 'Queen of Wands', 'King of Wands',
      // Swords
      'Ace of Swords', 'Two of Swords', 'Three of Swords', 'Four of Swords', 'Five of Swords',
      'Six of Swords', 'Seven of Swords', 'Eight of Swords', 'Nine of Swords', 'Ten of Swords',
      'Page of Swords', 'Knight of Swords', 'Queen of Swords', 'King of Swords',
      // Pentacles
      'Ace of Pentacles', 'Two of Pentacles', 'Three of Pentacles', 'Four of Pentacles', 'Five of Pentacles',
      'Six of Pentacles', 'Seven of Pentacles', 'Eight of Pentacles', 'Nine of Pentacles', 'Ten of Pentacles',
      'Page of Pentacles', 'Knight of Pentacles', 'Queen of Pentacles', 'King of Pentacles'
    ];

    const allCards = [...majorArcana, ...minorArcana];
    
    // Select cards based on spread type
    let selectedCards: string[] = [];
    let positions: string[] = [];

    if (request.cards && request.cards.length > 0) {
      selectedCards = request.cards;
    } else {
      // Randomly select cards
      const shuffled = [...allCards].sort(() => Math.random() - 0.5);
      
      switch (request.spread) {
        case 'single':
          selectedCards = [shuffled[0]];
          positions = ['Present Situation'];
          break;
        case 'three-card':
          selectedCards = shuffled.slice(0, 3);
          positions = ['Past', 'Present', 'Future'];
          break;
        case 'five-card':
          selectedCards = shuffled.slice(0, 5);
          positions = ['Past Influences', 'Present Situation', 'Hidden Influences', 'Advice', 'Outcome'];
          break;
        case 'celtic-cross':
          selectedCards = shuffled.slice(0, 10);
          positions = [
            'Present Situation', 'Challenge/Cross', 'Distant Past/Foundation', 'Recent Past',
            'Possible Outcome', 'Near Future', 'Your Approach', 'External Influences',
            'Hopes and Fears', 'Final Outcome'
          ];
          break;
      }
    }

    const prompt = `Generate a detailed Tarot reading for the following cards and positions:

${selectedCards.map((card, index) => `${positions[index] || `Position ${index + 1}`}: ${card}`).join('\n')}

${request.question ? `Question: "${request.question}"` : 'General life guidance reading'}

For each card, provide:
1. Card name
2. Position meaning
3. Traditional card meaning
4. Interpretation in this context

Also provide:
- Overall message of the reading
- Practical advice

Format as JSON with structure:
{
  "cards": [{"name": "card name", "position": "position", "meaning": "traditional meaning", "interpretation": "contextual interpretation"}],
  "overallMessage": "overall reading message",
  "advice": "practical guidance"
}

Be insightful, compassionate, and provide actionable guidance. Consider both upright meanings and the flow between cards.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const parsed = JSON.parse(text);
        return {
          cards: parsed.cards || selectedCards.map((card, index) => ({
            name: card,
            position: positions[index] || `Position ${index + 1}`,
            meaning: 'A card of transformation and new beginnings.',
            interpretation: 'This card speaks to your current journey and the path ahead.'
          })),
          overallMessage: parsed.overallMessage || 'The cards reveal a time of significant change and growth in your life.',
          advice: parsed.advice || 'Trust in your inner wisdom and remain open to new opportunities.'
        };
      } catch {
        // Fallback format
        return {
          cards: selectedCards.map((card, index) => ({
            name: card,
            position: positions[index] || `Position ${index + 1}`,
            meaning: 'This card carries deep spiritual significance.',
            interpretation: text.slice(0, 200) + '...',
          })),
          overallMessage: 'The cards speak of transformation and new possibilities.',
          advice: 'Listen to your intuition and trust the process of change.'
        };
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate tarot reading. Please try again.');
    }
  }

  /**
   * Generate zodiac knowledge and compatibility insights
   */
  async generateZodiacInsight(request: ZodiacRequest): Promise<{
    insight: string;
    traits: string[];
    compatibility: string[];
    advice: string;
  }> {
    const prompt = `Generate detailed zodiac insights for ${request.sign} regarding ${request.type}.

Query: "${request.query}"

Provide:
1. Detailed insight (3-4 paragraphs)
2. Key personality traits (5 traits)
3. Most compatible signs (3 signs with brief explanations)
4. Personalized advice

Format as JSON with keys: insight, traits (array), compatibility (array of strings), advice.

Be detailed, accurate to astrological tradition, and provide practical guidance.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const parsed = JSON.parse(text);
        return {
          insight: parsed.insight || text,
          traits: parsed.traits || ['Intuitive', 'Creative', 'Passionate', 'Loyal', 'Ambitious'],
          compatibility: parsed.compatibility || ['Taurus', 'Cancer', 'Virgo'],
          advice: parsed.advice || 'Trust your natural instincts and embrace your unique qualities.'
        };
      } catch {
        return {
          insight: text,
          traits: ['Intuitive', 'Creative', 'Passionate'],
          compatibility: ['Compatible with earth and water signs'],
          advice: 'Embrace your natural cosmic energy and trust your path.'
        };
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate zodiac insight. Please try again.');
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.model.generateContent('Say "Hello from Gemini AI" in exactly those words.');
      const response = await result.response;
      const text = response.text();
      return text.includes('Hello from Gemini AI');
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }
}