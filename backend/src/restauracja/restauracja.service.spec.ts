// backend/src/restauracja/restauracja.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { RestauracjaService } from './restauracja.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Restauracja } from './restauracja.entity';
import { RestauracjaObraz } from './obrazy/restauracjaObraz.entity';
import { Repository } from 'typeorm';

/**
 * Testy jednostkowe dla RestauracjaService
 * Testują funkcjonalności zarządzania restauracjami (CRUD + operacje z obrazami)
 */
describe('RestauracjaService', () => {
  let service: RestauracjaService;
  let restauracjaRepository: Repository<Restauracja>;
  let obrazRepository: Repository<RestauracjaObraz>;

  // Mock (atrapa) repozytorium Restauracja - symuluje operacje na bazie danych
  const mockRestauracjaRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  // Mock (atrapa) repozytorium RestauracjaObraz - symuluje operacje na obrazach
  const mockObrazRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  // Mock Query Builder dla zaawansowanych zapytań
  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  // Przed każdym testem tworzymy świeżą instancję modułu testowego
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestauracjaService,
        {
          provide: getRepositoryToken(Restauracja), // Token dla repozytorium Restauracja
          useValue: mockRestauracjaRepository,
        },
        {
          provide: getRepositoryToken(RestauracjaObraz), // Token dla repozytorium RestauracjaObraz
          useValue: mockObrazRepository,
        },
      ],
    }).compile();

    service = module.get<RestauracjaService>(RestauracjaService);
    restauracjaRepository = module.get<Repository<Restauracja>>(getRepositoryToken(Restauracja));
    obrazRepository = module.get<Repository<RestauracjaObraz>>(getRepositoryToken(RestauracjaObraz));

    // Konfiguracja Query Builder
    mockRestauracjaRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  // Po każdym teście czyścimy wszystkie mocki
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test 1: Sprawdza pobieranie wszystkich restauracji
   * Testuje scenariusz: administrator pobiera listę wszystkich restauracji wraz z obrazami
   * Oczekiwany rezultat: zwrócona lista restauracji z bazy danych w formacie API
   */
  it('should return all restauracje', async () => {
    // Przygotowanie danych testowych - lista mockowych restauracji z obrazami
    const mockRestauracje = [
      {
        restauracja_id: 1,
        nazwa: 'Restauracja Test 1',
        adres: 'ul. Testowa 1',
        nr_kontaktowy: '123456789',
        email: 'test1@restaurant.com',
        obraz: {
          id: 1,
          nazwa_pliku: 'image1.jpg',
          typ: 'image/jpeg',
          rozmiar: 1024,
          czy_glowne: true,
          obraz: Buffer.from('test'),
        },
      },
      {
        restauracja_id: 2,
        nazwa: 'Restauracja Test 2',
        adres: 'ul. Testowa 2',
        nr_kontaktowy: '987654321',
        email: 'test2@restaurant.com',
        obraz: null,
      },
    ];

    // Konfiguracja mocka - co ma zwrócić repozytorium
    mockRestauracjaRepository.find.mockResolvedValue(mockRestauracje);

    // Wywołanie testowanej metody
    const result = await service.findAll();

    // Asercje - sprawdzamy czy:
    // 1. Repozytorium zostało wywołane z relacją obrazy
    expect(mockRestauracjaRepository.find).toHaveBeenCalledWith({
      relations: ['obraz'],
    });
    // 2. Zwrócona lista zawiera odpowiednią liczbę elementów
    expect(result).toHaveLength(2);
    // 3. Dane są przekonwertowane na format API
    expect(result[0]).toHaveProperty('restauracja_id', 1);
    expect(result[0]).toHaveProperty('nazwa', 'Restauracja Test 1');
    // 4. Obraz jest przekonwertowany na base64
    expect(result[0].obraz).toBeDefined();
    expect(result[0].obraz).toHaveProperty('obrazBase64');
  });

  /**
   * Test 2: Sprawdza pobieranie pojedynczej restauracji
   * Testuje scenariusz: pobieranie szczegółów restauracji wraz z galerii zdjęć
   * Oczekiwany rezultat: zwrócona restauracja z załadowanymi obrazami w formacie API
   */
  it('should return a single restauracja with images', async () => {
    // Przygotowanie danych testowych - restauracja z obrazami
    const mockRestauracja = {
      restauracja_id: 1,
      nazwa: 'Restauracja Test',
      adres: 'ul. Testowa 1',
      nr_kontaktowy: '123456789',
      email: 'test@restaurant.com',
      obraz: {
        id: 1,
        nazwa_pliku: 'image1.jpg',
        typ: 'image/jpeg',
        rozmiar: 1024,
        czy_glowne: true,
        obraz: Buffer.from('testimage1'),
      },
    };

    // Konfiguracja mocka
    mockRestauracjaRepository.findOne.mockResolvedValue(mockRestauracja);

    // Wywołanie testowanej metody
    const result = await service.findOne(1);

    // Asercje - sprawdzamy czy:
    // 1. Zapytanie zawiera właściwe warunki i relacje
    expect(mockRestauracjaRepository.findOne).toHaveBeenCalledWith({
      where: { restauracja_id: 1 },
      relations: ['obraz'],
    });
    // 2. Zwrócona restauracja zawiera wszystkie dane w formacie API
    expect(result).toHaveProperty('restauracja_id', 1);
    expect(result).toHaveProperty('nazwa', 'Restauracja Test');
    // 3. Obraz został załadowany i przekonwertowany na base64
    expect(result.obraz).toBeDefined();
    expect(result.obraz.obrazBase64).toBe(Buffer.from('testimage1').toString('base64'));
  });
});