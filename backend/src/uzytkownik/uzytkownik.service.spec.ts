// backend/src/uzytkownik/uzytkownik.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UzytkownikService } from './uzytkownik.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Uzytkownik } from './uzytkownik.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

// Mockowanie biblioteki bcryptjs do testowania hashowania haseł
jest.mock('bcryptjs');

/**
 * Testy jednostkowe dla UzytkownikService
 * Testują funkcjonalności zarządzania użytkownikami (CRUD)
 */
describe('UzytkownikService', () => {
  let service: UzytkownikService;
  let repository: Repository<Uzytkownik>;

  // Mock (atrapa) repozytorium TypeORM - symuluje operacje na bazie danych
  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  // Przed każdym testem tworzymy świeżą instancję modułu testowego
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UzytkownikService,
        {
          provide: getRepositoryToken(Uzytkownik), // Token do wstrzykiwania repozytorium
          useValue: mockRepository, // Używamy mocka zamiast prawdziwego repozytorium
        },
      ],
    }).compile();

    service = module.get<UzytkownikService>(UzytkownikService);
    repository = module.get<Repository<Uzytkownik>>(getRepositoryToken(Uzytkownik));
  });

  // Po każdym teście czyścimy wszystkie mocki
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test 1: Sprawdza tworzenie nowego użytkownika z hashowaniem hasła
   * Testuje scenariusz: tworzenie użytkownika z rolą
   * Oczekiwany rezultat: hasło jest zahashowane i użytkownik zapisany w bazie
   */
  it('should create a new uzytkownik with hashed password', async () => {
    // Przygotowanie danych testowych
    const createDto = {
      login: 'newuser',
      haslo: 'password123',
      imie: 'Jan',
      nazwisko: 'Kowalski',
      email: 'jan.kowalski@example.com',
      telefon: '123456789',
      confirmed: true,
      rola_id: 2,
    };

    const hashedPassword = 'hashedPassword123';
    const mockUzytkownik = {
      uzytkownik_id: 1,
      ...createDto,
      haslo: hashedPassword,
      rola: { rola_id: 2 },
    };

    // Konfiguracja mocków
    (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
    mockRepository.create.mockReturnValue(mockUzytkownik);
    mockRepository.save.mockResolvedValue(mockUzytkownik);

    // Wywołanie testowanej metody
    const result = await service.create(createDto);

    // Asercje - sprawdzamy czy:
    // 1. Hasło zostało zahashowane
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    // 2. Repozytorium utworzyło obiekt z zahashowanym hasłem i relacją do roli
    expect(mockRepository.create).toHaveBeenCalledWith({
      ...createDto,
      haslo: hashedPassword,
      rola: { rola_id: 2 },
    });
    // 3. Użytkownik został zapisany
    expect(mockRepository.save).toHaveBeenCalledWith(mockUzytkownik);
    // 4. Zwrócony obiekt ma zahashowane hasło
    expect(result.haslo).toEqual(hashedPassword);
  });

  /**
   * Test 2: Sprawdza wyszukiwanie użytkownika po nazwie użytkownika (login)
   * Testuje scenariusz: pobieranie użytkownika z relacją do roli
   * Oczekiwany rezultat: zwrócony użytkownik z załadowaną rolą
   */
  it('should find uzytkownik by username with role relation', async () => {
    // Przygotowanie danych testowych
    const mockUzytkownik = {
      uzytkownik_id: 1,
      login: 'testuser',
      imie: 'Jan',
      nazwisko: 'Kowalski',
      rola: { rola_id: 2, nazwa: 'user' },
    };

    // Konfiguracja mocka
    mockRepository.findOne.mockResolvedValue(mockUzytkownik);

    // Wywołanie testowanej metody
    const result = await service.findOneByUsername('testuser');

    // Asercje - sprawdzamy czy:
    // 1. Zapytanie do bazy zawiera właściwe warunki i relacje
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { login: 'testuser' },
      relations: ['rola'],
    });
    // 2. Zwrócony użytkownik ma wszystkie dane wraz z rolą
    expect(result).toEqual(mockUzytkownik);
    expect(result.rola).toBeDefined();
  });
});