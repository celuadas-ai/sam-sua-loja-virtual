import { Product } from '@/types';
import waterBottleSmall from '@/assets/water-bottle-small.png';
import waterBottleMedium from '@/assets/water-bottle-medium.png';
import waterGallon from '@/assets/water-gallon.png';

export const products: Product[] = [
  // Água da Namaacha
  {
    id: 'namaacha-05',
    name: 'Água Namaacha',
    brand: 'Água da Namaacha',
    volume: '0.5L',
    price: 25,
    image: waterBottleSmall,
  },
  {
    id: 'namaacha-15',
    name: 'Água Namaacha',
    brand: 'Água da Namaacha',
    volume: '1.5L',
    price: 45,
    image: waterBottleMedium,
  },
  {
    id: 'namaacha-25',
    name: 'Água Namaacha',
    brand: 'Água da Namaacha',
    volume: '2.5L',
    price: 65,
    image: waterBottleMedium,
  },
  {
    id: 'namaacha-5',
    name: 'Água Namaacha',
    brand: 'Água da Namaacha',
    volume: '5L',
    price: 95,
    image: waterGallon,
  },
  // Fonte Fresca
  {
    id: 'fonte-05',
    name: 'Água Fonte Fresca',
    brand: 'Fonte Fresca',
    volume: '0.5L',
    price: 20,
    image: waterBottleSmall,
  },
  {
    id: 'fonte-15',
    name: 'Água Fonte Fresca',
    brand: 'Fonte Fresca',
    volume: '1.5L',
    price: 40,
    image: waterBottleMedium,
  },
  {
    id: 'fonte-7',
    name: 'Água Fonte Fresca',
    brand: 'Fonte Fresca',
    volume: '7L',
    price: 120,
    image: waterGallon,
  },
  // Natura / Ges20
  {
    id: 'natura-189',
    name: 'Garrafão Natura',
    brand: 'Natura / Ges20',
    volume: '18.9L',
    price: 250,
    image: waterGallon,
  },
  // Escolha Certa
  {
    id: 'escolha-7',
    name: 'Água Escolha Certa',
    brand: 'Escolha Certa',
    volume: '7L',
    price: 100,
    image: waterGallon,
  },
];

export const brands = [
  'Todos',
  'Água da Namaacha',
  'Fonte Fresca',
  'Natura / Ges20',
  'Escolha Certa',
];
