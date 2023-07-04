import { Request, Response } from "express";
import { ExampleService } from "../services/example.service";

export class ExampleController {
  private exampleService: ExampleService;
  constructor(exampleService: ExampleService) {
    this.exampleService = exampleService;
  }
  getExample(req: Request, res: Response) {
    const result = this.exampleService.getExample();
    return res.json({ message: "Successful", data: result });
  }
}
