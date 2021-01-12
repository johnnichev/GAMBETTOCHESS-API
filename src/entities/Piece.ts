import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne} from 'typeorm';
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

    @ManyToOne(() => Match, match => match.pieces)
    match: Match;

}
