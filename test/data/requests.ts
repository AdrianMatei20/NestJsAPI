import { GlobalRole } from "src/resources/user/enums/global-role";
import { userAdmin, userJamesSmith } from "./users";

export const regularUserRequest = {
    user: {
        id: userJamesSmith.id,
        globalRole: GlobalRole.REGULAR_USER,
    }
};

export const adminRequest = {
    user: {
        id: userAdmin.id,
        globalRole: GlobalRole.ADMIN,
    },
};

export const unknownRoleRequest = {
    user: {
        id: userAdmin.id,
    },
};