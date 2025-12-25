// API servisleri - fakestoreapi.com kullanarak

export interface ApiUser {
  id: number;
  email: string;
  username: string;
  password: string;
  name: {
    firstname: string;
    lastname: string;
  };
  phone: string;
  address: {
    city: string;
    street: string;
    number: number;
    zipcode: string;
  };
}

export interface ApiProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

export interface ApiCart {
  id: number;
  userId: number;
  date: string;
  products: Array<{
    productId: number;
    quantity: number;
  }>;
}

// Kullanıcı API servisleri
export const userApi = {
  getAll: async (): Promise<ApiUser[]> => {
    try {
      const response = await fetch('https://fakestoreapi.com/users');
      if (!response.ok) throw new Error('Kullanıcılar yüklenemedi');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      // Fallback: LocalStorage'dan oku
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('api_users_fallback');
        return local ? JSON.parse(local) : [];
      }
      return [];
    }
  },

  getById: async (id: number): Promise<ApiUser | null> => {
    try {
      const response = await fetch(`https://fakestoreapi.com/users/${id}`);
      if (!response.ok) throw new Error('Kullanıcı bulunamadı');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  create: async (user: Partial<ApiUser>): Promise<ApiUser | null> => {
    try {
      const response = await fetch('https://fakestoreapi.com/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (!response.ok) throw new Error('Kullanıcı oluşturulamadı');
      const created = await response.json();
      
      // Fallback olarak LocalStorage'a kaydet
      if (typeof window !== 'undefined') {
        const existing = await userApi.getAll();
        existing.push(created);
        localStorage.setItem('api_users_fallback', JSON.stringify(existing));
      }
      
      return created;
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  update: async (id: number, user: Partial<ApiUser>): Promise<ApiUser | null> => {
    try {
      const response = await fetch(`https://fakestoreapi.com/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (!response.ok) throw new Error('Kullanıcı güncellenemedi');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  delete: async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`https://fakestoreapi.com/users/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  },
};

// Ürün API servisleri
export const productApi = {
  getAll: async (): Promise<ApiProduct[]> => {
    try {
      const response = await fetch('https://fakestoreapi.com/products');
      if (!response.ok) throw new Error('Ürünler yüklenemedi');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  },

  getById: async (id: number): Promise<ApiProduct | null> => {
    try {
      const response = await fetch(`https://fakestoreapi.com/products/${id}`);
      if (!response.ok) throw new Error('Ürün bulunamadı');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },
};

// Sipariş API servisleri (Cart olarak)
export const orderApi = {
  getAll: async (): Promise<ApiCart[]> => {
    try {
      const response = await fetch('https://fakestoreapi.com/carts');
      if (!response.ok) throw new Error('Siparişler yüklenemedi');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      // Fallback: LocalStorage'dan oku
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('api_orders_fallback');
        return local ? JSON.parse(local) : [];
      }
      return [];
    }
  },

  getByUser: async (userId: number): Promise<ApiCart[]> => {
    try {
      const response = await fetch(`https://fakestoreapi.com/carts/user/${userId}`);
      if (!response.ok) throw new Error('Siparişler yüklenemedi');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  },

  getById: async (id: number): Promise<ApiCart | null> => {
    try {
      const response = await fetch(`https://fakestoreapi.com/carts/${id}`);
      if (!response.ok) throw new Error('Sipariş bulunamadı');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  create: async (cart: Partial<ApiCart>): Promise<ApiCart | null> => {
    try {
      const response = await fetch('https://fakestoreapi.com/carts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cart),
      });
      if (!response.ok) throw new Error('Sipariş oluşturulamadı');
      const created = await response.json();
      
      // Fallback olarak LocalStorage'a kaydet
      if (typeof window !== 'undefined') {
        const existing = await orderApi.getAll();
        existing.push(created);
        localStorage.setItem('api_orders_fallback', JSON.stringify(existing));
      }
      
      return created;
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  update: async (id: number, cart: Partial<ApiCart>): Promise<ApiCart | null> => {
    try {
      const response = await fetch(`https://fakestoreapi.com/carts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cart),
      });
      if (!response.ok) throw new Error('Sipariş güncellenemedi');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  delete: async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`https://fakestoreapi.com/carts/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  },
};


