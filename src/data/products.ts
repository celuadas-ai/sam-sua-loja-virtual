import { Product } from '@/types';
import namaacha500ml from '@/assets/namaacha-500ml.png';
import namaacha15l from '@/assets/namaacha-1.5l.png';
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
    id: 'namaacha-05',
    name: 'Água Namaacha',
    brand: 'Água da Namaacha',
    volume: '0.5L',
    price: 25,
    image: namaacha500ml,
  },
  {
    id: 'namaacha-15',
    name: 'Água Namaacha',
    brand: 'Água da Namaacha',
    volume: '1.5L',
    price: 45,
    image: namaacha15l,
  },
  {
    id: 'namaacha-25',
    name: 'Água Namaacha',
    brand: 'Água da Namaacha',
    volume: '2.5L',
    price: 65,
    image: namaacha15l,
  },
  {
    id: 'namaacha-5',
    name: 'Água Namaacha',
    brand: 'Água da Namaacha',
    volume: '5L',
    price: 95,
    image: namaacha5l,
  },
  // Água com Gás
  {
    id: 'namaacha-gas-330',
    name: 'Água com Gás',
    brand: 'Água da Namaacha',
    volume: '330ml',
    price: 30,
    image: aguaGas330ml,
  },
  // Fonte Fresca
  {
    id: 'fonte-05',
    name: 'Água Fonte Fresca',
    brand: 'Fonte Fresca',
    volume: '0.5L',
    price: 20,
    image: ff500ml,
  },
  {
    id: 'fonte-15',
    name: 'Água Fonte Fresca',
    brand: 'Fonte Fresca',
    volume: '1.5L',
    price: 40,
    image: ff15l,
  },
  {
    id: 'fonte-7',
    name: 'Água Fonte Fresca',
    brand: 'Fonte Fresca',
    volume: '7L',
    price: 120,
    image: ff7l,
  },
  // Natura / Ges20
  {
    id: 'natura-189',
    name: 'Garrafão Natura',
    brand: 'Natura / Ges20',
    volume: '18.9L',
    price: 250,
    image: natura189l,
  },
  // Escolha Certa
  {
    id: 'escolha-7',
    name: 'Água Escolha Certa',
    brand: 'Escolha Certa',
    volume: '7L',
    price: 100,
    image: escolhaCerta7l,
  },
];

export const brands = [
  'Todos',
  'Água da Namaacha',
  'Fonte Fresca',
  'Natura / Ges20',
  'Escolha Certa',
];
