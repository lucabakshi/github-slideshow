const apiKey = '5eab6605374c4d809bc057485a77c339';
// Using the symbols identified: CL1 for WTI, CO1 for Brent
const symbols = ['CL1', 'CO1']; 

const marketDataTableBody = document.getElementById('marketDataTable').getElementsByTagName('tbody')[0];

async function fetchMarketData() {
    // Constructing the URL for the /quote endpoint.
    // The /quote endpoint can handle multiple symbols, comma-separated.
    const symbolsString = symbols.join(',');
    const url = `https://api.twelvedata.com/quote?symbol=${symbolsString}&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            // Handle HTTP errors
            console.error(`API request failed with status: ${response.status}`);
            // Display a user-friendly error message in the table
            marketDataTableBody.innerHTML = `<tr><td colspan="10" style="text-align:center;color:red;">Failed to load market data. Status: ${response.status}</td></tr>`;
            return;
        }
        const data = await response.json();
        updateTable(data);
    } catch (error) {
        console.error('Error fetching market data:', error);
        // Display a user-friendly error message in the table
        marketDataTableBody.innerHTML = `<tr><td colspan="10" style="text-align:center;color:red;">Error fetching market data: ${error.message}</td></tr>`;
    }
}

function updateTable(data) {
    // Clear existing rows
    marketDataTableBody.innerHTML = '';

    // Twelve Data API returns data as a single object if one symbol is requested,
    // or an object where keys are symbols if multiple symbols are requested.
    // We need to handle both cases or ensure it's always treated as a collection.

    const dataToProcess = symbols.length === 1 && !data[symbols[0]] ? { [symbols[0]]: data } : data;


    symbols.forEach(symbolKey => {
        const stockData = dataToProcess[symbolKey];

        if (stockData && stockData.name) { // Check if data for the symbol exists
            const row = marketDataTableBody.insertRow();
            
            // Instrument Name
            const nameCell = row.insertCell();
            nameCell.textContent = stockData.name || 'N/A';

            // Symbol
            const symbolCell = row.insertCell();
            symbolCell.textContent = stockData.symbol || 'N/A';

            // Price (using 'close' for the latest price)
            const priceCell = row.insertCell();
            priceCell.textContent = stockData.close ? parseFloat(stockData.close).toFixed(2) : 'N/A';

            // Change
            const changeCell = row.insertCell();
            changeCell.textContent = stockData.change ? parseFloat(stockData.change).toFixed(2) : 'N/A';
            changeCell.style.color = parseFloat(stockData.change) < 0 ? 'red' : 'green';


            // % Change
            const percentChangeCell = row.insertCell();
            percentChangeCell.textContent = stockData.percent_change ? parseFloat(stockData.percent_change).toFixed(2) + '%' : 'N/A';
            percentChangeCell.style.color = parseFloat(stockData.percent_change) < 0 ? 'red' : 'green';

            // Open
            const openCell = row.insertCell();
            openCell.textContent = stockData.open ? parseFloat(stockData.open).toFixed(2) : 'N/A';

            // High
            const highCell = row.insertCell();
            highCell.textContent = stockData.high ? parseFloat(stockData.high).toFixed(2) : 'N/A';

            // Low
            const lowCell = row.insertCell();
            lowCell.textContent = stockData.low ? parseFloat(stockData.low).toFixed(2) : 'N/A';
            
            // Volume
            const volumeCell = row.insertCell();
            volumeCell.textContent = stockData.volume ? parseInt(stockData.volume).toLocaleString() : 'N/A';

            // Last Updated (datetime)
            const lastUpdatedCell = row.insertCell();
            lastUpdatedCell.textContent = stockData.datetime ? new Date(stockData.datetime).toLocaleString() : 'N/A';

        } else {
            // Handle cases where a symbol might not return data or is missing expected fields
            const row = marketDataTableBody.insertRow();
            const symbolCell = row.insertCell();
            symbolCell.textContent = symbolKey; // Display the symbol that failed
            const errorCell = row.insertCell();
            errorCell.colSpan = 9; // Span across the remaining columns
            errorCell.textContent = `Data not available for ${symbolKey}.`;
            errorCell.style.color = 'orange';
        }
    });
}

// Fetch data on page load
document.addEventListener('DOMContentLoaded', fetchMarketData);

// Refresh data every 60 seconds
setInterval(fetchMarketData, 60000);
