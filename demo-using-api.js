'use strict';
// load the mysql library
var mysql = require('promise-mysql');

// create a connection to our Cloud9 server
var connection = mysql.createPool({
    host     : 'localhost',
    user     : 'zhenghao22', // CHANGE THIS :)
    database: 'reddit',
    connectionLimit: 10
});

// load our API and pass it the connection
var RedditAPI = require('./reddit');

var myReddit = new RedditAPI(connection);

// We call this function to create a new user to test our API
// The function will return the newly created user's ID in the callback

myReddit.createUser({
    username: 'charles',
    password: 'abc123'
})
    .then(newUserId => {
        // Now that we have a user ID, we can use it to create a new post
        // Each post should be associated with a user ID
        console.log('New user created! ID=' + newUserId);

        return myReddit.createPost({
            title: 'Hello Reddit! This is my first post',
            url: 'http://www.digg.com',
            userId: newUserId,
              subredditId: 1,
        });
        
    })
    .then(newPostId => {
        // If we reach that part of the code, then we have a new post. We can print the ID
        console.log('New post created! ID=' + newPostId);
    })
    .catch(error => {
        console.log(error.stack);
    })
    

    

// We call this function to create a new subreddit to test our API
// The function will return the newly created user's ID in the callback

// myReddit.createSubreddit({
//     name: 'colors2',
//     description: 'bla'
// })
// .then(newSubredditId => {
//     // Now that we have a subreddit ID, we can use it to create a new post
//     // Each post should be associated with a user ID
//     console.log('New subreddit created! ID=' + newSubredditId);
// })
// .catch(error => {
//     console.log(error.stack);
// })

// .then(function(){
// //connection.end();
// });

// myReddit.createVote({
//     userId: '1',
//     postId: '1',
//     voteDirection:'1'
// })
// .then(newPostId=>{
//     console.log('new vote created');
// });

// //returning table of post
// myReddit.getAllPosts().then(function(data){
//  console.log(data);
// });

// myReddit.getAllSubreddits().then(function(data){
//  console.log(data);
// });