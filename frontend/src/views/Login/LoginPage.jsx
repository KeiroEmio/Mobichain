// LoginPage.jsx

import React, { useContext } from 'react';
import { WalletContext } from './WalletContext';
// import 'bootstrap/dist/css/bootstrap.min.css';

function LoginPage() {
  const { userAddress, balance, loading, login, logout, provider } = useContext(WalletContext);

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <h1>Web3Auth 登录示例</h1>

          {!provider ? (
            <>
              <p>未连接钱包。连接钱包以显示账户及其 ETH 余额。</p>
              <div id="prepare">
                <button className="btn btn-primary" onClick={login} disabled={loading}>
                  {loading ? '连接中...' : '连接钱包'}
                </button>
              </div>
            </>
          ) : (
            <>
              <button className="btn btn-primary" onClick={logout}>
                断开钱包
              </button>

              <hr />

              <div id="network">
                <p>
                  <strong>连接的区块链：</strong> Ethereum Mainnet
                </p>

                <p>
                  <strong>选定的账户：</strong> {userAddress}
                </p>
              </div>

              <hr />

              <h3>账户余额</h3>

              <table className="table table-listing">
                <thead>
                  <tr>
                    <th>地址</th>
                    <th>ETH 余额</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{userAddress}</td>
                    <td>{balance}</td>
                  </tr>
                </tbody>
              </table>

              <p>如果您的钱包支持此功能，请尝试在不同的账户之间切换。</p>
            </>
          )}

          <br />

          <div className="well">
            <p className="text-muted">
              没有账号？<a href="/register">注册</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
