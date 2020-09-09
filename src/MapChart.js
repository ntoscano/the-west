import React, { useState, useEffect } from "react";
import { csv } from "d3-fetch";
import { LineChart } from 'react-chartkick'
import 'chart.js'


const MapChart = () => {
	const [data, setData] = useState([]);
	const [state, setState] = useState("California");
	const [county, setCounty] = useState("Alameda");
	const [stateLineData, setStateLineData] = useState({});
	const [countyLineData, setCountyLineData] = useState({});
	const [selection, setSelection] = useState("land");


	useEffect(() => {
		csv("/ds11parsed.csv").then(countiesLandData => {
			const data = {};
			countiesLandData.map((county) => {
				if (!data[county.STATE]) {
					data[county.STATE] = { counties: {}, averageYearlyValue: {}, marriages: {}, divorces: {} }
				}
				if (!data[county.STATE].counties[county.COUNTY]) {
					data[county.STATE].counties[county.COUNTY] = {
						name: county.COUNTY,
						code: county.COUNTYCODE,
						averageYearlyValue: {},
						marriages: {},
						divorces: {},
					}
				}
				data[county.STATE].counties[county.COUNTY].averageYearlyValue[county.YEAR] = parseInt(county.AVERAGEVALUE);
				if (!data[county.STATE].averageYearlyValue[county.YEAR]) {
					data[county.STATE].averageYearlyValue[county.YEAR] = { counties: 1, value: parseInt(county.AVERAGEVALUE) };
				} else {
					data[county.STATE].averageYearlyValue[county.YEAR].counties++;
					data[county.STATE].averageYearlyValue[county.YEAR].value += parseInt(county.AVERAGEVALUE);
				}
			})
			Object.keys(data).map((stateName) => {
				Object.keys(data[stateName].averageYearlyValue).map((year) => {
					data[stateName].averageYearlyValue[year].value = Math.round(data[stateName].averageYearlyValue[year].value / data[stateName].averageYearlyValue[year].counties);
				})
			})

			const stateLineData = {}
			Object.keys(data[state].averageYearlyValue).map((year) => {
				stateLineData[year] = data[state].averageYearlyValue[year].value;
			})
			setStateLineData(stateLineData);
			const countyLineData = {};
			Object.keys(data[state].counties[county].averageYearlyValue).map((year) => {
				countyLineData[year] = data[state].counties[county].averageYearlyValue[year];
			});
			setCountyLineData(countyLineData);
			return data;
		}).then((landData) => {
			csv("/ds237parsed.csv").then(countiesMarriageData => {
				const data = { ...landData };
				countiesMarriageData.map((county) => {
					if (!data[county.STATE]) {
						data[county.STATE] = { counties: {}, averageYearlyValue: {}, marriages: {}, divorces: {} }
					}
					if (!data[county.STATE].counties[county.COUNTY]) {
						data[county.STATE].counties[county.COUNTY] = {
							name: county.COUNTY,
							code: county.COUNTYCODE,
							averageYearlyValue: {},
							marriages: {},
							divorces: {},
						}
					}
					data[county.STATE].counties[county.COUNTY].marriages[county.YEAR] = parseInt(county.MARRIAGES);
					data[county.STATE].counties[county.COUNTY].divorces[county.YEAR] = parseInt(county.DIVORCES);
					if (!data[county.STATE].marriages[county.YEAR]) {
						data[county.STATE].marriages[county.YEAR] = (parseInt(county.MARRIAGES) || 0);
					} else {
						data[county.STATE].marriages[county.YEAR] += (parseInt(county.MARRIAGES) || 0);
					}
					if (!data[county.STATE].divorces[county.YEAR]) {
						data[county.STATE].divorces[county.YEAR] = (parseInt(county.DIVORCES) || 0);
					} else {
						data[county.STATE].divorces[county.YEAR] += (parseInt(county.DIVORCES) || 0);
					}
				})
				setData(data);
			})
		});
	}, []);

	const displayStateLandData = (stateName) => {
		const stateLineData = {}
		Object.keys(data[stateName].averageYearlyValue).map((year) => {
			stateLineData[year] = data[stateName].averageYearlyValue[year].value;
		})
		setStateLineData(stateLineData);
		return;
	}

	const displayStateMarriageData = (stateName) => {
		const stateLineData = [];
		const marriages = {
			name: "Marriages",
			data: {}
		}
		const divorces = {
			name: "Divorces",
			data: {}
		}
		Object.keys(data[stateName].marriages).map((year) => {
			marriages.data[year] = data[stateName].marriages[year];
		});
		Object.keys(data[stateName].divorces).map((year) => {
			divorces.data[year] = data[stateName].divorces[year];
		});
		stateLineData.push(marriages);
		stateLineData.push(divorces);
		setStateLineData(stateLineData);
		return;
	}

	const displayCountyLandData = (countyName) => {
		const countyLineData = {};
		Object.keys(data[state].counties[countyName].averageYearlyValue).map((year) => {
			countyLineData[year] = data[state].counties[countyName].averageYearlyValue[year];
		});
		setCountyLineData(countyLineData);
		return;
	}

	const displayCountyMarriageData = (countyName) => {
		const countyLineData = [];
		const marriages = {
			name: "Marriages",
			data: {}
		}
		const divorces = {
			name: "Divorces",
			data: {}
		}
		Object.keys(data[state].counties[countyName].marriages).map((year) => {
			marriages.data[year] = data[state].counties[countyName].marriages[year];
		});
		Object.keys(data[state].counties[countyName].divorces).map((year) => {
			divorces.data[year] = data[state].counties[countyName].divorces[year];
		});
		countyLineData.push(marriages);
		countyLineData.push(divorces);
		setCountyLineData(countyLineData);
		return;
	}

	const isSelected = (regionName) => {
		return (regionName === state || regionName === county) ? " bg-light-gray " : "";
	}

	const sideNav = (region, isCounty) => {
		return (
			<div className={"flex-column h-100 overflow-hidden mb4 pb2"}>
				<div className={"h-100" + (isCounty ? " overflow-y-scroll ba " : "")}>
					{Object.keys(region).sort().map((regionName, index) => {
						return (
							<div key={index} className={"f4 ma2 pa2 tl bb " + isSelected(regionName)} onClick={() => {
								if (selection === "land") {
									if (isCounty) {
										setCounty(regionName);
										displayCountyLandData(regionName);
									} else {
										setState(regionName);
										setCounty(Object.keys(data[regionName].counties)[0]);
										displayStateLandData(regionName);
									}
								} else if (selection === "marriage") {
									if (isCounty) {
										setCounty(regionName);
										displayCountyMarriageData(regionName);
									} else {
										setState(regionName);
										setCounty(Object.keys(data[regionName].counties)[0]);
										displayStateMarriageData(regionName);
									}
								}
							}}>
								{regionName}
							</div>
						)
					})}
				</div>
			</div>
		)
	}

	if (!data || !data[state]) {
		return (<div>loading</div>);
	}

	return (
		<div className="flex">
			<div className="bg-black-90 fixed w-100 ph3 pv3 pv4-ns ph4-m ph5-l absolute">
				<nav className="f6 fw6 ttu tracked">
					<a className="link dim white dib mr3" href="#" title="home">Home</a>
					<a className="link dim white dib mr3" href="#data" title="data">Data</a>
				</nav>
			</div>
			<div className="w-10 br mt6">
				{sideNav(data, false)}
			</div>
			<div className="w-100">
				<div className="flex mt6 tc justify-center">
					<div className={"w-20 ba mh3 " + (selection === "land" ? " bg-light-gray " : "")} onClick={() => {
						setSelection("land")
						displayCountyLandData(county);
						displayStateLandData(state);
					}}> Land Value </div>
					<div className={"w-20 ba mh3 " + (selection === "marriage" ? " bg-light-gray " : "")} onClick={() => {
						setSelection("marriage")
						displayCountyMarriageData(county);
						displayStateMarriageData(state);
					}}> Marriage Info</div>
				</div>
				<div className="flex w-100">
					<div className="w-90 mh3">
						<div className={"f3 mh2 mt5 tc mb2 justify-center"}>State: {state}</div>
						<div className={""}>
							{<LineChart data={stateLineData} />}
						</div>
						<div className="mt5 bt">
							<div className="f3 mb3 tc mt2 justify-center">County: {county}</div>
							<div className="flex">
								<div className={"w-10 f3 mh2 h-100"} style={{ height: "400px" }}>
									{sideNav(data[state].counties, true)}
								</div>
								<div className={"w-80 mt5"}>
									{<LineChart data={countyLineData} />}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MapChart;
