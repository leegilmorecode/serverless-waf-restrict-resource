import { Region, Stage } from '../types';

export interface EnvironmentConfig {
  shared: {
    stage: Stage;
    serviceName: string;
    metricNamespace: string;
    logging: {
      logLevel: 'DEBUG' | 'INFO' | 'ERROR';
      logEvent: 'true' | 'false';
    };
  };
  env: {
    account: string;
    region: string;
  };
  stateless: {
    logisticsIpAddresses: string[];
  };
  stateful: {};
}

export const getEnvironmentConfig = (stage: Stage): EnvironmentConfig => {
  switch (stage) {
    case Stage.test:
      return {
        shared: {
          logging: {
            logLevel: 'DEBUG',
            logEvent: 'true',
          },
          serviceName: `event-gateway-service-${Stage.test}`,
          metricNamespace: `event-gateway-namespace-${Stage.test}`,
          stage: Stage.test,
        },
        stateless: {
          logisticsIpAddresses: ['92.75.23.123/32', '192.81.55.202/32'],
        },
        env: {
          account: '123456789123',
          region: Region.dublin,
        },
        stateful: {},
      };
    case Stage.staging:
      return {
        shared: {
          logging: {
            logLevel: 'INFO',
            logEvent: 'true',
          },
          serviceName: `event-gateway-service-${Stage.staging}`,
          metricNamespace: `event-gateway-namespace-${Stage.staging}`,
          stage: Stage.staging,
        },
        stateless: {
          logisticsIpAddresses: ['92.75.23.123/32', '192.81.55.202/32'],
        },
        env: {
          account: '123456789123',
          region: Region.dublin,
        },
        stateful: {},
      };
    case Stage.prod:
      return {
        shared: {
          logging: {
            logLevel: 'INFO',
            logEvent: 'true',
          },
          serviceName: `event-gateway-service-${Stage.prod}`,
          metricNamespace: `event-gateway-namespace-${Stage.prod}`,
          stage: Stage.prod,
        },
        stateless: {
          logisticsIpAddresses: ['92.75.23.123/32', '192.81.55.202/32'],
        },
        env: {
          account: '123456789123',
          region: Region.dublin,
        },
        stateful: {},
      };
    case Stage.develop:
      return {
        shared: {
          logging: {
            logLevel: 'DEBUG',
            logEvent: 'true',
          },
          serviceName: `event-gateway-service-${Stage.develop}`,
          metricNamespace: `event-gateway-namespace-${Stage.develop}`,
          stage: Stage.develop,
        },
        stateless: {
          logisticsIpAddresses: ['92.75.23.123/32', '192.81.55.202/32'],
        },
        env: {
          account: '123456789123',
          region: Region.dublin,
        },
        stateful: {},
      };
    default:
      return {
        shared: {
          logging: {
            logLevel: 'DEBUG',
            logEvent: 'true',
          },
          serviceName: `event-gateway-service-${stage}`,
          metricNamespace: `event-gateway-namespace-${stage}`,
          stage: stage,
        },
        stateless: {
          logisticsIpAddresses: ['92.75.23.123/32', '192.81.55.202/32'],
        },
        env: {
          account: '123456789123',
          region: Region.dublin,
        },
        stateful: {},
      };
  }
};
