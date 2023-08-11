import mongoose, { Schema, model } from 'mongoose';
import { Post } from '../../../../shared/types';

const postSchema = new Schema<Post>({
	_id: {
		type: Schema.Types.ObjectId,
		default: () => new mongoose.Types.ObjectId(),
	},
	userId: {
		ref: 'users',
		type: Schema.Types.ObjectId,
		required: true,
	},
	categoryId: {
		ref: 'category',
		type: Schema.Types.ObjectId,
		required: true,
	},
	parentId: {
		ref: 'posts',
		type: Schema.Types.ObjectId,
		required: true,
	},
	title: {
		type: String,
		required: true,
		minlength: 2,
		maxlength: 100,
	},
	content: {
		type: String,
		required: true,
		minlength: 2,
		maxlength: 1000,
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

// Create the Post model
const Post = mongoose.model('posts', postSchema);

const loginSessionRepository = {
	findById: (_id: string) => Post.findById(_id),
	insertOne: (post: Post) => Post.create(post),
	deleteById: (_id: string) => Post.deleteOne({ _id }),
	deleteByUserId: (userId: string) => Post.deleteMany({ userId }),
};
