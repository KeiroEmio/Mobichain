// WalletContext.js

import React, { createContext, useState, useEffect } from 'react';
import { Web3Auth } from '@web3auth/web3auth';
import { ethers } from 'ethers';

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [web3auth, setWeb3Auth] = useState(null);
  const [provider, setProvider] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);

  const clientId = process.env.WEB3_AUTH_CLIENT_ID; // 替换为您的 Web3Auth 客户端 ID

  useEffect(() => {
    const initWeb3Auth = async () => {
      try {
        const web3authInstance = new Web3Auth({
          clientId,
          chainConfig: {
            chainNamespace: 'Ethereum Sepolia',
            chainId: process.env.REACT_APP_SPEOLIA_CHAINID, // Ethereum Mainnet
            rpcTarget: process.env.SEPOLIA_URL, 
          },
        });

        setWeb3Auth(web3authInstance);
        await web3authInstance.initModal();

        if (web3authInstance.provider) {
          setProvider(web3authInstance.provider);
        }
      } catch (error) {
        console.error('Web3Auth 初始化错误:', error);
      }
    };

    initWeb3Auth();
  }, []);

  const login = async () => {
    if (!web3auth) return;
    setLoading(true);
    try {
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      await fetchAccountData(web3authProvider);
    } catch (error) {
      console.error('登录失败:', error);
    }
    setLoading(false);
  };

  const logout = async () => {
    if (!web3auth) return;
    await web3auth.logout();
    setProvider(null);
    setUserAddress('');
    setBalance('');
  };

  const fetchAccountData = async (web3authProvider) => {
    try {
      const ethersProvider = new ethers.providers.Web3Provider(web3authProvider);
      const signer = ethersProvider.getSigner();
      const address = await signer.getAddress();
      const balanceWei = await ethersProvider.getBalance(address);
      const balanceEther = ethers.utils.formatEther(balanceWei);

      setUserAddress(address);
      setBalance(balanceEther);
    } catch (error) {
      console.error('获取账户数据失败:', error);
    }
  };

  useEffect(() => {
    if (provider) {
      fetchAccountData(provider);
    }
  }, [provider]);

  return (
    <WalletContext.Provider
      value={{
        web3auth,
        provider,
        userAddress,
        balance,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
