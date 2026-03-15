/**
 * EditJadwalPelajaranGuruSpa
 * Path: /superadmin/informasi-sekolah/jadwal-pelajaran-guru/edit/:id
 *
 * Query params dari DetailTahunAktifRombelKelas:
 *   rombel_id, nama_rombel, kurmap_id, hari, guru_id,
 *   jam_mulai, jam_selesai, ruangan_id, link
 *
 * Semua field prefill otomatis — user tidak perlu pilih ulang.
 */
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import Footer from "@/pages/Footer";
import { ArrowLeft, CircleXIcon, Save, Loader2Icon } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface KurmapOption {
  kurikulum_mata_pelajaran_id: number;
  kurikulum: string | null;
  mata_pelajaran: string;
  tingkat: number;
  status_mata_pelajaran: string | null;
}
interface GuruOption {
  guru_id: number;
  nama_guru: string;
  nip: string | null;
  nuptk: string | null;
}
interface RuanganOption {
  ruangan_id: number;
  nama_ruangan: string;
  kode_ruangan: string | null;
  jenis_ruangan: string | null;
}

type Hari = "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat" | "Sabtu" | "Minggu";
const HARI_OPTIONS: Hari[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

interface FormErrors {
  kurikulum_mata_pelajaran_id?: string[];
  hari?: string[];
  guru_id?: string[];
  jam_mulai?: string[];
  jam_selesai?: string[];
  guru?: string[];
  rombel?: string[];
  data?: string[];
  jadwal?: string[];
}

const EditJadwalPelajaranGuruSpa = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const rombelId = searchParams.get("rombel_id") ?? "";
  const namaRombel = searchParams.get("nama_rombel") ?? "";
  const backUrl = `/superadmin/informasi-sekolah/rombel/aktif/${rombelId}`;

  const initKurmapId = searchParams.get("kurmap_id") ?? "";
  const initHari = (searchParams.get("hari") ?? "") as Hari | "";
  const initGuruId = searchParams.get("guru_id") ?? "";
  const initJamMulai = searchParams.get("jam_mulai") ?? "";
  const initJamSelesai = searchParams.get("jam_selesai") ?? "";
  const initRuanganId = searchParams.get("ruangan_id") ?? "";
  const initLink = searchParams.get("link") ?? "";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [kurmapList, setKurmapList] = useState<KurmapOption[]>([]);
  const [guruList, setGuruList] = useState<GuruOption[]>([]);
  const [ruanganList, setRuanganList] = useState<RuanganOption[]>([]);

  const [formData, setFormData] = useState({
    kurikulum_mata_pelajaran_id: initKurmapId,
    hari: initHari,
    guru_id: initGuruId,
    jam_mulai: initJamMulai,
    jam_selesai: initJamSelesai,
    ruangan_id: initRuanganId,
    link_opsional: initLink,
  });

  const jadwalId = id && id !== "undefined" && id !== "null" ? id : null;

  useEffect(() => {
    api
      .get("/spa/data-select/jadwal-pelajaran")
      .then((res) => {
        const d = res.data?.data;
        if (d) {
          setKurmapList(Array.isArray(d.kurikulum_mata_pelajaran) ? d.kurikulum_mata_pelajaran : []);
          setGuruList(Array.isArray(d.guru) ? d.guru : []);
          setRuanganList(Array.isArray(d.ruangan) ? d.ruangan : []);
        }
      })
      .catch(() => {
        Swal.fire({ icon: "error", title: "Gagal memuat data!", text: "Coba lagi." });
      })
      .finally(() => setLoadingSelect(false));

    if (!jadwalId) {
      Swal.fire({
        icon: "error",
        title: "ID Jadwal tidak valid",
        text: "Kembali ke halaman rombel dan coba lagi.",
      }).then(() => navigate(backUrl));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const kurmapGrouped = kurmapList.reduce<Record<number, KurmapOption[]>>((acc, k) => {
    if (!acc[k.tingkat]) acc[k.tingkat] = [];
    acc[k.tingkat].push(k);
    return acc;
  }, {});

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!jadwalId) {
      Swal.fire({ icon: "error", title: "ID Jadwal tidak valid!" });
      return;
    }

    const fe: FormErrors = {};
    if (!formData.kurikulum_mata_pelajaran_id) fe.kurikulum_mata_pelajaran_id = ["Mata pelajaran wajib dipilih"];
    if (!formData.hari) fe.hari = ["Hari wajib dipilih"];
    if (!formData.guru_id) fe.guru_id = ["Guru wajib dipilih"];
    if (!formData.jam_mulai) fe.jam_mulai = ["Jam mulai wajib diisi"];
    if (!formData.jam_selesai) fe.jam_selesai = ["Jam selesai wajib diisi"];
    if (Object.keys(fe).length) {
      setErrors(fe);
      return;
    }

    setLoading(true);
    try {
      const res = await api.put(`/spa/jadwal-pelajaran/${jadwalId}`, {
        kurikulum_mata_pelajaran_id: Number(formData.kurikulum_mata_pelajaran_id),
        hari: formData.hari,
        guru_id: Number(formData.guru_id),
        rombel_id: Number(rombelId),
        jam_mulai: formData.jam_mulai,
        jam_selesai: formData.jam_selesai,
        ruangan_id: formData.ruangan_id && formData.ruangan_id !== "none" ? Number(formData.ruangan_id) : null,
        link_opsional: formData.link_opsional || null,
      });

      if (res.data.status === "success") {
        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Jadwal berhasil diperbarui.",
          showConfirmButton: false,
          timer: 1800,
        });
        navigate(backUrl);
      }
    } catch (err: any) {
      const status = err.response?.status;
      const errData = err.response?.data;

      if (status === 422) {
        if (errData?.errors?.data) {
          Swal.fire({ icon: "warning", title: "Tidak dapat mengubah!", text: errData.errors.data[0] });
        } else if (errData?.errors?.guru || errData?.message === "Bentrok") {
          Swal.fire({ icon: "warning", title: "Bentrok Jadwal Guru!", text: errData?.errors?.guru?.[0] || "Guru sudah punya jadwal di jam ini." });
        } else if (errData?.errors?.rombel) {
          Swal.fire({ icon: "warning", title: "Bentrok Jadwal Rombel!", text: errData.errors.rombel[0] });
        } else if (errData?.errors?.jadwal) {
          Swal.fire({ icon: "warning", title: "Jadwal Sudah Ada!", text: errData.errors.jadwal[0] });
        } else if (errData?.errors) {
          setErrors(errData.errors);
          Swal.fire({ icon: "error", title: "Validasi Gagal!", text: "Periksa kembali inputan." });
        }
      } else {
        Swal.fire({ icon: "error", title: "Gagal!", text: errData?.message || "Tidak dapat terhubung ke server." });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingSelect) {
    return (
      <SidebarProvider>
        <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
          <PageTitle title="Edit Jadwal Pelajaran" />
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2Icon className="animate-spin mb-3" size={32} />
            <p className="text-gray-600">Memuat data...</p>
          </div>
          <Footer />
        </main>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Edit Jadwal Pelajaran" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(backUrl)}>
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Edit Jadwal Pelajaran</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Rombel: <span className="font-semibold text-foreground">{namaRombel}</span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded shadow p-5">
            <form className="space-y-5 max-w-2xl w-full" onSubmit={handleSubmit}>
              {/* Info Rombel */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <p className="text-xs text-indigo-600 font-medium mb-0.5">Rombel (tidak dapat diubah)</p>
                <p className="text-indigo-900 font-semibold">{namaRombel || `ID: ${rombelId}`}</p>
                <p className="text-xs text-indigo-500 mt-0.5">Tahun akademik &amp; semester dikunci oleh sistem</p>
              </div>

              {/* Mata Pelajaran */}
              <div>
                <label className="block font-semibold mb-1">
                  Mata Pelajaran <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.kurikulum_mata_pelajaran_id}
                  onValueChange={(v) => {
                    setFormData({ ...formData, kurikulum_mata_pelajaran_id: v });
                    setErrors({ ...errors, kurikulum_mata_pelajaran_id: undefined });
                  }}
                >
                  <SelectTrigger className={`w-full ${errors.kurikulum_mata_pelajaran_id ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="-- pilih mata pelajaran --" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {kurmapList.length === 0 && <div className="p-3 text-sm text-gray-400 text-center">Tidak ada data</div>}
                    {Object.entries(kurmapGrouped)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([tingkat, items]) => (
                        <SelectGroup key={tingkat}>
                          <SelectLabel className="font-bold text-primary">Tingkat {tingkat}</SelectLabel>
                          {items.map((k) => (
                            <SelectItem key={k.kurikulum_mata_pelajaran_id} value={String(k.kurikulum_mata_pelajaran_id)}>
                              <div className="flex flex-col">
                                <span className="font-medium">{k.mata_pelajaran}</span>
                                <span className="text-xs text-muted-foreground">
                                  {k.kurikulum} • {k.status_mata_pelajaran}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                  </SelectContent>
                </Select>
                {errors.kurikulum_mata_pelajaran_id && <p className="text-red-500 text-sm mt-1">{errors.kurikulum_mata_pelajaran_id[0]}</p>}
              </div>

              {/* Hari */}
              <div>
                <label className="block font-semibold mb-1">
                  Hari <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.hari}
                  onValueChange={(v) => {
                    setFormData({ ...formData, hari: v as Hari });
                    setErrors({ ...errors, hari: undefined });
                  }}
                >
                  <SelectTrigger className={`w-full ${errors.hari ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="-- pilih hari --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Pilih Hari</SelectLabel>
                      {HARI_OPTIONS.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.hari && <p className="text-red-500 text-sm mt-1">{errors.hari[0]}</p>}
              </div>

              {/* Guru */}
              <div>
                <label className="block font-semibold mb-1">
                  Guru Pengajar <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.guru_id}
                  onValueChange={(v) => {
                    setFormData({ ...formData, guru_id: v });
                    setErrors({ ...errors, guru_id: undefined, guru: undefined });
                  }}
                >
                  <SelectTrigger className={`w-full ${errors.guru_id ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="-- pilih guru --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Daftar Guru Aktif</SelectLabel>
                      {guruList.length === 0 && <div className="p-3 text-sm text-gray-400 text-center">Tidak ada data guru</div>}
                      {guruList.map((g) => (
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
                {errors.guru_id && <p className="text-red-500 text-sm mt-1">{errors.guru_id[0]}</p>}
                {errors.guru && <p className="text-red-500 text-sm mt-1">⚠️ {errors.guru[0]}</p>}
              </div>

              {/* Jam Mulai & Selesai */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">
                    Jam Mulai <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="time"
                    value={formData.jam_mulai}
                    onChange={(e) => {
                      setFormData({ ...formData, jam_mulai: e.target.value });
                      setErrors({ ...errors, jam_mulai: undefined });
                    }}
                    className={errors.jam_mulai ? "border-red-500" : ""}
                  />
                  {errors.jam_mulai && <p className="text-red-500 text-sm mt-1">{errors.jam_mulai[0]}</p>}
                </div>
                <div>
                  <label className="block font-semibold mb-1">
                    Jam Selesai <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="time"
                    value={formData.jam_selesai}
                    onChange={(e) => {
                      setFormData({ ...formData, jam_selesai: e.target.value });
                      setErrors({ ...errors, jam_selesai: undefined });
                    }}
                    className={errors.jam_selesai ? "border-red-500" : ""}
                  />
                  {errors.jam_selesai && <p className="text-red-500 text-sm mt-1">{errors.jam_selesai[0]}</p>}
                </div>
              </div>

              {/* Ruangan */}
              <div>
                <label className="block font-semibold mb-1">
                  Ruangan <span className="text-gray-400 text-sm font-normal">(opsional)</span>
                </label>
                <Select value={formData.ruangan_id || "none"} onValueChange={(v) => setFormData({ ...formData, ruangan_id: v === "none" ? "" : v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- pilih ruangan --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Daftar Ruangan Aktif</SelectLabel>
                      <SelectItem value="none">— Tanpa ruangan —</SelectItem>
                      {ruanganList.map((r) => (
                        <SelectItem key={r.ruangan_id} value={String(r.ruangan_id)}>
                          <div className="flex flex-col">
                            <span className="font-medium">{r.nama_ruangan}</span>
                            <span className="text-xs text-white">
                              {r.kode_ruangan} • {r.jenis_ruangan || "-"}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Link */}
              <div>
                <label className="block font-semibold mb-1">
                  Link Pembelajaran <span className="text-gray-400 text-sm font-normal">(opsional)</span>
                </label>
                <Input type="text" placeholder="Contoh: https://youtube.com/..." value={formData.link_opsional} onChange={(e) => setFormData({ ...formData, link_opsional: e.target.value })} />
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                <p className="font-semibold mb-1">ℹ️ Informasi:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Tahun akademik dan semester tidak dapat diubah</li>
                  <li>Sistem mengecek bentrok jadwal guru dan rombel</li>
                  <li>Hanya dapat diubah jika semester masih aktif</li>
                </ul>
              </div>

              {/* Tombol */}
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={loading || !jadwalId} className="bg-primary flex items-center gap-2">
                  <Save size={18} />
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
                <Button type="button" className="flex items-center gap-2 bg-muted-foreground hover:bg-muted-foreground/90" onClick={() => navigate(backUrl)}>
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

export default EditJadwalPelajaranGuruSpa;
