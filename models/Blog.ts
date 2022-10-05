import { Schema, model } from 'mongoose';

const BlogSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
			minlength: 3,
			maxlength: 50,
			trim: true,
		},
		author: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			trim: true,
		},
		image: {
			type: String,
			required: true,
			maxlength: 500,
			trim: true,
		},
		description: {
			type: String,
			required: true,
			minlength: 3,
			maxlength: 30000,
			trim: true,
		},
	},
	{ timestamps: true }
);

export const Blog = model('Blog', BlogSchema);
