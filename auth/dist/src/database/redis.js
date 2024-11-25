import { createClient } from 'redis';
import { getEnv } from '../utils';
const redis = await createClient({
    url: getEnv('NODE_ENV') === 'production' ? getEnv('REDIS_URL_PROD') : getEnv('REDIS_URL_DEV')
}).on('error', (err)=>{
    throw new Error(`Redis error: ${err}`);
}).connect();
export default redis;
