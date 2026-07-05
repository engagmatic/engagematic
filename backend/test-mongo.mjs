import mongoose from 'mongoose';
const uri = "mongodb://markitzenagency_db_user:Slb9AZ9M4CvW4xlB@ac-ag1kecz-shard-00-00.wabbygn.mongodb.net:27017,ac-ag1kecz-shard-00-01.wabbygn.mongodb.net:27017,ac-ag1kecz-shard-00-02.wabbygn.mongodb.net:27017/?ssl=true&replicaSet=atlas-osq99a-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri).then(() => {
  console.log("Connected!");
  process.exit(0);
}).catch(err => {
  console.error("Failed:", err);
  process.exit(1);
});
