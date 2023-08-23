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
	_id: string;
	userId: string;
	categoryId: string;
	parentId: string;
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
	userId: string;
	postId: string;
	type: ReactionType;
};

type Reaction = {
	id: string;
	userId: string;
	postId: string;
	type: ReactionType;
	createdDate: Date;
	updatedDate: Date;
};
