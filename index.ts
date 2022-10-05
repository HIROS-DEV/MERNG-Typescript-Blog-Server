import { ApolloServer } from 'apollo-server';
import { typeDefs } from './graphql/types';
import { resolvers } from './graphql/resolvers';
import { connect } from 'mongoose';
import { config } from 'dotenv';
import { verify } from 'jsonwebtoken';
import 'colors';

import { User } from './models/User';

config();

type TokenType = {
	username: string;
	id: string;
};

const MONGODB_URI = process.env.MONGODB_URI as string;
const JWT_SECRET = process.env.JWT_SECRET as string;

connect(MONGODB_URI)
	.then(() => {
		console.log(`connecting to MongoDB: ${MONGODB_URI}`.cyan);
	})
	.catch((err) =>
		console.log(`error connection to MongoDB ${err.message}`.red)
	);

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: async ({ req }) => {
		const auth = req ? req.headers.authorization : null;

		if (auth && auth.toLowerCase().startsWith('bearer ')) {
			const decodedToken = verify(auth.substring(7), JWT_SECRET) as TokenType;
			const currentUser = await User.findById(decodedToken.id).populate(
				'blogs'
			);
			return { currentUser };
		}
		return undefined;
	},
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
	console.log(`
    🚀  Server is ready at ${url}
    📭  Query at https://studio.apollographql.com/dev
  `);
});
