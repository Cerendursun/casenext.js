// Veri yönetimi - API entegrasyonu
import { userApi, orderApi, productApi, ApiUser, ApiCart, ApiProduct } from './api';

export interface Kullanici {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address?: {
    city: string;
    street: string;
  };
  grupTanimi?: string;
  departman?: string;
  admin?: boolean;
  temsilci?: boolean;
  kullaniciNo?: string;
}

export interface Urun {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  title: string;
  image?: string;
}

export interface Siparis {
  id: number;
  userId: number;
  date: string;
  products: Urun[];
  total: number;
}

// API'den gelen veriyi iç formata dönüştür
const mapApiUserToKullanici = (apiUser: ApiUser): Kullanici => {
  return {
    id: apiUser.id,
    username: apiUser.username,
    email: apiUser.email,
    firstName: apiUser.name.firstname,
    lastName: apiUser.name.lastname,
    phone: apiUser.phone,
    address: {
      city: apiUser.address.city,
      street: apiUser.address.street,
    },
    kullaniciNo: apiUser.id.toString().padStart(7, '0'),
    grupTanimi: 'GENEL MÜDÜR', // Varsayılan
    departman: 'Yönetim', // Varsayılan
    admin: false,
    temsilci: false,
  };
};

const mapKullaniciToApiUser = (kullanici: Partial<Kullanici>): Partial<ApiUser> => {
  return {
    username: kullanici.username,
    email: kullanici.email,
    phone: kullanici.phone,
    name: {
      firstname: kullanici.firstName || '',
      lastname: kullanici.lastName || '',
    },
    address: kullanici.address ? {
      city: kullanici.address.city,
      street: kullanici.address.street,
      number: 0,
      zipcode: '',
    } : undefined,
  };
};

// Sipariş ve ürün dönüşümleri
const mapApiCartToSiparis = async (apiCart: ApiCart): Promise<Siparis> => {
  const products: Urun[] = [];
  let total = 0;

  for (const item of apiCart.products) {
    const product = await productApi.getById(item.productId);
    if (product) {
      const urun: Urun = {
        id: item.productId,
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        title: product.title,
        image: product.image,
      };
      products.push(urun);
      total += product.price * item.quantity;
    }
  }

  return {
    id: apiCart.id,
    userId: apiCart.userId,
    date: apiCart.date,
    products,
    total,
  };
};

// Kullanıcı işlemleri
export const kullaniciService = {
  getAll: async (): Promise<Kullanici[]> => {
    try {
      const apiUsers = await userApi.getAll();
      return apiUsers.map(mapApiUserToKullanici);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
      // Fallback: LocalStorage
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('kullanicilar_fallback');
        if (local) return JSON.parse(local);
      }
      return [];
    }
  },

  getById: async (id: number): Promise<Kullanici | null> => {
    try {
      const apiUser = await userApi.getById(id);
      if (!apiUser) return null;
      return mapApiUserToKullanici(apiUser);
    } catch (error) {
      console.error('Kullanıcı yüklenirken hata:', error);
      return null;
    }
  },

  create: async (kullanici: Omit<Kullanici, 'id'>): Promise<Kullanici | null> => {
    try {
      const apiUserData = mapKullaniciToApiUser(kullanici);
      const created = await userApi.create(apiUserData as ApiUser);
      if (!created) return null;
      return mapApiUserToKullanici(created);
    } catch (error) {
      console.error('Kullanıcı oluşturulurken hata:', error);
      // Fallback: LocalStorage
      if (typeof window !== 'undefined') {
        const existing = await kullaniciService.getAll();
        const yeniId = existing.length > 0 ? Math.max(...existing.map(k => k.id)) + 1 : 1;
        const yeniKullanici: Kullanici = { ...kullanici, id: yeniId };
        existing.push(yeniKullanici);
        localStorage.setItem('kullanicilar_fallback', JSON.stringify(existing));
        return yeniKullanici;
      }
      return null;
    }
  },

  update: async (id: number, kullanici: Partial<Kullanici>): Promise<Kullanici | null> => {
    try {
      const apiUserData = mapKullaniciToApiUser(kullanici);
      const updated = await userApi.update(id, apiUserData);
      if (!updated) return null;
      return mapApiUserToKullanici(updated);
    } catch (error) {
      console.error('Kullanıcı güncellenirken hata:', error);
      // Fallback: LocalStorage
      if (typeof window !== 'undefined') {
        const existing = await kullaniciService.getAll();
        const index = existing.findIndex(k => k.id === id);
        if (index === -1) return null;
        existing[index] = { ...existing[index], ...kullanici };
        localStorage.setItem('kullanicilar_fallback', JSON.stringify(existing));
        return existing[index];
      }
      return null;
    }
  },

  delete: async (id: number): Promise<boolean> => {
    try {
      return await userApi.delete(id);
    } catch (error) {
      console.error('Kullanıcı silinirken hata:', error);
      // Fallback: LocalStorage
      if (typeof window !== 'undefined') {
        const existing = await kullaniciService.getAll();
        const filtered = existing.filter(k => k.id !== id);
        if (filtered.length === existing.length) return false;
        localStorage.setItem('kullanicilar_fallback', JSON.stringify(filtered));
        return true;
      }
      return false;
    }
  },
};

