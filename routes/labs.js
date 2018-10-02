const User = require('../models/User');
const Lab = require('../models/Lab');
const Freezer = require('../models/Freezer');
const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET){ require('../config/env.js'); }

module.exports = function(app) {
	
	// create new record
	app.post("/labs/new", adminRequired, (req, res) => {
    // Instantiate Schema Object
    let newRecord = new Lab({
			name: req.body.name,
			description: req.body.description
    });
    // Use Mongoose Built In Save Method
		newRecord.save((error, result) => {
			let jsonResponse;
			if(error){
				jsonResponse = {
					message: "There was a problem saving the new record to the DB.",
					data: {}
				};
			} else {
				jsonResponse = {
					message: "The new record was successfully saved to the DB.",
					data: result
				};
			}
			res.json(jsonResponse);
		});
	});	

	// remove record
	app.post("/labs/:recordId/remove", adminRequired, (req, res) => {
		Lab
		.findByIdAndRemove(req.params.recordId)
		.exec((error) => {
			if(error){
				jsonResponse = {
					message: "There was a problem removing the record from the DB."
				};
			} else {
				jsonResponse = {
					message: "The record was successfully removed from the DB."
				};
			}
			res.json(jsonResponse);
		});
	});	

	// edit record
	app.post("/labs/:recordId/edit", adminRequired, (req, res) => {
		Lab
		.findOne({'_id': req.params.recordId})
		.exec((err, record) => {
			record.name = req.body.name;
			record.description = req.body.description;
			record.save((error, updatedRecord) => {
				let jsonResponse;
				if(error){
					jsonResponse = {
						message: "There was a problem saving the updated World to the DB.",
						data: record
					};
				} else {
					jsonResponse = {
						message: "The updated World was successfully saved to the DB.",
						data: updatedRecord
					};
				}
				res.json(jsonResponse);
			});
		});
	});	

	// show one record
	app.get("/labs/:recordId", getRecordById, (req, res) => {
		let jsonResponse = {
			message: res.locals.message,
			data: res.locals.data,
			children: res.locals.children
		};
		res.json(jsonResponse);
	});	

	// list all records
	app.get("/labs", getAllRecords, (req, res) => {
		let jsonResponse = {
			message: res.locals.message,
			data: res.locals.records
		};
		res.json(jsonResponse);
	});	

};

function getAllRecords(req, res, next) {
	Lab
	.find({}, {}, {sort: {name: 1}})
	.exec((error, records) => {
		if(error) {
			res.locals.message = "There was a problem with retrieving the records from the DB.";
		} else {
			res.locals.message = "The records were successfully retrieved from the DB.";
		}
		res.locals.records = records;
		return next();
	});
}

function getRecordById(req, res, next) {
	Lab
	.findOne({'_id': req.params.recordId})
	.exec((error, record) => {
		if(error) {
			res.locals.message = "There was a problem with retrieving the record from the DB.";
		} else {
			Freezer
			.find({'parentId': req.params.recordId})
			.exec((error, children) => {
				if(error) {
					res.locals.message = "There was a problem with retrieving the record from the DB.";
				} else {				
					res.locals.message = "The record was successfully retrieved from the DB.";
					res.locals.record = record;
					res.locals.children = children;
				}
				return next();
			});		
		}
	});
}

function adminRequired(req, res, next) {
	if(!req.token){
		res.status(401).json({
			message: "You do not have access."
		});
		next();
	} else {
		jwt.verify(req.token, process.env.JWT_SECRET, (error, decoded) => {
			if(error){
				console.log(error);
				res.status(401).json({
					message: "You do not have access."
				});
				next();				
			} else {
				let userId = decoded.sub;
				User
				.findOne({'_id': userId})
				.exec((error, user) => {
					if(error || !user){
						res.status(401).json({
							message: "You do not have access."
						});
						next();
					} else {
						if(user.isAdmin){
							res.locals.currentUser = user;
							next();
						} else {
							res.status(401).json({
								message: "You need to be an Admin to perform this action on the API."
							});
							next();
						}
					}
				});
			}
		});
	}
}