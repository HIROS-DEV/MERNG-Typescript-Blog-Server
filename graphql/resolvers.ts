import { AuthenticationError, UserInputError } from 'apollo-server';
import jwt from 'jsonwebtoken';
import { hash, compare } from 'bcryptjs';
import { Blog } from '../models/Blog';
import { User } from '../models/User';
import { config } from 'dotenv';

config();

const JWT_SECRET = process.env.JWT_SECRET as string;

type BlogTypes = {
	title: string;
	author: string;
	createdAt?: string;
	image: string;
	description: string;
	id?: string;
};

type RegisterUser = {
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
};

type LoginUser = {
	email: string;
	password: string;
};

type EditBlogType = {
	title: string;
	image: string;
	description: string;
	id: string;
	author: string;
};

export const resolvers = {
	Query: {
		blogCount: async () => Blog.collection.countDocuments(),
		allBlogs: async () => {
			return Blog.find({}).sort({ createdAt: -1 }).populate('author');
		},
		findBlog: async (_root: any, args: { id: string }) => {
			try {
				return Blog.findOne({ _id: args.id }).populate('author');
			} catch (error) {
				throw new UserInputError('Something went wrong', {
					invalidArgs: args,
				});
			}
		},
		me: (_root: any, _args: any, context: any) => {
			return context.currentUser;
		},
	},
	Mutation: {
		addBlog: async (_root: any, args: BlogTypes, context: any) => {
			const authorId = context.currentUser._id;
			const blog = new Blog({ ...args, author: authorId });
			const currentUser = context.currentUser;

			if (!currentUser) {
				throw new AuthenticationError('not authenticated');
			}

			try {
				await blog.save();
				currentUser.blogs.push(blog.id);
				await currentUser.save();
			} catch (error) {
				throw new UserInputError('Something went wrong', {
					invalidArgs: args,
				});
			}

			return blog;
		},
		editBlog: async (_root: any, args: EditBlogType, context: any) => {
			const currentUser = context.currentUser;

			if (!currentUser) {
				throw new AuthenticationError('not authenticated');
			}

			const blog = await Blog.findOneAndUpdate(
				{ _id: args.id, author: currentUser._id },
				{
					$set: {
						title: args.title,
						image: args.image,
						description: args.description,
					},
				},
				{ new: true }
			);

			if (!blog) return null;

			try {
				await blog.save();
			} catch (error) {
				throw new UserInputError("Something went wrong. Can not edit blog.'", {
					invalidArgs: args,
				});
			}

			return blog;
		},
		deleteBlog: async (_root: any, args: BlogTypes, context: any) => {
			const currentUser = context.currentUser;

			if (!currentUser) {
				throw new AuthenticationError('not authenticated');
			}

			try {
				const blog = await Blog.findOne({
					_id: args.id,
				}).populate('author');

				if (!blog) return null;
				if (blog.author && blog.author.id !== currentUser.id) {
					throw new UserInputError(
						'Something went wrong. Can not delete blog.',
						{
							invalidArgs: args,
						}
					);
				}

				// Delete blog(id) from user database.
				await User.findByIdAndUpdate(
					{
						_id: currentUser.id,
					},
					{
						$pull: {
							blogs: args.id,
						},
					}
				).populate('blogs');

				return blog.delete();
			} catch (error) {
				console.log(error);

				throw new UserInputError('Something went wrong. Can not delete blog.', {
					invalidArgs: args,
				});
			}
		},
		createUser: async (_root: any, args: RegisterUser) => {
			if (args.password !== args.confirmPassword) {
				throw new UserInputError('Password does not match');
			}

			const hashedPassword = await hash(args.password, 12);
			const user = new User({
				username: args.username,
				email: args.email,
				password: hashedPassword,
			});

			return user.save().catch((error) => {
				if (error.message.includes('E11000 duplicate key error collection')) {
					throw new UserInputError('Username and Email must be unique', {
						invalidArgs: args,
					});
				}

				throw new UserInputError(error.message, {
					invalidArgs: args,
				});
			});
		},
		login: async (_root: any, args: LoginUser) => {
			const user = await User.findOne({ email: args.email });
			if (!user) {
				throw new UserInputError('wrong credentials');
			}

			const comparePassword = await compare(args.password, user.password);

			if (!comparePassword) {
				throw new UserInputError('wrong credentials');
			}

			const userForToken = {
				username: user.username,
				id: user._id,
			};

			return { value: jwt.sign(userForToken, JWT_SECRET) };
		},
	},
	Blog: {
		createdAt: (root: any): string =>
			`${new Date(root.createdAt).getDay()}/${new Date(
				root.createdAt
			).getMonth()}/${new Date(root.createdAt).getFullYear()}`,
	},
};
