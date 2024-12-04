import React, { useState, useEffect } from 'react';

function Main({ contract, account }) {
  const [rentalHistory, setRentalHistory] = useState([]);
  // const [propertiesData, setPropertiesData] = useState({});

  useEffect(() => {
    loadRentalHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, account]);

  const loadRentalHistory = async () => {
    if (contract) {
      try {
        // Get total number of properties
        const propertyCount = await contract.methods.getPropertiesCount().call();
        
        // Create an object to store property details
        const propertyDetails = {};
        
        // Fetch all properties and their rental histories
        const allRentals = [];
        
        for (let propertyId = 0; propertyId < propertyCount; propertyId++) {
          // Get property details
          const property = await contract.methods.properties(propertyId).call();
          propertyDetails[propertyId] = property;
          
          // Get rental history for this property
          const propertyRentals = await contract.methods.getRentalHistory(propertyId).call();
          
          // Map rental data with property details
          const formattedRentals = propertyRentals.map((rental) => {
            const startDate = new Date(parseInt(rental.startTime) * 1000);
            
            return {
              propertyId,
              propertyName: property.name,
              renter: rental.renter,
              rentalDays: parseInt(rental.rentalDays),
              totalAmount: rental.totalAmount,
              startTime: startDate.toLocaleString(),
              isActive: rental.active
            };
          });
          
          allRentals.push(...formattedRentals);
        }
        
        // Sort rentals by start time (newest first)
        const sortedRentals = allRentals.sort((a, b) => {
          return new Date(b.startTime) - new Date(a.startTime);
        });
        
        // setPropertiesData(propertyDetails);
        setRentalHistory(sortedRentals);
      } catch (error) {
        console.error('Error loading rental history:', error);
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2>Property Rental History</h2>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th>Property Name</th>
              <th>Renter</th>
              <th>Duration (Days)</th>
              <th>Start Time</th>
              <th>Total Amount (ETH)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rentalHistory.map((rental, index) => (
              <tr key={index}>
                <td>{rental.propertyName}</td>
                <td>
                  {rental.renter.slice(0, 6)}...{rental.renter.slice(-4)}
                </td>
                <td>{rental.rentalDays}</td>
                <td>{rental.startTime}</td>
                <td>{window.web3.utils.fromWei(rental.totalAmount.toString(), 'ether')}</td>
                <td>
                  <span className={`badge ${rental.isActive ? 'bg-success' : 'bg-secondary'}`}>
                    {rental.isActive ? 'Active' : 'Ended'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rentalHistory.length === 0 && (
        <div className="alert alert-info mt-3">
          No rental history available yet.
        </div>
      )}
    </div>
  );
}

export default Main;