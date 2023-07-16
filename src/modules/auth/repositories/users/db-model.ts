import { Schema, model } from 'mongoose';

export { dbModel };

const userSchema = new Schema(
	{
		_id: { type: String, required: true },
		email: { type: String, index: true, required: true },
		firstName: { type: String, required: true },
		accountStatus: { type: String },
		lastName: { type: String, required: false },
		role: {
			type: String,
			enum: ['admin', 'moderator', 'user'],
			default: 'user',
		},
		username: { type: String, default: '', index: true },
	},
	{ timestamps: true },
);

const dbModel = model('users', userSchema);
