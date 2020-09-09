const fs = require('fs');
const path = require('path');


const paths = [
	"./data/ds11/",
	"./data/ds224/",
	"./data/ds230/",
	"./data/ds237/",
]

const states = [
"Nevada",
"California",
"Oregon",
"Washington",
"Utah",
"Arizona",
"Texas",
"Colorado",
"New Mexico",
]

function csvJSON(csv, p) {

	var lines = csv.split("\n");
	var result = [];
	var headers = lines[0].split(",");

	for (var i = 1; i < lines.length; i++) {

		var obj = {};
		var currentline = lines[i].split(",");

		for (var j = 0; j < headers.length; j++) {
			obj[headers[j]] = currentline[j];
		}
		states.map((state) => {
			if(obj.STATE && obj.STATE.includes(state)){
				result.push(obj);
			}
		})

	}
	result = ConvertToCSV(result)
	fs.writeFileSync(path.join(process.cwd(), p+"parsed.csv"), result);
}

function ConvertToCSV(objArray) {
	var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
	var str = '';

	for (var i = 0; i < array.length; i++) {
		var line = '';
		for (var index in array[i]) {
			if (line != '') line += ','

			line += array[i][index];
		}

		str += line + '\r\n';
	}

	return str;
}

paths.map((p) => {
	csvJSON(fs.readFileSync(path.join(process.cwd(), p+"merged.csv"), "utf-8"), p)
})




