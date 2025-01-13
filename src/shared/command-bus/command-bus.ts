export interface ICommandHandler<TCommand> {
  execute(command: TCommand): Promise<unknown>;
}

export class CommandBus {
  private handlers: Map<string, ICommandHandler<unknown>> = new Map();

  register<T>(commandName: string, handler: ICommandHandler<T>) {
    this.handlers.set(commandName, handler);
  }

  async execute<T>(command: T): Promise<any> {
    const commandName = command.constructor.name;
    const handler = this.handlers.get(commandName);

    if (!handler) {
      throw new Error(`No handler registered for command ${commandName}`);
    }

    return handler.execute(command);
  }
} 