 step 1 for json file:
 npm init -y 

step 2 package installed in backend server ,
npm install express cors dotenv cookie-parser bcrypt jsonwebtoken mongoose


step 3 
all package 
"keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module",
  "dependencies": {
    "bcrypt": "^6.0.0",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^9.9.5"
  }

   step 4 :
   install nodemon  
   npm install -D nodemon 

   step 5 :
   changing the debug to 
   "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
 step 6;
 gitignore
 
 step 7 :
  in server package imported and  app.use function used, app port ,app.listen
  
  step 8 :
  Centralized error handler to send error  msg ;
   
   step 9:
    db.js  connection verfication message


    step 10:
     database mutated

     step 11 :
     module > user.js
    hashing password
    encrytion 
    campare password
    trimmedEmail
    
    
    
//middlware will excute first and controller next
//importing auth router from express package