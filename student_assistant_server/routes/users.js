let express = require('express');
let router = express.Router();
let act = require('./activity');
let shell = require('shelljs');
let mongo = require("./mongo");
let mongoURL = "mongodb://localhost:27017/student_assistant";
let ObjectId = require('mongodb').ObjectID;
// let fse = require('fs-extra');
let filePath="";

router.post('/getActivityData', function (req, res, next) {
    try {
        console.log("In fetching activity");
        if(req.session.username!==null || req.session.username!==undefined) {
            let username = req.session.username;

            let jsonObj = [];

            mongo.connect(mongoURL, function () {
                let useractivitycoll = mongo.collection("useractivities");
                useractivitycoll.find({$and:[{username:username},{activitytype:"signup"}]}).toArray(function (err, results) {
                    console.log(results);
                    if(err){
                        console.log("Error while fetting account creation data");
                    }
                    if(results.length===1) {
                        let tempObj={};
                        tempObj["activitytype"] = results[0].activitytype;
                        tempObj["activitytime"] = results[0].activitytime;
                        tempObj["username"] = results[0].username;
                        jsonObj.push(tempObj);

                        useractivitycoll.find({$and:[{username:username},{activitytype:"login"}]}).sort({activitytime:-1}).limit(4).toArray(function (err, results1) {
                            console.log(results1);
                            if(err){
                                console.log(err);
                                throw err;
                            }
                            else
                            {
                                if(results1.length>0) {
                                    for (i = 0; i < results1.length; i++) {
                                        let tempObj = {};
                                        tempObj["activitytype"] = results1[i].activitytype;
                                        tempObj["activitytime"] = results1[i].activitytime;
                                        jsonObj.push(tempObj);
                                    }
                                    res.status(201).send(jsonObj);
                                }
                                else {
                                    res.status(301).send({"message":"Unrecognized Error. No activity found"});
                                }
                            }
                        });
                    }
                });
            });
        }
        else{
            res.status(203).send({"message":"Session Expired. Please Login Again"});
        }
    }
    catch (e){
        console.log(e);
        res.status(301).send({"message" : "Error while fetching activity data"});
    }
});

router.post('/changeProfile', function (req, res, next) {
    try {
        if(req.session.username!==null || req.session.username!==undefined) {
            let username = req.session.username;
            console.log(username);
            let data = req.body;
            console.log(data);
            updateQuery= {
                $set : {
                    username : data.username,
                    firstname : data.firstname,
                    lastname : data.lastname,
                    gender : data.gender,
                    skillset : data.skillset
                }
            };

            mongo.connect(mongoURL, function () {
                mongo.collection("users").updateOne({_id:username},updateQuery, function (err, results) {
                    console.log(results);
                    if (err) {
                        throw err;
                    }
                    if (results.result.nModified === 1) {
                        res.status(201).send({"message":"Profile updated successfully"});
                    }
                    else {
                        res.status(301).send({"message":"Failed to Update Profile"});
                    }
                });
            });
        }
        else{
            res.status(203).send({"message":"Session Expired. Please Login Again"});
        }
    }
    catch (e){
        console.log(e);
        res.status(301).send({"message" : "Error while fetching activity data"});
    }
});

router.post('/getprofile', function (req, res, next) {
    console.log("Inside get profile");
    try {
        console.log("In fetching profile");
        if(req.session.username!==null || req.session.username!==undefined) {
            let username = req.session.username;
            mongo.connect(mongoURL,function () {
                let profile = mongo.collection("users");
                profile.find({_id:username}).toArray(function (err, results) {
                    console.log(results);
                    if (err) {
                        throw err;
                    }
                    if (results.length === 1) {
                        res.status(201).send(results[0]);
                    }
                    else {
                        res.status(301).send({"message":"Failed to fetch Profile Data"});
                    }
                });
            });
        }
        else{
            res.status(203).send({"message":"Session Expired. Please Login Again"});
        }
    }
    catch (e){
        console.log(e);
        console.log("error");
        res.status(301).send({"message" : "Error while fetching activity data"});
    }
});


router.get('/getskillsets', function (req, res, next) {
    console.log("Here O m");
    try {
        console.log("In fetching profile");
        if(req.session.username!==null || req.session.username!==undefined) {
            let username = req.session.username;
            mongo.connect(mongoURL,function () {
                let skillset = mongo.collection("skillset");
                skillset.find({}).toArray(function (err, results) {
                    console.log(results);
                    if (err) {
                        throw err;
                    }
                    else {
                        if (results.length > 0) {
                            res.status(201).send(results);
                        }
                        else if (results.length === 0) {
                            res.status(204).end();
                        }
                        else {
                            res.status(301).send({"message":"Failed to fetch Profile Data"});
                        }
                    }

                });
            });
        }
        else{
            res.status(203).send({"message":"Session Expired. Please Login Again"});
        }
    }
    catch (e){
        console.log(e);
        console.log("error");
        res.status(301).send({"message" : "Error while fetching activity data"});
    }
});

