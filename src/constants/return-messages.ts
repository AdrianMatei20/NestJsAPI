export const RETURN_MESSAGES = {

    OK: {
        REGISTRATION_EMAIL_SENT: 'You will receive a registration email shortly!',
        SUCCESSFUL_VERIFICATION: 'If your account exists, it has been successfully verified.',
        RESET_PASSWORD_EMAIL_SENT: 'You will receive an email with a password reset link shortly!',
        FORGOT_PASSWORD_EMAIL_SENT: 'If you are registered, you will receive an email with a password reset link shortly!',
        PASSWORD_RESET: 'If you are registered, your password has been reset successfully.',
        ACCOUNT_DELETED: 'Account deleted.',
        SESSION_ENDED: 'User session ended!',

        N_USERS_FOUND: (numberOfUsers: number) => `${numberOfUsers} user${numberOfUsers == 1 ? '' : 's'} found`,
        USER_FOUND: 'User found!',
        USER_DELETED: 'User deleted!',

        N_PROJECTS_FOUND: (numberOfProjects: number) => `${numberOfProjects} project${numberOfProjects == 1 ? '' : 's'} found`,
        PROJECT_FOUND: 'Project found!',
        PROJECT_UPDATED: 'Project updated!',
        PROJECT_DELETED: 'Project deleted!',

        N_LOGS_FOUND: (numberOfLogs: number) => `${numberOfLogs} log${numberOfLogs == 1 ? '' : 's'} found`,
    },

    CREATED: {
        SUCCESSFUL_REGISTRATION: (firstname: string, lastname: string) => `Successfully logged in. Welcome ${firstname} ${lastname}!`,
        PROJECT: 'Project created!',
    },

    BAD_REQUEST: {
        MISSING_PROPS: (missingProperties) => `Bad request! Missing properties: ${missingProperties}`,
        PASSWORD_MISMATCH: 'Passwords don\'t match!',
        INVALID_USER_ID: 'Invalid user id!',
        BAD_TOKEN: 'The password reset link is invalid or has expired. Please request a new password reset link.',
        INVALID_PROJECT_ID: 'Invalid project id!',
    },

    UNAUTHORIZED: 'Invalid credentials.',

    FORBIDDEN: {
        PROJECT_NOT_FOUND_OR_LACKING_PERMISSIONS: 'Project not found or you lack permissions.',
        INCORRECT_ROLE: 'You do not have the required role to perform this action.',
    },

    NOT_FOUND: {
        USER: 'User not found!',
        PROJECT: 'Project not found!',
    },

    CONFLICT: {
        EMAIL_ALREADY_REGISTERED: 'Email already registered!',
    },

    INTERNAL_SERVER_ERROR: 'An unexpected error occurred. Please try again later.',

    SERVICE_UNAVAILABLE: 'The service is currently unavailable. Please try again later.',

};