<script lang="ts">
    import { onMount } from 'svelte';
    import { DataFrame } from 'pandas-js'; // Assuming you are using pandas-js
    import DBConnect from './DatabaseConnection'; // Assuming correct import
    import { writeFile } from 'fs/promises'; // Import the file system module for writing files
    import { Chart } from 'chart.js';

  
  let df: DataFrame | null = null;
  let EVdf: DataFrame | null = null;
  let XFMR_SID: string | null = null;
  let KVA_RATING: number | null = null;
  let EV_count: number | null = null;
  let overloaded_time: Date | null = null;
  let EVoverloaded_time: Date | null = null;
  let output: string = '-------------------------------------\n';
  let EV_output: string = '-------------------------------------\n';
  let threshold: number | null = null;
  let scenario: string | null = null;
  
    async function createDataFrame() {
  try {
    const queryStr = `SELECT XFMR_SID, MEASURE_DATE, UTC_TIME, KVA_MEASURE FROM [XfmrMeasure] WHERE XFMR_SID  = '${XFMR_SID}' AND KVA_MEASURE < ${parseFloat(KVA_RATING) * 4} order by MEASURE_DATE, UTC_TIME`;

    const cursor = await DBConnect().connDB().cursor();
    await cursor.execute(queryStr);
    const rows = await cursor.fetchall();

    df = new DataFrame(rows, ['XFMR_SID', 'MEASURE_DATE', 'UTC_TIME', 'KVA_MEASURE']);
  } catch (error) {
    output += `Error creating DataFrame: ${error}\n`;
  }
}

function getOutput() {
    return output;
}

function getEvOutput() {
    return EV_output;
}

interface DataFrameRow {
  MEASURE_DATE: string;
  UTC_TIME: string;
  // other fields
}

function sortDataFrame() {
  if (df === null) {
    output += 'DataFrame is null.\n';
    return;
  }

  df = df.sort((a: DataFrameRow, b: DataFrameRow) => {
    const dateA = new Date(a.MEASURE_DATE);
    const dateB = new Date(b.MEASURE_DATE);
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
      const timeA = a.UTC_TIME;
      const timeB = b.UTC_TIME;
      if (timeA < timeB) return -1;
      if (timeA > timeB) return 1;
      return 0;
    });
}
interface DataFrameRow {
  LOAD_PERCENT?: number;
  KVA_MEASURE: number;
  
  // other fields 
}

function changeToPercent() {
  if (df === null || KVA_RATING === null) {
    output += 'DataFrame or KVA_RATING is null.\n';
    return;
  }

  const kvaRating = KVA_RATING; // KVA_RATING is not null here

  df.forEach((row: DataFrameRow) => {
    row.LOAD_PERCENT = (row.KVA_MEASURE / parseFloat(kvaRating.toString())) * 100;
  });
}

async function saveCSV(filename: string, dataFrame: DataFrame) {
  try {
    const csvData = dataFrame.toCSV(); // Assuming toCSV() is a method on your DataFrame
    await writeFile(filename, csvData);
  } catch (error) {
    output += `Error saving CSV: ${error}\n`;
  }
}

async function createCSV() {
  try {
    if (EV_count !== null && parseFloat(EV_count.toString()) > 0) {
      await saveCSV(`XFMR ${XFMR_SID} - ${EV_count} EV's - ${scenario}.csv`, EVdf);
    } else {
      await saveCSV(`XFMR ${XFMR_SID}.csv`, df);
    }
  } catch (error) {
    console.error('Error creating .CSV file. This could be due to your package location or permissions. Please attempt to run the program as an administrator.');
  }
}

async function getKVA_Rating() {
    try {
        // Sets KVA_RATING to the KVA_RATING of the specified transformer using query result
        const queryStr = `SELECT KVA_RATING FROM [XfmrDimension] WHERE XFMR_SID = '${XFMR_SID}'`;
        const cursor = await DBConnect().connDB().cursor();
        await cursor.execute(queryStr);
        const result = await cursor.fetchall();
        KVA_RATING = parseFloat(result[0][0]);
    }  catch (error) {
    output += `Error getting KVA: ${error}\n`;
    }
}

