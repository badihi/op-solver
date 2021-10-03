'use strict';

const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const fs = require('fs');

// Constants
const PORT = 80;
const HOST = '0.0.0.0';

// App
const app = express();
app.use(express.json());
app.post('/', (req, res) => {
	const points = req.body.points;
	points.sort((a, b) => b.score - a.score);

	let inputFile = '';
	inputFile += `NAME: planner
TYPE: OP
COMMENT: Iran tourism problem!
DIMENSION: ${points.length}
COST_LIMIT : ${req.body.limit}
EDGE_WEIGHT_TYPE: GEO
DISPLAY_DATA_TYPE: COORD_DISPLAY
NODE_COORD_SECTION
`;

	inputFile += points.map((p, i) => `${i + 1} ${toMS(p.coords)}`).join('\n');

	inputFile += '\nNODE_SCORE_SECTION\n';

	inputFile += points.map((p, i) => `${i + 1} ${p.score}`).join('\n');

	inputFile += `
DEPOT_SECTION
1
-1
EOF
`;
	const fileName = `/tmp/${Math.random()}.oplib`;
	fs.writeFile(fileName, inputFile, () => {
		const outFileName = `/tmp/${Math.random()}.sol`;
		exec(`/usr/local/bin/op-solver opt --op-exact 0 --sol ${outFileName} ${fileName}`, (err, stdout, stderr) => {
			if (err) {
				res.send({
					error: err
				});
				return;
			}

			fs.readFile(outFileName, (err, file) => {
				if (err) {
					res.send({
						error: err
					});
					return;
				}
				res.send(file);
			});
		});
	});

});

function toMS(point) {
	const x = Math.floor(point[0]) + (point[0] - Math.floor(point[0])) / 10 * 6;
	const y = Math.floor(point[1]) + (point[1] - Math.floor(point[1])) / 10 * 6;
	return `${x} ${y}`;
}

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
