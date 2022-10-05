import { gql} from 'apollo-server';

export const typeDefs = gql`
	type User {
		username: String!
		email: String!
		password: String!
		confirmPassword: String
		blogs: [Blog!]!
		id: ID!
	}

	type Token {
		value: String!
	}

	type Blog {
		id: ID
		title: String!
		author: User!
		createdAt: String
		image: String!
		description: String!
	}

	type Query {
		blogCount: Int!
		allBlogs: [Blog!]!
		findBlog(id: ID!): Blog
		me: User
	}

	type Mutation {
		addBlog(
			title: String!
			author: String
			createdAt: String
			image: String!
			description: String!
		): Blog
		editBlog(title: String!, image: String!, description: String!, id: ID!): Blog
		deleteBlog(id: ID!): Blog
		createUser(
			username: String!
			email: String!
			password: String!
			confirmPassword: String!
		): User
		login(email: String!, password: String!): Token
	}
`;
