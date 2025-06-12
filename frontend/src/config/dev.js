import { Amplify } from 'aws-amplify';

const devConfig = {
    Auth: {
        region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
        userPoolId: process.env.REACT_APP_USER_POOL_ID,
        userPoolWebClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID,
        mandatorySignIn: true,
        cookieStorage: {
            domain: 'localhost',
            path: '/',
            expires: 365,
            secure: false
        },
        storage: window.localStorage,
        authenticationFlowType: 'USER_PASSWORD_AUTH'
    },
    API: {
        endpoints: [
            {
                name: 'api',
                endpoint: 'https://qym7ixny0k.execute-api.us-east-1.amazonaws.com/dev',
                region: 'us-east-1',
                custom_header: async () => {
                    try {
                        const session = await Amplify.Auth.currentSession();
                        return {
                            Authorization: `Bearer ${session.getIdToken().getJwtToken()}`
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

// Configure Amplify
Amplify.configure(devConfig);

// Log configuration for debugging
console.log('Amplify Configuration:', devConfig);

export default devConfig; 