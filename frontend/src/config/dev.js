import { Amplify } from 'aws-amplify';

const getConfig = () => {
    const env = process.env.REACT_APP_ENV || 'development';
    
    const baseConfig = {
        Auth: {
            region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
            userPoolId: process.env.REACT_APP_USER_POOL_ID,
            userPoolWebClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID,
            mandatorySignIn: true,
            cookieStorage: {
                domain: env === 'production' ? '.agenda.dev' : 'localhost',
                path: '/',
                expires: 365,
                secure: env === 'production'
            },
            storage: window.localStorage,
            authenticationFlowType: 'USER_PASSWORD_AUTH'
        },
        API: {
            endpoints: [
                {
                    name: 'api',
                    endpoint: process.env.REACT_APP_API_URL,
                    region: 'us-east-1',
                    custom_header: async () => {
                        try {
                            const session = await Amplify.Auth.currentSession();
                            return {
                                Authorization: `Bearer ${session.getAccessToken().getJwtToken()}`
                            };
                        } catch (error) {
                            console.error('Error getting token:', error);
                            return {};
                        }
                    }
                }
            ]
        }
    };

    // Configuraciones específicas por ambiente
    const envConfigs = {
        development: {
            // Configuraciones específicas para desarrollo
            Auth: {
                ...baseConfig.Auth,
                cookieStorage: {
                    ...baseConfig.Auth.cookieStorage,
                    secure: false
                }
            }
        },
        qa: {
            // Configuraciones específicas para QA
            Auth: {
                ...baseConfig.Auth,
                cookieStorage: {
                    ...baseConfig.Auth.cookieStorage,
                    domain: 'qa.agenda.dev'
                }
            }
        },
        production: {
            // Configuraciones específicas para producción
            Auth: {
                ...baseConfig.Auth,
                cookieStorage: {
                    ...baseConfig.Auth.cookieStorage,
                    domain: '.agenda.dev'
                }
            }
        }
    };

    return {
        ...baseConfig,
        ...envConfigs[env]
    };
};

const config = getConfig();

// Configure Amplify
Amplify.configure(config);

// Log configuration for debugging
console.log('Amplify Configuration:', config);

export default config; 