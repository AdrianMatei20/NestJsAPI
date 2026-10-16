import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Issue } from "src/resources/issue/entities/issue.entity";
import { User } from "src/resources/user/entities/user.entity";

@Entity()
export class Comment {

    @PrimaryGeneratedColumn("uuid")
    readonly id: string;

    @Column({ length: 2000 })
    body: string;

    @ManyToOne(() => Issue, (issue) => issue.comments, { onDelete: 'CASCADE' })
    issue: Issue;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    author: User | null;

    @Column({ type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamptz' })
    createdAt: Date;

}
