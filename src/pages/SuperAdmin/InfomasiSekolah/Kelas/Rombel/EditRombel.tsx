/**
 * EditRombel — Dipanggil dari DetailKelas via:
 *   /superadmin/informasi-sekolah/rombel/edit/:id
 *     ?kelas_id=X&nama_kelas=Y
 *     &nama_rombel=Z&jurusan_id=W&status=aktif
 *     &back_kelas_id=X   (untuk navigate back)
 *
 * FIX dari versi lama:
 * - show() RombelController butuh tahun_akademik_id → TIDAK dipakai
 * - Data prefill dikirim via query param dari DetailKelas
 * - dataSelect /spa/data-select/rombel hanya return jurusan (kelas dikomentar)
 * - Navigate back ke DetailKelas
 */
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { ArrowLeft, CircleXIcon, FilePenLine, Loader2Icon } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

// ── Types ────────────────────────────────────────────────────────────────────
interface JurusanOption {
  jurusan_id: number;
  nama_jurusan: string;
}

interface FormErrors {
  kelas_id?: string[];
  nama_rombel?: string[];
  jurusan_id?: string[];
  status?: string[];
  pesan?: string[];
}

const EditRombel = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Query params yang dikirim dari DetailKelas
  const backKelasId = searchParams.get("back_kelas_id") ?? searchParams.get("kelas_id") ?? "";
  const namaKelas = searchParams.get("nama_kelas") ?? "";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [jurusanOptions, setJurusanOptions] = useState<JurusanOption[]>([]);

  // Pre-fill dari query param — fallback ke string kosong
  const [formData, setFormData] = useState({
    nama_rombel: searchParams.get("nama_rombel") ?? "",
    jurusan_id: searchParams.get("jurusan_id") ?? "",
    status: searchParams.get("status") ?? "aktif",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // ── Validasi param ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id || !backKelasId) {
      Swal.fire({
        icon: "warning",
        title: "Akses tidak valid",
        text: "Silakan buka halaman ini dari Detail Kelas.",
      });
      navigate("/superadmin/informasi-sekolah/kelas");
    }
  }, [id, backKelasId]);

  // ── Fetch jurusan dropdown ────────────────────────────────────────────────
  useEffect(() => {
    const fetchSelect = async () => {
      try {
        setLoadingSelect(true);
        const res = await api.get("/spa/data-select/rombel");
        if (res.data.status === "success") {
          setJurusanOptions(res.data.data?.jurusan ?? []);
        }
      } catch {
        setJurusanOptions([]);
      } finally {
        setLoadingSelect(false);
      }
    };
    fetchSelect();
  }, []);

  const backUrl = `/superadmin/informasi-sekolah/kelas/${backKelasId}`;

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!formData.nama_rombel.trim()) {
      setErrors({ nama_rombel: ["Nama rombel wajib diisi"] });
      return;
    }

    setLoading(true);
    try {
      const res = await api.put(`/spa/rombel/${id}`, {
        nama_rombel: formData.nama_rombel,
        jurusan_id: formData.jurusan_id ? Number(formData.jurusan_id) : null,
        status: formData.status,
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data rombel berhasil diperbarui.",
          showConfirmButton: false,
          timer: 1800,
        });
        navigate(backUrl);
      }
    } catch (err: any) {
      const status = err.response?.status;
      const errData = err.response?.data;

      if (status === 422 && errData?.errors) {
        // Duplikasi nama rombel
        if (errData.errors.nama_rombel) {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat disimpan!",
            text: Array.isArray(errData.errors.nama_rombel) ? errData.errors.nama_rombel[0] : errData.errors.nama_rombel,
          });
          return;
        }
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
        <PageTitle title="Edit Rombel" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(backUrl)}>
              <ArrowLeft size={16} />
            </Button>
            <h1 className="text-3xl font-bold">Edit Rombel</h1>
          </div>

          <div className="bg-white rounded shadow p-5">
            {loadingSelect ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                <Loader2Icon className="animate-spin mb-2" size={28} />
                <p className="text-lg font-medium">Memuat form...</p>
              </div>
            ) : (
              <form className="space-y-5 max-w-lg w-full" onSubmit={handleSubmit}>
                {/* Info Kelas — read only */}
                <div className="bg-indigo-50 border border-indigo-200 rounded p-3 text-sm">
                  <p className="text-indigo-700 font-medium">Kelas</p>
                  <p className="text-indigo-900 font-semibold text-base mt-0.5">{namaKelas || `Kelas ID: ${backKelasId}`}</p>
                  <p className="text-indigo-500 text-xs mt-0.5">Kelas tidak dapat diubah</p>
                </div>

                {/* Nama Rombel */}
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Nama Rombel <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: X-A-1"
                    value={formData.nama_rombel}
                    onChange={(e) => {
                      setFormData({ ...formData, nama_rombel: e.target.value });
                      setErrors({ ...errors, nama_rombel: undefined });
                    }}
                    className={`border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-primary ${errors.nama_rombel ? "border-red-500" : ""}`}
                  />
                  {errors.nama_rombel && <p className="text-red-500 text-sm mt-1">{errors.nama_rombel[0]}</p>}
                </div>

                {/* Jurusan */}
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Jurusan <span className="text-gray-400 text-sm font-normal">(opsional)</span>
                  </label>
                  <Select value={formData.jurusan_id || "none"} onValueChange={(v) => setFormData({ ...formData, jurusan_id: v === "none" ? "" : v })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- pilih jurusan --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Jurusan</SelectLabel>
                        <SelectItem value="none">Tidak ada jurusan</SelectItem>
                        {jurusanOptions.map((j) => (
                          <SelectItem key={j.jurusan_id} value={String(j.jurusan_id)}>
                            {j.nama_jurusan}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.jurusan_id && <p className="text-red-500 text-sm mt-1">{errors.jurusan_id[0]}</p>}
                </div>

                {/* Status */}
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="aktif">Aktif</SelectItem>
                        <SelectItem value="arsip">Arsip</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status[0]}</p>}
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
            )}
          </div>
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default EditRombel;
