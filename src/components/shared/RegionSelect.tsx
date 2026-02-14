import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RegionData {
  id: string;
  name: string;
  code: string;
}

interface RegionSelectProps {
  provinceId?: string;
  regencyId?: string;
  districtId?: string;
  villageId?: string;
  onProvinceChange: (id: string, name: string) => void;
  onRegencyChange: (id: string, name: string) => void;
  onDistrictChange?: (id: string, name: string) => void;
  onVillageChange?: (id: string, name: string) => void;
  showDistrict?: boolean;
  showVillage?: boolean;
  disabled?: boolean;
}

export function RegionSelect({
  provinceId = '',
  regencyId = '',
  districtId = '',
  villageId = '',
  onProvinceChange,
  onRegencyChange,
  onDistrictChange,
  onVillageChange,
  showDistrict = false,
  showVillage = false,
  disabled = false,
}: RegionSelectProps) {
  const [provinces, setProvinces] = useState<RegionData[]>([]);
  const [regencies, setRegencies] = useState<RegionData[]>([]);
  const [districts, setDistricts] = useState<RegionData[]>([]);
  const [villages, setVillages] = useState<RegionData[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingRegencies, setLoadingRegencies] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  useEffect(() => {
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (provinceId) {
      fetchRegencies(provinceId);
    } else {
      setRegencies([]);
      setDistricts([]);
      setVillages([]);
    }
  }, [provinceId]);

  useEffect(() => {
    if (regencyId && showDistrict) {
      fetchDistricts(regencyId);
    } else {
      setDistricts([]);
      setVillages([]);
    }
  }, [regencyId, showDistrict]);

  useEffect(() => {
    if (districtId && showVillage) {
      fetchVillages(districtId);
    } else {
      setVillages([]);
    }
  }, [districtId, showVillage]);

  const fetchProvinces = async () => {
    setLoadingProvinces(true);
    const { data } = await supabase
      .from('provinces')
      .select('id, name, code')
      .eq('is_active', true)
      .order('name');
    setProvinces(data || []);
    setLoadingProvinces(false);
  };

  const fetchRegencies = async (provId: string) => {
    setLoadingRegencies(true);
    const { data } = await supabase
      .from('regencies')
      .select('id, name, code')
      .eq('province_id', provId)
      .eq('is_active', true)
      .order('name');
    setRegencies(data || []);
    setLoadingRegencies(false);
  };

  const fetchDistricts = async (regId: string) => {
    setLoadingDistricts(true);
    const { data } = await supabase
      .from('districts')
      .select('id, name, code')
      .eq('regency_id', regId)
      .eq('is_active', true)
      .order('name');
    setDistricts(data || []);
    setLoadingDistricts(false);
  };

  const fetchVillages = async (distId: string) => {
    setLoadingVillages(true);
    const { data } = await supabase
      .from('villages')
      .select('id, name, code')
      .eq('district_id', distId)
      .eq('is_active', true)
      .order('name');
    setVillages(data || []);
    setLoadingVillages(false);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Provinsi *</Label>
        <Select
          value={provinceId}
          onValueChange={(val) => {
            const prov = provinces.find(p => p.id === val);
            onProvinceChange(val, prov?.name || '');
          }}
          disabled={disabled || loadingProvinces}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingProvinces ? 'Memuat...' : 'Pilih provinsi'} />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Kabupaten/Kota *</Label>
        <Select
          value={regencyId}
          onValueChange={(val) => {
            const reg = regencies.find(r => r.id === val);
            onRegencyChange(val, reg?.name || '');
          }}
          disabled={disabled || !provinceId || loadingRegencies}
        >
          <SelectTrigger>
            <SelectValue placeholder={
              loadingRegencies ? 'Memuat...' : 
              !provinceId ? 'Pilih provinsi dulu' : 'Pilih kabupaten/kota'
            } />
          </SelectTrigger>
          <SelectContent>
            {regencies.map((r) => (
              <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showDistrict && (
        <div className="space-y-2">
          <Label>Kecamatan</Label>
          <Select
            value={districtId}
            onValueChange={(val) => {
              const dist = districts.find(d => d.id === val);
              onDistrictChange?.(val, dist?.name || '');
            }}
            disabled={disabled || !regencyId || loadingDistricts}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                loadingDistricts ? 'Memuat...' :
                !regencyId ? 'Pilih kab/kota dulu' : 'Pilih kecamatan'
              } />
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showVillage && (
        <div className="space-y-2">
          <Label>Desa/Kelurahan</Label>
          <Select
            value={villageId}
            onValueChange={(val) => {
              const vil = villages.find(v => v.id === val);
              onVillageChange?.(val, vil?.name || '');
            }}
            disabled={disabled || !districtId || loadingVillages}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                loadingVillages ? 'Memuat...' :
                !districtId ? 'Pilih kecamatan dulu' : 'Pilih desa/kelurahan'
              } />
            </SelectTrigger>
            <SelectContent>
              {villages.map((v) => (
                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
