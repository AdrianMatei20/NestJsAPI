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

        N_ISSUES_FOUND: (numberOfIssues: number) => `${numberOfIssues} issue${numberOfIssues == 1 ? '' : 's'} found`,
        ISSUE_FOUND: 'Issue found!',
        ISSUE_UPDATED: 'Issue updated!',
        ISSUE_DELETED: 'Issue deleted!',

        N_LABELS_FOUND: (numberOfLabels: number) => `${numberOfLabels} label${numberOfLabels == 1 ? '' : 's'} found`,
        LABEL_FOUND: 'Label found!',
        LABEL_UPDATED: 'Label updated!',
        LABEL_DELETED: 'Label deleted!',

        N_COMMENTS_FOUND: (numberOfComments: number) => `${numberOfComments} comment${numberOfComments == 1 ? '' : 's'} found`,
        COMMENT_UPDATED: 'Comment updated!',
        COMMENT_DELETED: 'Comment deleted!',
    },

    CREATED: {
        SUCCESSFUL_REGISTRATION: (firstname: string, lastname: string) => `Successfully logged in. Welcome ${firstname} ${lastname}!`,
        PROJECT: 'Project created!',
        ISSUE: 'Issue created!',
        LABEL: 'Label created!',
        COMMENT: 'Comment created!',
    },

    BAD_REQUEST: {
        MISSING_PROPS: (missingProperties) => `Bad request! Missing properties: ${missingProperties}`,
        PASSWORD_MISMATCH: 'Passwords don\'t match!',
        INVALID_USER_ID: 'Invalid user id!',
        BAD_TOKEN: 'The password reset link is invalid or has expired. Please request a new password reset link.',
        INVALID_PROJECT_ID: 'Invalid project id!',
        INVALID_ISSUE_ID: 'Invalid issue id!',
        INVALID_LABEL_ID: 'Invalid label id!',
        INVALID_COMMENT_ID: 'Invalid comment id!',
        INVALID_ASSIGNEE_ID: 'Invalid assignee id!',
    },

    UNAUTHORIZED: 'Invalid credentials.',

    FORBIDDEN: {
        PROJECT_NOT_FOUND_OR_LACKING_PERMISSIONS: 'Project not found or you lack permissions.',
        INCORRECT_ROLE: 'You do not have the required role to perform this action.',
        NOT_A_PROJECT_MEMBER: 'You are not a member of this project.',
        INSUFFICIENT_PROJECT_ROLE: 'You do not have the required project role to perform this action.',
        NOT_COMMENT_AUTHOR: 'You can only edit or delete your own comments.',
    },

    NOT_FOUND: {
        USER: 'User not found!',
        PROJECT: 'Project not found!',
        ISSUE: 'Issue not found!',
        LABEL: 'Label not found!',
        COMMENT: 'Comment not found!',
        ASSIGNEE: 'Assignee not found, or not a member of this project.',
    },

    CONFLICT: {
        EMAIL_ALREADY_REGISTERED: 'Email already registered!',
    },

    INTERNAL_SERVER_ERROR: 'An unexpected error occurred. Please try again later.',

    SERVICE_UNAVAILABLE: 'The service is currently unavailable. Please try again later.',

};