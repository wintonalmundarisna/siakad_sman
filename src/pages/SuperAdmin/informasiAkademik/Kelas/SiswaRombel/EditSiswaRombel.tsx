/**
 * EditSiswaRombel — Dipanggil dari DetailTahunAktifRombel via:
 *   /superadmin/informasi-akademik/siswa-rombel/edit/:id
 *     ?rombel_id=X&nama_rombel=Y&nama_siswa=Z&status_akhir=W&catatan=V
 *
 * :id = siswa_rombel record ID
 *
 * FIX dari versi lama:
 * - Tidak pakai router.state (fragile)
 * - Semua prefill dari query params
 * - Body PUT: { status_akhir?, catatan? }
 * - Navigate back ke DetailTahunAktifRombel
 */
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CircleXIcon, FilePenLine } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";
import {
  Select, SelectContent, SelectGroup,
  SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// ── Types ────────────────────────────────────────────────────────────────────
type StatusAkhir =
  | "naik_kelas" | "tinggal_kelas" | "pindah"
  | "pindahan"   | "berhenti"      | "diberhentikan" | "lulus";

const STATUS_AKHIR_LABEL: Record<StatusAkhir, string> = {
  naik_kelas:     "Naik Kelas",
  tinggal_kelas:  "Tinggal Kelas",
  pindah:         "Pindah",
  pindahan:       "Pindahan",
  berhenti:       "Berhenti",
  diberhentikan:  "Diberhentikan",
  lulus:          "Lulus",
};

const STATUS_AKHIR_OPTIONS = Object.keys(STATUS_AKHIR_LABEL) as StatusAkhir[];

interface FormErrors {
  status_akhir?: string[];
  catatan?:      string[];
}

const EditSiswaRombel = () => {
  const { id }         = useParams<{ id: string }>(); // siswa_rombel record ID
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();

  // Query params dari DetailTahunAktifRombel
  const rombelId    = searchParams.get("rombel_id")    ?? "";
  const namaRombel  = searchParams.get("nama_rombel")  ?? "";
  const namaSiswa   = searchParams.get("nama_siswa")   ?? "";
  const initStatus  = (searchParams.get("status_akhir") ?? "") as StatusAkhir | "";
  const initCatatan = searchParams.get("catatan") ?? "";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading]         = useState(false);

  const [formData, setFormData] = useState({
    status_akhir: initStatus as StatusAkhir | "",
    catatan:      initCatatan,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const backUrl = `/superadmin/informasi-akademik/rombel/aktif/${rombelId}`;

  // ── Validasi ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id || !rombelId) {
      Swal.fire({
        icon: "warning",
        title: "Akses tidak valid",
        text: "Silakan buka halaman ini dari Detail Rombel.",
      });
      navigate("/superadmin/informasi-akademik/kelas");
    }
  }, [id, rombelId]);

  // ── Submit ────────────────────────────────────────────────────────────────
  // PUT /spa/siswa-rombel/{id} → body: { status_akhir?, catatan? }
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await api.put(`/spa/siswa-rombel/${id}`, {
        status_akhir: formData.status_akhir || null,
        catatan:      formData.catatan      || null,
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data siswa rombel berhasil diperbarui.",
          showConfirmButton: false,
          timer: 1800,
        });
        navigate(backUrl);
      }
    } catch (err: any) {
      const status  = err.response?.status;
      const errData = err.response?.data;

      if (status === 422 && errData?.errors) {
        setErrors(errData.errors);
      } else if (status === 404) {
        Swal.fire({ icon: "error", title: "Data tidak ditemukan!" });
        navigate(backUrl);
      } else {
        Swal.fire({
          icon: "error",
          title: "Koneksi gagal!",
          text: errData?.message || "Tidak dapat terhubung ke server.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Edit Siswa Rombel" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(backUrl)}>
              <ArrowLeft size={16} />
              Kembali
            </Button>
            <h1 className="text-3xl font-bold">Edit Siswa Rombel</h1>
          </div>

          <div className="bg-white rounded shadow p-5">
            <form className="space-y-5 max-w-lg w-full" onSubmit={handleSubmit}>
              {/* Card info saat ini */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
                <h3 className="text-sm font-semibold text-indigo-900 mb-3">📋 Data Saat Ini</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-indigo-700 font-medium block">Siswa</span>
                    <span className="text-indigo-900 font-semibold">{namaSiswa || "-"}</span>
                  </div>
                  <div>
                    <span className="text-indigo-700 font-medium block">Rombel</span>
                    <span className="text-indigo-900 font-semibold">{namaRombel || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Status Akhir */}
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Status Akhir <span className="text-gray-400 text-sm font-normal">(opsional)</span>
                </label>
                <Select value={formData.status_akhir || "none"} onValueChange={(v) => setFormData({ ...formData, status_akhir: v === "none" ? "" : (v as StatusAkhir) })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- pilih status akhir --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Status Akhir Siswa di Rombel Ini</SelectLabel>
                      <SelectItem value="none">— kosongkan status —</SelectItem>
                      {STATUS_AKHIR_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_AKHIR_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.status_akhir && <p className="text-red-500 text-sm mt-1">{errors.status_akhir[0]}</p>}
              </div>

              {/* Catatan */}
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Catatan <span className="text-gray-400 text-sm font-normal">(opsional)</span>
                </label>
                <Textarea rows={3} placeholder="Tulis catatan untuk siswa di rombel ini..." value={formData.catatan} onChange={(e) => setFormData({ ...formData, catatan: e.target.value })} className="w-full" />
                {errors.catatan && <p className="text-red-500 text-sm mt-1">{errors.catatan[0]}</p>}
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                <p className="font-semibold mb-1">ℹ️ Informasi:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Hanya <strong>status akhir</strong> dan <strong>catatan</strong> yang dapat diubah
                  </li>
                  <li>Untuk mengganti siswa, hapus data ini dan tambah ulang</li>
                </ul>
              </div>

              {/* Tombol */}
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                  <FilePenLine size={18} />
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
                <Button type="button" className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90" onClick={() => navigate(backUrl)}>
                  <CircleXIcon size={18} /> Batal
                </Button>
              </div>
            </form>
          </div>
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default EditSiswaRombel;