'use strict';
var bcrypt = require('bcrypt-as-promised');
var HASH_ROUNDS = 10;

class RedditAPI {
    constructor(conn) {
        this.conn = conn;
    }

    createUser(user) {
        /*
        first we have to hash the password. we will learn about hashing next week.
        the goal of hashing is to store a digested version of the password from which
        it is infeasible to recover the original password, but which can still be used
        to assess with great confidence whether a provided password is the correct one or not
         */
        return bcrypt.hash(user.password, HASH_ROUNDS)
        .then(hashedPassword => {
            return this.conn.query('INSERT INTO users (username,password, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())', [user.username, hashedPassword]);
        })
        .then(result => {
            return result.insertId;
        })
        .catch(error => {
            // Special error handling for duplicate entry
            if (error.code === 'ER_DUP_ENTRY'){
                throw new Error('A user with this username already exists');
            }
            else {
                throw error;
            }
        });
    }
    
    
    createSubreddit(subreddit){
        return this.conn.query( `INSERT INTO subreddit (name, description, createdAt, updatedAt)
                          VALUES (?, ?, NOW(), NOW())`,
        [subreddit.name, subreddit.description])
        .then(result => {
            return result.insertId;
        })
        .catch(error => {
            // Special error handling for duplicate entry
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('A subreddit with this name already exists');
            } else {
                throw error;
            }
        });
    }

    createPost(post) {
        
        //throw error if subredditId is not provided
        if(post.subredditId===undefined){
            throw new Error("subredditId is not provided.");
        }
        else{
        
            return this.conn.query(
                `
                INSERT INTO posts (userId, title, url, subredditId, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, NOW(), NOW())
                `,
                [post.userId, post.title, post.url, post.subredditId]
            )
                .then(result => {
                    return result.insertId;
                });
        }    
    }
    
     createVote(vote){
        if(vote.voteDirection!=1 && vote.voteDirection!=-1 && vote.voteDirection!=0){
            throw new Error("vote is not 1 ,0,or -1.");
             
        }else{
            return this.conn.query(
            `
            INSERT INTO votes SET postId=?, userId=?, voteDirection=? 
            ON DUPLICATE KEY UPDATE voteDirection=?;
            `,
            [vote.postId, vote.userId,vote.voteDirection, vote.voteDirection]
            )
            .then(result => {
                 return vote.insertId;
            });
        }
     }
    
    
    
//     Add a function called createVote(vote) to your Reddit API. This function will take
//     a vote object with postId, userId, voteDirection. Your function should make sure that the 
//     voteDirection is either 1, 0 (to cancel a vote) or -1. 
//     If it's different, your function should return an error.

// If we do the query with a regular INSERT we can run into errors. The first time a user 
// votes on a given post will pass. But if they try to change their vote direction, 
// the query will fail because we would be trying to insert a new vote with the same 
// postId/userId. One way to fix this would be to first check if the user has already 
// voted on a post by doing a SELECT, and UPDATE the corresponding row if they have. 
// But SQL gives us a better way to do that: ON DUPLICATE KEY UPDATE. With it, we can write our voting
// query like this:

// INSERT INTO votes SET postId=?, userId=?, voteDirection=? ON DUPLICATE KEY UPDATE voteDirection=?;
// This way, the first time user#1 votes for post#1, a new row will be created. If they change their
// mind and send a different vote for the same post, then the voteDirection column of the same row will 
// be updated instead.
    
    


    getAllPosts() {
        /*
        strings delimited with ` are an ES2015 feature called "template strings".
        they are more powerful than what we are using them for here. one feature of
        template strings is that you can write them on multiple lines. if you try to
        skip a line in a single- or double-quoted string, you would get a syntax error.

        therefore template strings make it very easy to write SQL queries that span multiple
        lines without having to manually split the string line by line.
         */
         
                    //
                    
                    
         
        return this.conn.query(
            `
            SELECT 
            p.id 
            ,p.title
            ,p.url
            ,p.createdAt
            ,p.updatedAt
            ,p.userId
            ,u.username
            ,s.name
            ,s.description
            ,u.createdAt AS userCreatedAt
            ,u.updatedAt AS userUpdatedAt
            ,s.createdAt AS subCreatedAt
            ,s.updatedAt  As subUpdate
                  
            ,SUM(v.voteDirection) as votescore
            
                   
            FROM posts as p
            JOIN users as u on u.id = p.userId
            JOIN subreddit as s on s.id = p.subredditId
            LEFT JOIN votes as v on v.postId = p.id
            GROUP BY postId
            
            ORDER BY votescore DESC
            LIMIT 25
            `
            
            // SELECT SUM(column_name)
            // FROM table_name
            // WHERE condition;
        )
        
        
    // Now that we have voting, we need to add the voteScore of each post by doing an 
    // extra JOIN to the votes table, grouping by postId, and doing a SUM on the voteDirection 
    // column.
        
        
        //reformat each object in a new table
        //post return 1 Select object out of 25
        .map(function(post) {
            return {
                id: post.id,
                title: post.title,
                url: post.url,
                createdAt: post.createdAt,
                updateAt: post.updateAt,
                user: {
                    id: post.userId,
                    username: post.username,
                    createdAt: post.userCreatedAt,
                    updateAt: post.userUpdatedAt
                },
                subreddit: {
                    name: post.name,
                    description: post.description,
                    subCreation: post.subCreation,
                    subUpdate: post.subUpdate
                },
                numberOfVote:{
                    
                }
            };
        });
    }
    
    
    
    getAllSubreddits() {
        
         return this.conn.query(
            `
            SELECT id, name, description,
                   createdAt, updatedAt
            FROM subreddit
            ORDER BY createdAt DESC
            LIMIT 25
            `
        );
        
        
    }
}




module.exports = RedditAPI;


