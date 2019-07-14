import SocksAgent from 'socks5-https-client/lib/Agent'

const socksAgent = new SocksAgent({
    socksHost: '',
    socksPort: null,
    socksUsername: '',
    socksPassword: '',
});

export default socksAgent