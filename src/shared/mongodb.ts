
import mongoose from 'mongoose';

export default (uri: string) => {
  const connect = () => {
    mongoose
        .connect(uri, {
          useNewUrlParser: true,
          useCreateIndex: true,
          useUnifiedTopology: true,
          useFindAndModify: false,
        })
        .then(() => {
        })
        .catch((error) => {
          return process.exit(1);
        });
  };
  connect();

  mongoose.connection.on('disconnected', connect);
};
