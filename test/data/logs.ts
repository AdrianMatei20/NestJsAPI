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

export function getLogs() {
    let logs = [
        { level: 'error', message: 'message', context: 'context', metadata: 'metadata', trace: 'trace', timestamp: new Date('2000-03-10T18:10:24.878Z') },
        { level: 'error', message: 'message', context: 'context', metadata: 'metadata', trace: 'trace', timestamp: new Date('2001-03-10T18:10:24.878Z') },
        { level: 'error', message: 'message', context: 'context', metadata: 'metadata', trace: 'trace', timestamp: new Date('2002-03-10T18:10:24.878Z') },
        { level: 'error', message: 'message', context: 'context', metadata: 'metadata', trace: 'trace', timestamp: new Date('2003-03-10T18:10:24.878Z') },
        { level: 'warn', message: 'message', context: 'context', metadata: 'metadata', trace: 'trace', timestamp: new Date('2004-03-10T18:10:24.878Z') },
        { level: 'warn', message: 'message', context: 'context', metadata: 'metadata', trace: 'trace', timestamp: new Date('2005-03-10T18:10:24.878Z') },
        { level: 'warn', message: 'message', context: 'context', metadata: 'metadata', trace: 'trace', timestamp: new Date('2006-03-10T18:10:24.878Z') },
        { level: 'warn', message: 'message', context: 'context', metadata: 'metadata', trace: 'trace', timestamp: new Date('2007-03-10T18:10:24.878Z') },
        { level: 'warn', message: 'message', context: 'context', metadata: 'metadata', trace: 'trace', timestamp: new Date('2008-03-10T18:10:24.878Z') },
        { level: 'info', message: 'message', context: 'context', metadata: 'metadata', trace: 'trace', timestamp: new Date('2009-03-10T18:10:24.878Z') },
        { level: 'info', message: 'message', context: 'context', metadata: 'metadata', trace: 'trace', timestamp: new Date('2010-03-10T18:10:24.878Z') },
        { level: 'info', message: 'message', context: 'context', metadata: 'metadata', trace: 'trace', timestamp: new Date('2011-03-10T18:10:24.878Z') },
        { level: 'info', message: 'message', context: 'context', metadata: 'metadata', trace: 'trace', timestamp: new Date('2012-03-10T18:10:24.878Z') },
        { level: 'info', message: 'message', context: 'context', metadata: 'metadata', trace: 'trace', timestamp: new Date('2013-03-10T18:10:24.878Z') },
        { level: 'info', message: 'message', context: 'context', metadata: 'metadata', trace: 'trace', timestamp: new Date('2014-03-10T18:10:24.878Z') },
        { level: 'info', message: 'message', context: 'context', metadata: 'metadata', trace: 'trace', timestamp: new Date('2015-03-10T18:10:24.878Z') },
        { level: 'info', message: 'message', context: 'context', metadata: 'metadata', trace: 'trace', timestamp: new Date('2016-03-10T18:10:24.878Z') },
        { level: 'debug', message: 'message', context: 'context', metadata: 'metadata', trace: 'trace', timestamp: new Date('2017-03-10T18:10:24.878Z') },
        { level: 'debug', message: 'message', context: 'context', metadata: 'metadata', trace: 'trace', timestamp: new Date('2018-03-10T18:10:24.878Z') },
        { level: 'debug', message: 'message', context: 'context', metadata: 'metadata', trace: 'trace', timestamp: new Date('2019-03-10T18:10:24.878Z') },
    ];

    return logs
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
};