// Sipariş işlemleri
export const siparisService = {
  getAll: async (): Promise<Siparis[]> => {
    try {
      const apiCarts = await orderApi.getAll();
      const siparisler: Siparis[] = [];
      for (const cart of apiCarts) {
        const siparis = await mapApiCartToSiparis(cart);
        siparisler.push(siparis);
      }
      return siparisler;
    } catch (error) {
      console.error('Siparişler yüklenirken hata:', error);
      return [];
    }
  },

  getByDateRange: async (
    baslangic: string,
    bitis: string,
    userId?: number
  ): Promise<Siparis[]> => {
    try {
      let apiCarts: ApiCart[];
      if (userId) {
        apiCarts = await orderApi.getByUser(userId);
      } else {
        apiCarts = await orderApi.getAll();
      }

      const siparisler: Siparis[] = [];
      for (const cart of apiCarts) {
        const siparisTarihi = new Date(cart.date);
        const baslangicTarihi = new Date(baslangic);
        const bitisTarihi = new Date(bitis);
        
        if (siparisTarihi >= baslangicTarihi && siparisTarihi <= bitisTarihi) {
          const siparis = await mapApiCartToSiparis(cart);
          siparisler.push(siparis);
        }
      }
      return siparisler;
    } catch (error) {
      console.error('Siparişler filtrelenirken hata:', error);
      return [];
    }
  },

  getById: async (id: number): Promise<Siparis | null> => {
    try {
      const apiCart = await orderApi.getById(id);
      if (!apiCart) return null;
      return await mapApiCartToSiparis(apiCart);
    } catch (error) {
      console.error('Sipariş yüklenirken hata:', error);
      return null;
    }
  },

  update: async (id: number, siparis: Partial<Siparis>): Promise<Siparis | null> => {
    try {
      const existing = await siparisService.getById(id);
      if (!existing) return null;

      const apiCartData: Partial<ApiCart> = {
        userId: siparis.userId || existing.userId,
        date: siparis.date || existing.date,
        products: siparis.products
          ? siparis.products.map(p => ({
              productId: p.productId,
              quantity: p.quantity,
            }))
          : existing.products.map(p => ({
              productId: p.productId,
              quantity: p.quantity,
            })),
      };

      const updated = await orderApi.update(id, apiCartData);
      if (!updated) return null;
      return await mapApiCartToSiparis(updated);
    } catch (error) {
      console.error('Sipariş güncellenirken hata:', error);
      return null;
    }
  },

  delete: async (id: number): Promise<boolean> => {
    try {
      return await orderApi.delete(id);
    } catch (error) {
      console.error('Sipariş silinirken hata:', error);
      return false;
    }
  },

  create: async (siparis: Omit<Siparis, 'id'>): Promise<Siparis | null> => {
    try {
      const apiCartData: Partial<ApiCart> = {
        userId: siparis.userId,
        date: siparis.date,
        products: siparis.products.map(p => ({
          productId: p.productId,
          quantity: p.quantity,
        })),
      };

      const created = await orderApi.create(apiCartData);
      if (!created) return null;
      return await mapApiCartToSiparis(created);
    } catch (error) {
      console.error('Sipariş oluşturulurken hata:', error);
      return null;
    }
  },

  // Ürün işlemleri
  addProduct: async (siparisId: number, urun: Omit<Urun, 'id'>): Promise<Urun | null> => {
    const siparis = await siparisService.getById(siparisId);
    if (!siparis) return null;

    const yeniId = siparis.products.length > 0 
      ? Math.max(...siparis.products.map(u => u.id)) + 1 
      : 1;
    const yeniUrun: Urun = { ...urun, id: yeniId };
    
    siparis.products.push(yeniUrun);
    siparis.total = siparis.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    
    const updated = await siparisService.update(siparisId, siparis);
    return updated ? yeniUrun : null;
  },

  updateProduct: async (
    siparisId: number,
    urunId: number,
    urun: Partial<Urun>
  ): Promise<Urun | null> => {
    const siparis = await siparisService.getById(siparisId);
    if (!siparis) return null;

    const index = siparis.products.findIndex(u => u.id === urunId);
    if (index === -1) return null;

    siparis.products[index] = { ...siparis.products[index], ...urun };
    siparis.total = siparis.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    
    const updated = await siparisService.update(siparisId, siparis);
    return updated ? siparis.products[index] : null;
  },

  deleteProduct: async (siparisId: number, urunId: number): Promise<boolean> => {
    const siparis = await siparisService.getById(siparisId);
    if (!siparis) return false;

    const filtered = siparis.products.filter(u => u.id !== urunId);
    if (filtered.length === siparis.products.length) return false;

    siparis.products = filtered;
    siparis.total = siparis.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    
    const updated = await siparisService.update(siparisId, siparis);
    return updated !== null;
  },
};
