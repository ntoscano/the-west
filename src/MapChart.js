import React, { useState, useEffect } from "react";
import { csv } from "d3-fetch";
import { LineChart } from 'react-chartkick'
import 'chart.js'


const MapChart = () => {
	const [data, setData] = useState([]);
	const [state, setState] = useState("California");
	const [county, setCounty] = useState("");
	const [stateLineData, setStateLineData] = useState({});
	const [countyLineData, setCountyLineData] = useState({});


	useEffect(() => {
		csv("/ds11parsed.csv").then(counties => {
			const data = {};
			counties.map((county) => {
				if (!data[county.STATE]) {
					data[county.STATE] = { counties: {}, averageYearlyValue: {} }
				}
				if (!data[county.STATE].counties[county.COUNTY]) {
					data[county.STATE].counties[county.COUNTY] = {
						name: county.COUNTY,
						code: county.COUNTYCODE,
						averageYearlyValue: {}
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
			setData(data);
			const stateLineData = {}
			Object.keys(data[state].averageYearlyValue).map((year) => {
				stateLineData[year] = data[state].averageYearlyValue[year].value;
			})
			setStateLineData(stateLineData);
			console.log(data)
		});
		// csv("/ds230parsed.csv").then(counties => {
		// 	counties.map((county) => {
		// 		if (!data[county.STATE]) {
		// 			data[county.STATE] = { counties: {}, averageYearlyValue: {} }
		// 		}
		// 		if (!data[county.STATE].counties[county.COUNTY]) {
		// 			data[county.STATE].counties[county.COUNTY] = {
		// 				name: county.COUNTY,
		// 				code: county.COUNTYCODE,
		// 				averageYearlyValue: {}
		// 			}
		// 		}
		// 		data[county.STATE].counties[county.COUNTY].averageYearlyValue[county.YEAR] = parseInt(county.AVERAGEVALUE);
		// 		if (!data[county.STATE].averageYearlyValue[county.YEAR]) {
		// 			data[county.STATE].averageYearlyValue[county.YEAR] = { counties: 1, value: parseInt(county.AVERAGEVALUE) };
		// 		} else {
		// 			data[county.STATE].averageYearlyValue[county.YEAR].counties++;
		// 			data[county.STATE].averageYearlyValue[county.YEAR].value += parseInt(county.AVERAGEVALUE);
		// 		}
		// 	})
		// 	Object.keys(data).map((stateName) => {
		// 		Object.keys(data[stateName].averageYearlyValue).map((year) => {
		// 			data[stateName].averageYearlyValue[year].value = Math.round(data[stateName].averageYearlyValue[year].value / data[stateName].averageYearlyValue[year].counties);
		// 		})
		// 	})
		// 	setData(data);
		// 	const stateLineData = {}
		// 	Object.keys(data[state].averageYearlyValue).map((year) => {
		// 		stateLineData[year] = data[state].averageYearlyValue[year].value;
		// 	})
		// 	setStateLineData(stateLineData);
		// 	console.log(data)
		// })

	}, []);

	const displayState = (stateName) => {
		setState(stateName);
		const stateLineData = {}
		Object.keys(data[stateName].averageYearlyValue).map((year) => {
			stateLineData[year] = data[stateName].averageYearlyValue[year].value;
		})
		setStateLineData(stateLineData);
		return;
	}

	const displayCounties = (countyName) => {
		setCounty(countyName);
		const countyLineData = {};
		Object.keys(data[state].counties[countyName].averageYearlyValue).map((year) => {
			countyLineData[year] = data[state].counties[countyName].averageYearlyValue[year];
		});
		setCountyLineData(countyLineData);
		return;
	}

	const isSelected = (regionName) => {
		return (regionName === state || regionName === county) ? " bg-light-gray " : "";
	}

	const sideNav = (region, isCounty) => {
		return (
			<div className={"flex-column h-100 " + (isCounty ? " overflow-scroll " : "")}>
				{Object.keys(region).sort().map((regionName, index) => {
					return (
						<p key={index} className={"f4 ma2 pa2 tl bb " + isSelected(regionName)} onClick={() => { isCounty ? displayCounties(regionName) : displayState(regionName) }}>
							{regionName}
						</p>
					)
				})}
			</div>
		)
	}

	if (!data || !data[state]) {
		return (<div>loading</div>);
	}

	return (
		<div>
			<header className="bg-black-90 fixed w-100 ph3 pv3 pv4-ns ph4-m ph5-l">
				<nav className="f6 fw6 ttu tracked">
					<a className="link dim white dib mr3" href="#" title="farmValue">1850-1959 Farm Values</a>
					<a className="link dim white dib mr3" href="#" title="About">About</a>
					<a className="link dim white dib mr3" href="#" title="Store">Store</a>
					<a className="link dim white dib" href="#" title="Contact">Contact</a>
				</nav>
			</header>
			<div className="flex">
				<div className=" mt6 w-10 br">
					{sideNav(data, false)}
				</div>
				<div className="mt6 w-90 mh3">
					<div className={"f3 mh2 mt5 tc mb2"}>{state}:</div>
					<div className={""}>
						<LineChart data={stateLineData} />
					</div>
					<div className="mt5 bt">
						<div className="f3 mb3 tc mt2">County: {county}</div>
						<div className="flex">
							<div className={"w-10 f3 mh2 h-100"} style={{ height: "400px" }}>
								{sideNav(data[state].counties, true)}
							</div>
							<div className={"w-80 mt5"}>
								<LineChart data={countyLineData} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MapChart;
