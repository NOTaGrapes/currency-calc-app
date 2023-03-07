import React, { useEffect, useState } from 'react';
import DerivAPIBasic from "https://cdn.skypack.dev/@deriv/deriv-api/dist/DerivAPIBasic";
import './App.css';

function App() {
    const [leftOpt,setLeftOpt] = useState();
    const [rightOpt,setRightOpt] = useState();
    const [leftSel,setLeftSel] = useState();
    const [rightSel,setRightSel] = useState();   
    const [leftVal,setLeftVal] = useState();
    const [rightVal,setRightVal] = useState();
    const [exchange,setExchange] = useState();
    //Стартовый хук
    useEffect(() => {
        getPayoutCurrencies();
    },[]); 
    //реакция на изменения левого селекта
    useEffect(()=>{
        if(leftSel===undefined){
            return;
        }
        getExchangeRates();
    },[leftSel]);
    //реакция на изменения правого селекта
    useEffect(()=>{
        if(leftVal===undefined){
            return; 
        }
        setRightVal(leftVal*exchange[rightSel].toFixed(3))       
    },[rightSel]);
    //реакция на получение новых коэффициентов обмена
    useEffect(()=>{
        if(exchange===undefined || leftVal===undefined){
            return;
        }
        setRightVal(leftVal*exchange[rightSel].toFixed(3))
    },[exchange]);
    //взаимные реакции на изменения полей инпут
    useEffect(()=>{
        if(leftVal===undefined){
            return; 
        }
        setRightVal(leftVal*exchange[rightSel].toFixed(3))
    },[leftVal]);
    //взаимные реакции на изменения полей инпут
    useEffect(()=>{
        if(rightVal===undefined){
            return;
        }
        setLeftVal(rightVal/exchange[rightSel].toFixed(3))
    },[rightVal]);
    //Компонент помошник  
    const OutString = () => {
        if(exchange===undefined)
        {
            return(<p>Ожидайте...</p>);
        }
        return(<p>1 {leftSel} = {exchange[rightSel].toFixed(3)} {rightSel}</p>);
    };

    const app_id = 1089; // Replace with your app_id or leave as 1089 for testing.
    const connection = new WebSocket(
        `wss://ws.binaryws.com/websockets/v3?app_id=${app_id}`
    );
    const api = new DerivAPIBasic({ connection });

    const exchange_request = {
        exchange_rates: 1,
        base_currency: leftSel,
    };
    const payout_request = {
        payout_currencies: 1
    };
    const exchangeResponse = async (res) => {
        const data = JSON.parse(res.data);
        console.log("exchangeResponse :",data);
        if (data.error !== undefined) {
            console.log("Error : ", data.error.message);
            connection.removeEventListener("message", exchangeResponse, false);
            await api.disconnect();
        }
        if (data.msg_type === "exchange_rates") {
            let newOptRight = Object.keys(data.exchange_rates.rates);
            setRightOpt(newOptRight.map((text, index) => {
                return <option key={index} value={text}>{text}</option>;
            }));
            setExchange(data.exchange_rates.rates)
            setRightSel(newOptRight[0]);
        }
        connection.removeEventListener("message", exchangeResponse,false)
    };
    const getExchangeRates = async () => {
        connection.addEventListener("message", exchangeResponse);
        await api.exchangeRates(exchange_request);
    };
    const payoutResponse = async (res) =>{
        const data = JSON.parse(res.data);
        console.log("payoutResponse :",data);
        if (data.error !== undefined) {
            console.log("Error : ", data.error.message);
            connection.removeEventListener("message", payoutResponse, false);
            await api.disconnect();
        }
        if (data.msg_type === "payout_currencies") {
            let newOptLeft = data.payout_currencies;
            setLeftOpt(newOptLeft.map((text, index) => {
                return <option key={index} value={text}>{text}</option>;
            }));
            setLeftSel(newOptLeft[0]);
            
        }
        connection.removeEventListener("message", payoutResponse,false)
    };
    const getPayoutCurrencies = async () => {
        connection.addEventListener("message", payoutResponse);
        await api.payoutCurrencies(payout_request);
    };

    return (
        <div
        className="AppMain"
        >
            <header>
                <select
                aria-label="leftValSelect"
                className="AppSelect"
                onChange={(e)=>{setLeftSel(e.target.value);}}>
                {leftOpt}
                </select>
                <select
                aria-label="rightValSelect"
                className="AppSelect"
                onChange={(e)=>{setRightSel(e.target.value)}}>
                {rightOpt}
                </select>

            </header>
            <header>
                <input
                aria-label="leftValInput"
                className="AppInput"
                type="number"
                value={leftVal}
                min="0"
                max="999999999"

                placeholder="Значение"
                onChange={(e)=>{setLeftVal(e.target.value)}}
                />
                <input
                aria-label="rightValInput"             
                className="AppInput"
                type="number"
                value={rightVal}
                min="0"
                max="999999999"

                placeholder="Значение"
                onChange={(e)=>{setRightVal(e.target.value)}}
                />
            </header>
            <header>
                <OutString/>
            </header>
        </div>
    );
}

export default App;
