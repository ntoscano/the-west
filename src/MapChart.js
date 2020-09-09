import React, { useState, useEffect } from "react";
import { csv } from "d3-fetch";
import { LineChart } from 'react-chartkick'
import ds11 from "./ds11Parsed.csv"
import ds237 from "./ds237Parsed.csv"
import 'chart.js'


const MapChart = () => {
	const [stateData, setStateData] = useState([]);
	const [state, setState] = useState("California");
	const [county, setCounty] = useState("Alameda");
	const [stateLineData, setStateLineData] = useState({});
	const [countyLineData, setCountyLineData] = useState({});
	const [selection, setSelection] = useState("land");


	useEffect(() => {
		csv(ds11).then(countiesLandData => {
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
			csv(ds237).then(countiesMarriageData => {
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
				setStateData(data);
			})
		});
	}, []);

	const displayStateLandData = (stateName) => {
		const stateLineData = {}
		Object.keys(stateData[stateName].averageYearlyValue).map((year) => {
			stateLineData[year] = stateData[stateName].averageYearlyValue[year].value;
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
		Object.keys(stateData[stateName].marriages).map((year) => {
			marriages.data[year] = stateData[stateName].marriages[year];
		});
		Object.keys(stateData[stateName].divorces).map((year) => {
			divorces.data[year] = stateData[stateName].divorces[year];
		});
		stateLineData.push(marriages);
		stateLineData.push(divorces);
		setStateLineData(stateLineData);
		return;
	}

	const displayCountyLandData = (countyName) => {
		const countyLineData = {};
		Object.keys(stateData[state].counties[countyName].averageYearlyValue).map((year) => {
			countyLineData[year] = stateData[state].counties[countyName].averageYearlyValue[year];
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
		Object.keys(stateData[state].counties[countyName].marriages).map((year) => {
			marriages.data[year] = stateData[state].counties[countyName].marriages[year];
		});
		Object.keys(stateData[state].counties[countyName].divorces).map((year) => {
			divorces.data[year] = stateData[state].counties[countyName].divorces[year];
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
			<div className={"flex-column h-100 overflow-hidden mb4 pb2 f4"}>
				<div className={"h-100" + (isCounty ? " overflow-y-scroll ba f6" : "")}>
					{Object.keys(region).sort().map((regionName, index) => {
						return (
							<div key={index} className={" ma2 pa2 tl bb " + isSelected(regionName)} onClick={() => {
								if (selection === "land") {
									if (isCounty) {
										setCounty(regionName);
										displayCountyLandData(regionName);
									} else {
										setState(regionName);
										setCounty(Object.keys(stateData[regionName].counties)[0]);
										displayStateLandData(regionName);
									}
								} else if (selection === "marriage") {
									if (isCounty) {
										setCounty(regionName);
										displayCountyMarriageData(regionName);
									} else {
										setState(regionName);
										setCounty(Object.keys(stateData[regionName].counties)[0]);
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

	if (!stateData || !stateData[state]) {
		return (<div>loading</div>);
	}

	return (
		<div className="flex">
			<div className="bg-black-90 fixed w-100 ph3 pv3 pv4-ns ph4-m ph5-l absolute">
				<nav className="f6 fw6 ttu tracked">
					<a className="link dim white dib mr3" href="#" title="head">A look at Real Estate Value of Farmland and Marriage/Divorce rates in The West</a>
				</nav>
			</div>
			<div className="mt6 fl tl mh2 w-50">
				<h1 id="overview">Overview</h1>
				<p>The American West has been long seen as the land of opportunity. The Gold Rush of the mid 1800&#39;s sparked a mass migration westward, the American Public was inspired to manifest its destiny. This migration highlighted the need for federal involvement in facilitating access to California and the The West as a whole, such as with the Mail Act of 1857 and later the Railroad Act of 1862.</p>
				<p>Patricia Limerick, a leading historian of The West, argues that real estate is the emotional center of the region, a stand-in for struggles over resources -- oil, water, minerals, etc. Therefore, this examination of the of the changes in the value of farmland over-time paint a deeper picture, indicative of greater issues at play.</p>
				<p>This analysis attempted to find any correlation between trends in land value and marriage/divorce rates in The West at the county level. </p>
				<h2 id="findings">Findings</h2>
				<p>No significant statistical relationship was found comparing land value trends to marriage/divorce rates. </p>
				<p>Examining the two metrics separately, however, shows significant relationships between historical events and the metrics under examination.</p>
				<h3 id="marriage-divorce-rates">Marriage/Divorce Rates</h3>
				<p>World War 1 and World War 2 show the greatest impact on marriage/divorce rates. However, across the board, in 1973 there is a dip in marriage rates, likely a result of the Supreme Court Case Row v Wade. We also see anomalies such as the dramatic spike in Nevada marriages following the founding of Las Vegas after World War 2.</p>
				<h3 id="farm-land-value">Farm Land Value</h3>
				<p>Similarly to marriage/divorce rates, the World Wars saw increases in population in The West, which saw an increase in land value. California counties, such as Inyo and Humboldt county saw dramatic increases in value in the later half of the 1920, then sharp drops. Trends like these can be explained by the formation of Water Districts increasing the viability of farmland, and the following Great Depression and New Deal legislation under F.D.R.</p>
				<h2 id="conclusion">Conclusion</h2>
				<p>The history of The West can not be understood by simply examining major events. Nor would the story be complete by focusing solely on statistical data. The history of any place is how major event affect a given place over time. The emotional toll of the World Wars are seen in the numbers of marriages following the soldiers return home. The rises in property value in desert areas are reflections of government works projects.</p>
				<p>To understand History, we must understand the causes of major events, and their long lasting consequences. </p>

			</div>
			<div className="w-10 bl mt6">
				{sideNav(stateData, false)}
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
						<div className="mt5 bt bl">
							<div className="f3 mb3 tc mt2 justify-center">County: {county}</div>
							<div className="flex">
								<div className={"w-20 f3 mh2 h-100"} style={{ height: "500px" }}>
									{sideNav(stateData[state].counties, true)}
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
