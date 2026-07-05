const mongoose = require('mongoose');
const uri = "mongodb+srv://markitzenagency_db_user:Slb9AZ9M4CvW4xlB@cluster0.wabbygn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri).then(() => {
  console.log("Connected!");
  process.exit(0);
}).catch(err => {
  console.error("Failed:", err);
  process.exit(1);
});
