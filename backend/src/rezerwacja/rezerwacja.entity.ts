import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Uzytkownik } from '../uzytkownik/uzytkownik.entity';
import { Stolik } from '../stolik/stolik.entity';
import { Restauracja } from '../restauracja/restauracja.entity';

@Entity('rezerwacja')
export class Rezerwacja {
  @PrimaryGeneratedColumn()
  rezerwacja_id: number;

  @Column({ type: 'varchar', length: 100 })
  imie: string;

  @Column({ type: 'varchar', length: 20 })
  telefon: string;

  @Column({ type: 'int' })
  liczba_osob: number;

  @Column({ type: 'simple-json' })
  stoliki: number[];

  @Column({ type: 'varchar', length: 10 })
  godzina: string;

  @Column({ type: 'date' })
  data: string;

  @Column({ type: 'int' })
  restauracja_id: number;

  @Column({ type: 'varchar', length: 50, default: 'NOWA' })
  status: string;


    @Column({ type: 'int', nullable: true })
    uzytkownik_id: number;
  // Relacje z innymi tabelami
  @ManyToOne(() => Uzytkownik)
  @JoinColumn({ name: 'uzytkownik_id' })
  uzytkownik: Uzytkownik;


  @ManyToOne(() => Restauracja)
  @JoinColumn({ name: 'restauracja_id' })
  restauracja: Restauracja;

}
