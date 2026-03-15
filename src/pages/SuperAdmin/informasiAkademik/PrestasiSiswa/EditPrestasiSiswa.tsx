import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, Loader2Icon, SaveIcon } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";
import {
  Select, SelectContent, SelectGroup, SelectItem,
  SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface SiswaSelect {
  siswa_id: number;
  nama_siswa: string;
  nisn: string;
  nis: string;
}

interface TahunAkademikSelect {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: "aktif" | "arsip";
}

interface FormErrors {
  siswa_id?: string[];
  tahun_akademik_id?: string[];
  prestasi_diraih?: string[];
}

const EditPrestasiSiswa = () => {
  const { id } = useParams<{ id: string }>(); // prestasi_id
  const navigate  = useNavigate();
  const location  = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [loading, setLoading] = useState(false);

  const [siswaList, setSiswaList] = useState<SiswaSelect[]>([]);
  const [tahunList, setTahunList] = useState<TahunAkademikSelect[]>([]);

  const [formData, setFormData] = useState({
    siswa_id:           "",
    tahun_akademik_id:  "",
    prestasi_diraih:    "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // ── Load data-select + pre-fill dari state navigasi ───────
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingSelect(true);
        const res = await api.get("/spa/data-select/siswa/prestasi");
        if (res.data.status === "success") {
          setSiswaList(res.data.data.siswa ?? []);
          setTahunList(res.data.data.tahun_akademik ?? []);
        }
      } catch {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Tidak dapat memuat data pilihan.",
        });
      } finally {
        setLoadingSelect(false);
      }
    };
    load();

    // Pre-fill dari state yang dikirim saat navigate
    const state = location.state as {
      siswa_id?: number;
      tahun_akademik_id?: number;
      prestasi_diraih?: string;
    } | null;

    if (state?.siswa_id) {
      setFormData({
        siswa_id:          String(state.siswa_id),
        tahun_akademik_id: String(state.tahun_akademik_id ?? ""),
        prestasi_diraih:   state.prestasi_diraih ?? "",
      });
    }
  }, []);

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Validasi sederhana frontend
    const newErrors: FormErrors = {};
    if (!formData.siswa_id)          newErrors.siswa_id          = ["Siswa wajib dipilih"];
    if (!formData.tahun_akademik_id) newErrors.tahun_akademik_id = ["Tahun akademik wajib dipilih"];
    if (!formData.prestasi_diraih.trim()) newErrors.prestasi_diraih = ["Prestasi wajib diisi"];
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      const res = await api.put(`/spa/prestasi/${id}`, {
        siswa_id:          Number(formData.siswa_id),
        tahun_akademik_id: Number(formData.tahun_akademik_id),
        prestasi_diraih:   formData.prestasi_diraih.trim(),
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data prestasi siswa berhasil diperbarui.",
          showConfirmButton: false,
          timer: 1800,
        });
        navigate("/superadmin/informasi-akademik/prestasi-siswa");
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {});
        return;
      }
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: err.response?.data?.message ?? "Terjadi kesalahan.",
      });
    } finally {
      setLoading(false);
    }
  };

  const siswaSelected = siswaList.find(
    s => String(s.siswa_id) === formData.siswa_id
  );

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Edit Prestasi Siswa" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Prestasi Siswa</h1>

          {loadingSelect ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <div className="bg-white rounded shadow p-5 max-w-lg">
              <form className="space-y-5" onSubmit={handleSubmit}>

                {/* Pilih Siswa */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-sm">
                    Pilih Siswa <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.siswa_id}
                    onValueChange={v => setFormData({ ...formData, siswa_id: v })}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Pilih Siswa --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Siswa</SelectLabel>
                        {siswaList.map(s => (
                          <SelectItem key={s.siswa_id} value={String(s.siswa_id)}>
                            {s.nama_siswa} — {s.nis}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.siswa_id && (
                    <p className="text-red-500 text-xs">{errors.siswa_id[0]}</p>
                  )}
                  {siswaSelected && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded px-3 py-2 text-xs text-indigo-700">
                      NISN: {siswaSelected.nisn} · NIS: {siswaSelected.nis}
                    </div>
                  )}
                </div>

                {/* Tahun Akademik */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-sm">
                    Tahun Akademik <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.tahun_akademik_id}
                    onValueChange={v => setFormData({ ...formData, tahun_akademik_id: v })}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Pilih Tahun Akademik --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Tahun Akademik</SelectLabel>
                        {tahunList.map(t => (
                          <SelectItem
                            key={t.tahun_akademik_id}
                            value={String(t.tahun_akademik_id)}
                          >
                            {t.tahun_akademik}
                            {t.status_tahun_akademik === "aktif" && " (Aktif)"}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.tahun_akademik_id && (
                    <p className="text-red-500 text-xs">{errors.tahun_akademik_id[0]}</p>
                  )}
                </div>

                {/* Prestasi Diraih */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-sm">
                    Prestasi Diraih <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.prestasi_diraih}
                    onChange={e =>
                      setFormData({ ...formData, prestasi_diraih: e.target.value })
                    }
                    disabled={loading}
                    rows={4}
                    className="border border-gray-300 p-2 w-full rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                    placeholder="Contoh: Juara 1 Lomba Matematika Nasional"
                  />
                  {errors.prestasi_diraih && (
                    <p className="text-red-500 text-xs">{errors.prestasi_diraih[0]}</p>
                  )}
                </div>

                {/* Tombol */}
                <div className="flex gap-2 pt-1">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-primary flex items-center gap-2"
                  >
                    {loading
                      ? <><Loader2Icon size={16} className="animate-spin" /> Menyimpan...</>
                      : <><SaveIcon size={16} /> Simpan Perubahan</>}
                  </Button>
                  <Link to="/superadmin/informasi-akademik/prestasi-siswa">
                    <Button
                      type="button"
                      className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90"
                    >
                      <CircleXIcon size={16} /> Batal
                    </Button>
                  </Link>
                </div>
              </form>
            </div>
          )}
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default EditPrestasiSiswa;