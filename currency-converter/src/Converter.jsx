import { useEffect, useState } from 'react';
import  './Converter.css';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { Button, Grid } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import {Space} from 'antd';




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
    <div  >
      <h1> CURRENCY CONVERTER </h1>
   <div >
      <select 
        id="demo-simple-select-helper"
      onChange={(e) => setFromCurrency(e.target.value)} value={fromCurrency}>
        <option value=""> Select source currency</option>
        {Object.keys(symbols).map(symbol => (
          <option value={symbol} key={symbol}>
            {symbols[symbol].description} ({symbol})
          </option>
        ))}
      </select>
   
      <select  onChange={(e) => setToCurrency(e.target.value)} value={toCurrency}>
        <option value="">Select target currency</option>
        {Object.keys(symbols).map(symbol => (
          <option value={symbol} key={symbol}>
            {symbols[symbol].description} ({symbol})
          </option>
        ))}
      </select>
      </div>
     <Space/>
      <div>
      <TextField 
      id="filled-number"
      variant="filled"
      type='number' value={amount || ''} onChange={(e) => setAmount(e.target.value)} /> </div>
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

      <TextField 
      id="filled-number"
      variant="filled" type='number' readOnly value={rate || ''} />
        {rate !== null && (
          <p className='p'>
            Converted amount: {rate} {toCurrency}
          </p>
        )}
      </div>
      <div>
        <h2>Exchange Rate History</h2>
       
        {toCurrency ? (
          <LineChart data={history} width={500} height={250}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={['dataMin', 'dataMax']} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={toCurrency} stroke="#8884d8" />
          </LineChart>
        ) : (
          <LineChart width={500} height={250}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis domain={['date','date']}/>
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Legend />
          </LineChart>
        )}
      </div>
    
    </div>
  );
}

export default Converter;
