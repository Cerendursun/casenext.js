"use client";

import { useState, useEffect, useCallback } from 'react';
import DataGrid, {
  Column,
  Paging,
  Pager,
  Editing,
  Selection,
  Toolbar,
  Item,
  Export,
  MasterDetail,
  SearchPanel,
  LoadPanel,
} from 'devextreme-react/data-grid';
import DateBox from 'devextreme-react/date-box';
import SelectBox from 'devextreme-react/select-box';
import Button from 'devextreme-react/button';
import Popup from 'devextreme-react/popup';
import { siparisService, kullaniciService, Siparis, Urun, Kullanici } from '@/lib/data';
import { confirm } from 'devextreme/ui/dialog';
import notify from "devextreme/ui/notify";

export default function SiparislerPage() {
  const [siparisler, setSiparisler] = useState<Siparis[]>([]);
  const [kullanicilar, setKullanicilar] = useState<Kullanici[]>([]);
  const [baslangicTarihi, setBaslangicTarihi] = useState<Date | null>(null);
  const [bitisTarihi, setBitisTarihi] = useState<Date | null>(null);
  const [seciliKullaniciId, setSeciliKullaniciId] = useState<number | null>(null);
  const [urunFotoPopup, setUrunFotoPopup] = useState(false);
  const [seciliUrunFoto, setSeciliUrunFoto] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const loadKullanicilar = useCallback(async () => {
    try {
      const data = await kullaniciService.getAll();
      setKullanicilar(data);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    }
  }, []);

  const loadSiparisler = useCallback(async () => {
    if (!baslangicTarihi || !bitisTarihi) return;
    
    try {
      setLoading(true);
      const data = await siparisService.getByDateRange(
        baslangicTarihi.toISOString().split('T')[0],
        bitisTarihi.toISOString().split('T')[0],
        seciliKullaniciId || undefined
      );
      setSiparisler(data);
    } catch (error) {
      notify('Siparişler yüklenirken hata oluştu', 'error', 3000);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [baslangicTarihi, bitisTarihi, seciliKullaniciId]);

  useEffect(() => {
    // Client-side'da tarihleri ayarla
    if (baslangicTarihi === null || bitisTarihi === null) {
      const bugun = new Date();
      const birAyOnce = new Date();
      birAyOnce.setMonth(birAyOnce.getMonth() - 1);
      setBaslangicTarihi(birAyOnce);
      setBitisTarihi(bugun);
    }
  }, []);

  useEffect(() => {
    loadKullanicilar();
  }, [loadKullanicilar]);

  useEffect(() => {
    if (baslangicTarihi && bitisTarihi) {
      loadSiparisler();
    }
  }, [loadSiparisler, baslangicTarihi, bitisTarihi]);

  const handleFiltrele = () => {
    loadSiparisler();
  };

  const handleBugun = () => {
    const bugun = new Date();
    setBaslangicTarihi(bugun);
    setBitisTarihi(bugun);
  };

  const handleSiparisRowRemoving = async (e: any) => {
    const result = await confirm(
      'Bu sipariş silinecek. Emin misiniz?',
      'Sipariş Silme'
    );

    if (!result) {
      e.cancel = true;
    }
  };

  const handleSiparisRowRemoved = async () => {
    await loadSiparisler();
  };

  const handleSiparisRowUpdating = async (e: any) => {
    try {
      const updated = await siparisService.update(e.key, e.newData);
      if (updated) {
        notify('Sipariş başarıyla güncellendi', 'success', 3000);
        await loadSiparisler();
      } else {
        notify('Sipariş güncellenirken hata oluştu', 'error', 3000);
      }
    } catch (error) {
      notify('Sipariş güncellenirken hata oluştu', 'error', 3000);
    }
  };

  const handleSiparisRowInserting = async (e: any) => {
    try {
      const yeniSiparis: Omit<Siparis, 'id'> = {
        userId: e.data.userId || 1,
        date: e.data.date || new Date().toISOString().split('T')[0],
        products: [],
        total: 0,
      };
      const created = await siparisService.create(yeniSiparis);
      if (created) {
        notify('Sipariş başarıyla oluşturuldu', 'success', 3000);
        await loadSiparisler();
      } else {
        notify('Sipariş oluşturulurken hata oluştu', 'error', 3000);
      }
    } catch (error) {
      notify('Sipariş oluşturulurken hata oluştu', 'error', 3000);
    }
  };

  const handleUrunRowRemoving = async (e: any) => {
    const siparisId = (e.component as any).option('dataSource').siparisId;
    const result = await confirm(
      'Bu ürün silinecek. Emin misiniz?',
      'Ürün Silme'
    );

    if (!result) {
      e.cancel = true;
    } else {
      try {
        await siparisService.deleteProduct(siparisId, e.key);
        await loadSiparisler();
      } catch (error) {
        notify('Ürün silinirken hata oluştu', 'error', 3000);
      }
    }
  };

  const handleUrunRowUpdating = async (e: any) => {
    const siparisId = (e.component as any).option('dataSource').siparisId;
    try {
      const updated = await siparisService.updateProduct(siparisId, e.key, e.newData);
      if (updated) {
        notify('Ürün başarıyla güncellendi', 'success', 3000);
        await loadSiparisler();
      } else {
        notify('Ürün güncellenirken hata oluştu', 'error', 3000);
      }
    } catch (error) {
      notify('Ürün güncellenirken hata oluştu', 'error', 3000);
    }
  };

  const handleUrunRowInserting = async (e: any) => {
    const siparisId = (e.component as any).option('dataSource').siparisId;
    try {
      const yeniUrun: Partial<Urun> = {
        ...e.data,
        quantity: e.data.quantity || 1,
        price: e.data.price || 0,
      };
      const created = await siparisService.addProduct(siparisId, yeniUrun as Omit<Urun, 'id'>);
      if (created) {
        notify('Ürün başarıyla eklendi', 'success', 3000);
        await loadSiparisler();
      } else {
        notify('Ürün eklenirken hata oluştu', 'error', 3000);
      }
    } catch (error) {
      notify('Ürün eklenirken hata oluştu', 'error', 3000);
    }
  };

  const handleFotoGoster = (fotoUrl: string) => {
    setSeciliUrunFoto(fotoUrl);
    setUrunFotoPopup(true);
  };

  const MasterDetailGrid = ({ data }: { data: Siparis }) => {
    const urunDataSource = {
      store: data.products,
      siparisId: data.id,
    };

    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Ürünler</h3>
        <DataGrid
          dataSource={urunDataSource}
          keyExpr="id"
          showBorders={true}
          columnAutoWidth={true}
          onRowRemoving={handleUrunRowRemoving}
          onRowUpdating={handleUrunRowUpdating}
          onRowInserting={handleUrunRowInserting}
        >
          <Editing
            mode="row"
            allowAdding={true}
            allowUpdating={true}
            allowDeleting={true}
          />
          <Paging defaultPageSize={10} />
          <Column dataField="productId" caption="Ürün ID" dataType="number" width={100} />
          <Column dataField="title" caption="Ürün Adı" />
          <Column dataField="quantity" caption="Miktar" dataType="number" width={100} />
          <Column
            dataField="price"
            caption="Fiyat"
            dataType="number"
            format="currency"
            width={120}
          />
          <Column
            caption="Toplam"
            calculateCellValue={(rowData: Urun) => rowData.quantity * rowData.price}
            format="currency"
            width={120}
          />
          <Column
            type="buttons"
            width={150}
            buttons={[
              {
                hint: 'Fotoğraf Göster',
                icon: 'image',
                onClick: (e: any) => {
                  if (e.row.data.image) {
                    handleFotoGoster(e.row.data.image);
                  } else {
                    notify('Bu ürün için fotoğraf bulunamadı', 'warning', 3000);
                  }
                },
              },
              'edit',
              'delete',
            ]}
          />
        </DataGrid>
      </div>
    );
  };

  const kullaniciSecenekleri = [
    { value: null, text: 'Tüm Kullanıcılar' },
    ...kullanicilar.map((k) => ({
      value: k.id,
      text: `${k.firstName} ${k.lastName} (${k.username})`,
    })),
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Siparişler</h1>
      </div>

      {/* Toolbar - Görseldeki gibi */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap">Başlangıç:</label>
            {baslangicTarihi && (
              <DateBox
                value={baslangicTarihi}
                onValueChanged={(e) => setBaslangicTarihi(e.value)}
                type="date"
                width={150}
                displayFormat="dd.MM.yyyy"
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap">Bitiş:</label>
            {bitisTarihi && (
              <DateBox
                value={bitisTarihi}
                onValueChanged={(e) => setBitisTarihi(e.value)}
                type="date"
                width={150}
                displayFormat="dd.MM.yyyy"
              />
            )}
          </div>
          <Button
            text="Bugün"
            type="default"
            stylingMode="contained"
            onClick={handleBugun}
          />
          <div className="flex-1">
            <SelectBox
              value={seciliKullaniciId}
              onValueChanged={(e) => setSeciliKullaniciId(e.value)}
              dataSource={kullaniciSecenekleri}
              displayExpr="text"
              valueExpr="value"
              placeholder="Kullanıcı Seçiniz"
              width={250}
            />
          </div>
          <Button
            text="Filtrele"
            type="default"
            stylingMode="contained"
            icon="filter"
            onClick={handleFiltrele}
          />
        </div>
      </div>

      <DataGrid
        dataSource={loading ? [] : siparisler}
        keyExpr="id"
        showBorders={true}
        columnAutoWidth={true}
        onRowRemoving={handleSiparisRowRemoving}
        onRowRemoved={handleSiparisRowRemoved}
        onRowUpdating={handleSiparisRowUpdating}
        onRowInserting={handleSiparisRowInserting}
      >
        <LoadPanel enabled={loading} showIndicator={true} showPane={true} />
        <Editing
          mode="row"
          allowAdding={true}
          allowUpdating={true}
          allowDeleting={true}
        />
        <Toolbar>
          <Item location="before">
            <Button
              text="Yeni"
              icon="plus"
              stylingMode="contained"
              type="default"
            />
          </Item>
          <Item location="before">
            <Button
              text="Düzenle"
              icon="edit"
              stylingMode="contained"
              type="default"
            />
          </Item>
          <Item location="before">
            <Button
              text="Yazdır"
              icon="print"
              stylingMode="contained"
              type="default"
              onClick={() => window.print()}
            />
          </Item>
          <Item name="exportButton" location="after" />
          <Item name="searchPanel" location="after" />
        </Toolbar>
        <SearchPanel
          visible={true}
          width={240}
          placeholder="Arama..."
        />
        <Export enabled={true} />
        <Paging defaultPageSize={20} />
        <Pager
          showPageSizeSelector={true}
          allowedPageSizes={[10, 20, 50, 100]}
          showInfo={true}
        />
        <MasterDetail
          enabled={true}
          component={MasterDetailGrid}
        />
        <Column dataField="id" caption="ID" width={80} />
        <Column
          dataField="userId"
          caption="Kullanıcı"
          lookup={{
            dataSource: kullanicilar,
            valueExpr: 'id',
            displayExpr: (item: Kullanici) => `${item.firstName} ${item.lastName}`,
          }}
          width={150}
        />
        <Column
          dataField="date"
          caption="Tarih"
          dataType="date"
          format="dd/MM/yyyy"
          width={120}
        />
        <Column
          dataField="total"
          caption="Toplam"
          dataType="number"
          format="currency"
          width={120}
        />
        <Column
          caption="Ürün Sayısı"
          calculateCellValue={(data: Siparis) => data.products.length}
          width={100}
        />
      </DataGrid>

      <Popup
        visible={urunFotoPopup}
        onHiding={() => setUrunFotoPopup(false)}
        showTitle={true}
        title="Ürün Fotoğrafı"
        width={600}
        height={600}
      >
        <div className="flex items-center justify-center h-full p-4">
          <img
            src={seciliUrunFoto}
            alt="Ürün Fotoğrafı"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </Popup>
    </div>
  );
}
