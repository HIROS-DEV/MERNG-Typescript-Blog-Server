import { Schema, model } from 'mongoose';

const UserSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
			maxlength: 30,
			trim: true,
			unique: true,
		},
		email: {
			type: String,
			required: true,
			maxlength: 200,
			trim: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			maxlength: 3000,
		},
		blogs: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Blog',
			},
		],
	},
	{ timestamps: true }
);

export const User = model('User', UserSchema);
