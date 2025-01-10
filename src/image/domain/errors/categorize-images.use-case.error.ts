import { ExceptionBase } from "../../../shared/errors/exception-base";
import { ExceptionBaseArgs } from "src/shared/errors/interfaces/exception-base.interface";

export class CategorizeImagesUseCaseError extends ExceptionBase {
  static readonly message = 'categorize image use-case Failed';

  constructor(args: ExceptionBaseArgs = {}) {
    args.message = args.message || CategorizeImagesUseCaseError.message;
    super(args);
  }
}