function plotDataFrame() {

    if (EV_count !== null && parseFloat(EV_count) === 0) {
        // Plots DataFrame and changes labels to better match data
        const xValues = df.map(row => row.MEASURE_DATE);
        const yValues = df.map(row => row.KVA_MEASURE);
        const chart = new Chart({
            target: document.getElementById('chart'), 
            data: {
                labels: xValues,
                datasets: [{
                    label: 'KVA',
                    data: yValues,
                    borderColor: 'blue',
                    fill: false
                }]
            },
            type: 'line',
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            displayFormats: {
                                day: 'MMM D'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Measure Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'KVA'
                        },
                        ticks: {
                            beginAtZero: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                },
            }
        });
    } 
    else {
        // Plot EV and Normal Usage
        df.forEach(row => {
            row.MEASURE_DATE = new Date(row.MEASURE_DATE);
        });

        const xValues = df.map(row => row.MEASURE_DATE);
        const yValuesNormal = df.map(row => row.KVA_MEASURE);
        const yValuesEV = EVdf.map(row => row.KVA_MEASURE);

        const chart = new Chart({
            target: document.getElementById('chart'), 
            data: {
                labels: xValues,
                datasets: [{
                    label: 'Normal Usage',
                    data: yValuesNormal,
                    borderColor: 'blue',
                    fill: false
                }, {
                    label: 'EV Usage',
                    data: yValuesEV,
                    borderColor: 'orange',
                    fill: false
                }]
            },
            type: 'line',
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            displayFormats: {
                                day: 'MMM D'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Measure Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'KVA'
                        },
                        ticks: {
                            beginAtZero: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                },
            }
        });
    }
    
}
function printDataFrame() {
    console.log(df);
}

function setOverloadedTime() {
    // Returns the amount of time, in hours, that the specified transformer was overloaded
    const mask = df.map(row => row.KVA_MEASURE > KVA_RATING);
    const count = mask.filter(Boolean).length;
    overloaded_time = count * 0.25;

    if (parseFloat(EV_count) > 0) {
        const EVmask = EVdf.map(row => row.KVA_MEASURE > KVA_RATING);
        const EVcount = EVmask.filter(Boolean).length;
        EVoverloaded_time = EVcount * 0.25;
        EV_output += 'Total overloaded hours: ' + EVoverloaded_time + '\n';
    }
}

