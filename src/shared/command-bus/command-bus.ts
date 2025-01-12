export interface ICommandHandler<T> {
  execute(command: T): Promise<any>;
}

export class CommandBus {
  private handlers = new Map<string, ICommandHandler<any>>();

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