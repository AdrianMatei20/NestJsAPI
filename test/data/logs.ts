import { Log } from "src/logger/entities/log.entity";
import { project, updateProjectDto } from "./projects";
import { logUUIDs } from "./UUIDs";
import { userJamesSmith } from "./users";

export const errorLog: Log = {
    id: logUUIDs[0],
    level: 'ERROR',
    message: 'Failed to update project.',
    context: 'ProjectService.update',
    trace: 'Cannot read properties of undefined (reading \'find\')',
    metadata: { projectId: project.id, project, updateProjectDto },
    timestamp: new Date("2020/01/18 18:32:03"),
}

export const warnLog: Log = {
    id: logUUIDs[1],
    level: 'WARN',
    message: 'Could not update project. Project with not found.',
    context: 'ProjectService.update',
    trace: null,
    metadata: { projectId: project.id, project, updateProjectDto },
    timestamp: new Date("2021/01/01 17:39:53"),
}

export const infoLog: Log = {
    id: logUUIDs[2],
    level: 'INFO',
    message: 'Created project.',
    context: 'ProjectService.create',
    trace: null,
    metadata: { project, userId: userJamesSmith.id },
    timestamp: new Date("2022/01/04 08:49:09"),
};

export const debugLog: Log = {
    id: logUUIDs[3],
    level: 'DEBUG',
    message: 'Debug message.',
    context: 'ProjectService.create',
    trace: null,
    metadata: { project, userId: userJamesSmith.id },
    timestamp: new Date("2023/02/02 13:51:21"),
};

export const logs: Log[] = [errorLog, warnLog, infoLog, debugLog];