router.post('/addissue', function (req, res, next) {
    try {
        if(req.session.username!==null || req.session.username!==undefined) {
            let username = req.session.username;
            let data = req.body;
            data.issueId = new ObjectId();
            console.log("data:"+JSON.stringify(data));
            mongo.connect(mongoURL, function () {

                let users = mongo.collection("users");

                users.updateOne({_id: username}, {
                    $push: {
                        issues_raised: {
                            _id: data.issueId,
                            topic: data.skillId,
                            issuecontent: data.issueContent,
                            isopen : true
                        }
                    }
                }, function (err, result) {
                    if (err) {
                        console.log(err);
                        throw err;
                    }
                    if(result.result.nModified===1){
                        // Adding Comment collection
                        let comments = mongo.collection("Comments");
                        comments.insert({
                            id:ObjectId(data.issueId),
                            comments:[]
                        }, function (err, result1) {

                            if(result1)
                            {
                                res.status(201).send(data);
                            }
                            else
                            {
                                res.status(201).send(data);
                            }

                        });



                    }
                    else {
                        res.status(301).send({"message":"Failed to add Issue"});
                    }
                });

            });
        }
        else{
            res.status(203).send({"message":"Session Expired. Please Login Again"});
        }
    }
    catch (e){
        console.log(e);
        res.status(301).send({"message" : "Error while fetching activity data"});
    }
});

router.post('/getUserIssues', function (req, res, next) {
    try {
        if(req.session.username!==null || req.session.username!==undefined) {
            let username = req.session.username;

            console.log("username"+username);
            mongo.connect(mongoURL, function () {

                let users = mongo.collection("users");

                users.aggregate([
                    {
                        $match:
                            {
                                '_id': username
                            }
                    },
                    {
                        $project:
                            {
                                issues_raised:1,
                            }
                    }
                ], function (err, result) {
                    if(err){
                        console.log(err);
                        throw err;
                    }
                    else
                    {
                        console.log(result[0].issues_raised);
                        // console.log(result[0].issues_raised.length);
                        if(result[0].issues_raised){
                            if(result[0].issues_raised.length>0){
                                let jsonObj = {
                                    openIssues : [],
                                    resolvedIssues : []
                                };
                                let count = 0;
                                result[0].issues_raised.map((issue)=>{
                                    let temp={};
                                    temp["issueId"]=issue._id;
                                    temp["skillId"]=issue.topic;
                                    temp["issueContent"]=issue.issuecontent;
                                    if(issue.isopen){
                                        jsonObj.openIssues.push(temp);
                                    }
                                    else {
                                        jsonObj.resolvedIssues.push(temp);
                                    }
                                    count++;
                                    if(result[0].issues_raised.length===count){
                                        console.log(jsonObj);
                                        res.status(201).send(jsonObj);
                                    }
                                });
                            }
                            else if(result[0].issues_raised.length===0){
                                res.status(204).send({"message":"No Open Issues or Closed added"});
                            }
                            else {
                                res.status(301).send({"message":"Failed to fetch Issue"});
                            }
                        }
                        else {
                            res.status(301).send({"message":"Failed to fetch Issue"});
                        }
                    }

                });

            });
        }
        else{
            res.status(203).send({"message":"Session Expired. Please Login Again"});
        }
    }
    catch (e){
        console.log(e);
        res.status(301).send({"message" : "Error while fetching activity data"});
    }
});

router.post('/resolveIssue', function (req, res, next) {
    try {
        if(req.session.username!==null || req.session.username!==undefined) {
            let username = req.session.username;
            let data = req.body;
            console.log("data:"+JSON.stringify(data));
            mongo.connect(mongoURL, function () {

                let users = mongo.collection("users");

                users.updateOne({'issues_raised._id': ObjectId(data.issueId)},{
                    $set: {
                        'issues_raised.$.isopen' : false
                    }
                }, function (err, result) {
                    if (err) {
                        console.log(err);
                        throw err;
                    }
                    else {
                        // console.log(result);
                        if(result){
                            console.log(result.result);
                            if(result.result.nModified===1){
                                res.status(201).send(data);
                            }
                            else {
                                res.status(301).send({"message":"Failed to add Issue"});
                            }
                        }
                        else {
                            res.status(301).send({"message":"Failed to add Issue"});
                        }

                    }
                });

            });
        }
        else{
            res.status(203).send({"message":"Session Expired. Please Login Again"});
        }
    }
    catch (e){
        console.log(e);
        res.status(301).send({"message" : "Error while fetching activity data"});
    }
});

router.post('/addSkill', function (req, res, next) {
    try {
        console.log("In fetching profile");
        if(req.session.username!==null || req.session.username!==undefined) {
            let username = req.session.username;
            console.log(req.body);
            mongo.connect(mongoURL,function () {
                let user = mongo.collection("users");
                user.updateOne({_id : username}, {
                    $push:{
                        skillset:{
                            _id : req.body.skillId
                        }
                    }
                }, function (err, results) {
                    if(err){
                        console.log(err);
                    }
                    else {
                        if(results) {
                            console.log(results);
                            if (results.result.nModified === 1) {
                                res.status(201).end();
                            }
                            else {
                                res.status(301).end();
                            }
                        }
                        else {
                            res.status(301).end();
                        }
                    }
                });
            });
        }
        else{
            res.status(203).send({"message":"Session Expired. Please Login Again"});
        }
    }
    catch (e){
        console.log(e);
        console.log("error");
        res.status(301).send({"message" : "Error while fetching activity data"});
    }
});




module.exports = router;
