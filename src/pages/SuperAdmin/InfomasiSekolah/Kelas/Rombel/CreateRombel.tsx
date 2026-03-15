/**
 * CreateRombel — Dipanggil dari DetailKelas via:
 *   /superadmin/informasi-sekolah/rombel/create?kelas_id=X&nama_kelas=Y
 *
 * FIX dari versi lama:
 * - dataSelect /spa/data-select/rombel hanya return jurusan (kelas dikomentari backend)
 * - Kelas di-prefill dari query param → tidak perlu dropdown kelas
 * - Navigate back ke DetailKelas setelah berhasil
 */
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { ArrowLeft, CircleXIcon, FilePlus, Loader2Icon } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";
import {
  Select, SelectContent, SelectGroup,
  SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// ── Types ────────────────────────────────────────────────────────────────────
interface JurusanOption {
  jurusan_id: number;
  nama_jurusan: string;
}

interface FormErrors {
  kelas_id?: string[];
  nama_rombel?: string[];
  jurusan_id?: string[];
  pesan?: string[];        // backend: duplikasi
}

const CreateRombel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Ambil dari query param yang dikirim DetailKelas
  const kelasId   = searchParams.get("kelas_id")   ?? "";
  const namaKelas = searchParams.get("nama_kelas")  ?? "";

  const [isCollapsed, setIsCollapsed]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [jurusanOptions, setJurusanOptions] = useState<JurusanOption[]>([]);

  const [formData, setFormData] = useState({
    nama_rombel: "",
    jurusan_id:  "",      // opsional
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // ── Validasi query param ──────────────────────────────────────────────────
  useEffect(() => {
    if (!kelasId) {
      Swal.fire({
        icon: "warning",
        title: "Akses tidak valid",
        text: "Silakan buka halaman ini dari Detail Kelas.",
      });
      navigate("/superadmin/informasi-sekolah/kelas");
    }
  }, [kelasId]);

  // ── Fetch jurusan untuk dropdown ──────────────────────────────────────────
  // Backend /spa/data-select/rombel hanya return { jurusan: [...] }
  useEffect(() => {
    const fetchSelect = async () => {
      try {
        setLoadingSelect(true);
        const res = await api.get("/spa/data-select/rombel");
        if (res.data.status === "success") {
          setJurusanOptions(res.data.data?.jurusan ?? []);
        }
      } catch {
        // Jurusan opsional — form tetap bisa jalan meski gagal
        setJurusanOptions([]);
      } finally {
        setLoadingSelect(false);
      }
    };
    fetchSelect();
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Validasi frontend
    if (!formData.nama_rombel.trim()) {
      setErrors({ nama_rombel: ["Nama rombel wajib diisi"] });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/spa/rombel", {
        kelas_id:    Number(kelasId),
        nama_rombel: formData.nama_rombel,
        jurusan_id:  formData.jurusan_id ? Number(formData.jurusan_id) : null,
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Rombel berhasil ditambahkan.",
          showConfirmButton: false,
          timer: 1800,
        });
        // Kembali ke DetailKelas
        navigate(`/superadmin/informasi-sekolah/kelas/${kelasId}`);
      }
    } catch (err: any) {
      const status  = err.response?.status;
      const errData = err.response?.data;

      if ((status === 400 || status === 422) && errData?.errors) {
        // Duplikasi — backend kirim errors.pesan
        if (errData.errors.pesan) {
          Swal.fire({
            icon: "warning",
            title: "Gagal!",
            text: Array.isArray(errData.errors.pesan)
              ? errData.errors.pesan[0]
              : errData.errors.pesan,
          });
          return;
        }
        setErrors(errData.errors);
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
        <PageTitle title="Tambah Rombel" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm"
              onClick={() => navigate(`/superadmin/informasi-sekolah/kelas/${kelasId}`)}>
              <ArrowLeft size={16} />
            </Button>
            <h1 className="text-3xl font-bold">Tambah Rombel</h1>
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
                  <p className="text-indigo-700 font-medium">Kelas Tujuan</p>
                  <p className="text-indigo-900 font-semibold text-base mt-0.5">{namaKelas || `Kelas ID: ${kelasId}`}</p>
                </div>

                {/* Nama Rombel */}
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Nama Rombel <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: X-A-1, XI-MIPA-2"
                    value={formData.nama_rombel}
                    onChange={(e) => {
                      setFormData({ ...formData, nama_rombel: e.target.value });
                      setErrors({ ...errors, nama_rombel: undefined });
                    }}
                    className={`border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-primary ${errors.nama_rombel ? "border-red-500" : ""}`}
                  />
                  {errors.nama_rombel && (
                    <p className="text-red-500 text-sm mt-1">{errors.nama_rombel[0]}</p>
                  )}
                </div>

                {/* Jurusan — opsional */}
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Jurusan <span className="text-gray-400 text-sm font-normal">(opsional)</span>
                  </label>
                  <Select
                    value={formData.jurusan_id || "none"}
                    onValueChange={(v) =>
                      setFormData({ ...formData, jurusan_id: v === "none" ? "" : v })
                    }
                  >
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
                  {errors.jurusan_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.jurusan_id[0]}</p>
                  )}
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                  <p className="font-semibold mb-1">ℹ️ Informasi:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Status otomatis menjadi <strong>Aktif</strong></li>
                    <li>Nama rombel harus unik per kelas dan jurusan</li>
                    <li>Jurusan bersifat opsional</li>
                  </ul>
                </div>

                {/* Tombol */}
                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                    <FilePlus size={18} />
                    {loading ? "Menyimpan..." : "Simpan"}
                  </Button>
                  <Button
                    type="button"
                    className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90"
                    onClick={() => navigate(`/superadmin/informasi-sekolah/kelas/${kelasId}`)}
                  >
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

export default CreateRombel;