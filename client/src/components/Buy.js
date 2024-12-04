import React, { useState, useEffect } from 'react';

function Buy({ contract, account }) {
  const [rentalDays, setRentalDays] = useState({});
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const getAvailableProperties = async () => {
      if (contract) {
        try {
          const propertiesCount = await contract.methods.getPropertiesCount().call();
          const availableProperties = [];

          for (let i = 0; i < propertiesCount; i++) {
            const property = await contract.methods.properties(i).call();
            if (!property.isRented || property.currentRenter.toLowerCase() === account.toLowerCase()) {
              availableProperties.push({
                id: i,
                name: property.name,
                description: property.description,
                location: property.location,
                pricePerDay: property.pricePerDay,
                isRented: property.isRented,
                owner: property.owner,
                currentRenter: property.currentRenter,
              });
            }
          }

          setProperties(availableProperties);
        } catch (error) {
          console.error('Error fetching properties:', error);
        }
      }
    };

    getAvailableProperties();
  }, [contract, account]);

  const handleRentalDaysChange = (propertyId, value) => {
    setRentalDays(prev => ({
      ...prev,
      [propertyId]: value
    }));
  };

  const rentProperty = async (propertyId, pricePerDay) => {
    try {
      setLoading(true);
      const days = rentalDays[propertyId] || 0;
      const totalAmount = window.web3.utils.toWei(
        (parseFloat(pricePerDay) * parseFloat(days)).toString(),
        'ether'
      );
      
      await contract.methods.rentProperty(propertyId, days)
        .send({ from: account, value: totalAmount });
        
      window.location.reload();
    } catch (error) {
      console.error('Error renting property:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelRental = async (propertyId) => {
    try {
      setLoading(true);
      await contract.methods.cancelRental(propertyId)
        .send({ from: account });
      window.location.reload();
    } catch (error) {
      console.error('Error canceling rental:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Available Properties</h2>
      <div className="row">
        {properties.map((property) => (
          <div className="col-md-4 mb-4" key={property.id}>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{property.name}</h5>
                <p className="card-text" style={{ textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: property.description.replace(/\n/g, '<br/>') }} />
                <p>Location: {property.location}</p>
                <p>Price per day: {window.web3.utils.fromWei(property.pricePerDay.toString(), 'ether')} ETH</p>
                {property.owner.toLowerCase() === account.toLowerCase() ? (
                  <button className="btn btn-secondary" disabled>
                    Your Property
                  </button>
                ) : !property.isRented ? (
                  <>
                    <input
                      type="number"
                      className="form-control mb-2"
                      placeholder="Number of days"
                      value={rentalDays[property.id] || ''}
                      onChange={(e) => handleRentalDaysChange(property.id, e.target.value)}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={() => rentProperty(property.id, window.web3.utils.fromWei(property.pricePerDay.toString(), 'ether'))}
                      disabled={loading || !rentalDays[property.id]}
                    >
                      Rent Property
                    </button>
                  </>
                ) : (
                  property.currentRenter.toLowerCase() === account.toLowerCase() && (
                    <button
                      className="btn btn-danger"
                      onClick={() => cancelRental(property.id)}
                      disabled={loading}
                    >
                      Cancel Rental
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Buy;