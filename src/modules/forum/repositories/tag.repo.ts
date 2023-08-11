import { Collection, Model } from 'mongoose';
import { ITag } from 'shared/types/forum.types';
import { TagModel } from '../models/tag.model';

export default class TagRepo {
	private tagModel: Model<ITag>;
	constructor() {
		this.tagModel = TagModel;
	}

	async bulkInsert(tagNames: string[]) {
		const existingTags = await TagModel.find({ name: { $in: tagNames } });

		const existingTagNames = existingTags.map((tag) => tag.name);
		console.log(existingTagNames);
		const newTagNames = tagNames.filter(
			(tagName) => !existingTagNames.includes(tagName),
		);

		const newTags = await TagModel.insertMany(
			newTagNames.map((tagName) => ({ name: tagName })),
		);

		const allTags = [...existingTags, ...newTags];

		return allTags.map((tag) => tag._id);
	}
}
