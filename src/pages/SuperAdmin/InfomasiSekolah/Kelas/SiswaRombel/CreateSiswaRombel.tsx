/**
 * CreateSiswaRombel — Dipanggil dari DetailTahunAktifRombel via:
 *   /superadmin/informasi-sekolah/siswa-rombel/create
 *     ?rombel_id=X&nama_rombel=Y
 *
 * FIX dari versi lama:
 * - dataSelect /spa/siswa/data-select/rombel hanya return siswa (rombel dikomentar)
 * - rombel_id diambil dari query param — tidak perlu dropdown rombel
 * - tahun_akademik_id OTOMATIS dari backend
 * - Error backend: message "Duplikasi" + data string (bukan errors object)
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
interface SiswaOption {
  siswa_id: number;
  nama_siswa: string;
  nisn: string | null;
  nis: string | null;
}

interface FormErrors {
  siswa_id?: string[];
  rombel_id?: string[];
}

const CreateSiswaRombel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Query params dari DetailTahunAktifRombel
  const rombelId = searchParams.get("rombel_id") ?? "";
  const namaRombel = searchParams.get("nama_rombel") ?? "";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [siswaOptions, setSiswaOptions] = useState<SiswaOption[]>([]);
  const [selectedSiswa, setSelectedSiswa] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [searchTerm,] = useState("");

  const backUrl = `/superadmin/informasi-sekolah/rombel/aktif/${rombelId}`;

  // ── Validasi ──────────────────────────────────────────────────────────────
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

  // ── Fetch daftar siswa aktif ──────────────────────────────────────────────
  // Endpoint: GET /spa/siswa/data-select/rombel → { siswa: [...] }
  useEffect(() => {
    const fetchSelect = async () => {
      try {
        setLoadingSelect(true);
        const res = await api.get("/spa/siswa/data-select/rombel");
        if (res.data.status === "success") {
          setSiswaOptions(res.data.data?.siswa ?? []);
        }
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: err.response?.data?.message || "Tidak dapat memuat daftar siswa.",
        });
      } finally {
        setLoadingSelect(false);
      }
    };
    fetchSelect();
  }, []);

  // Filter siswa berdasarkan search
  const filteredSiswa = siswaOptions.filter((s) => s.nama_siswa?.toLowerCase().includes(searchTerm.toLowerCase()) || s.nisn?.includes(searchTerm) || s.nis?.includes(searchTerm));

  // ── Submit ────────────────────────────────────────────────────────────────
  // POST /spa/siswa-rombel → body: { siswa_id, rombel_id }
  // Error unik: message "Duplikasi", data: "Siswa sudah terdaftar di rombel..."
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!selectedSiswa) {
      setErrors({ siswa_id: ["Siswa wajib dipilih"] });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/spa/siswa-rombel", {
        siswa_id: Number(selectedSiswa),
        rombel_id: Number(rombelId),
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Siswa berhasil didaftarkan ke rombel.",
          showConfirmButton: false,
          timer: 1800,
        });
        navigate(backUrl);
      }
    } catch (err: any) {
      const status = err.response?.status;
      const errData = err.response?.data;

      if (status === 400 || status === 422) {
        // Backend kirim message "Duplikasi" dengan data string
        if (errData?.message === "Duplikasi") {
          Swal.fire({
            icon: "warning",
            title: "Tidak bisa didaftarkan!",
            text: typeof errData.data === "string" ? errData.data : "Siswa sudah terdaftar di rombel ini atau rombel lain pada tahun aktif.",
          });
          return;
        }
        // Tahun akademik tidak aktif
        if (errData?.message?.toLowerCase().includes("tahun akademik")) {
          Swal.fire({ icon: "warning", title: "Tidak bisa!", text: errData.message });
          return;
        }
        // Validasi field biasa
        if (errData?.errors) {
          setErrors(errData.errors);
        } else if (errData?.data) {
          Swal.fire({
            icon: "warning",
            title: "Tidak bisa didaftarkan!",
            text: typeof errData.data === "string" ? errData.data : "Terjadi kesalahan.",
          });
        }
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
        <PageTitle title="Tambah Siswa Rombel" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(backUrl)}>
              <ArrowLeft size={16} />
            </Button>
            <h1 className="text-3xl font-bold">Tambah Siswa ke Rombel</h1>
          </div>

          <div className="bg-white rounded shadow p-5">
            {loadingSelect ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                <Loader2Icon className="animate-spin mb-2" size={28} />
                <p className="text-lg font-medium">Memuat data siswa...</p>
              </div>
            ) : (
              <form className="space-y-5 max-w-lg w-full" onSubmit={handleSubmit}>
                {/* Info Rombel — read only */}
                <div className="bg-indigo-50 border border-indigo-200 rounded p-3 text-sm">
                  <p className="text-indigo-700 font-medium">Rombel Tujuan</p>
                  <p className="text-indigo-900 font-semibold text-base mt-0.5">{namaRombel || `Rombel ID: ${rombelId}`}</p>
                </div>

                {/* Dropdown Siswa */}
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Siswa <span className="text-red-500">*</span>
                  </label>
                  <Select value={selectedSiswa} onValueChange={setSelectedSiswa}>
                    <SelectTrigger className={`w-full ${errors.siswa_id ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="-- pilih siswa --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Daftar Siswa Aktif ({filteredSiswa.length} siswa)</SelectLabel>
                        {filteredSiswa.length > 0 ? (
                          filteredSiswa.map((s) => (
                            <SelectItem key={s.siswa_id} value={String(s.siswa_id)}>
                              <div className="flex flex-col">
                                <span className="font-medium">{s.nama_siswa}</span>
                                <span className="text-xs text-muted-foreground">
                                  NISN: {s.nisn || "-"} • NIS: {s.nis || "-"}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="_empty" disabled>
                            Tidak ada siswa ditemukan
                          </SelectItem>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.siswa_id && <p className="text-red-500 text-sm mt-1">{errors.siswa_id[0]}</p>}
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                  <p className="font-semibold mb-1">ℹ️ Informasi:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Siswa didaftarkan untuk tahun akademik yang sedang <strong>Aktif</strong>
                    </li>
                    <li>Satu siswa hanya bisa terdaftar di satu rombel per tahun akademik</li>
                    <li>Jika salah, hapus data dan tambah ulang (tidak ada fitur edit)</li>
                  </ul>
                </div>

                {/* Tombol */}
                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                    <FilePlus size={18} />
                    {loading ? "Menyimpan..." : "Daftarkan Siswa"}
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

export default CreateSiswaRombel;