function getOverloadedTime() {
    // Prints out the overloaded time calculated in setOverloadedTime()
    output += 'Total overloaded hours: ' + overloaded_time + '\n';

    // Calculates the overloaded KWH
    const aboveCapacity = df.filter(row => row.KVA_MEASURE > KVA_RATING).map(row => row.KVA_MEASURE);
    const overloadedKWH = aboveCapacity.map(value => (value - KVA_RATING) * 0.25);
    const totalKWH = overloadedKWH.reduce((a, b) => a + b, 0);

    output += 'Total overloaded KWH: ' + totalKWH.toFixed(3) + '\n';

    // Calculates how many overloaded KWH it would take for the transformer to be upgraded or changed
    const load = 1.5 * KVA_RATING * 876 * 2;
    output += 'This is the upgrade threshold in KWH: ' + load + '\n';
    
    if (totalKWH > load) {
        output += 'This transformer needs to be checked or upgraded.\n';
    } else {
        output += 'The transformer is in good shape.\n';
    }

    if (parseFloat(EV_count) > 0) {
        const EVaboveCapacity = EVdf.filter(row => row.KVA_MEASURE > KVA_RATING).map(row => row.KVA_MEASURE);
        const EVoverloadedKWH = EVaboveCapacity.map(value => (value - KVA_RATING) * 0.25);
        const EVtotalKWH = EVoverloadedKWH.reduce((a, b) => a + b, 0);

        EV_output += 'Total overloaded KWH: ' + EVtotalKWH.toFixed(3) + '\n';
        EV_output += 'This is the upgrade threshold in KWH: ' + load + '\n';

        if (EVtotalKWH > load) {
            EV_output += 'EV usage needs this transformer to be checked or upgraded.\n';
        } else {
            EV_output += 'The transformer is in good shape, regardless of EV usage.\n';
        }
    }
}
function getTimeOverThreshold(threshold_choice) {
    // Prints amount of KWH over specified threshold percentage

    const threshold = threshold_choice;

    if (threshold === '') {
        return;
    } else {
        const aboveThreshold = df.filter(row => row.LOAD_PERCENT > parseFloat(threshold))
                                  .map(row => ({ LOAD_PERCENT: row.LOAD_PERCENT, KVA_MEASURE: row.KVA_MEASURE }));
        
        const overloadedKWH = aboveThreshold.map(row => (row.KVA_MEASURE - (KVA_RATING * (parseFloat(threshold) / 100))) * 0.25);
        const totalKWH = overloadedKWH.reduce((a, b) => a + b, 0);

        output += 'Total KWH above ' + threshold + '% load: ' + totalKWH.toFixed(3) + '\n';

        if (parseFloat(EV_count) > 0) {
            const EVaboveThreshold = EVdf.filter(row => row.LOAD_PERCENT > parseFloat(threshold))
                                          .map(row => ({ LOAD_PERCENT: row.LOAD_PERCENT, KVA_MEASURE: row.KVA_MEASURE }));
            
            const EVoverloadedKWH = EVaboveThreshold.map(row => (row.KVA_MEASURE - (KVA_RATING * (parseFloat(threshold) / 100))) * 0.25);
            const EVtotalKWH = EVoverloadedKWH.reduce((a, b) => a + b, 0);

            EV_output += 'Total KWH above ' + threshold + '% load: ' + EVtotalKWH.toFixed(3) + '\n';
        }
    }
}
function getAvailableKWH() {
    // Calculates available KWH
    const belowCapacity = df.filter(row => row.KVA_MEASURE < KVA_RATING)
                            .map(row => row.KVA_MEASURE);
    
    const availableKWH = belowCapacity.map(value => (KVA_RATING - value) * 0.25);
    const totalKWH = availableKWH.reduce((a, b) => a + b, 0);

    output += 'Total available KWH: ' + totalKWH.toFixed(3) + '\n';
    output += '-------------------------------------\n';
    console.log(output);

    // Calculates available KWH for the EV prediction
    if (parseFloat(EV_count) > 0) {
        const EVbelowCapacity = EVdf.filter(row => row.KVA_MEASURE < KVA_RATING)
                                    .map(row => row.KVA_MEASURE);
        
        const EVavailableKWH = EVbelowCapacity.map(value => (KVA_RATING - value) * 0.25);
        const EVtotalKWH = EVavailableKWH.reduce((a, b) => a + b, 0);

        EV_output += 'Total available KWH: ' + EVtotalKWH.toFixed(3) + '\n';
        EV_output += '-------------------------------------\n';
        console.log(EV_output);
    }
}
function analyzeEV(count, scenario_choice) {
    EV_count = count;

    if (EV_count === '0') {
        return;
    } else if (EV_count === '1' || EV_count === '2' || EV_count === '3') {
        EVdf = df.slice(); // Create a shallow copy of the DataFrame df
        EV_output += "EV Count: " + EV_count + "\n";
        scenario = scenario_choice;

        if (scenario === '1') {
            EV_output += "EV Loading Scenario: Peak Loading\n";
            EV_scenario = "Peak";
            // Convert the 'MEASURE_DATE' column to a Date format
            EVdf.forEach(row => {
                row.MEASURE_DATE = new Date(row.MEASURE_DATE);
            });

            // Extract the month from the 'MEASURE_DATE' column and save it to a new column called 'MONTH'
            EVdf.forEach(row => {
                row.MONTH = row.MEASURE_DATE.getMonth() + 1; // Months are 0-indexed in JavaScript
            });

            // Extract the hour from the 'UTC_TIME' column and save it to a new column called 'HOUR'
            EVdf.forEach(row => {
                row.HOUR = new Date(row.UTC_TIME).getHours();
            });

            // Create a mask that checks if the 'MONTH' is between April and October
            const mask1 = row => row.MONTH >= 4 && row.MONTH <= 10;

            // Create a mask that checks if the 'HOUR' is between 2pm and 8pm
            const mask2 = row => (row.HOUR >= 14 && row.HOUR <= 19) || row.UTC_TIME === '20:00:00.0000000';

            // Create a mask that checks if the 'MONTH' is between November and March
            const mask3 = row => (row.MONTH >= 1 && row.MONTH <= 3) || (row.MONTH >= 11 && row.MONTH <= 12);

            // Create a mask that checks if the 'HOUR' is between 5am and 11am
            const mask4 = row => (row.HOUR >= 5 && row.HOUR <= 10) || row.UTC_TIME === '11:00:00.0000000';

            // Update the 'KVA_MEASURE' column based on the masks and EV_count
            EVdf.forEach(row => {
                if (mask1(row) && mask2(row)) {
                    row.KVA_MEASURE += 7 * parseFloat(EV_count);
                } else if (mask3(row) && mask4(row)) {
                    row.KVA_MEASURE += 7 * parseFloat(EV_count);
                }
            });

            // Save the updated DataFrame if needed
            // ...

            return;
        } else if (scenario === '2') {
            EV_output += "EV Loading Scenario: Off-Peak Loading\n";
            EV_scenario = "Off-Peak";

            // Extract the hour from the 'UTC_TIME' column and save it to a new column called 'HOUR'
            EVdf.forEach(row => {
                row.HOUR = new Date(row.UTC_TIME).getHours();
            });

            // Create a mask that checks if the 'HOUR' is between 9pm and 4am
            const mask = row => (row.HOUR >= 21 || row.HOUR <= 4) || row.UTC_TIME === '05:00:00.0000000';

            // Update the 'KVA_MEASURE' column based on the mask and EV_count
            EVdf.forEach(row => {
                if (mask(row)) {
                    row.KVA_MEASURE += 7 * parseFloat(EV_count);
                }
            });

            // Save the updated DataFrame if needed
            // ...

            return;
        } else if (scenario === '3') {
            EV_output += "EV Loading Scenario: Partial-Peak Loading\n";
            EV_scenario = "Partial-Peak";

            // Extract the hour from the 'UTC_TIME' column and save it to a new column called 'HOUR'
            EVdf.forEach(row => {
                row.HOUR = new Date(row.UTC_TIME).getHours();
            });

            // Create a mask that checks if the 'HOUR' is between 5pm and 12am
            const mask = row => (row.HOUR >= 17 || row.HOUR === 0) || row.UTC_TIME === '01:00:00.0000000';

            // Update the 'KVA_MEASURE' column based on the mask and EV_count
            EVdf.forEach(row => {
                if (mask(row)) {
                    row.KVA_MEASURE += 7 * parseFloat(EV_count);
                }
            });

            // Save the updated DataFrame if needed
            // ...

            return;
        }
    }
}
function createRiskReport(sid, threshold, EV_count, scenario) {
    XFMR_SID = sid;

    // Call the asynchronous functions sequentially
    getKVA_Rating();
    createDataFrame()
        .then(() => {
            if (df.length === 0) {
                throw new Error("Error: The SID input returned no results.");
            }
            sortDataFrame();
            changeToPercent();
            // printDataFrame();
            analyzeEV(EV_count, scenario);
            createCSV();
            getTimeOverThreshold(threshold);
            setOverloadedTime();
            getOverloadedTime();
            getAvailableKWH();
            plotDataFrame();
        })
        .catch(error => {
            output += "Error: " + error.message + "\n";
        });
}

onMount(() => {
        // Code here will run after the component is mounted
        // You can call your createRiskReport function here
        createRiskReport(XFMR_SID, threshold, EV_count, scenario);
    });





</script>
