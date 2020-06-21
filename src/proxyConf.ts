import SocksAgent from 'socks5-https-client/lib/Agent';

const socksAgent = new SocksAgent({
  socksHost: '139.59.157.170',
  socksPort: 1080,
  socksUsername: 'sobaken',
  socksPassword: decodeURIComponent('H%5D%25eEJWcV%29u%7BKbyV'),
});

export default socksAgent;
