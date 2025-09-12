export interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  colors?: string[];
}

export const getAllProducts = (): Product[] => {
  return [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: "₱2,999",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      colors: ["black", "white", "silver"]
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      price: "₱4,999",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
      colors: ["black", "rose-gold", "silver"]
    },
    {
      id: 3,
      name: "Wireless Bluetooth Speaker",
      price: "₱1,999",
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
      colors: ["black", "blue", "red"]
    },
    {
      id: 4,
      name: "Gaming Mechanical Keyboard",
      price: "₱3,499",
      image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop",
      colors: ["black", "white"]
    },
    {
      id: 5,
      name: "Wireless Gaming Mouse",
      price: "₱2,499",
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop",
      colors: ["black", "white", "rgb"]
    },
    {
      id: 6,
      name: "Smartphone Stand",
      price: "₱899",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
      colors: ["black", "white", "silver"]
    },
    {
      id: 7,
      name: "LED Desk Lamp",
      price: "₱1,299",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      colors: ["black", "white"]
    },
    {
      id: 8,
      name: "Portable Power Bank",
      price: "₱1,599",
      image: "https://images.unsplash.com/photo-1609592808265-4b0b5b5b5b5b?w=400&h=400&fit=crop",
      colors: ["black", "blue", "red"]
    },
    {
      id: 9,
      name: "USB-C Hub",
      price: "₱2,199",
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=400&fit=crop",
      colors: ["black", "silver"]
    },
    {
      id: 10,
      name: "Wireless Charger",
      price: "₱1,799",
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop",
      colors: ["black", "white"]
    }
  ];
};
