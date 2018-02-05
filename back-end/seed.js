const csv = require('csvtojson');


let DaBa = require("./models");
let DB = DaBa.models;
DaBa.sequelize.sync({force: true}).then(function(){
	let routesArray = [];
	let stopsArray = [];
	let tripsArray = [];
	let invalidRoutes = ["Start"];
	let invalidStops = ["Start"];
	let invalidTrips = ["Start"];

	csv()
	.fromFile('./StaticTripData/routes.txt')
	.on('json',(jsonObj)=>{
		if(jsonObj.route_id) routesArray.push({name: jsonObj.route_id, description: jsonObj.route_long_name, color: jsonObj.route_color});
		else invalidRoutes.push(jsonObj);
	})
	.on('done', (err)=>{
		console.log('done converting routes');
		console.log('Invalid Routes:', ...invalidRoutes);
		DB.Route.bulkCreate(routesArray, {validate: true})
		.then((createdRoutes)=>{
			console.log("CREATED ROUTES!", createdRoutes);
			console.log('end');

			csv()
			.fromFile('./StaticTripData/stops.txt')
			.on('json',(jsonObj)=>{
				if(jsonObj.stop_id) stopsArray.push({number:jsonObj.stop_id, name:jsonObj.stop_name});
				else invalidStops.push(jsonObj);
			})
			.on('done',(err)=>{
				console.log('done converting Stops CSV');
				console.log('Invalid Stops:', ...invalidStops);
				DB.Stop.bulkCreate(stopsArray, {validate: true})
				.then((createdStops)=>{
					console.log("CREATED STOPS!");

				console.log('Ended');


				csv()
				.fromFile('./StaticTripData/trips.txt')
				.on('json', (jsonObj)=>{
					if(jsonObj.route_id) tripsArray.push({route:jsonObj.route_id,service:jsonObj.service_id,trip:jsonObj.trip_id});
					else invalidTrips.push(jsonObj);
				})
				.on('done', (err)=>{
					console.log('done converting Trips CSV');
					console.log('Invalid Trips:', ...invalidTrips);
					DB.Trip.bulkCreate(tripsArray, {validate: true})
					.then((createdTrips)=>{
						console.log("Created Trips!");
						process.exit();
					});

					console.log('Finished!');
					});
				});
			});
		});
	});
});
