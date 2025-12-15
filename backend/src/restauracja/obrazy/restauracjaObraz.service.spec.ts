// backend/src/restauracja/obrazy/restauracjaObraz.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { RestauracjaObrazService } from './restauracjaObraz.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RestauracjaObraz } from './restauracjaObraz.entity';
import { Restauracja } from '../restauracja.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

/**
 * Testy jednostkowe dla RestauracjaObrazService
 * Testują funkcjonalności zarządzania obrazami restauracji (upload, update, delete)
 */
describe('RestauracjaObrazService', () => {
  let service: RestauracjaObrazService;
  let obrazRepository: Repository<RestauracjaObraz>;
  let restauracjaRepository: Repository<Restauracja>;

  // Mock (atrapa) repozytorium RestauracjaObraz - symuluje operacje na obrazach
  const mockObrazRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  // Mock (atrapa) repozytorium Restauracja - symuluje sprawdzanie istnienia restauracji
  const mockRestauracjaRepository = {
    findOne: jest.fn(),
  };

  // Przed każdym testem tworzymy świeżą instancję modułu testowego
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestauracjaObrazService,
        {
          provide: getRepositoryToken(RestauracjaObraz), // Token dla repozytorium obrazów
          useValue: mockObrazRepository,
        },
        {
          provide: getRepositoryToken(Restauracja), // Token dla repozytorium restauracji
          useValue: mockRestauracjaRepository,
        },
      ],
    }).compile();

    service = module.get<RestauracjaObrazService>(RestauracjaObrazService);
    obrazRepository = module.get<Repository<RestauracjaObraz>>(getRepositoryToken(RestauracjaObraz));
    restauracjaRepository = module.get<Repository<Restauracja>>(getRepositoryToken(Restauracja));
  });

  // Po każdym teście czyścimy wszystkie mocki
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test 1: Sprawdza dodawanie nowego obrazu do restauracji
   * Testuje scenariusz: właściciel restauracji dodaje zdjęcie do galerii
   * Oczekiwany rezultat: obraz zostaje zapisany z metadanymi (nazwa, typ, rozmiar)
   */
  it('should add a new image to restauracja', async () => {
    // Przygotowanie danych testowych - mockowy plik zdjęcia
    const mockFile: Express.Multer.File = {
      buffer: Buffer.from('fake-image-data'),
      originalname: 'restaurant-photo.jpg',
      mimetype: 'image/jpeg',
      size: 1024 * 500, // 500KB
      fieldname: 'file',
      encoding: '7bit',
      stream: null as any,
      destination: '',
      filename: '',
      path: '',
    };

    // Mockowa restauracja
    const mockRestauracja = {
      restauracja_id: 1,
      nazwa: 'Test Restaurant',
      adres: 'ul. Testowa 1',
    };

    // Mockowy obraz po zapisaniu
    const mockObraz = {
      id: 1,
      obraz: mockFile.buffer,
      nazwa_pliku: mockFile.originalname,
      typ: mockFile.mimetype,
      rozmiar: mockFile.size,
      czy_glowne: false,
      restauracja: mockRestauracja,
    };

    // Konfiguracja mocków
    mockRestauracjaRepository.findOne.mockResolvedValue(mockRestauracja);
    mockObrazRepository.create.mockReturnValue(mockObraz);
    mockObrazRepository.save.mockResolvedValue(mockObraz);

    // Wywołanie testowanej metody
    const result = await service.dodajObraz(1, mockFile);

    // Asercje - sprawdzamy czy:
    // 1. Sprawdzono czy restauracja istnieje
    expect(mockRestauracjaRepository.findOne).toHaveBeenCalledWith({
      where: { restauracja_id: 1 },
    });
    // 2. Utworzono obiekt obrazu z prawidłowymi danymi
    expect(mockObrazRepository.create).toHaveBeenCalledWith({
      obraz: mockFile.buffer,
      nazwa_pliku: mockFile.originalname,
      typ: mockFile.mimetype,
      rozmiar: mockFile.size,
      restauracja: mockRestauracja,
    });
    // 3. Obraz został zapisany w bazie danych
    expect(mockObrazRepository.save).toHaveBeenCalledWith(mockObraz);
    // 4. Zwrócony obiekt zawiera wszystkie metadane
    expect(result).toEqual(mockObraz);
    expect(result.nazwa_pliku).toBe('restaurant-photo.jpg');
    expect(result.typ).toBe('image/jpeg');
    expect(result.rozmiar).toBe(512000);
  });

  /**
   * Test 2: Sprawdza usuwanie obrazu restauracji
   * Testuje scenariusz: właściciel usuwa niepotrzebne zdjęcie z galerii
   * Oczekiwany rezultat: obraz zostaje usunięty z bazy danych
   */
  it('should delete an image', async () => {
    // Przygotowanie danych testowych - rezultat operacji usuwania
    const mockDeleteResult = {
      affected: 1, // Liczba usuniętych rekordów
      raw: [],
    };

    // Konfiguracja mocka
    mockObrazRepository.delete.mockResolvedValue(mockDeleteResult);

    // Wywołanie testowanej metody
    await service.usunObraz(1);

    // Asercje - sprawdzamy czy:
    // 1. Repozytorium zostało wywołane z prawidłowym ID
    expect(mockObrazRepository.delete).toHaveBeenCalledWith(1);
    // 2. Metoda zakończyła się bez rzucania wyjątku (affected = 1)
    expect(mockObrazRepository.delete).toHaveBeenCalledTimes(1);
  });
});