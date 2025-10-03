import nodemailer from 'nodemailer';
import { logger } from './LoggingService';

interface EmailConfig {
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  smtp_user: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private config: EmailConfig;

  constructor() {
    this.config = {
      smtp_host: process.env.SMTP_HOST || 'smtp.gmail.com',
      smtp_port: parseInt(process.env.SMTP_PORT || '587'),
      smtp_secure: process.env.SMTP_SECURE === 'true',
      smtp_user: process.env.SMTP_USER || '',
      smtp_password: process.env.SMTP_PASSWORD || '',
      from_email: process.env.FROM_EMAIL || 'noreply@astroluna.ai',
      from_name: process.env.FROM_NAME || 'AstroLuna'
    };

    this.transporter = nodemailer.createTransporter({
      host: this.config.smtp_host,
      port: this.config.smtp_port,
      secure: this.config.smtp_secure,
      auth: {
        user: this.config.smtp_user,
        pass: this.config.smtp_password
      }
    });
  }

  async sendEmailVerification(email: string, token: string, language: string = 'en'): Promise<boolean> {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/verify-email?token=${token}`;
    
    const template = this.getEmailVerificationTemplate(verifyUrl, language);
    
    return this.sendEmail(email, template);
  }

  async sendPasswordReset(email: string, token: string, language: string = 'en'): Promise<boolean> {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    
    const template = this.getPasswordResetTemplate(resetUrl, language);
    
    return this.sendEmail(email, template);
  }

  async sendWelcomeEmail(email: string, fullName: string, language: string = 'en'): Promise<boolean> {
    const template = this.getWelcomeTemplate(fullName, language);
    
    return this.sendEmail(email, template);
  }

  private async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      const mailOptions = {
        from: `${this.config.from_name} <${this.config.from_email}>`,
        to: to,
        subject: template.subject,
        html: template.html,
        text: template.text
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent successfully', { 
        to, 
        subject: template.subject, 
        messageId: info.messageId 
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to send email', { to, error: error.message });
      return false;
    }
  }

  private getEmailVerificationTemplate(verifyUrl: string, language: string): EmailTemplate {
    if (language === 'uk') {
      return {
        subject: 'Підтвердіть вашу електронну адресу - AstroLuna',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🌟 AstroLuna</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Штучний Інтелект для Астрології</p>
            </div>
            
            <div style="padding: 40px 30px; background: white;">
              <h2 style="color: #333; margin-bottom: 20px;">Ласкаво просимо до AstroLuna!</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Дякуємо за реєстрацію в AstroLuna! Щоб завершити створення облікового запису, 
                будь ласка, підтвердіть вашу електронну адресу, натиснувши на кнопку нижче.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                  ✅ Підтвердити Email
                </a>
              </div>
              
              <p style="color: #888; font-size: 14px; margin-top: 30px;">
                Якщо кнопка не працює, скопіюйте це посилання в ваш браузер:<br>
                <a href="${verifyUrl}" style="color: #667eea; word-break: break-all;">${verifyUrl}</a>
              </p>
              
              <p style="color: #888; font-size: 14px; margin-top: 20px;">
                Це посилання діє протягом 24 годин. Якщо ви не реєструвалися в AstroLuna, 
                просто ігноруйте цей лист.
              </p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
              © 2024 AstroLuna. Всі права захищені.
            </div>
          </div>
        `,
        text: `
          Ласкаво просимо до AstroLuna!
          
          Дякуємо за реєстрацію! Щоб завершити створення облікового запису, 
          перейдіть за цим посиланням: ${verifyUrl}
          
          Це посилання діє протягом 24 годин.
          
          AstroLuna Team
        `
      };
    }

    // English default
    return {
      subject: 'Verify Your Email Address - AstroLuna',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🌟 AstroLuna</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">AI-Powered Astrology Platform</p>
          </div>
          
          <div style="padding: 40px 30px; background: white;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to AstroLuna!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Thank you for registering with AstroLuna! To complete your account setup, 
              please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                ✅ Verify Email
              </a>
            </div>
            
            <p style="color: #888; font-size: 14px; margin-top: 30px;">
              If the button doesn't work, copy this link into your browser:<br>
              <a href="${verifyUrl}" style="color: #667eea; word-break: break-all;">${verifyUrl}</a>
            </p>
            
            <p style="color: #888; font-size: 14px; margin-top: 20px;">
              This link expires in 24 hours. If you didn't sign up for AstroLuna, 
              please ignore this email.
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            © 2024 AstroLuna. All rights reserved.
          </div>
        </div>
      `,
      text: `
        Welcome to AstroLuna!
        
        Thank you for registering! To complete your account setup, 
        please visit: ${verifyUrl}
        
        This link expires in 24 hours.
        
        AstroLuna Team
      `
    };
  }

  private getPasswordResetTemplate(resetUrl: string, language: string): EmailTemplate {
    if (language === 'uk') {
      return {
        subject: 'Скидання паролю - AstroLuna',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🌟 AstroLuna</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Штучний Інтелект для Астрології</p>
            </div>
            
            <div style="padding: 40px 30px; background: white;">
              <h2 style="color: #333; margin-bottom: 20px;">Скидання паролю</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Ви запросили скидання паролю для вашого облікового запису AstroLuna. 
                Натисніть на кнопку нижче, щоб створити новий пароль.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                  🔑 Скинути Пароль
                </a>
              </div>
              
              <p style="color: #888; font-size: 14px; margin-top: 30px;">
                Якщо кнопка не працює, скопіюйте це посилання в ваш браузер:<br>
                <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
              </p>
              
              <p style="color: #888; font-size: 14px; margin-top: 20px;">
                Це посилання діє протягом 1 години. Якщо ви не запросили скидання паролю, 
                просто ігноруйте цей лист.
              </p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
              © 2024 AstroLuna. Всі права захищені.
            </div>
          </div>
        `,
        text: `
          Скидання паролю - AstroLuna
          
          Ви запросили скидання паролю. Перейдіть за цим посиланням: ${resetUrl}
          
          Це посилання діє протягом 1 години.
          
          AstroLuna Team
        `
      };
    }

    return {
      subject: 'Password Reset - AstroLuna',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🌟 AstroLuna</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">AI-Powered Astrology Platform</p>
          </div>
          
          <div style="padding: 40px 30px; background: white;">
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              You requested a password reset for your AstroLuna account. 
              Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                🔑 Reset Password
              </a>
            </div>
            
            <p style="color: #888; font-size: 14px; margin-top: 30px;">
              If the button doesn't work, copy this link into your browser:<br>
              <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
            </p>
            
            <p style="color: #888; font-size: 14px; margin-top: 20px;">
              This link expires in 1 hour. If you didn't request a password reset, 
              please ignore this email.
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            © 2024 AstroLuna. All rights reserved.
          </div>
        </div>
      `,
      text: `
        Password Reset - AstroLuna
        
        You requested a password reset. Please visit: ${resetUrl}
        
        This link expires in 1 hour.
        
        AstroLuna Team
      `
    };
  }

  private getWelcomeTemplate(fullName: string, language: string): EmailTemplate {
    if (language === 'uk') {
      return {
        subject: 'Ласкаво просимо до AstroLuna! 🌟',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🌟 AstroLuna</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Штучний Інтелект для Астрології</p>
            </div>
            
            <div style="padding: 40px 30px; background: white;">
              <h2 style="color: #333; margin-bottom: 20px;">Привіт, ${fullName}! 👋</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Ласкаво просимо до AstroLuna! Ваш обліковий запис успішно створено.
              </p>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Тепер ви маєте доступ до потужних інструментів штучного інтелекту для астрологічних досліджень:
              </p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <ul style="margin: 0; padding-left: 20px; color: #333;">
                  <li style="margin-bottom: 10px;">🔮 Генерація натальних карт з ШІ аналізом</li>
                  <li style="margin-bottom: 10px;">📊 Астрологічні прогнози та поради</li>
                  <li style="margin-bottom: 10px;">💫 Аналіз сумісності партнерів</li>
                  <li style="margin-bottom: 10px;">📚 Особиста бібліотека контенту</li>
                  <li>💰 Система кредитів для гнучкої оплати</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                  🚀 Перейти до Кабінету
                </a>
              </div>
              
              <p style="color: #888; font-size: 14px; margin-top: 30px;">
                Потрібна допомога? Звертайтеся до нашої служби підтримки в будь-який час.
              </p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
              © 2024 AstroLuna. Всі права захищені.
            </div>
          </div>
        `,
        text: `
          Привіт, ${fullName}!
          
          Ласкаво просимо до AstroLuna! Ваш обліковий запис успішно створено.
          
          Перейдіть до кабінету: ${process.env.FRONTEND_URL}/dashboard
          
          AstroLuna Team
        `
      };
    }

    return {
      subject: 'Welcome to AstroLuna! 🌟',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🌟 AstroLuna</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">AI-Powered Astrology Platform</p>
          </div>
          
          <div style="padding: 40px 30px; background: white;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello, ${fullName}! 👋</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Welcome to AstroLuna! Your account has been successfully created.
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              You now have access to powerful AI tools for astrological insights:
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <ul style="margin: 0; padding-left: 20px; color: #333;">
                <li style="margin-bottom: 10px;">🔮 AI-powered natal chart generation</li>
                <li style="margin-bottom: 10px;">📊 Astrological forecasts and insights</li>
                <li style="margin-bottom: 10px;">💫 Compatibility analysis</li>
                <li style="margin-bottom: 10px;">📚 Personal content library</li>
                <li>💰 Flexible credit-based billing</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                🚀 Go to Dashboard
              </a>
            </div>
            
            <p style="color: #888; font-size: 14px; margin-top: 30px;">
              Need help? Contact our support team anytime.
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            © 2024 AstroLuna. All rights reserved.
          </div>
        </div>
      `,
      text: `
        Hello, ${fullName}!
        
        Welcome to AstroLuna! Your account has been successfully created.
        
        Go to your dashboard: ${process.env.FRONTEND_URL}/dashboard
        
        AstroLuna Team
      `
    };
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      logger.error('Email service connection failed', { error: error.message });
      return false;
    }
  }
}

export const emailService = new EmailService();