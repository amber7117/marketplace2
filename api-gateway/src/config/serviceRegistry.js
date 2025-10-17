class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.healthCheckInterval = null;
  }

  init() {
    // Initialize with default service URLs
    this.services.set( 'auth-service', {
      url: process.env.AUTH_SERVICE_URL,
      healthy: true,
      lastCheck: new Date()
    } );

    this.services.set( 'product-service', {
      url: process.env.PRODUCT_SERVICE_URL,
      healthy: true,
      lastCheck: new Date()
    } );

    this.services.set( 'order-service', {
      url: process.env.ORDER_SERVICE_URL,
      healthy: true,
      lastCheck: new Date()
    } );

    this.services.set( 'wallet-service', {
      url: process.env.WALLET_SERVICE_URL,
      healthy: true,
      lastCheck: new Date()
    } );

    this.services.set( 'payment-service', {
      url: process.env.PAYMENT_SERVICE_URL,
      healthy: true,
      lastCheck: new Date()
    } );

    this.services.set( 'notification-service', {
      url: process.env.NOTIFICATION_SERVICE_URL,
      healthy: true,
      lastCheck: new Date()
    } );

    // Start health checking
    this.startHealthChecking();
  }

  getServiceUrl( serviceName ) {
    const service = this.services.get( serviceName );
    if ( !service ) {
      throw new Error( `Service ${ serviceName } not found` );
    }

    console.log( `🔍 getServiceUrl(${ serviceName }): ${ service.url }, healthy: ${ service.healthy }` );

    // Even if service is unhealthy, return the URL and let proxy handle the connection
    return service.url;
  }

  registerService( name, url ) {
    this.services.set( name, {
      url,
      healthy: true,
      lastCheck: new Date()
    } );
    console.log( `✅ Service registered: ${ name } at ${ url }` );
  }

  unregisterService( name ) {
    this.services.delete( name );
    console.log( `❌ Service unregistered: ${ name }` );
  }

  async checkServiceHealth( serviceName, serviceConfig ) {
    try {
      const response = await fetch( `${ serviceConfig.url }/health`, {
        method: 'GET',
        timeout: 5000
      } );

      const isHealthy = response.ok;

      this.services.set( serviceName, {
        ...serviceConfig,
        healthy: isHealthy,
        lastCheck: new Date()
      } );

      if ( !isHealthy && serviceConfig.healthy ) {
        console.warn( `⚠️ Service ${ serviceName } became unhealthy` );
      } else if ( isHealthy && !serviceConfig.healthy ) {
        console.log( `✅ Service ${ serviceName } became healthy` );
      }

      return isHealthy;
    } catch ( error ) {
      console.error( `❌ Health check failed for ${ serviceName }:`, error.message );

      this.services.set( serviceName, {
        ...serviceConfig,
        healthy: false,
        lastCheck: new Date()
      } );

      return false;
    }
  }

  startHealthChecking() {
    const interval = parseInt( process.env.HEALTH_CHECK_INTERVAL ) || 30000;

    this.healthCheckInterval = setInterval( async () => {
      console.log( '🔍 Performing health checks...' );

      for ( const [ serviceName, serviceConfig ] of this.services ) {
        await this.checkServiceHealth( serviceName, serviceConfig );
      }
    }, interval );
  }

  stopHealthChecking() {
    if ( this.healthCheckInterval ) {
      clearInterval( this.healthCheckInterval );
      this.healthCheckInterval = null;
    }
  }

  getHealthStatus() {
    const status = {};
    for ( const [ serviceName, serviceConfig ] of this.services ) {
      status[ serviceName ] = {
        healthy: serviceConfig.healthy,
        url: serviceConfig.url,
        lastCheck: serviceConfig.lastCheck
      };
    }
    return status;
  }

  cleanup() {
    this.stopHealthChecking();
    this.services.clear();
  }
}

module.exports = new ServiceRegistry();
