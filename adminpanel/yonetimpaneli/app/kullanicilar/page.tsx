"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DataGrid, {
  Column,
  Paging,
  Pager,
  Editing,
  Selection,
  Toolbar,
  Item,
  Export,
  SearchPanel,
  LoadPanel,
} from 'devextreme-react/data-grid';
import Button from 'devextreme-react/button';
import { kullaniciService, Kullanici } from '@/lib/data';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';

export default function KullanicilarPage() {
  const router = useRouter();
  const [kullanicilar, setKullanicilar] = useState<Kullanici[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const loadKullanicilar = useCallback(async () => {
    try {
      setLoading(true);
      const data = await kullaniciService.getAll();
      setKullanicilar(data);
    } catch (error) {
      notify('Kullanıcılar yüklenirken hata oluştu', 'error', 3000);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKullanicilar();
  }, [loadKullanicilar]);

  const handleAdd = () => {
    router.push('/kullanicilar/yeni');
  };

  const handleEdit = (e: any) => {
    const id = e.row?.data?.id || e.selectedRowsData?.[0]?.id;
    if (id) {
      router.push(`/kullanicilar/${id}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async () => {
    if (selectedRowKeys.length === 0) {
      notify('Lütfen silmek için kullanıcı seçiniz', 'warning', 3000);
      return;
    }

    const result = await confirm(
      `Seçili ${selectedRowKeys.length} kullanıcı silinecek. Emin misiniz?`,
      'Kullanıcı Silme'
    );

    if (result) {
      try {
        for (const id of selectedRowKeys) {
          await kullaniciService.delete(id);
        }
        notify('Kullanıcılar başarıyla silindi', 'success', 3000);
        await loadKullanicilar();
        setSelectedRowKeys([]);
      } catch (error) {
        notify('Kullanıcılar silinirken hata oluştu', 'error', 3000);
      }
    }
  };

  const handleRowRemoving = async (e: any) => {
    const result = await confirm(
      'Bu kullanıcı silinecek. Emin misiniz?',
      'Kullanıcı Silme'
    );

    if (!result) {
      e.cancel = true;
    }
  };

  const handleRowRemoved = async () => {
    await loadKullanicilar();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Kullanıcılar</h1>
      </div>

      <DataGrid
        dataSource={loading ? [] : kullanicilar}
        keyExpr="id"
        showBorders={true}
        columnAutoWidth={true}
        allowColumnReordering={true}
        selectedRowKeys={selectedRowKeys}
        onSelectionChanged={(e) => setSelectedRowKeys(e.selectedRowKeys as number[])}
        onRowRemoving={handleRowRemoving}
        onRowRemoved={handleRowRemoved}
        onRowDblClick={handleEdit}
      >
        <LoadPanel enabled={loading} showIndicator={true} showPane={true} />
        <Selection mode="multiple" />
        <Editing
          mode="row"
          allowDeleting={true}
        />
        <Toolbar>
          <Item location="before">
            <Button
              text="Yeni"
              icon="plus"
              stylingMode="contained"
              type="default"
              onClick={handleAdd}
            />
          </Item>
          <Item location="before">
            <Button
              text="Düzenle"
              icon="edit"
              stylingMode="contained"
              type="default"
              onClick={handleEdit}
              disabled={selectedRowKeys.length !== 1}
            />
          </Item>
          <Item location="before">
            <Button
              text="Yazdır"
              icon="print"
              stylingMode="contained"
              type="default"
              onClick={handlePrint}
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
        <Column
          caption="Ad - Soyad"
          calculateCellValue={(data: Kullanici) => `${data.firstName} ${data.lastName}`}
          width={200}
        />
        <Column
          dataField="kullaniciNo"
          caption="Kullanıcı No"
          width={120}
        />
        <Column
          dataField="username"
          caption="Kullanıcı Adı"
          width={150}
        />
        <Column
          dataField="grupTanimi"
          caption="Grup Tanımı"
          width={180}
        />
        <Column
          dataField="departman"
          caption="Departman"
          width={150}
        />
        <Column
          dataField="admin"
          caption="Admin"
          dataType="boolean"
          width={80}
        />
        <Column
          dataField="temsilci"
          caption="Temsilci"
          dataType="boolean"
          width={100}
        />
        <Column
          type="buttons"
          width={100}
          buttons={[
            {
              name: 'edit',
              icon: 'edit',
              hint: 'Düzenle',
              onClick: handleEdit,
            },
            'delete',
          ]}
        />
      </DataGrid>
    </div>
  );
}
