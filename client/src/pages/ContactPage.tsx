import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  const contactMethods = [
    {
      name: 'Email Support',
      description: 'Get help from our support team within 24 hours',
      contact: 'support@astroluna.ai',
      icon: EnvelopeIcon,
      color: 'from-blue-500 to-indigo-600',
      available: '24/7'
    },
    {
      name: 'Live Chat',
      description: 'Chat with our team in real-time during business hours',
      contact: 'Available in dashboard',
      icon: ChatBubbleLeftRightIcon,
      color: 'from-green-500 to-emerald-600',
      available: 'Mon-Fri, 9AM-6PM PST'
    },
    {
      name: 'Phone Support',
      description: 'Speak directly with our experts for complex issues',
      contact: '+1 (555) 123-LUNA',
      icon: PhoneIcon,
      color: 'from-purple-500 to-violet-600',
      available: 'Mon-Fri, 9AM-6PM PST'
    }
  ];

  const supportCategories = [
    {
      name: 'Technical Support',
      description: 'Issues with the platform, login problems, or bugs',
      icon: ExclamationTriangleIcon,
      examples: ['Login issues', 'Payment problems', 'Platform bugs', 'Account access']
    },
    {
      name: 'Billing & Subscriptions',
      description: 'Questions about plans, billing, or account management',
      icon: EnvelopeIcon,
      examples: ['Plan changes', 'Billing questions', 'Refund requests', 'Credit issues']
    },
    {
      name: 'Astrological Questions',
      description: 'Help understanding your readings or astrological concepts',
      icon: QuestionMarkCircleIcon,
      examples: ['Reading interpretation', 'Astrological guidance', 'Chart questions', 'Compatibility help']
    },
    {
      name: 'Partnership & Business',
      description: 'Enterprise solutions, partnerships, or business inquiries',
      icon: HeartIcon,
      examples: ['API access', 'White label', 'Partnerships', 'Enterprise plans']
    }
  ];

  const officeLocations = [
    {
      city: 'San Francisco',
      address: '123 Cosmic Way, Suite 456',
      description: 'Main headquarters and AI development center',
      timezone: 'PST (UTC-8)'
    },
    {
      city: 'New York',
      address: '789 Stellar Avenue, Floor 12',
      description: 'East Coast operations and customer success',
      timezone: 'EST (UTC-5)'
    },
    {
      city: 'London',
      address: '456 Astrology Lane, Level 3',
      description: 'European operations and research center',
      timezone: 'GMT (UTC+0)'
    }
  ];

  return (
    <div className="bg-cosmic-stars bg-cover bg-center bg-fixed min-h-screen relative">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      
      <div className="relative z-10">
        {/* Header Section */}
        <div className="py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl drop-shadow-lg">
                Contact <span className="text-yellow-300">AstroLuna</span>
              </h1>
              <p className="mt-6 text-xl leading-8 text-gray-200 max-w-3xl mx-auto drop-shadow-md">
                We're here to help you on your astrological journey. Whether you have questions, 
                need support, or want to explore partnerships, our team is ready to assist.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white drop-shadow-lg">Get in Touch</h2>
              <p className="mt-4 text-lg text-gray-200 drop-shadow-md">
                Choose the best way to reach us based on your needs
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {contactMethods.map((method) => (
                <div key={method.name} className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20 shadow-xl text-center hover:bg-opacity-15 transition-all duration-300">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${method.color} mb-6 shadow-lg`}>
                    <method.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-md">{method.name}</h3>
                  <p className="text-gray-200 mb-4 drop-shadow-sm">{method.description}</p>
                  <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-4">
                    <div className="font-mono text-yellow-300 drop-shadow-md">{method.contact}</div>
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-300">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    {method.available}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form and Support Categories */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Contact Form */}
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20 shadow-xl">
                <h3 className="text-2xl font-bold text-white mb-6 drop-shadow-md">Send us a Message</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                      required
                    >
                      <option value="" className="text-gray-900">Select a category</option>
                      <option value="technical" className="text-gray-900">Technical Support</option>
                      <option value="billing" className="text-gray-900">Billing & Subscriptions</option>
                      <option value="astrological" className="text-gray-900">Astrological Questions</option>
                      <option value="business" className="text-gray-900">Partnership & Business</option>
                      <option value="other" className="text-gray-900">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                      placeholder="Brief subject line"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={5}
                      className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent resize-none"
                      placeholder="Describe your question or issue in detail..."
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-gradient-cosmic hover:shadow-xl shadow-lg" size="lg">
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Support Categories */}
              <div>
                <h3 className="text-2xl font-bold text-white mb-8 drop-shadow-md">How Can We Help?</h3>
                <div className="space-y-6">
                  {supportCategories.map((category) => (
                    <div key={category.name} className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20 shadow-xl">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <category.icon className="h-6 w-6 text-yellow-300" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-white mb-2 drop-shadow-md">{category.name}</h4>
                          <p className="text-gray-200 text-sm mb-3 drop-shadow-sm">{category.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {category.examples.map((example) => (
                              <span key={example} className="bg-white bg-opacity-20 text-gray-200 px-2 py-1 rounded text-xs">
                                {example}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Office Locations */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white drop-shadow-lg">Our Offices</h2>
              <p className="mt-4 text-lg text-gray-200 drop-shadow-md">
                AstroLuna teams around the world ready to support you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {officeLocations.map((location) => (
                <div key={location.city} className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20 shadow-xl text-center hover:bg-opacity-15 transition-all duration-300">
                  <MapPinIcon className="h-8 w-8 text-yellow-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2 drop-shadow-md">{location.city}</h3>
                  <p className="text-gray-200 mb-4 drop-shadow-sm">{location.address}</p>
                  <p className="text-gray-300 text-sm mb-3 drop-shadow-sm">{location.description}</p>
                  <div className="bg-white bg-opacity-20 rounded-lg p-2">
                    <span className="text-yellow-300 text-sm font-medium">{location.timezone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Link Section */}
        <div className="py-24">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div className="bg-mystical-space bg-cover bg-center rounded-3xl p-12 relative overflow-hidden">
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-cosmic bg-opacity-80 rounded-3xl"></div>
              
              <div className="relative z-10">
                <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
                  Looking for Quick Answers?
                </h2>
                <p className="text-xl text-gray-100 mb-8 drop-shadow-md">
                  Check out our comprehensive FAQ section or explore our help documentation 
                  for instant solutions to common questions.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/pricing">
                    <Button size="lg" className="bg-white bg-opacity-90 text-gray-800 hover:bg-opacity-100 shadow-xl">
                      View FAQ
                    </Button>
                  </Link>
                  <Link to="/services">
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-800">
                      Help Documentation
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;