export const ARC_TESTNET_CONFIG = {
  chainId: '0x1060', // 4192 in hex
  chainName: 'Arc Testnet',
  nativeCurrency: { name: 'Arc', symbol: 'ARC', decimals: 18 },
  rpcUrls: ['https://rpc.testnet.arc.network'],
  blockExplorerUrls: ['https://explorer.testnet.arc.network'],
};

export async function getWeb3Provider(providerId?: string) {
  if (typeof window === 'undefined') return null;
  const win = window as any;

  if (providerId === 'okx' && win.okxwallet) return win.okxwallet;
  if (providerId === 'phantom' && win.phantom?.ethereum) return win.phantom.ethereum;
  if (providerId === 'trust' && win.trustwallet) return win.trustwallet;
  if (win.ethereum) return win.ethereum;

  return null;
}

export async function switchOrAddArcNetwork(provider: any) {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ARC_TESTNET_CONFIG.chainId }],
    });
  } catch (switchError: any) {
    if (
      switchError.code === 4902 ||
      switchError.code === -32603 ||
      (switchError.message && switchError.message.toLowerCase().includes('unrecognized'))
    ) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [ARC_TESTNET_CONFIG],
      });
    } else {
      console.warn('Arc chain switch warning:', switchError);
    }
  }
}

export async function connectWeb3Account(providerId?: string): Promise<string> {
  const provider = await getWeb3Provider(providerId);
  if (!provider) {
    throw new Error('No Web3 wallet extension found. Please install MetaMask, OKX, or Phantom to connect on Arc Testnet.');
  }

  const accounts = await provider.request({ method: 'eth_requestAccounts' });
  if (!accounts || !accounts[0]) {
    throw new Error('No wallet address returned from Web3 wallet.');
  }

  try {
    await switchOrAddArcNetwork(provider);
  } catch (err: any) {
    console.warn('Network switch notice:', err);
  }

  return accounts[0];
}

export async function fetchRealArcBalance(address: string): Promise<number> {
  if (!address || typeof window === 'undefined') return 0;
  const provider = await getWeb3Provider();
  if (!provider) return 0;

  try {
    const hexBalance = await provider.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });

    if (hexBalance) {
      const wei = BigInt(hexBalance);
      // Convert wei to 18-decimal ARC balance
      const balance = Number(wei) / 1e18;
      return balance;
    }
  } catch (err) {
    console.warn('Could not fetch real Arc on-chain balance:', err);
  }
  return 0;
}

export async function sendArcTestnetBetTransaction(
  userAddress: string,
  marketId: string,
  outcome: 'YES' | 'NO',
  amountUsdc: number
): Promise<string> {
  const provider = await getWeb3Provider();
  if (!provider) {
    throw new Error('Web3 wallet extension is not connected. Please connect your Web3 browser wallet.');
  }

  await switchOrAddArcNetwork(provider);

  // Convert amountUsdc to wei (18 decimals) hex
  const amountInWei = BigInt(Math.floor(amountUsdc * 1e18));
  const hexValue = '0x' + amountInWei.toString(16);

  const txParams = {
    from: userAddress,
    to: '0x4192000000000000000000000000000000004192', // Arc Testnet Contract Router
    value: hexValue,
    data: '0x' + Array.from(new TextEncoder().encode(`ARC_BET:${marketId}:${outcome}:${amountUsdc}`)).map(b => b.toString(16).padStart(2, '0')).join(''),
    chainId: ARC_TESTNET_CONFIG.chainId,
  };

  const txHash = await provider.request({
    method: 'eth_sendTransaction',
    params: [txParams],
  });

  return txHash;
}
