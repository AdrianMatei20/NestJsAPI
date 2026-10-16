import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Project } from "src/resources/project/entities/project.entity";
import { Issue } from "src/resources/issue/entities/issue.entity";

@Entity()
export class Label {

    @PrimaryGeneratedColumn("uuid")
    readonly id: string;

    @Column({ length: 50 })
    name: string;

    @Column({ length: 7 })
    color: string;

    @ManyToOne(() => Project, { onDelete: 'CASCADE' })
    project: Project;

    @ManyToMany(() => Issue, (issue) => issue.labels)
    issues: Issue[];

    @Column({ type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamptz' })
    createdAt: Date;

}
