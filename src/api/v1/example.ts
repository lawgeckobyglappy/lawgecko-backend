import express from "express";
import { ExampleController } from "../../modules/example-feature/controllers/example.controller";
import { ExampleRepository } from "../../modules/example-feature/repositories/example.repository";
import { ExampleService } from "../../modules/example-feature/services/example.service";

const router = express.Router();

const exampleRepo: ExampleRepository = new ExampleRepository();
const exampleService: ExampleService = new ExampleService(exampleRepo);
const exampleController: ExampleController = new ExampleController(
  exampleService
);

router.get("/example", exampleController.getExample.bind(exampleController));

export default router;
