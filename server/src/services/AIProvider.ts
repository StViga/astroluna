import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export interface AIGenerationRequest {
  service_type: 'astroscope' | 'tarotpath' | 'zodiac';
  prompt_data: Record<string, any>;
  user_id?: number;
}

export interface AIGenerationResponse {
  content: string;
  generation_time_ms: number;
  provider: string;
  model: string;
  tokens_used?: number;
}

export interface PromptTemplate {
  system: string;
  user: string;
  format: string;
}

export class AIProvider {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private isDemo: boolean;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.isDemo = !apiKey || apiKey === 'demo_mode';
    
    if (!this.isDemo) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      });
    }
    
    console.log(`🤖 AI Provider initialized: ${this.isDemo ? 'Demo Mode' : 'Gemini 1.5 Flash'}`);
  }

  async generateContent(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const startTime = Date.now();
    
    try {
      const prompt = this.buildPrompt(request.service_type, request.prompt_data);
      
      if (this.isDemo) {
        return this.generateDemoResponse(request.service_type, startTime);
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();
      
      return {
        content,
        generation_time_ms: Date.now() - startTime,
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        tokens_used: result.response?.usageMetadata?.totalTokenCount || 0
      };
      
    } catch (error: any) {
      console.error('AI generation error:', error);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  private buildPrompt(serviceType: string, promptData: Record<string, any>): string {
    const template = this.getPromptTemplate(serviceType);
    return this.interpolateTemplate(template, promptData);
  }

  private getPromptTemplate(serviceType: string): PromptTemplate {
    switch (serviceType) {
      case 'astroscope':
        return {
          system: `You are an expert astrologer with deep knowledge of birth charts, planetary movements, and cosmic influences. You provide personalized horoscope readings that are insightful, empowering, and practical.

Guidelines:
- Avoid medical or financial advice
- Use encouraging and positive language
- Make predictions general but meaningful  
- Focus on personal growth and opportunities
- Keep mystical tone but be practical`,

          user: `Generate a personalized weekly horoscope for someone with these details:
- Birth Date: {{birthDate}}
- Birth Time: {{birthTime}}
- Birth Place: {{birthPlace}}
- Zodiac Sign: {{zodiacSign}}

Current timezone: Europe/Kiev
Language: English`,

          format: `Format your response with these exact sections:

**☉ General Overview**
Brief weekly forecast (2-3 sentences about overall cosmic influences)

**💫 Key Areas**
- **Career**: Opportunities and focus areas  
- **Love**: Relationships and emotional insights
- **Health**: Wellbeing and energy guidance

**🔮 Recommendations**
Practical advice and gentle cautions for the week ahead

Keep total response 250-300 words. Use mystical but empowering tone.`
        };

      case 'tarotpath':
        return {
          system: `You are a wise and intuitive tarot reader with years of experience. You provide meaningful card interpretations that offer guidance, clarity, and insight while avoiding fatalistic predictions.

Guidelines:
- Use encouraging and insightful language
- Avoid doom and gloom predictions
- Focus on guidance and personal empowerment
- Explain card symbolism briefly
- Connect past, present, and future meaningfully`,

          user: `Generate a 3-card tarot reading for this question: "{{question}}"

Use these positions:
- Past: What influences led to this situation
- Present: Current energies and opportunities
- Future: Likely outcome and guidance`,

          format: `Format your response exactly like this:

**🃏 Past - [Card Name]**
Brief interpretation of past influences (2-3 sentences)

**🃏 Present - [Card Name]**  
Current situation and opportunities (2-3 sentences)

**🃏 Future - [Card Name]**
Likely outcome and path forward (2-3 sentences)

**🌟 Overall Guidance**
Combined wisdom and practical advice (2-3 sentences)

Use traditional tarot card names (Major or Minor Arcana). Keep total response 150-200 words.`
        };

      case 'zodiac':
        return {
          system: `You are a knowledgeable astrologer specializing in zodiac sign analysis. You provide comprehensive yet concise profiles that highlight both strengths and growth areas for each sign.

Guidelines:
- Be balanced - mention both positive traits and challenges
- Use engaging and informative tone
- Include practical insights
- Make it relatable and useful
- Avoid stereotypes while being authentic`,

          user: `Generate a comprehensive profile for the zodiac sign: {{zodiacSign}}`,

          format: `Format your response exactly like this:

**{{zodiacSign}} Profile**

**Element**: [Element] | **Ruler**: [Planet] | **Dates**: [Date range]

**Key Traits**: List 3-4 main personality characteristics

**Strengths**: Positive qualities and natural talents

**Challenges**: Areas for growth and potential difficulties  

**What Makes {{zodiacSign}} Unique**: 
2-3 sentences describing their special qualities and what sets them apart from other signs

Keep total response 120-150 words. Be insightful and balanced.`
        };

      default:
        throw new Error(`Unknown service type: ${serviceType}`);
    }
  }

  private interpolateTemplate(template: PromptTemplate, data: Record<string, any>): string {
    let fullPrompt = `${template.system}\n\n${template.user}\n\n${template.format}`;
    
    // Replace template variables
    Object.keys(data).forEach(key => {
      const value = data[key] || 'Not specified';
      fullPrompt = fullPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    
    return fullPrompt;
  }

  private generateDemoResponse(serviceType: string, startTime: number): AIGenerationResponse {
    // Simulate API delay
    const delay = Math.random() * 2000 + 1000; // 1-3 seconds
    
    let content = '';
    
    switch (serviceType) {
      case 'astroscope':
        content = `**☉ General Overview**
This week brings powerful cosmic energy and transformative opportunities. The planetary alignments favor personal growth and new beginnings, with Jupiter's influence bringing expansion and optimism.

**💫 Key Areas**
- **Career**: Exceptional creativity and leadership opportunities emerge. Focus on innovative projects and collaboration.
- **Love**: Deep emotional connections develop. Single? Meaningful encounters are likely. Partnered? Deepen intimacy through honest communication.  
- **Health**: Renewed energy and vitality support your wellbeing. Great time for new fitness routines or wellness practices.

**🔮 Recommendations**
Trust your intuition this week and embrace new possibilities. Focus on positive communication and authentic self-expression. Avoid rushing important decisions - patience will serve you well. Midweek brings the most favorable energy for launching new initiatives.

*Generated in demo mode. Configure GEMINI_API_KEY for personalized AI insights.*`;
        break;

      case 'tarotpath':
        content = `**🃏 Past - The Star**
Hope and healing from past challenges have prepared you for this moment. Previous difficulties taught valuable lessons about resilience and faith in your journey.

**🃏 Present - The Magician**
You possess all the tools needed for success right now. Your willpower, resources, and skills are perfectly aligned to manifest your desires into reality.

**🃏 Future - The Sun**
Brilliant success and joy await you. This card promises positive outcomes, recognition, and a period of happiness and achievement in your endeavors.

**🌟 Overall Guidance**
The cards reveal a powerful transformation from past struggles to present empowerment and future success. Trust in your abilities and maintain your positive outlook. The universe is supporting your highest good, and your efforts will soon bear fruit.

*Demo reading generated. Configure GEMINI_API_KEY for AI-powered insights.*`;
        break;

      case 'zodiac':
        content = `**Leo Profile**

**Element**: Fire | **Ruler**: Sun | **Dates**: July 23 - August 22

**Key Traits**: Natural born leader, creative powerhouse, generous spirit, magnetic charisma

**Strengths**: Confidence, creativity, loyalty, natural leadership abilities, warm-heartedness, dramatic flair, inspiring presence

**Challenges**: Pride, need for attention, stubbornness, tendency toward drama, difficulty accepting criticism

**What Makes Leo Unique**:
Leos possess an unmatched ability to light up any room with their radiant energy and genuine warmth. Ruled by the Sun, they naturally inspire and lead others through their passionate approach to life and unwavering belief in their vision.

*Demo analysis generated. Configure GEMINI_API_KEY for detailed AI insights.*`;
        break;
    }

    return {
      content,
      generation_time_ms: Date.now() - startTime,
      provider: 'demo',
      model: 'demo-mode',
      tokens_used: 0
    };
  }

  isInDemoMode(): boolean {
    return this.isDemo;
  }

  getProviderInfo(): { provider: string; model: string; mode: string } {
    return {
      provider: this.isDemo ? 'demo' : 'gemini',
      model: this.isDemo ? 'demo-mode' : 'gemini-1.5-flash',
      mode: this.isDemo ? 'Demo Mode' : 'Live AI'
    };
  }
}