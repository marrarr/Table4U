import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Restauracja } from '../restauracja.entity';

@Entity('restauracja_obraz')
export class RestauracjaObraz {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
      default: false,
    })
    czy_glowne: boolean;

    @Column({
        type: 'longblob',
        nullable: false,
    })
    obraz: Buffer;

    @Column()
    nazwa_pliku: string;

    @Column()
    typ: string;

    @Column()
    rozmiar: number;

    @OneToOne(() => Restauracja, restauracja => restauracja.obraz, {
      onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'restauracja_id' })
    restauracja: Restauracja;
}