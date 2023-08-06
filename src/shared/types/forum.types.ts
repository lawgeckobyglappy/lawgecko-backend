import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Document } from 'mongoose';

export interface ICategory extends Document {
	name: string;
	description: string;
	tags: ITag['_id'][];
}

export interface ITag extends Document {
	name: string;
}

export class CreateCategoryDto {
	@IsString()
	@MaxLength(20)
	name!: string;

	@IsString()
	@MaxLength(40)
	description!: string;
}
