"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TabPanel, { Item as TabItem } from 'devextreme-react/tab-panel';
import Form, {
  Item,
  Label,
  RequiredRule,
  EmailRule,
  GroupItem,
  SimpleItem,
} from 'devextreme-react/form';
import Button from 'devextreme-react/button';
import { kullaniciService, Kullanici } from '@/lib/data';
import notify from 'devextreme/ui/notify';

export default function KullaniciFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id ? (params.id === 'yeni' ? null : Number(params.id)) : null;
  const [formData, setFormData] = useState<Partial<Kullanici>>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      city: '',
      street: '',
    },
    grupTanimi: '',
    departman: '',
    admin: false,
    temsilci: false,
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        try {
          const kullanici = await kullaniciService.getById(id);
          if (kullanici) {
            setFormData(kullanici);
          } else {
            notify('Kullanıcı bulunamadı', 'error', 3000);
            router.push('/kullanicilar');
          }
        } catch (error) {
          notify('Kullanıcı yüklenirken hata oluştu', 'error', 3000);
          router.push('/kullanicilar');
        }
      }
      setInitialLoading(false);
    };
    loadData();
  }, [id, router]);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      if (id) {
        const updated = await kullaniciService.update(id, formData);
        if (updated) {
          notify('Kullanıcı başarıyla güncellendi', 'success', 3000);
          router.push('/kullanicilar');
        } else {
          notify('Kullanıcı güncellenirken hata oluştu', 'error', 3000);
        }
      } else {
        const created = await kullaniciService.create(formData as Omit<Kullanici, 'id'>);
        if (created) {
          notify('Kullanıcı başarıyla oluşturuldu', 'success', 3000);
          router.push('/kullanicilar');
        } else {
          notify('Kullanıcı oluşturulurken hata oluştu', 'error', 3000);
        }
      }
    } catch (error) {
      notify('Bir hata oluştu', 'error', 3000);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/kullanicilar');
  };

  const handleDelete = async () => {
    if (!id) return;
    
    const result = confirm('Bu kullanıcı silinecek. Emin misiniz?');
    if (result) {
      try {
        const deleted = await kullaniciService.delete(id);
        if (deleted) {
          notify('Kullanıcı başarıyla silindi', 'success', 3000);
          router.push('/kullanicilar');
        } else {
          notify('Kullanıcı silinirken hata oluştu', 'error', 3000);
        }
      } catch (error) {
        notify('Bir hata oluştu', 'error', 3000);
      }
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Yükleniyor...</div>
      </div>
    );
  }

  const grupSecenekleri = [
    'GENEL MÜDÜR',
    'MUHASEBE ELEMANI',
    'SATIŞ ELEMANI',
    'DEPO SORUMLUSU',
  ];

  const departmanSecenekleri = [
    'Yönetim',
    'Satın Alma',
    'Üretim',
    'Satış',
    'Muhasebe',
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Kullanıcı Bilgileri</h1>
        <div className="flex gap-2">
          <Button
            icon="plus"
            stylingMode="contained"
            type="default"
            onClick={() => router.push('/kullanicilar/yeni')}
            hint="Yeni"
          />
          <Button
            icon="save"
            stylingMode="contained"
            type="success"
            onClick={handleSubmit}
            disabled={loading}
            hint="Kaydet"
          />
          {id && (
            <Button
              icon="trash"
              stylingMode="contained"
              type="danger"
              onClick={handleDelete}
              hint="Sil"
            />
          )}
          <Button
            icon="print"
            stylingMode="contained"
            type="default"
            onClick={() => window.print()}
            hint="Yazdır"
          />
          <Button
            icon="preferences"
            stylingMode="contained"
            type="default"
            hint="Ayarlar"
          />
          <Button
            icon="menu"
            stylingMode="contained"
            type="default"
            hint="Menü"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <TabPanel
          height={600}
          dataSource={[
            { title: 'Kullanıcı Bilgileri', content: 'kullanici' },
            { title: 'Şirket Şube', content: 'sirket' },
            { title: 'Depo', content: 'depo' },
            { title: 'Departman Yetkileri', content: 'yetkiler' },
          ]}
          itemTitleRender={(item) => item.title}
        >
          <TabItem title="Kullanıcı Bilgileri">
            <div className="p-6">
              <Form
                formData={formData}
                onFieldDataChanged={(e) => {
                  if (e.dataField) {
                    if (e.dataField.startsWith('address.')) {
                      const field = e.dataField.replace('address.', '');
                      setFormData((prev) => ({
                        ...prev,
                        address: {
                          ...(prev.address || { city: '', street: '' }),
                          [field]: e.value,
                        },
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        [e.dataField]: e.value,
                      }));
                    }
                  }
                }}
                colCount={2}
              >
                <GroupItem colSpan={2}>
                  <Item dataField="firstName" editorType="dxTextBox" colSpan={1}>
                    <Label text="Ad *" />
                    <RequiredRule message="Ad gereklidir" />
                  </Item>
                  <Item dataField="lastName" editorType="dxTextBox" colSpan={1}>
                    <Label text="Soyad *" />
                    <RequiredRule message="Soyad gereklidir" />
                  </Item>
                </GroupItem>

                <GroupItem colSpan={2}>
                  <Item
                    dataField="grupTanimi"
                    editorType="dxSelectBox"
                    colSpan={1}
                    editorOptions={{
                      dataSource: grupSecenekleri,
                      searchEnabled: true,
                    }}
                  >
                    <Label text="Rol *" />
                    <RequiredRule message="Rol gereklidir" />
                  </Item>
                  <Item
                    dataField="departman"
                    editorType="dxSelectBox"
                    colSpan={1}
                    editorOptions={{
                      dataSource: departmanSecenekleri,
                      searchEnabled: true,
                    }}
                  >
                    <Label text="Departman *" />
                    <RequiredRule message="Departman gereklidir" />
                  </Item>
                </GroupItem>

                <GroupItem colSpan={2}>
                  <Item dataField="username" editorType="dxTextBox" colSpan={1}>
                    <Label text="Kullanıcı Adı *" />
                    <RequiredRule message="Kullanıcı adı gereklidir" />
                  </Item>
                  <Item dataField="email" editorType="dxTextBox" colSpan={1}>
                    <Label text="Email Adresi *" />
                    <RequiredRule message="E-posta gereklidir" />
                    <EmailRule message="Geçerli bir e-posta adresi giriniz" />
                  </Item>
                </GroupItem>

                <GroupItem colSpan={2}>
                  <Item dataField="phone" editorType="dxTextBox" colSpan={1}>
                    <Label text="Telefon" />
                  </Item>
                  <Item dataField="password" editorType="dxTextBox" colSpan={1} editorOptions={{ mode: 'password' }}>
                    <Label text="Şifre" />
                  </Item>
                </GroupItem>

                <GroupItem colSpan={2} caption="Yetkiler">
                  <Item
                    dataField="admin"
                    editorType="dxCheckBox"
                    colSpan={1}
                    label={{ text: 'Admin' }}
                  />
                  <Item
                    dataField="temsilci"
                    editorType="dxCheckBox"
                    colSpan={1}
                    label={{ text: 'Temsilci' }}
                  />
                  <Item
                    dataField="tumSubeleriGorebilir"
                    editorType="dxCheckBox"
                    colSpan={1}
                    label={{ text: 'Tüm Şubeleri Görebilir' }}
                  />
                  <Item
                    dataField="satisTemsilcisi"
                    editorType="dxCheckBox"
                    colSpan={1}
                    label={{ text: 'Satış Temsilcisi' }}
                  />
                  <Item
                    dataField="stokMaliyetleriniGorur"
                    editorType="dxCheckBox"
                    colSpan={1}
                    label={{ text: 'Stok Maliyetlerini Görür' }}
                  />
                  <Item
                    dataField="kisitliFinansKullanicisi"
                    editorType="dxCheckBox"
                    colSpan={1}
                    label={{ text: 'Kısıtlı Finans Kullanıcısı' }}
                  />
                </GroupItem>
              </Form>
            </div>
          </TabItem>

          <TabItem title="Şirket Şube">
            <div className="p-6">
              <p>Şirket Şube bilgileri buraya gelecek</p>
            </div>
          </TabItem>

          <TabItem title="Depo">
            <div className="p-6">
              <p>Depo bilgileri buraya gelecek</p>
            </div>
          </TabItem>

          <TabItem title="Departman Yetkileri">
            <div className="p-6">
              <p>Departman yetkileri buraya gelecek</p>
            </div>
          </TabItem>
        </TabPanel>
      </div>
    </div>
  );
}
