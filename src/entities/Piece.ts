import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinTable} from 'typeorm';
import { Match } from './Match';

@Entity()
export class Piece extends BaseEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    type: string;

    @Column()
    color: string;

    @Column()
    row: number;

    @Column()
    col: number;
    
    @Column('string', { nullable: true })
    match_id: number;

    @ManyToOne(() => Match)
    @JoinTable({name: 'match_id'})
    match: Match;
}
