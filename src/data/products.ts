import { Product } from '@/types';
import namaacha500ml from '@/assets/namaacha-500ml.png';
import namaacha500mlPack6 from '@/assets/namaacha-500ml-pack6.png';
import namaacha500mlPack12 from '@/assets/namaacha-500ml-pack12.png';
import namaacha15l from '@/assets/namaacha-1.5l.png';
import namaacha15lPack6 from '@/assets/namaacha-1.5l-pack6.png';
import namaacha25l from '@/assets/namaacha-2.5l.png';
import namaacha5l from '@/assets/namaacha-5l.png';
import aguaGas330ml from '@/assets/agua-gas-330ml.png';
import ff500ml from '@/assets/ff-500ml.png';
import ff15l from '@/assets/ff-1.5l.png';
import ff7l from '@/assets/ff-7l.png';
import natura189l from '@/assets/natura-18.9l.png';
import escolhaCerta7l from '@/assets/escolha-certa-7l.png';

export const products: Product[] = [
  // Água da Namaacha
  {
    id: 'namaacha-05-pack6',
    name: 'Água Namaacha',
    brand: 'Água da Namaacha',
    volume: '0.5L',
    price: 25,
    image: namaacha500mlPack6,
    minQuantity: 6,
    unitLabel: '1 pack (6un)',
  },
  {
    id: 'namaacha-05-pack12',
    name: 'Água Namaacha',
    brand: 'Água da Namaacha',
    volume: '0.5L',
    price: 25,
    image: namaacha500mlPack12,
    minQuantity: 12,
    unitLabel: '1 pack (12un)',
  },
  {
    id: 'namaacha-05',
    name: 'Água Namaacha',
    brand: 'Água da Namaacha',
    volume: '0.5L',
    price: 25,
    image: namaacha500ml,
    minQuantity: 24,
    unitLabel: '1 caixa (24un)',
  },
  {
    id: 'namaacha-15-pack6',
    name: 'Água Namaacha',
    brand: 'Água da Namaacha',
    volume: '1.5L',
    price: 45,
    image: namaacha15lPack6,
    minQuantity: 6,
    unitLabel: '1 pack (6un)',
  },
  {
    id: 'namaacha-15',
    name: 'Água Namaacha',
    brand: 'Água da Namaacha',
    volume: '1.5L',
    price: 45,
    image: namaacha15l,
    minQuantity: 12,
    unitLabel: '1 caixa (12un)',
  },
  {
    id: 'namaacha-25',
    name: 'Água Namaacha',
    brand: 'Água da Namaacha',
    volume: '2.5L',
    price: 65,
    image: namaacha25l,
    minQuantity: 6,
    unitLabel: '1 pack (6un)',
  },
  {
    id: 'namaacha-5',
    name: 'Água Namaacha',
    brand: 'Água da Namaacha',
    volume: '5L',
    price: 95,
    image: namaacha5l,
    minQuantity: 5,
    unitLabel: 'Mín. 5 garrafões',
  },
  // Água com Gás
  {
    id: 'namaacha-gas-330',
    name: 'Água com Gás',
    brand: 'Água da Namaacha',
    volume: '330ml',
    price: 30,
    image: aguaGas330ml,
    minQuantity: 6,
    unitLabel: '1 pack (6un)',
  },
  // Fonte Fresca
  {
    id: 'fonte-05',
    name: 'Água Fonte Fresca',
    brand: 'Fonte Fresca',
    volume: '0.5L',
    price: 20,
    image: ff500ml,
    minQuantity: 12,
    unitLabel: '1 pack (12un)',
  },
  {
    id: 'fonte-15',
    name: 'Água Fonte Fresca',
    brand: 'Fonte Fresca',
    volume: '1.5L',
    price: 40,
    image: ff15l,
    minQuantity: 12,
    unitLabel: '1 pack (12un)',
  },
  {
    id: 'fonte-7',
    name: 'Água Fonte Fresca',
    brand: 'Fonte Fresca',
    volume: '7L',
    price: 120,
    image: ff7l,
    minQuantity: 5,
    unitLabel: 'Mín. 5 garrafões',
  },
  // Natura / Ges20
  {
    id: 'natura-189',
    name: 'Garrafão Natura',
    brand: 'Natura / Ges20',
    volume: '18.9L',
    price: 250,
    image: natura189l,
    minQuantity: 1,
    unitLabel: 'Mín. 1 galão',
  },
  // Escolha Certa
  {
    id: 'escolha-7',
    name: 'Água Escolha Certa',
    brand: 'Escolha Certa',
    volume: '7L',
    price: 100,
    image: escolhaCerta7l,
    minQuantity: 5,
    unitLabel: 'Mín. 5 garrafões',
  },
];

export const brands = [
  'Todos',
  'Água da Namaacha',
  'Fonte Fresca',
  'Natura / Ges20',
  'Escolha Certa',
];
