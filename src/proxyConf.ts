import SocksAgent from 'socks5-https-client/lib/Agent';
import dotenv from 'dotenv';

dotenv.config();

const socksAgent = new SocksAgent({
  socksHost: process.env.PROXY_SOCKS_HOST,
  socksPort: parseInt(process.env.PROXY_SOCKS_PORT, 10),
  socksUsername: process.env.PROXY_SOCKS_USERNAME,
  socksPassword: decodeURIComponent(process.env.PROXY_SOCKS_PASSWORD),
});

export default socksAgent;
