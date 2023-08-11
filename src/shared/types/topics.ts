export type { Post, Reaction, PostInput, ReactionInput };
import { Schema } from 'mongoose';

type PostInput = {
	userId: string;
	categoryId: string;
	parentId: string;
	title: string;
	content: string;
};

type Post = {
	_id: Schema.Types.ObjectId;
	userId: Schema.Types.ObjectId;
	categoryId: Schema.Types.ObjectId;
	parentId: Schema.Types.ObjectId;
	title: string;
	content: string;
	createdDate: Date;
	updatedDate: Date;
};

enum ReactionType {
	UPVOTE = 'upvote',
	DOWNVOTE = 'downvote',
}

type ReactionInput = {
	userId: Schema.Types.ObjectId;
	postId: Schema.Types.ObjectId;
	type: ReactionType;
};

type Reaction = {
	id: Schema.Types.ObjectId;
	userId: Schema.Types.ObjectId;
	postId: Schema.Types.ObjectId;
	type: ReactionType;
	createdDate: Date;
	updatedDate: Date;
};
