const router = require('express').Router();

const passport = require('passport');

let mainController = require('../controllers/mainController');
let authController = require('../controllers/authController');



let lastUsed = Date.now();
//determines if the server is active(has seen user traffic in the last 15 min)
let isActive = false;


//will start up the interval function to make api calls.  this is where the API Update function will be called;
let updateTrips = ()=>{
	console.log("Hit Update Trip!");
	//will let functions know the updater is running and not to run it again
	isActive = true;
	// make API route call and parse data
	mainController.updateData();

	let rightNow = Date.now();
	//if nobody's been here in 15 minutes(900000ms), turn it off!
	if((rightNow-lastUsed)>600000){
		console.log("it has been 15 minutes with no server hits.  Should be shutting down");
		//lets functions know that the updater is not running and to restart it
		isActive = false;
		clearInterval(updateTimer);
	}
};

updateTimer = setInterval(function(){updateTrips();},90000);


//keeps server awake and updating data only as long as people are requesting.  If it isn't already updating, it will start it up again!
router.keepActive = (req, res, next)=>{
	console.log("Hit keepActive! lastUsed:",lastUsed);
	lastUsed = Date.now();
	if(!isActive){
		updateTrips();
		updateTimer;
	}
	return next();
};

router.get('/', (req,res)=>{
	res.json("POTATO Server is working!");
});

router.route('/api')
	.get(mainController.getApi);

router.route('/api/routes')
	.get(mainController.getRoutes);

router.route('/api/buses/:route')
	.get(mainController.getBuses);

router.route('/api/stops/:route/:bus')
	.get(mainController.getStops);

router.route('/api/update/:route/:stop/:bus')
	.get(mainController.getUpdate);

router.route('/api/login')
	.post(authController.login);

router.route('/api/signup')
	.post(authController.signup);

router.route('/api/userroutes')
	.get(authController.hasGoodToken, mainController.getUserRoutes)
	.post(authController.hasGoodToken,mainController.postUserRoutes);

router.route('/api/userroutes/:id')
	.get(authController.hasGoodToken,mainController.showUserRoute)
	.put(authController.hasGoodToken,mainController.editUserRoute)
	.delete(authController.hasGoodToken,mainController.deleteUserRoute);




module.exports = router;