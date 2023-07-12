import { ExampleRepository } from '../repositories/example.repository';

export class ExampleService {
	private exampleRepo: ExampleRepository;
	constructor(exampleRepo: ExampleRepository) {
		this.exampleRepo = exampleRepo;
	}
	public getExample() {
		return this.exampleRepo.getExample();
	}
}
