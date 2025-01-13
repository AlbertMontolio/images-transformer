export interface ICommandHandler<TCommand, TResult = unknown> {
  execute(command: TCommand): Promise<TResult>;
}

export class CommandBus {
  private handlers: Map<string, ICommandHandler<unknown, unknown>> = new Map();

  register<TCommand, TResult>(
    commandName: string, 
    handler: ICommandHandler<TCommand, TResult>
  ): void {
    this.handlers.set(commandName, handler as ICommandHandler<unknown, unknown>);
  }

  async execute<TCommand, TResult>(command: TCommand): Promise<TResult> {
    const commandName = command.constructor.name;
    const handler = this.handlers.get(commandName) as ICommandHandler<TCommand, TResult> | undefined;

    if (!handler) {
      throw new Error(`No handler registered for command ${commandName}`);
    }

    return handler.execute(command);
  }
} 