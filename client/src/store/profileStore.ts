import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

export interface AstrologicalProfile {
  // Birth Data
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  timeZone: string;
  
  // Calculated Data
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  
  // Coordinates (calculated from place)
  latitude?: number;
  longitude?: number;
  
  // Verification status
  isVerified: boolean;
  lastUpdated: string;
}

export interface PartnerProfile {
  name?: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  timeZone: string;
}

interface ProfileState {
  // State
  astrologicalProfile: AstrologicalProfile | null;
  savedPartners: PartnerProfile[];
  isLoading: boolean;
  error: string | null;

  // Actions
  updateAstrologicalProfile: (data: Partial<AstrologicalProfile>) => Promise<void>;
  addPartner: (partner: PartnerProfile) => void;
  removePartner: (index: number) => void;
  updatePartner: (index: number, data: Partial<PartnerProfile>) => void;
  clearProfile: () => void;
  calculateAstrologyData: (birthData: { date: string; time: string; place: string }) => Promise<void>;
  
  // Utility actions
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  hasCompleteBirthData: () => boolean;
  getFormattedBirthData: () => { date: string; time: string; place: string } | null;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      // Initial state
      astrologicalProfile: null,
      savedPartners: [],
      isLoading: false,
      error: null,

      // Update astrological profile
      updateAstrologicalProfile: async (data) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentProfile = get().astrologicalProfile;
          const updatedProfile: AstrologicalProfile = {
            ...currentProfile,
            ...data,
            lastUpdated: new Date().toISOString(),
            isVerified: false // Re-verify when data changes
          };

          // If we have complete birth data, calculate astrological info
          if (updatedProfile.birthDate && updatedProfile.birthTime && updatedProfile.birthPlace) {
            await get().calculateAstrologyData({
              date: updatedProfile.birthDate,
              time: updatedProfile.birthTime,
              place: updatedProfile.birthPlace
            });
          }

          set({ 
            astrologicalProfile: updatedProfile,
            isLoading: false 
          });
          
          toast.success('Astrological profile updated!');
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to update profile' 
          });
          toast.error('Failed to update profile');
          throw error;
        }
      },

      // Calculate astrological data (mock implementation)
      calculateAstrologyData: async (birthData) => {
        // In real app, this would call an astrology API or calculation service
        // For now, we'll use mock data based on birth date
        
        const birthDate = new Date(birthData.date);
        const month = birthDate.getMonth() + 1;
        const day = birthDate.getDate();
        
        // Simple sun sign calculation (mock)
        let sunSign = 'Unknown';
        if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) sunSign = 'Aries';
        else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) sunSign = 'Taurus';
        else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) sunSign = 'Gemini';
        else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) sunSign = 'Cancer';
        else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) sunSign = 'Leo';
        else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) sunSign = 'Virgo';
        else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) sunSign = 'Libra';
        else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) sunSign = 'Scorpio';
        else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) sunSign = 'Sagittarius';
        else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) sunSign = 'Capricorn';
        else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) sunSign = 'Aquarius';
        else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) sunSign = 'Pisces';

        // Mock moon and rising signs (in real app, these would be calculated based on exact time and location)
        const mockMoonSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        const mockRisingSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        
        const moonSign = mockMoonSigns[Math.floor(Math.random() * mockMoonSigns.length)];
        const risingSign = mockRisingSigns[Math.floor(Math.random() * mockRisingSigns.length)];

        // Update profile with calculated data
        const currentProfile = get().astrologicalProfile;
        set({
          astrologicalProfile: {
            ...currentProfile,
            ...birthData,
            sunSign,
            moonSign,
            risingSign,
            isVerified: true,
            lastUpdated: new Date().toISOString()
          } as AstrologicalProfile
        });
      },

      // Add partner
      addPartner: (partner) => {
        const partners = get().savedPartners;
        set({ 
          savedPartners: [...partners, { ...partner, name: partner.name || `Partner ${partners.length + 1}` }] 
        });
        toast.success('Partner added to saved profiles!');
      },

      // Remove partner
      removePartner: (index) => {
        const partners = get().savedPartners;
        set({ 
          savedPartners: partners.filter((_, i) => i !== index) 
        });
        toast.success('Partner removed from saved profiles');
      },

      // Update partner
      updatePartner: (index, data) => {
        const partners = get().savedPartners;
        const updatedPartners = partners.map((partner, i) => 
          i === index ? { ...partner, ...data } : partner
        );
        set({ savedPartners: updatedPartners });
      },

      // Clear profile
      clearProfile: () => {
        set({ 
          astrologicalProfile: null,
          savedPartners: [],
          error: null 
        });
        toast.success('Profile cleared');
      },

      // Utility actions
      clearError: () => set({ error: null }),
      setLoading: (loading) => set({ isLoading: loading }),

      // Check if user has complete birth data
      hasCompleteBirthData: () => {
        const profile = get().astrologicalProfile;
        return !!(profile?.birthDate && profile?.birthTime && profile?.birthPlace);
      },

      // Get formatted birth data for forms
      getFormattedBirthData: () => {
        const profile = get().astrologicalProfile;
        if (!profile || !get().hasCompleteBirthData()) {
          return null;
        }
        
        return {
          date: profile.birthDate,
          time: profile.birthTime,
          place: profile.birthPlace
        };
      }
    }),
    {
      name: 'astroluna-profile-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        astrologicalProfile: state.astrologicalProfile,
        savedPartners: state.savedPartners
      })
    }
  )
);

// Utility hook
export const useProfile = () => {
  const store = useProfileStore();
  
  return {
    ...store,
    hasBirthData: store.hasCompleteBirthData(),
    birthData: store.getFormattedBirthData(),
    isProfileComplete: store.astrologicalProfile?.isVerified || false
  };
};