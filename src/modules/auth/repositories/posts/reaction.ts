import mongoose, { ObjectId, Schema, model } from 'mongoose';
import { Reaction } from '../../../../shared/types';

// Define the Reaction schema
const reactionSchema = new Schema({
	id: {
		type: Number,
		required: true,
		min: 0,
	},
	userId: {
		ref: 'users',
		type: Schema.Types.ObjectId,
		required: true,
	},
	postId: {
		ref: 'posts',
		type: Schema.Types.ObjectId,
		required: true,
	},
	type: {
		type: String,
		enum: ['UPVOTE', 'DOWNVOTE'],
		required: true,
	},
	createdDate: {
		type: Date,
		required: true,
		default: Date.now,
	},
	updatedDate: {
		type: Date,
		required: true,
		default: Date.now,
	},
});

// Create the Reaction model
const Reaction = model('Reaction', reactionSchema);

const loginSessionRepository = {
	findById: (_id: string) => Reaction.findById(_id),
	insertOne: (reaction: Reaction) => Reaction.create(reaction),
	deleteById: (_id: string) => Reaction.deleteOne({ _id }),
	deleteByUserId: (userId: string) => Reaction.deleteMany({ userId }),
	countPostReactions: (postId: ObjectId) =>
		Reaction.countDocuments({ postId: postId }),
};
