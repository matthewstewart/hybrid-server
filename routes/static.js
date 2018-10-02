module.exports = function(app) {
	
	// landing page route
	app.get("/", (req, res) => {
		let jsonResponse = {
			message: "Welcome to the Hybrid API."
		};
		res.json(jsonResponse);
	});
	
};	