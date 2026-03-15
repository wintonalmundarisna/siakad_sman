/**
 * CreateKompetensi
 * Route: /superadmin/informasi-sekolah/kompetensi/create?kurikulum_mata_pelajaran_id=X
 *
 * Setelah berhasil/batal → redirect ke:
 *   /superadmin/informasi-sekolah/kompetensi?kurikulum_mata_pelajaran_id=X
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
  Select, SelectContent, SelectGroup, SelectItem,
  SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface KurmapOption {
  kurikulum_mata_pelajaran_id: number;
  kurikulum: string;
  mata_pelajaran: string;
  tingkat: number;
  status: string | null;
}

type Jenis = "KD" | "CP" | "";

interface FormData {
  kurikulum_mata_pelajaran_id: string;
  judul_kompetensi: string;
  jenis: Jenis;
  kode: string;
  tingkat: string;
  aspek: string;
  fase: string;
  deskripsi: string;
}

interface FormErrors {
  kurikulum_mata_pelajaran_id?: string[];
  judul_kompetensi?: string[];
  jenis?: string[];
  kode?: string[];
  tingkat?: string[];
  aspek?: string[];
  fase?: string[];
  deskripsi?: string[];
  data?: string[];
  unique?: string[];
}

const CreateKompetensi = () => {
  const navigate             = useNavigate();
  const [searchParams]       = useSearchParams();
  const [isCollapsed, setIsCollapsed]     = useState(false);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [loading, setLoading]             = useState(false);
  const [kurmapList, setKurmapList]       = useState<KurmapOption[]>([]);
  const [errors, setErrors]               = useState<FormErrors>({});

  // Jika ada kurikulum_mata_pelajaran_id di URL → pre-select dan jadikan default redirect
  const kurmapIdParam = searchParams.get("kurikulum_mata_pelajaran_id") || "";

  const [formData, setFormData] = useState<FormData>({
    kurikulum_mata_pelajaran_id: kurmapIdParam, // pre-select jika ada
    judul_kompetensi: "",
    jenis: "",
    kode: "",
    tingkat: "",
    aspek: "",
    fase: "",
    deskripsi: "",
  });

  const buildBackUrl = () =>
    kurmapIdParam
      ? `/superadmin/informasi-sekolah/kompetensi?kurikulum_mata_pelajaran_id=${kurmapIdParam}`
      : "/superadmin/informasi-sekolah/kompetensi";

  // Fetch select
  useEffect(() => {
    api.get("/spa/data-select/kompetensi")
      .then((res) => {
        const d = res.data?.data;
        if (d && Array.isArray(d.kurikulum_mata_pelajaran)) {
          setKurmapList(d.kurikulum_mata_pelajaran);
        }
      })
      .catch((err) => {
        Swal.fire({
          icon: "error", title: "Gagal memuat form!",
          text: err.response?.data?.message || "Tidak dapat memuat data pilihan.",
        });
      })
      .finally(() => setLoadingSelect(false));
  }, []);

  const kurmapGrouped = kurmapList.reduce<Record<number, KurmapOption[]>>((acc, k) => {
    if (!acc[k.tingkat]) acc[k.tingkat] = [];
    acc[k.tingkat].push(k);
    return acc;
  }, {});

  const handleJenisChange = (val: string) => {
    const j = val as Jenis;
    setFormData((prev) => ({
      ...prev, jenis: j,
      tingkat: j === "CP" ? "" : prev.tingkat,
      aspek:   j === "CP" ? "" : prev.aspek,
      fase:    j === "KD" ? "" : prev.fase,
    }));
    setErrors((prev) => ({ ...prev, jenis: undefined, tingkat: undefined, aspek: undefined, fase: undefined }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const fe: FormErrors = {};
    if (!formData.kurikulum_mata_pelajaran_id) fe.kurikulum_mata_pelajaran_id = ["Mata pelajaran wajib dipilih"];
    if (!formData.judul_kompetensi.trim())     fe.judul_kompetensi = ["Judul kompetensi wajib diisi"];
    if (!formData.jenis)                       fe.jenis     = ["Jenis wajib dipilih"];
    if (!formData.deskripsi.trim())            fe.deskripsi = ["Deskripsi wajib diisi"];
    if (formData.jenis === "KD") {
      if (!formData.tingkat) fe.tingkat = ["Tingkat wajib dipilih untuk KD"];
      if (!formData.aspek)   fe.aspek   = ["Aspek wajib dipilih untuk KD"];
    }
    if (formData.jenis === "CP") {
      if (!formData.fase) fe.fase = ["Fase wajib dipilih untuk CP"];
    }
    if (Object.keys(fe).length) { setErrors(fe); return; }

    setLoading(true);
    try {
      const payload: Record<string, any> = {
        kurikulum_mata_pelajaran_id: Number(formData.kurikulum_mata_pelajaran_id),
        judul_kompetensi: formData.judul_kompetensi.trim(),
        jenis:   formData.jenis,
        kode:    formData.kode.trim() || null,
        deskripsi: formData.deskripsi.trim(),
      };
      if (formData.jenis === "KD") {
        payload.tingkat = formData.tingkat || null;
        payload.aspek   = formData.aspek   || null;
        payload.fase    = null;
      } else {
        payload.fase    = formData.fase    || null;
        payload.tingkat = null;
        payload.aspek   = null;
      }

      // Tentukan backUrl sesuai kurikulum_mata_pelajaran_id yang dipilih
      const selectedKurmapId = formData.kurikulum_mata_pelajaran_id;
      const successUrl = selectedKurmapId
        ? `/superadmin/informasi-sekolah/kompetensi?kurikulum_mata_pelajaran_id=${selectedKurmapId}`
        : "/superadmin/informasi-sekolah/kompetensi";

      const res = await api.post("/spa/kompetensi", payload);
      if (res.data.status === "success") {
        await Swal.fire({
          icon: "success", title: "Berhasil!",
          text: "Data kompetensi berhasil ditambahkan.",
          showConfirmButton: false, timer: 1800,
        });
        navigate(successUrl);
      }
    } catch (err: any) {
      const httpStatus = err.response?.status;
      const errData    = err.response?.data;

      if (httpStatus === 400 || httpStatus === 422) {
        if (errData?.errors?.data) {
          Swal.fire({
            icon: "warning", title: "Tidak dapat membuat data!",
            text: Array.isArray(errData.errors.data) ? errData.errors.data[0] : errData.errors.data,
          });
        } else if (errData?.errors?.unique) {
          Swal.fire({
            icon: "warning", title: "Data Sudah Ada!",
            text: Array.isArray(errData.errors.unique) ? errData.errors.unique[0] : errData.errors.unique,
          });
        } else if (errData?.errors) {
          setErrors(errData.errors);
          Swal.fire({ icon: "error", title: "Validasi Gagal!", text: "Periksa kembali inputan." });
        }
      } else {
        Swal.fire({ icon: "error", title: "Koneksi gagal!", text: errData?.message || "Tidak dapat terhubung ke server." });
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
          <PageTitle title="Tambah Kompetensi" />
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Loader2Icon className="animate-spin mb-3" size={32} />
            <p className="font-medium">Memuat form...</p>
          </div>
          <Footer />
        </main>
      </SidebarProvider>
    );
  }

  const backUrl = buildBackUrl();

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Tambah Kompetensi" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(backUrl)}>
              <ArrowLeft size={16} />
            </Button>
            <h1 className="text-3xl font-bold">Tambah Kompetensi</h1>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <form className="space-y-5 max-w-2xl w-full" onSubmit={handleSubmit}>

              {/* Kurikulum & Mata Pelajaran */}
              <div>
                <label className="block font-semibold mb-1">
                  Kurikulum & Mata Pelajaran <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Pilih kombinasi kurikulum dan mata pelajaran yang tersedia
                </p>
                <Select
                  value={formData.kurikulum_mata_pelajaran_id}
                  onValueChange={(v) => {
                    setFormData({ ...formData, kurikulum_mata_pelajaran_id: v });
                    setErrors({ ...errors, kurikulum_mata_pelajaran_id: undefined });
                  }}
                >
                  <SelectTrigger className={`w-full ${errors.kurikulum_mata_pelajaran_id ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="-- pilih kurikulum & mata pelajaran --" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {kurmapList.length === 0 && (
                      <div className="p-3 text-sm text-gray-400 text-center">Tidak ada data</div>
                    )}
                    {Object.entries(kurmapGrouped)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([tingkat, items]) => (
                        <SelectGroup key={tingkat}>
                          <SelectLabel className="font-bold text-primary">Tingkat {tingkat}</SelectLabel>
                          {items.map((k) => (
                            <SelectItem key={k.kurikulum_mata_pelajaran_id} value={String(k.kurikulum_mata_pelajaran_id)}>
                              <div className="flex flex-col">
                                <span className="font-medium">{k.mata_pelajaran}</span>
                                <span className="text-xs text-muted-foreground">{k.kurikulum} • {k.status || "-"}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                  </SelectContent>
                </Select>
                {errors.kurikulum_mata_pelajaran_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.kurikulum_mata_pelajaran_id[0]}</p>
                )}
              </div>

              {/* Judul Kompetensi */}
              <div>
                <label className="block font-semibold mb-1">
                  Judul Kompetensi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="contoh: Pemahaman Konsep Aljabar"
                  value={formData.judul_kompetensi}
                  onChange={(e) => {
                    setFormData({ ...formData, judul_kompetensi: e.target.value });
                    setErrors({ ...errors, judul_kompetensi: undefined });
                  }}
                  className={`border rounded w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    errors.judul_kompetensi ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.judul_kompetensi && (
                  <p className="text-red-500 text-sm mt-1">{errors.judul_kompetensi[0]}</p>
                )}
              </div>

              {/* Jenis */}
              <div>
                <label className="block font-semibold mb-1">
                  Jenis <span className="text-red-500">*</span>
                </label>
                <Select value={formData.jenis} onValueChange={handleJenisChange}>
                  <SelectTrigger className={`w-full ${errors.jenis ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="-- pilih jenis --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Pilih Jenis</SelectLabel>
                      <SelectItem value="KD">KD — Kompetensi Dasar (Kurikulum 2013)</SelectItem>
                      <SelectItem value="CP">CP — Capaian Pembelajaran (Kurikulum Merdeka)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.jenis && <p className="text-red-500 text-sm mt-1">{errors.jenis[0]}</p>}
              </div>

              {/* Kode */}
              <div>
                <label className="block font-semibold mb-1">
                  Kode <span className="text-gray-400 text-sm font-normal">(opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder={formData.jenis === "KD" ? "contoh: KD-1.1" : formData.jenis === "CP" ? "contoh: CP-MAT-E1" : "contoh: KD-1.1 atau CP-MAT-E1"}
                  value={formData.kode}
                  onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                  className="border border-gray-300 rounded w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* KD fields */}
              {formData.jenis === "KD" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                  <p className="text-sm font-semibold text-blue-800">Field khusus KD (Kompetensi Dasar - K13)</p>
                  <div>
                    <label className="block font-semibold mb-1 text-sm">Tingkat <span className="text-red-500">*</span></label>
                    <Select value={formData.tingkat} onValueChange={(v) => { setFormData({ ...formData, tingkat: v }); setErrors({ ...errors, tingkat: undefined }); }}>
                      <SelectTrigger className={`w-full bg-white ${errors.tingkat ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="-- pilih tingkat --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Pilih Tingkat</SelectLabel>
                          <SelectItem value="10">Kelas 10</SelectItem>
                          <SelectItem value="11">Kelas 11</SelectItem>
                          <SelectItem value="12">Kelas 12</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.tingkat && <p className="text-red-500 text-sm mt-1">{errors.tingkat[0]}</p>}
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-sm">Aspek <span className="text-red-500">*</span></label>
                    <Select value={formData.aspek} onValueChange={(v) => { setFormData({ ...formData, aspek: v }); setErrors({ ...errors, aspek: undefined }); }}>
                      <SelectTrigger className={`w-full bg-white ${errors.aspek ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="-- pilih aspek --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Pilih Aspek</SelectLabel>
                          <SelectItem value="sikap">Sikap</SelectItem>
                          <SelectItem value="pengetahuan">Pengetahuan</SelectItem>
                          <SelectItem value="keterampilan">Keterampilan</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.aspek && <p className="text-red-500 text-sm mt-1">{errors.aspek[0]}</p>}
                  </div>
                </div>
              )}

              {/* CP fields */}
              {formData.jenis === "CP" && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-emerald-800 mb-3">Field khusus CP (Capaian Pembelajaran - Kurikulum Merdeka)</p>
                  <div>
                    <label className="block font-semibold mb-1 text-sm">Fase <span className="text-red-500">*</span></label>
                    <Select value={formData.fase} onValueChange={(v) => { setFormData({ ...formData, fase: v }); setErrors({ ...errors, fase: undefined }); }}>
                      <SelectTrigger className={`w-full bg-white ${errors.fase ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="-- pilih fase --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Pilih Fase</SelectLabel>
                          {["A","B","C","D","E","F"].map((f) => (
                            <SelectItem key={f} value={f}>Fase {f}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.fase && <p className="text-red-500 text-sm mt-1">{errors.fase[0]}</p>}
                  </div>
                </div>
              )}

              {/* Deskripsi */}
              <div>
                <label className="block font-semibold mb-1">Deskripsi <span className="text-red-500">*</span></label>
                <textarea
                  rows={4}
                  placeholder="Deskripsi kompetensi..."
                  value={formData.deskripsi}
                  onChange={(e) => { setFormData({ ...formData, deskripsi: e.target.value }); setErrors({ ...errors, deskripsi: undefined }); }}
                  className={`border rounded w-full p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.deskripsi ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.deskripsi && <p className="text-red-500 text-sm mt-1">{errors.deskripsi[0]}</p>}
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-semibold mb-1">ℹ️ Informasi:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Status otomatis menjadi <strong>Aktif</strong> setelah disimpan</li>
                  <li>Jenis <strong>KD</strong>: wajib isi Tingkat dan Aspek</li>
                  <li>Jenis <strong>CP</strong>: wajib isi Fase</li>
                </ul>
              </div>

              {/* Tombol */}
              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={loading} className="bg-primary gap-2">
                  <FilePlus size={16} />
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>
                <Button type="button" className="gap-2 bg-muted-foreground hover:bg-muted-foreground/90" onClick={() => navigate(backUrl)}>
                  <CircleXIcon size={16} /> Batal
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

export default CreateKompetensi;