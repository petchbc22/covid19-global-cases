import React, { useEffect, useState } from "react";
import ChartRace from "react-chart-race";
import axios from "axios";
import "./style.css"; 
function App() {
  // ------------------------------------------------ state -----------------------------------------------------
  const [mediaItem, setMediaItem] = useState();
  const [index, setIndex] = useState(0);
  const [data, setData] = useState([]);
  const [rawDatafromAPI, setrawDatafromAPI] = useState([]);
  const [finalData, setFinalData] = useState([]);
  // ------------------------------------------ useEffect fetch API ---------------------------------------------
  useEffect(() => {
    axios
      .get("https://disease.sh/v3/covid-19/historical?lastdays=100")
      .then(function (response) {
        setrawDatafromAPI(response.data);
      });
  }, []);
  // ------------------------ convert data from api to format JSON desired --------------------------------------
  useEffect(() => {
    if (rawDatafromAPI.length) {
      let rawData = rawDatafromAPI.map((data) => {
        let newCaseData = {};
        // filter only month number 5 (may) 2021.
        let casesData = Object.entries(data.timeline.cases).filter((data) => {
          return parseInt(data[0].split("/")[0]) === 5;
        });
        // get value position 0 (date) and position 1 (infected people cases).
        for (let i = 0; i < casesData.length; i++) {
          newCaseData[casesData[i][0]] = casesData[i][1];
        }
        return {
          country: data.country,
          cases: newCaseData,
          color: "#" + (((1 << 24) * Math.random()) | 0).toString(16), // ramdom color to set in chart.
        };
      });
      let countryKey = [];
      for (let i = 0; i < rawData.length; i++) {
        countryKey.push(rawData[i].country);
      }
      // get value contryname not duplicate. 
      countryKey = [...new Set(countryKey)];

      let dateGroup = Object.keys(rawData[0].cases);
      let dataReturn = [];
      for (let i = 0; i < dateGroup.length; i++) {
        let dateData = {
          date: String(dateGroup[i]),
          countryInfor: [],
        };
        for (let j = 0; j < countryKey.length; j++) {
          let total = 0;
          for (let z = 0; z < rawData.length; z++) {
            if (String(countryKey[j]) === String(rawData[z].country)) {
              total += parseInt(rawData[z].cases[String(dateGroup[i])]); // sum total case with name country. 
            }
          }
          dateData.countryInfor.push({
            country: String(countryKey[j]),
            color: rawData[j].color,
            total: total,
          });
        }
        dataReturn.push(dateData);
      }
      // sort data descending.
      dataReturn = dataReturn.map((data) => {
        return {
          date: data.date,
          countryInfor: data.countryInfor.sort(function (a, b) {
            return b.total - a.total;
          }),
        };
      });
      console.log(dataReturn);
      dataReturn.unshift({date:'',countryInfor:[]});
      
      setFinalData(dataReturn);
    }
  }, [rawDatafromAPI]);
  // ------------------------ useEffect setTime to render Chart each day --------------------------------------
  // ---- set index number to loop
  useEffect(() => {
    const timerId = setInterval(
      () => setIndex((i) => 
      (i + 1) % finalData.length),
      350
    );
    console.log(timerId)
    return () => clearInterval(timerId);
  
  }, [finalData]);

  // ---- set data to format of react-chart-race when state name : number change.
  useEffect(() => {
    console.log(index)
    
    setMediaItem(finalData[index]);
    if (mediaItem) {
      if (mediaItem.countryInfor.length) {
        let dataCountry = mediaItem.countryInfor.map((data, index) => {
          return {
            id: index + 1,
            title: data.country,
            value: data.total,
            color: data.color,
          };
        });
        // console.log(dataCountry);
        setData(dataCountry);
      }
    }
  }, [index]);

  return (
    <div>
      <div className="underLine"></div>
      <h2 className="text-center">Covid Global Cases by SGN</h2>
      <div className="text-center">
        date : {mediaItem ? mediaItem.date : ""}
      </div>
      <ChartRace
        data={data}
        backgroundColor="#fff"
        width={968}
        padding={12}
        itemHeight={20}
        gap={12}
        titleStyle={{ font: "normal 400 13px Arial", color: "#fff" }}
        valueStyle={{
          font: "normal 400 11px Arial",
          color: "rgba(255,255,255, 0.42)",
        }}
      />
    </div>
  );
}

export default App;
