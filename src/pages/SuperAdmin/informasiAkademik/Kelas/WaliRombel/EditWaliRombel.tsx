/**
 * EditWaliRombel — Dipanggil dari DetailTahunAktifRombel via:
 *   /superadmin/informasi-akademik/wali-rombel/edit/:id
 *     ?rombel_id=X&nama_rombel=Y&guru_id=Z&nama_guru=W
 *
 * :id = wali_rombel record ID (bukan kepegawaian_id)
 *
 * FIX dari versi lama:
 * - Tidak pakai router.state (fragile, null jika refresh/direct URL)
 * - Pakai query params → prefill guru saat ini
 * - Body PUT: { wali_rombel_id } → ganti guru wali
 * - Navigate back ke DetailTahunAktifRombel
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
interface GuruOption {
  guru_id: number;
  nama_guru: string;
  nip: string | null;
  nuptk: string | null;
}

interface FormErrors {
  wali_rombel_id?: string[];
  data?: string[];
  arsip?: string[];
}

const EditWaliRombel = () => {
  const { id } = useParams<{ id: string }>(); // wali_rombel record ID
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Query params dari DetailTahunAktifRombel
  const rombelId = searchParams.get("rombel_id") ?? "";
  const namaRombel = searchParams.get("nama_rombel") ?? "";
  const guruIdAwal = searchParams.get("guru_id") ?? "";
  const namaGuru = searchParams.get("nama_guru") ?? "";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [guruOptions, setGuruOptions] = useState<GuruOption[]>([]);
  const [selectedGuru, setSelectedGuru] = useState(guruIdAwal);
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

  // ── Fetch daftar guru ─────────────────────────────────────────────────────
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
  // PUT /spa/wali-rombel/{id} → body: { wali_rombel_id }
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!selectedGuru) {
      setErrors({ wali_rombel_id: ["Guru wajib dipilih"] });
      return;
    }

    setLoading(true);
    try {
      const res = await api.put(`/spa/wali-rombel/${id}`, {
        wali_rombel_id: Number(selectedGuru),
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Wali rombel berhasil diperbarui.",
          showConfirmButton: false,
          timer: 1800,
        });
        navigate(backUrl);
      }
    } catch (err: any) {
      const status = err.response?.status;
      const errData = err.response?.data;

      if (status === 422 && errData?.errors) {
        // Tahun akademik sudah arsip
        if (errData.errors.arsip) {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat diubah!",
            text: Array.isArray(errData.errors.arsip) ? errData.errors.arsip[0] : errData.errors.arsip,
          });
          navigate(backUrl);
          return;
        }
        // Guru sudah jadi wali lain / role bukan guru
        if (errData.errors.data) {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat diubah!",
            text: Array.isArray(errData.errors.data) ? errData.errors.data[0] : errData.errors.data,
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
        <PageTitle title="Edit Wali Rombel" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(backUrl)}>
              <ArrowLeft size={16} />
              Kembali
            </Button>
            <h1 className="text-3xl font-bold">Edit Wali Rombel</h1>
          </div>

          <div className="bg-white rounded shadow p-5">
            {loadingSelect ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2Icon className="animate-spin mb-2" size={28} />
                <p className="text-lg font-medium">Memuat data...</p>
              </div>
            ) : (
              <form className="space-y-5 max-w-lg w-full" onSubmit={handleSubmit}>
                {/* Card info saat ini */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                  <h3 className="text-sm font-semibold text-purple-900 mb-3">📋 Data Saat Ini</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-purple-700 font-medium block">Wali Kelas</span>
                      <span className="text-purple-900 font-semibold">{namaGuru || "-"}</span>
                    </div>
                    <div>
                      <span className="text-purple-700 font-medium block">Rombel</span>
                      <span className="text-purple-900 font-semibold">{namaRombel || "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Dropdown Guru Pengganti */}
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Ganti Guru (Wali Kelas) <span className="text-red-500">*</span>
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
                              <span className="text-xs">
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

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                  <p className="font-semibold mb-1">ℹ️ Informasi:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Hanya guru wali yang dapat diganti</li>
                    <li>Rombel dan tahun akademik tidak dapat diubah</li>
                    <li>Guru baru tidak boleh sudah menjadi wali rombel lain di tahun yang sama</li>
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
            )}
          </div>
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default EditWaliRombel;
