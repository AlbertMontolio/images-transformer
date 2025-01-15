import { injectable } from 'tsyringe';
import { ProcessRepository } from '../../infraestructure/repositories/process.repository';
import { Process } from '@prisma/client';


@injectable()
export class ProcessesStatsService {
  constructor(
    private readonly processRepository: ProcessRepository,
  ) {}

  async execute(projectId: number) {
    const processes = await this.processRepository.getByProjectId(projectId);
    console.log('processes', processes);

    const processesWithDurations = processes.map((process) => {
      return {
        ...process,
        duration: this.calculateDuration(process),
      };
    });

    return processesWithDurations;
  }
  
  calculateDuration(process: Process) {
    const duration = process.finishedAt ? process.finishedAt.getTime() - process.createdAt.getTime() : 0;
    const durationInSeconds = duration / 1000;
    return durationInSeconds;
  }
} 
