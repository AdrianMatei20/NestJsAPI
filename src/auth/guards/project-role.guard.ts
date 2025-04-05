import { CanActivate, ExecutionContext, ForbiddenException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Project } from "src/resources/project/entities/project.entity";
import { ProjectRole } from "src/resources/project/enums/project-role";
import { GlobalRole } from "src/resources/user/enums/global-role";
import { RETURN_MESSAGES } from "src/constants/return-messages";

@Injectable()
export class ProjectRoleGuard implements CanActivate {

    constructor(
        @InjectRepository(Project) private projectRepository: Repository<Project>,
        private readonly reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user; // User from the JWT/Auth middleware
        const projectId = request.params.id; // Project ID from the route params

        // Retrieve the required roles from metadata
        const requiredRoles = this.reflector.get<ProjectRole[]>('projectRoles', context.getHandler());

        if (!user) {
            throw new UnauthorizedException({
                statusCode: HttpStatus.UNAUTHORIZED,
                message: RETURN_MESSAGES.UNAUTHORIZED,
            });
        }

        // Optional: Allow global admins full control
        if (user.globalRole === GlobalRole.ADMIN) {
            return true; // Remove this if global admins should only observe
        }

        if (!requiredRoles || requiredRoles.length === 0) {
            return true; // No roles required for this endpoint
        }

        // Fetch project details to check roles
        const project = await this.projectRepository.findOne({
            where: { id: projectId },
            relations: ['userProjectRoles', 'userProjectRoles.user']
        });

        if (!project) {
            throw new ForbiddenException({
                statusCode: HttpStatus.FORBIDDEN,
                message: RETURN_MESSAGES.FORBIDDEN.PROJECT_NOT_FOUND_OR_LACKING_PERMISSIONS,
            });
        }

        // Check if the user has one of the required roles
        const hasAccess = project.userProjectRoles.some((userProjectRole) => {
            return (
                userProjectRole.user.id === user.id &&
                requiredRoles.includes(userProjectRole.projectRole)
            );
        });

        if (!hasAccess) {
            throw new ForbiddenException({
                statusCode: HttpStatus.FORBIDDEN,
                message: RETURN_MESSAGES.FORBIDDEN.INCORRECT_ROLE,
            });
        }

        return true;
    }

}