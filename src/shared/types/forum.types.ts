import {
	ArrayMinSize,
	IsArray,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
} from 'class-validator';
import { Document } from 'mongoose';

export interface ICreateCategory {
	name: string;
	description: string;
	tags?: ITag['_id'][];
}

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

	@IsOptional()
	@IsArray()
	@ArrayMinSize(0)
	tags: string[];
}
