import { ExceptionBaseArgs } from "./interfaces/exception-base.interface";

export class ExceptionBase extends Error {
  constructor(args: ExceptionBaseArgs) {
    super(args.message)
  }
}