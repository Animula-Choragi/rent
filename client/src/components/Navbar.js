import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from './logo.png';

function Navbar({ account }) {
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    const getBalance = async () => {
      if (window.ethereum && account) {
        try {
          const web3 = window.web3;
          const balanceWei = await web3.eth.getBalance(account);
          const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
          setBalance(parseFloat(balanceEth).toFixed(4));
        } catch (error) {
          console.error('Error fetching balance:', error);
          setBalance('0');
        }
      }
    };

    getBalance();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', getBalance);
      window.ethereum.on('chainChanged', getBalance);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', getBalance);
        window.ethereum.removeListener('chainChanged', getBalance);
      }
    };
  }, [account]);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        {/* Logo dan Nama Aplikasi */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={logo} width="30" height="30" alt="Logo" className="navbar-logo mr-2" />
          ETH Property Rental
        </Link>
        
        {/* Tombol Toggle untuk Mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Daftar Menu */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/buy">Rent Property</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/sell">Add Property</Link>
            </li>
          </ul>

          {/* Informasi Akun */}
          <div className="navbar-text text-right">
            <span className="d-block">
              Account: {account ? 
                `${account.slice(0, 10)}...${account.slice(-4)}` : 
                'Not connected'}
            </span>
            <span className="d-block">
              Balance: {balance} ETH
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
