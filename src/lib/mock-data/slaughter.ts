export type SlaughterButcher = {
  name: string;
  weight: number;
  price: number;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
};

export type SlaughterAnimal = {
  id: number;
  weight: number;
  purchasePrice: number;
  meatWeight: number;
  tripesWeight: number;
  date: string;
  butchers: SlaughterButcher[];
};

export const MOCK_SLAUGHTER_ANIMALS: SlaughterAnimal[] = [
  {
    id: 1,
    weight: 200,
    purchasePrice: 500000,
    meatWeight: 150,
    tripesWeight: 30,
    date: "2024-01-15",
    butchers: [
      {
        name: "Boucherie Halal",
        weight: 80,
        price: 2000,
        address: "Ngaoundéré, Yoko",
        city: "Ngaoundéré",
        postal_code: "454",
        phone: "(+237) 695956707",
      },
      {
        name: "Boucherie Centrale",
        weight: 70,
        price: 1750,
        address: "Douala, Rue 5",
        city: "Douala",
        postal_code: "123",
        phone: "(+237) 612345678",
      },
    ],
  },
  {
    id: 2,
    weight: 180,
    purchasePrice: 450000,
    meatWeight: 130,
    tripesWeight: 25,
    date: "2024-01-14",
    butchers: [
      {
        name: "Boucherie Halal",
        weight: 70,
        price: 1800,
        address: "Ngaoundéré, Yoko",
        city: "Ngaoundéré",
        postal_code: "454",
        phone: "(+237) 695956707",
      },
      {
        name: "Boucherie du Marché",
        weight: 60,
        price: 1500,
        address: "Yaoundé, Marché Central",
        city: "Yaoundé",
        postal_code: "789",
        phone: "(+237) 678901234",
      },
    ],
  },
  {
    id: 3,
    weight: 220,
    purchasePrice: 550000,
    meatWeight: 160,
    tripesWeight: 35,
    date: "2024-01-13",
    butchers: [
      {
        name: "Boucherie Centrale",
        weight: 90,
        price: 2200,
        address: "Douala, Rue 5",
        city: "Douala",
        postal_code: "123",
        phone: "(+237) 612345678",
      },
    ],
  },
  {
    id: 4,
    weight: 190,
    purchasePrice: 480000,
    meatWeight: 140,
    tripesWeight: 28,
    date: "2024-01-12",
    butchers: [
      {
        name: "Boucherie Halal",
        weight: 75,
        price: 1900,
        address: "Ngaoundéré, Yoko",
        city: "Ngaoundéré",
        postal_code: "454",
        phone: "(+237) 695956707",
      },
      {
        name: "Boucherie du Marché",
        weight: 65,
        price: 1600,
        address: "Yaoundé, Marché Central",
        city: "Yaoundé",
        postal_code: "789",
        phone: "(+237) 678901234",
      },
      {
        name: "Boucherie Centrale",
        weight: 60,
        price: 1500,
        address: "Douala, Rue 5",
        city: "Douala",
        postal_code: "123",
        phone: "(+237) 612345678",
      },
    ],
  },
  {
    id: 5,
    weight: 210,
    purchasePrice: 520000,
    meatWeight: 155,
    tripesWeight: 30,
    date: "2024-01-11",
    butchers: [
      {
        name: "Boucherie du Marché",
        weight: 70,
        price: 1750,
        address: "Yaoundé, Marché Central",
        city: "Yaoundé",
        postal_code: "789",
        phone: "(+237) 678901234",
      },
      {
        name: "Boucherie Centrale",
        weight: 85,
        price: 2000,
        address: "Douala, Rue 5",
        city: "Douala",
        postal_code: "123",
        phone: "(+237) 612345678",
      },
    ],
  },
];

export const getSlaughterAnimalById = (id: string): SlaughterAnimal | undefined =>
  MOCK_SLAUGHTER_ANIMALS.find((a) => String(a.id) === id);
