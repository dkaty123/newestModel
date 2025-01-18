import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

const config: HardhatUserConfig = {
  solidity: '0.8.24',
  networks: {
    testnet: {
      url: 'https://testnet.evm.nodes.onflow.org',
      accounts: [`KEY_HERE`], // In practice, this should come from an environment variable and not be commited
      gas: 500000, // Example gas limit
    },
  },
};

export default config;
