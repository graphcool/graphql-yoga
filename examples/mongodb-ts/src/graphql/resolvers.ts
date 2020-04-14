import { models } from '../db'
import { Post } from '../db/post'


export const resolvers = {
  Query: {
    posts: async () => {
      const Posts = await models.Post.find({});
      console.log(Posts);
      return Posts;
    },
  },
  Mutation: {
    createPost: async (root : any,  args : any) => {
      const argsPost = new Post(args);
      const post = await models.Post.findOne({ argsPost });

      if (post) {
        throw new Error('Please provide a unique title.');        
      }
      
      // create a new post
      const newPost = new models.Post(args);

      // save the post
      try {
        await newPost.save();
      } catch (e) {
        throw new Error('Cannot Save Post!!!');
      }

      return true;
    },
  },
};