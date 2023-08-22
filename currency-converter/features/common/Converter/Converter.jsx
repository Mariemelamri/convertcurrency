import { useEffect, useState } from 'react';
import React from 'react';
import axios from 'axios';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { Button, Grid } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Converter = () => {
  const [symbols, setSymbols] = useState([]);
  const [amount, setAmount] = useState(1);
  const [rate, setRate] = useState(0);
  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [history, setHistory] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const currentDate = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(currentDate.getDate() - 7);

    setStartDate(sevenDaysAgo.toISOString().split('T')[0]);
    setEndDate(currentDate.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    async function load() {
      if (toCurrency && fromCurrency && amount) {
        await axios.get(`https://api.exchangerate.host/latest?base=${fromCurrency}&symbols=${toCurrency}&amount=${amount}`)
          .then(response => setRate(response.data.rates[toCurrency]))
          .catch(err => console.log(err));

        await axios.get(`https://api.exchangerate.host/timeseries?start_date=${startDate}&end_date=${endDate}&base=${fromCurrency}&symbols=${toCurrency}&amount=${amount}`)
          .then((response) => {
            const historicalData = response.data.rates;
            const formattedHistory = Object.keys(historicalData).map(date => ({
              date,
              [toCurrency]: historicalData[date][toCurrency]
            }));
            setHistory(formattedHistory);
          })
          .catch(error => console.error(error));
      }
    }

    load();
  }, [fromCurrency, toCurrency, amount, startDate, endDate]);

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
        <LineChart width={500} height={250} data={history}>
          <CartesianGrid strokeDasharray="3" />
          <XAxis dataKey="date" />
          <YAxis />3
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={toCurrency} stroke="#8884d8" />
        </LineChart>
      </div>
    </div>
  );
}

export default Converter;
