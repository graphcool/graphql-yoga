import dotenv from 'dotenv'
import mongoose from 'mongoose';
import { Post } from './post';

dotenv.config();

// SET UP Mongoose Promises.
mongoose.Promise = global.Promise;

export const startDB = mongoose.connect(`${process.env.DB_URI}`, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true} );

export const models = {
  Post,
}
