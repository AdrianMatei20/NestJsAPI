import { GlobalRole } from "src/resources/user/enums/global-role";

export class CurrentUser {
  id: string;
  globalRole: GlobalRole;

  constructor(id: string, globalRole: GlobalRole) {
    this.id = id;
    this.globalRole = globalRole;
  }
}