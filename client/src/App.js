import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Web3 from 'web3';
import PropertyRental from './contracts/PropertyRental.json';
import Navbar from './components/Navbar';
import Buy from './components/Buy';
import Sell from './components/Sell';
import Main from './components/Main';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';


function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          loadBlockchainData();
        } catch (error) {
          console.error("User denied account access");
        }
      } else {
        console.log('Non-Ethereum browser detected. Consider installing MetaMask!');
      }
    };
    loadWeb3();
  }, []);

  const loadBlockchainData = async () => {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);

    // Load smart contract
    const networkId = await web3.eth.net.getId();
    const networkData = PropertyRental.networks[networkId];
    
    if (networkData) {
      const propertyRental = new web3.eth.Contract(
        PropertyRental.abi,
        networkData.address
      );
      setContract(propertyRental);
      
      // Load properties
      const propertiesCount = await propertyRental.methods.getPropertiesCount().call();
      const loadedProperties = [];
      
      for (let i = 0; i < propertiesCount; i++) {
        const property = await propertyRental.methods.properties(i).call();
        loadedProperties.push(property);
      }
      
      setProperties(loadedProperties);
      setLoading(false);
    } else {
      window.alert('PropertyRental contract not deployed to detected network.');
    }
  };

  return (
    <Router>
      <div className="App">
        <Navbar account={account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              {loading ? (
                <div>Loading...</div>
              ) : (
                <Routes>
                  <Route path="/" element={<Main contract={contract} account={account} properties={properties} />} />
                  <Route path="/buy" element={<Buy contract={contract} account={account} properties={properties} />} />
                  <Route path="/sell" element={<Sell contract={contract} account={account} />} />
                </Routes>
              )}
            </main>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;