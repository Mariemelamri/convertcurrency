import { useEffect, useState } from 'react';
import axios from 'axios';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { Button, Grid } from "@mui/material";
import {
  Chart as ChartJS, CategoryScale
} from 'chart.js/auto';
import { Line } from 'react-chartjs-2';

const Converter = () => {
  const [symbols, setSymbols] = useState([]);
  const [amount, setAmount] = useState(1);
  const [rate, setRate] = useState(0);
  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    async function load() {
      if (toCurrency && fromCurrency && amount) {
        await axios.get(`https://api.exchangerate.host/latest?base=${fromCurrency}&symbols=${toCurrency}&amount=${amount}`)
          .then(response => setRate(response.data.rates[toCurrency]))
          .catch(err => console.log(err));

        await axios.get(`https://api.exchangerate.host/timeseries?start_date=2023-08-14&end_date=2023-08-21&base=${fromCurrency}&symbols=${toCurrency}&amount=${amount}`)
          .then((response) => setHistory(response.data.rates))
          .catch(error => console.error(error));
        ChartJS.register(CategoryScale)
      }
    }

    load()
  }, [fromCurrency, toCurrency, amount]);

  useEffect(() => {
    axios.get("https://api.exchangerate.host/symbols")
      .then(response => setSymbols(response.data.symbols))
      .catch(error => console.error(error));
  }, []);

  const handleSwitch = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div>
      <select onChange={(e) => setFromCurrency(e.target.value)} value={fromCurrency}>
        <option value="">Select source currency</option>
        {Object.keys(symbols).map(symbol => (
          <option value={symbol} key={symbol}>
            {symbols[symbol].description} ({symbol})
          </option>
        ))}
      </select>
      <input type='number' value={amount || ''} onChange={(e) => setAmount(e.target.value)} />
      <select onChange={(e) => setToCurrency(e.target.value)} value={toCurrency}>
        <option value="">Select target currency</option>
        {Object.keys(symbols).map(symbol => (
          <option value={symbol} key={symbol}>
            {symbols[symbol].description} ({symbol})
          </option>
        ))}
      </select>
      <div>
        <input type='number' readOnly value={rate || ''} />
        {rate !== null && (
          <p>
            Converted amount: {rate} {toCurrency}
          </p>
        )}
      </div>
      <div>
        <Grid item xs={13} md="auto">
          <Button onClick={handleSwitch} sx={{
            borderRadius: 1,
            height: "50%"
          }}>
            <CompareArrowsIcon sx={{ fontSize: 28 }} />
          </Button>
        </Grid>
      </div>
      <div>
        <h2>Exchange Rate History</h2>
        <canvas id="currencyChart" width="400" height="200"></canvas>
        <Line
          datasetIdKey='currencyChart'
          data={{
            labels: ['Jun', 'Jul', 'Aug'],
            datasets: [
              {
                id: 1,
                label: 'Jun',
                data: [5, 6, 7],
              },
              {
                id: 2,
                label: 'Jul',
                data: [3, 2, 1],
              },
            ],
          }}
        />
      </div>
    </div>
  );
}

export default Converter;
