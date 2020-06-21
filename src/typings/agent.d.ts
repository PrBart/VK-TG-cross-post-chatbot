declare module 'socks5-https-client/lib/Agent' {
  import https from 'https';

  interface AgentOptions extends https.AgentOptions {
    socksHost?: string;
    socksPort?: number;
    socksUsername?: string;
    socksPassword?: string;
  }

  class Agent extends https.Agent {
    constructor(options?: AgentOptions);
    options: AgentOptions;
    socksHost?: string;
    socksPort?: number;
  }

  export = Agent;
}
