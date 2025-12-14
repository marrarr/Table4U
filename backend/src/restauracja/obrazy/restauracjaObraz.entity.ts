import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { Restauracja } from '../restauracja.entity';

@Entity('restauracja_obraz')
@Index(  // indeks w bazie, który dba o to, żeby restauracja miała tylko jedno główne zdjęcie
  ['restauracja', 'czy_glowne'],
  { unique: true, where: 'czy_glowne = true' }
)
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

    @ManyToOne(() => Restauracja, restauracja => restauracja.obrazy, {
        onDelete: 'CASCADE'
    })
    restauracja: Restauracja;
}