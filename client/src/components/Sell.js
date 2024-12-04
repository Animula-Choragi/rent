import React, { useState } from 'react';

function Sell({ contract, account }) {
  const [propertyName, setPropertyName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(''); // Menambahkan state untuk lokasi
  const [pricePerDay, setPricePerDay] = useState('');
  const [loading, setLoading] = useState(false);

  const listProperty = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const priceInWei = window.web3.utils.toWei(pricePerDay.toString(), 'ether');
      
      await contract.methods.listProperty(propertyName, description, location, priceInWei) // Menambahkan parameter location
        .send({ from: account });
        
      window.location.reload();
    } catch (error) {
      console.error('Error listing property:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Add Your Property</h2>
      <form onSubmit={listProperty}>
        <div className="form-group">
          <label>Property Name</label>
          <input
            type="text"
            className="form-control"
            value={propertyName}
            onChange={(e) => setPropertyName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            className="form-control"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Price per Day (ETH)</label>
          <input
            type="number"
            step="0.01"
            className="form-control"
            value={pricePerDay}
            onChange={(e) => setPricePerDay(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
          {loading ? 'Processing...' : 'Add Property'}
        </button>
      </form>
    </div>
  );
}

export default Sell;