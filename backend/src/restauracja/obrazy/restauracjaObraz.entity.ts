import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, ManyToOne } from 'typeorm';
import { Rezerwacja } from '../../rezerwacja/rezerwacja.entity';
import { Uzytkownik } from 'src/uzytkownik/uzytkownik.entity';
import { Restauracja } from '../restauracja.entity';

@Entity('restauracja_obraz')
export class restauracjaObraz {
    @PrimaryGeneratedColumn()
    id: number;

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