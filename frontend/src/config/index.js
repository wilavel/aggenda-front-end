import devConfig from './dev';

const env = process.env.REACT_APP_ENV || 'dev';

const configs = {
    dev: devConfig,
    // Aquí puedes agregar más configuraciones para otros ambientes
    // prod: prodConfig,
    // staging: stagingConfig,
};

const config = configs[env];

if (!config) {
    throw new Error(`No configuration found for environment: ${env}`);
}

export default config; 