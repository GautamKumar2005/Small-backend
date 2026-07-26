class EnrichmentService {
  constructor() {
    this.providerStatus = {
      'mock-geo-primary': true,
      'mock-geo-secondary': true,
      'mock-geo-fallback': true
    };
    this.fallbackLogs = [];
  }

  setProviderStatus(providerName, isUp) {
    if (providerName in this.providerStatus) {
      this.providerStatus[providerName] = Boolean(isUp);
      return true;
    }
    return false;
  }

  getProviderStatus() {
    return { ...this.providerStatus };
  }

  getFallbackLogs() {
    return [...this.fallbackLogs];
  }

  clearFallbackLogs() {
    this.fallbackLogs = [];
  }

  async enrichIp(ip) {
    const chain = [
      {
        name: 'mock-geo-primary',
        resolve: async (targetIp) => {
          if (!this.providerStatus['mock-geo-primary']) {
            throw new Error('Provider mock-geo-primary is DOWN or unreachable (simulated error)');
          }
          // Simulate latency & lookup
          return {
            country: 'United States',
            city: 'San Francisco',
            region: 'California',
            postal: '94103',
            latitude: 37.7749,
            longitude: -122.4194,
            ip: targetIp
          };
        }
      },
      {
        name: 'mock-geo-secondary',
        resolve: async (targetIp) => {
          if (!this.providerStatus['mock-geo-secondary']) {
            throw new Error('Provider mock-geo-secondary is DOWN or unreachable (simulated error)');
          }
          return {
            country: 'United Kingdom',
            city: 'London',
            region: 'England',
            postal: 'EC1A 1BB',
            latitude: 51.5074,
            longitude: -0.1278,
            ip: targetIp
          };
        }
      },
      {
        name: 'mock-geo-fallback',
        resolve: async (targetIp) => {
          return {
            country: 'Germany',
            city: 'Berlin',
            region: 'Berlin',
            postal: '10115',
            latitude: 52.5200,
            longitude: 13.4050,
            ip: targetIp
          };
        }
      }
    ];

    for (let i = 0; i < chain.length; i++) {
      const provider = chain[i];
      try {
        const geo = await provider.resolve(ip);
        return {
          geo,
          provider: provider.name
        };
      } catch (err) {
        const logMsg = `[EnrichmentService] Provider ${provider.name} failed (${err.message}). Failing over to next provider...`;
        console.warn(logMsg);
        this.fallbackLogs.push({
          timestamp: new Date().toISOString(),
          provider: provider.name,
          error: err.message
        });
      }
    }

    // Ultimate fallback if even fallback provider throws
    return {
      geo: {
        country: 'Unknown',
        city: 'Unknown',
        region: 'Unknown',
        ip
      },
      provider: 'none'
    };
  }
}

module.exports = new EnrichmentService();
