import api from '@/services/api';

interface GeoLocationData {
  country: string;
  countryCode: string;
  currency: 'INR' | 'USD';
  region: 'India' | 'International';
  timezone: string;
  city?: string;
}

class GeoLocationService {
  private cache: GeoLocationData | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  async detectUserLocation(): Promise<GeoLocationData> {
    // Check cache first
    if (this.cache && Date.now() < this.cacheExpiry) {
      return this.cache;
    }

    try {
      // Try multiple methods for better accuracy
      const methods = [
        this.detectViaIPAPI,
        this.detectViaIPInfo,
        this.detectViaBrowserAPI,
        this.detectViaBackend
      ];

      for (const method of methods) {
        try {
          const result = await method();
          if (result) {
            this.cache = result;
            this.cacheExpiry = Date.now() + this.CACHE_DURATION;
            return result;
          }
        } catch (error) {
          console.log(`Geo detection method failed:`, error);
          continue;
        }
      }

      // Fallback to default
      const fallback: GeoLocationData = {
        country: 'United States',
        countryCode: 'US',
        currency: 'USD',
        region: 'International',
        timezone: 'America/New_York'
      };

      this.cache = fallback;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;
      return fallback;

    } catch (error) {
      console.error('All geo detection methods failed:', error);
      return {
        country: 'United States',
        countryCode: 'US',
        currency: 'USD',
        region: 'International',
        timezone: 'America/New_York'
      };
    }
  }

  private async detectViaIPAPI(): Promise<GeoLocationData | null> {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    if (data.country_code) {
      return {
        country: data.country_name || data.country,
        countryCode: data.country_code,
        currency: data.country_code === 'IN' ? 'INR' : 'USD',
        region: data.country_code === 'IN' ? 'India' : 'International',
        timezone: data.timezone || 'UTC',
        city: data.city
      };
    }
    
    return null;
  }

  private async detectViaIPInfo(): Promise<GeoLocationData | null> {
    const response = await fetch('https://ipinfo.io/json');
    const data = await response.json();
    
    if (data.country) {
      return {
        country: data.country === 'IN' ? 'India' : 'United States',
        countryCode: data.country,
        currency: data.country === 'IN' ? 'INR' : 'USD',
        region: data.country === 'IN' ? 'India' : 'International',
        timezone: data.timezone || 'UTC',
        city: data.city
      };
    }
    
    return null;
  }

  private async detectViaBrowserAPI(): Promise<GeoLocationData | null> {
    return new Promise((resolve) => {
      if (!navigator.language) {
        resolve(null);
        return;
      }

      // Check browser language
      const language = navigator.language.toLowerCase();
      const isIndianLanguage = language.includes('hi') || language.includes('in');
      
      if (isIndianLanguage) {
        resolve({
          country: 'India',
          countryCode: 'IN',
          currency: 'INR',
          region: 'India',
          timezone: 'Asia/Kolkata'
        });
      } else {
        resolve(null);
      }
    });
  }

  private async detectViaBackend(): Promise<GeoLocationData | null> {
    try {
      const response = await api.detectRegion();
      if (response.success) {
        return {
          country: response.data.region === 'India' ? 'India' : 'United States',
          countryCode: response.data.currency === 'INR' ? 'IN' : 'US',
          currency: response.data.currency,
          region: response.data.region,
          timezone: response.data.currency === 'INR' ? 'Asia/Kolkata' : 'America/New_York'
        };
      }
    } catch (error) {
      console.log('Backend geo detection failed:', error);
    }
    
    return null;
  }

  // Get currency symbol
  getCurrencySymbol(currency: 'INR' | 'USD'): string {
    return currency === 'INR' ? '₹' : '$';
  }

  // Format price based on currency
  formatPrice(price: number, currency: 'INR' | 'USD'): string {
    if (currency === 'INR') {
      return `₹${Math.round(price)}`;
    }
    return `$${price.toFixed(2)}`;
  }

  // Check if user is in India
  isIndianUser(geoData: GeoLocationData): boolean {
    return geoData.countryCode === 'IN' || geoData.currency === 'INR';
  }

  // Get appropriate pricing config based on location
  getPricingConfig(geoData: GeoLocationData) {
    return {
      currency: geoData.currency,
      region: geoData.region,
      postPrice: geoData.currency === 'INR' ? 10 : 0.40,
      commentPrice: geoData.currency === 'INR' ? 5 : 0.20,
      ideaPrice: geoData.currency === 'INR' ? 5 : 0.20,
      starterPrice: geoData.currency === 'INR' ? 249 : 9,
      proPrice: geoData.currency === 'INR' ? 649 : 19
    };
  }

  // Clear cache (useful for testing or when user location changes)
  clearCache(): void {
    this.cache = null;
    this.cacheExpiry = 0;
  }
}

export default new GeoLocationService();
