/**
 * CreateWaliRombel — Dipanggil dari DetailTahunAktifRombel via:
 *   /superadmin/informasi-sekolah/wali-rombel/create
 *     ?rombel_id=X&nama_rombel=Y&back_rombel_id=X
 *
 * FIX dari versi lama:
 * - dataSelect /spa/data-select/wali-rombel hanya return guru (rombel dikomentar)
 * - rombel_id diambil dari query param (sudah diketahui dari halaman sebelumnya)
 * - Tidak perlu dropdown rombel
 * - tahun_akademik_id OTOMATIS diambil backend dari yang aktif
 * - Navigate back ke DetailTahunAktifRombel
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

// ── Types ────────────────────────────────────────────────────────────────────
interface GuruOption {
  guru_id: number;
  nama_guru: string;
  nip: string | null;
  nuptk: string | null;
}

interface FormErrors {
  wali_rombel_id?: string[];
  rombel_id?: string[];
  tahun_akademik?: string[];
  data?: string[];
}

const CreateWaliRombel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Query params dari DetailTahunAktifRombel
  const rombelId = searchParams.get("rombel_id") ?? "";
  const namaRombel = searchParams.get("nama_rombel") ?? "";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [guruOptions, setGuruOptions] = useState<GuruOption[]>([]);
  const [selectedGuru, setSelectedGuru] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const backUrl = `/superadmin/informasi-sekolah/rombel/aktif/${rombelId}`;

  // ── Validasi query param ──────────────────────────────────────────────────
  useEffect(() => {
    if (!rombelId) {
      Swal.fire({
        icon: "warning",
        title: "Akses tidak valid",
        text: "Silakan buka halaman ini dari Detail Rombel.",
      });
      navigate("/superadmin/informasi-sekolah/kelas");
    }
  }, [rombelId]);

  // ── Fetch daftar guru aktif ───────────────────────────────────────────────
  // Endpoint: GET /spa/data-select/wali-rombel → { guru: [...] }
  useEffect(() => {
    const fetchSelect = async () => {
      try {
        setLoadingSelect(true);
        const res = await api.get("/spa/data-select/wali-rombel");
        if (res.data.status === "success") {
          setGuruOptions(res.data.data?.guru ?? []);
        }
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: err.response?.data?.message || "Tidak dapat memuat daftar guru.",
        });
      } finally {
        setLoadingSelect(false);
      }
    };
    fetchSelect();
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  // POST /spa/wali-rombel → body: { wali_rombel_id, rombel_id }
  // tahun_akademik_id OTOMATIS dari backend (tahun aktif)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!selectedGuru) {
      setErrors({ wali_rombel_id: ["Guru wajib dipilih"] });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/spa/wali-rombel", {
        wali_rombel_id: Number(selectedGuru),
        rombel_id: Number(rombelId),
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Wali rombel berhasil ditambahkan.",
          showConfirmButton: false,
          timer: 1800,
        });
        navigate(backUrl);
      }
    } catch (err: any) {
      const status = err.response?.status;
      const errData = err.response?.data;

      if ((status === 400 || status === 422) && errData?.errors) {
        // Tahun akademik tidak aktif
        if (errData.errors.tahun_akademik) {
          Swal.fire({
            icon: "warning",
            title: "Tidak bisa ditambahkan!",
            text: Array.isArray(errData.errors.tahun_akademik) ? errData.errors.tahun_akademik[0] : errData.errors.tahun_akademik,
          });
          return;
        }
        // Duplikasi / guru sudah jadi wali / rombel sudah punya wali
        if (errData.errors.data) {
          Swal.fire({
            icon: "warning",
            title: "Tidak bisa ditambahkan!",
            text: Array.isArray(errData.errors.data) ? errData.errors.data[0] : errData.errors.data,
          });
          return;
        }
        // Role bukan guru
        if (errData.errors.wali_rombel_id) {
          Swal.fire({
            icon: "warning",
            title: "Tidak bisa ditambahkan!",
            text: Array.isArray(errData.errors.wali_rombel_id) ? errData.errors.wali_rombel_id[0] : errData.errors.wali_rombel_id,
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
        <PageTitle title="Tambah Wali Rombel" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(backUrl)}>
              <ArrowLeft size={16} />
            </Button>
            <h1 className="text-3xl font-bold">Tambah Wali Rombel</h1>
          </div>

          <div className="bg-white rounded shadow p-5">
            {loadingSelect ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                <Loader2Icon className="animate-spin mb-2" size={28} />
                <p className="text-lg font-medium">Memuat form...</p>
              </div>
            ) : (
              <form className="space-y-5 max-w-lg w-full" onSubmit={handleSubmit}>
                {/* Info Rombel — read only */}
                <div className="bg-indigo-50 border border-indigo-200 rounded p-3 text-sm">
                  <p className="text-indigo-700 font-medium">Rombel Tujuan</p>
                  <p className="text-indigo-900 font-semibold text-base mt-0.5">{namaRombel || `Rombel ID: ${rombelId}`}</p>
                </div>

                {/* Dropdown Guru */}
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Guru (Wali Kelas) <span className="text-red-500">*</span>
                  </label>
                  <Select value={selectedGuru} onValueChange={setSelectedGuru}>
                    <SelectTrigger className={`w-full ${errors.wali_rombel_id ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="-- pilih guru --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Daftar Guru Aktif</SelectLabel>
                        {guruOptions.map((g) => (
                          <SelectItem key={g.guru_id} value={String(g.guru_id)}>
                            <div className="flex flex-col">
                              <span className="font-medium">{g.nama_guru}</span>
                              <span className="text-xs text-muted-foreground">
                                NIP: {g.nip || "-"} • NUPTK: {g.nuptk || "-"}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.wali_rombel_id && <p className="text-red-500 text-sm mt-1">{errors.wali_rombel_id[0]}</p>}
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                  <p className="font-semibold mb-1">ℹ️ Informasi:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Wali ditambahkan untuk tahun akademik yang sedang <strong>Aktif</strong>
                    </li>
                    <li>Satu guru hanya bisa menjadi wali satu rombel per tahun akademik</li>
                    <li>Satu rombel hanya dapat memiliki satu wali per tahun akademik</li>
                  </ul>
                </div>

                {/* Tombol */}
                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                    <FilePlus size={18} />
                    {loading ? "Menyimpan..." : "Simpan"}
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

export default CreateWaliRombel;
