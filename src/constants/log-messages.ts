export const LOG_MESSAGES = {

    AUTH: {
        REGISTER_USER: {
            MISSING_PROPS: (missingProperties: string[]) => `Could not create account. Reason: missing properties: ${missingProperties}.`,
            EMAIL_ALREADY_REGISTERED: 'Could not create account. Reason: email already registered.',
            PASSWORD_MISMATCH: 'Could not create account. Reason: passwords don\'t match',
            SUCCESS: (firstname: string, lastname: string, email: string) => `User ${firstname} ${lastname} successfully registered with email ${email}.`,
            CONFIRMATION_EMAIL: (email: string) => `Confirmation email successfully sent to ${email}.`,
            FAILED_TO_SEND_EMAIL: (email: string, errorMessage: string) => `Failed to send confirmation email to ${email}. Reason: ${errorMessage}`,
            FAILED_TO_REGISTER_USER: (email: string, errorMessage: string) => `Failed to register user ${email}. Reason: ${errorMessage}`,
        },
        VERIFY_USER: {
            INVALID_UUID: 'Could not verify user. The provided user id was not a valid UUID.',
            FAILED_TO_FIND_USER: (userId: string) => `Failed to find user with id ${userId}.`,
            USER_NOT_FOUND: (userId: string) => `Could not verify user. User with id ${userId} not found.`,
            BAD_TOKEN: (token: string) => `Could not verify user. Token ${token} is expired or invalid.`,
            FAILED_TO_VERIFY_USER: 'Failed to verify user.',
            SUCCESS: (firstname: string, lastname: string, email: string) => `User ${firstname} ${lastname} successfully confirmed their email (${email}).`,
        },
        SEND_RESET_PASSWORD_EMAIL: {
            INVALID_UUID: 'Could not send password reset email. The provided user id was not a valid UUID.',
            FAILED_TO_FIND_USER: (userId: string) => `Failed to find user with id ${userId}.`,
            USER_NOT_FOUND: (userId: string) => `Could not send password reset email. User with id ${userId} not found.`,
            FAILED_TO_SEND_RESET_PASSWORD_EMAIL: (email: string, errorMessage: string) => `Failed to send password reset email to user ${email}. Reason: ${errorMessage}`,
            SUCCESS: (email: string) => `Password reset email sent to '${email}'.`,
        },
        SEND_FORGOT_PASSWORD_EMAIL: {
            FAILED_TO_FIND_USER: (email: string) => `Failed to find user with email '${email}'.`,
            USER_NOT_FOUND: (email: string) => `Attempt to send reset password confirmation to unregistered email: '${email}'.`,
            FAILED_TO_SEND_RESET_PASSWORD_EMAIL: (email: string, errorMessage: string) => `Failed to send password reset email to user ${email}. Reason: ${errorMessage}`,
            SUCCESS: (email: string) => `Password reset email sent to ${email}.`,
        },
        RESET_PASSWORD: {
            INVALID_UUID: 'Could not reset user\'s password. The provided user id was not a valid UUID.',
            FAILED_TO_FIND_USER: (userId: string) => `Failed to find user with id ${userId}.`,
            USER_NOT_FOUND: (userId: string) => `Could not reset user\'s password. User with id ${userId} not found.`,
            FAILED_TO_VALIDATE_TOKEN: (token: string) => `Failed to validate reset token '${token}'.`,
            BAD_TOKEN: 'Failed to reset user\'s password. Token was expired or invalid.',
            PASSWORD_MISMATCH: 'Failed to reset user\'s password. The new passwords don\'t match.',
            FAILED: 'Failed to find reset password data.',
            SUCCESS: 'Successfully reset user\'s password.',
        },
        FIND_BY_EMAIL: {
            FAILED_TO_FIND_USER: (email: string) => `Failed to find user with email '${email}'.`,
            USER_NOT_FOUND: (email: string) => `User with email '${email}' not found.`,
        },
        DELETE_USER: {
            INVALID_UUID: 'Could not delete user. The provided user id was not a valid UUID.',
            FAILED_TO_FIND_USER: (userId: string) => `Failed to find user with id ${userId}.`,
            USER_NOT_FOUND: (userId: string) => `Could not delete user. User with id ${userId} not found.`,
            FAILED_TO_DELETE_USER: 'Failed to delete user.',
            SUCCESS: (email: string) => `User '${email}' successfully deleted.`,
        },
    },

    PROJECT: {
        CREATE: {
            INVALID_UUID: 'Could not create project. The provided user id was not a valid UUID.',
            FAILED_TO_FIND_USER: (userId: string) => `Failed to find user with id ${userId}.`,
            USER_NOT_FOUND: (projectName: string, userId: string) => `Could not create project '${projectName}'. User with id ${userId} not found.`,
            MISSING_PROPS: (missingProperties: string[]) => `Could not create project. Reasin: missing properties: ${missingProperties}.`,
            FAILED_TO_CREATE_PROJECT: (projectName: string) => `Failed to create project '${projectName}'.`,
            SUCCESS: (firstname: string, lastname: string, projectName: string) => `User ${firstname} ${lastname} created project '${projectName}'.`,
        },
        FIND_ALL_BY_USER_ID: {
            INVALID_UUID: 'Could not retrieve user\'s projects. The provided user id was not a valid UUID.',
            FAILED_TO_FIND_USER: (userId: string) => `Failed to find user with id ${userId}.`,
            USER_NOT_FOUND: (userId: string) => `Could not retrieve user's projects. User with id ${userId} not found.`,
            FAILED_TO_RETRIEVE_PROJECTS: 'Failed to retrieve user\'s projects.',
        },
        FIND_ONE_BY_ID: {
            INVALID_UUID: 'Could not retrieve project. The provided project id was not a valid UUID.',
            FAILED_TO_FIND_PROJECT: (projectId: string) => `Failed to find project with id ${projectId}.`,
            PROJECT_NOT_FOUND: (projectId: string) => `Could not retrieve project. Project with id ${projectId} not found.`,
        },
        UPDATE: {
            INVALID_UUID: 'Could not update project. The provided project id was not a valid UUID.',
            FAILED_TO_FIND_PROJECT: (projectId: string) => `Failed to find project with id ${projectId}.`,
            PROJECT_NOT_FOUND: (projectId: string) => `Could not update project. Project with id ${projectId} not found.`,
            MISSING_PROPS: (projectName: string, missingProperties: string[]) => `Could not update project '${projectName}'. Reason: missing properties: ${missingProperties}.`,
            FAILED_TO_UPDATE_PROJECT: (projectName: string) => `Failed to update project '${projectName}'.`,
            //SUCCESS: (firstname: string, lastname: string, projectName: string) => `User ${firstname} ${lastname} updated project '${projectName}'.`,
            SUCCESS: (projectName: string) => `Updated project '${projectName}'.`,
        },
        REMOVE: {
            INVALID_UUID: 'Could not delete project. The provided project id was not a valid UUID.',
            FAILED_TO_FIND_PROJECT: (projectId: string) => `Failed to find project with id ${projectId}.`,
            PROJECT_NOT_FOUND: (projectId: string) => `Could not delete project. Project with id ${projectId} not found.`,
            FAILED_TO_DELETE_PROJECT: (projectName: string) => `Failed to delete project "${projectName}".`,
            //SUCCESS: (firstname: string, lastname: string, projectName: string) => `User ${firstname} ${lastname} deleted project '${projectName}'.`,
            SUCCESS: (projectName: string) => `Deleted project: '${projectName}'`,
        },
    },

};
