/**
 * DataNilaiSiswa — Leger
 * Route: /superadmin/informasi-akademik/data-nilai-siswa
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2Icon, BookOpenIcon, FileSpreadsheetIcon, FileTextIcon, SearchIcon, UsersIcon, TrophyIcon, AlertCircleIcon, ChevronDownIcon, ChevronRightIcon, EyeIcon, PrinterIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";

// ── Types ──────────────────────────────────────────────────────────────────────
interface SemesterOption {
  semester_id: number;
  semester: string;
  status: string;
}
interface TahunOption {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status: string;
  semester: SemesterOption[];
}
interface KelasOption {
  kelas_id: number;
  kelas: string;
  tingkat: number;
  status: string;
}
interface SelectData {
  tahun_dan_semester: TahunOption[];
  kelas: KelasOption[];
}
interface NilaiPoint {
  absensi: string | null;
  tugas: string | null;
  uts?: string | null;
  uas?: string | null;
  nilai_akhir: string | null;
}
interface DataNilaiItem {
  data_nilai_siswa_id?: number;
  mata_pelajaran: string;
  guru_pengajar?: string;
  jenis_penilaian?: string;
  point: NilaiPoint | null;
}
interface Absensi {
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
}
interface Peringkat {
  total_nilai_akhir: number;
  rata_rata: number;
  kelas: number;
  par: number;
}
interface Rapor {
  rapor_id: number;
  jenis_rapor: string;
  sikap_spiritual: string | null;
  sikap_sosial: string | null;
  deskripsi_sikap: string | null;
  status: string;
  tanggal_terbit: string | null;
  catatan_wali: string | null;
}
interface SiswaData {
  siswa_id: number;
  nama_siswa: string;
  nisn: string;
  nis: string;
  peringkat: Peringkat;
  absensi: Absensi;
  data_nilai_siswa: DataNilaiItem[];
  rapor: Rapor | null;
}
interface RombelData {
  rombel_id: number;
  nama_rombel: string;
  jurusan: string | null;
  wali_rombel: string | null;
  siswas: SiswaData[];
}
interface SemesterData {
  semester_id: number;
  semester: string;
  status_semester: string;
  rombels: RombelData[];
}
interface LegerResponse {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun: string;
  semesters: SemesterData[];
}
interface RombelOption {
  rombel_id: number;
  nama_rombel: string;
  jurusan: string | null;
}
interface JenisPenilaianMap {
  [key: string]: string;
}
interface SelectRaporData {
  tahun_dan_semester: TahunOption[];
  rombel: RombelOption[];
  jenis_penilaian: JenisPenilaianMap;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const RaporStatusBadge = ({ status }: { status: string }) => <Badge className={`text-xs ${status === "final" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{status}</Badge>;

/**
 * Download blob dengan deteksi error.
 * Backend bisa mengembalikan JSON error meski responseType: "blob"
 * → kita baca teks dari blob dulu, kalau parseable JSON berarti error
 */
const downloadBlob = async (blob: Blob, filename: string) => {
  // Cek apakah blob adalah JSON error
  if (blob.type === "application/json" || blob.type.includes("json")) {
    const text = await blob.text();
    try {
      const json = JSON.parse(text);
      throw new Error(json.message || "Server mengembalikan error");
    } catch {
      throw new Error("Gagal mengunduh file");
    }
  }
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// ── Component ──────────────────────────────────────────────────────────────────
const DataNilaiSiswa = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [selectData, setSelectData] = useState<SelectData | null>(null);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [selectedTahun, setSelectedTahun] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedKelas, setSelectedKelas] = useState<string>("");
  const [legerData, setLegerData] = useState<LegerResponse | null>(null);
  const [loadingLeger, setLoadingLeger] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRombels, setExpandedRombels] = useState<Set<number>>(new Set());
  const [loadingExport, setLoadingExport] = useState(false);

  // Dialog cetak rapor
  const [dialogRapor, setDialogRapor] = useState(false);
  const [selectRapor, setSelectRapor] = useState<SelectRaporData | null>(null);
  const [loadingSelectRapor, setLoadingSelectRapor] = useState(false);
  const [raporTahun, setRaporTahun] = useState("");
  const [raporSemester, setRaporSemester] = useState("");
  const [raporJenis, setRaporJenis] = useState("");
  const [raporRombel, setRaporRombel] = useState("");
  const [loadingCetakRapor, setLoadingCetakRapor] = useState(false);

  // ── Fetch select data ──────────────────────────────────────────────────────
  useEffect(() => {
    api
      .get("/spa/data-select/leger")
      .then((res) => {
        if (res.data.status === "success") {
          setSelectData(res.data.data);
          const aktif = res.data.data.tahun_dan_semester.find((t: TahunOption) => t.status === "aktif");
          if (aktif) setSelectedTahun(String(aktif.tahun_akademik_id));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSelect(false));
  }, []);

  useEffect(() => {
    setSelectedSemester("");
    setSelectedKelas("");
    setLegerData(null);
    if (!selectedTahun || !selectData) return;
    const tahun = selectData.tahun_dan_semester.find((t) => String(t.tahun_akademik_id) === selectedTahun);
    const aktifSem = tahun?.semester.find((s) => s.status === "aktif");
    if (aktifSem) setSelectedSemester(String(aktifSem.semester_id));
  }, [selectedTahun, selectData]);

  const semesterOptions = useMemo(() => {
    if (!selectData || !selectedTahun) return [];
    return selectData.tahun_dan_semester.find((t) => String(t.tahun_akademik_id) === selectedTahun)?.semester ?? [];
  }, [selectData, selectedTahun]);

  const fetchLeger = async () => {
    if (!selectedTahun || !selectedSemester || !selectedKelas) {
      Swal.fire({ icon: "warning", title: "Filter belum lengkap", text: "Pilih tahun, semester, dan kelas terlebih dahulu." });
      return;
    }
    try {
      setLoadingLeger(true);
      setLegerData(null);
      setExpandedRombels(new Set());
      setSearchTerm("");
      const res = await api.get("/spa/data-nilai-siswa/leger", {
        params: { tahun_akademik_id: selectedTahun, semester_id: selectedSemester, kelas_id: selectedKelas },
      });
      if (res.data.status === "success" && res.data.data.length > 0) {
        const d: LegerResponse = res.data.data[0];
        setLegerData(d);
        const withSiswa = d.semesters[0]?.rombels.filter((r) => r.siswas.length > 0).map((r) => r.rombel_id) ?? [];
        setExpandedRombels(new Set(withSiswa));
      } else {
        Swal.fire({ icon: "info", title: "Tidak ada data", text: "Belum ada nilai siswa pada filter yang dipilih." });
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        Swal.fire({ icon: "error", title: "Gagal memuat leger!", text: err.response?.data?.message || "Terjadi kesalahan." });
      }
    } finally {
      setLoadingLeger(false);
    }
  };

  // ── Export Leger ───────────────────────────────────────────────────────────
  const handleExportLeger = async () => {
    if (!selectedTahun || !selectedSemester || !selectedKelas) return;
    try {
      setLoadingExport(true);
      const res = await api.get("/spa/data-nilai-siswa/export/leger", {
        params: { tahun_akademik_id: selectedTahun, semester_id: selectedSemester, kelas_id: selectedKelas },
        responseType: "blob",
      });
      const kelasLabel = selectData?.kelas.find((k) => String(k.kelas_id) === selectedKelas)?.kelas ?? selectedKelas;
      const semLabel = semesterOptions.find((s) => String(s.semester_id) === selectedSemester)?.semester ?? selectedSemester;
      await downloadBlob(res.data, `Leger_${kelasLabel}_Sem${semLabel}.xlsx`);
      Swal.fire({ icon: "success", title: "Export berhasil!", showConfirmButton: false, timer: 1500 });
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Export gagal!", text: err.message || "Terjadi kesalahan." });
    } finally {
      setLoadingExport(false);
    }
  };

  // ── Buka dialog cetak rapor ────────────────────────────────────────────────
  const handleOpenDialogRapor = async () => {
    setDialogRapor(true);
    if (selectRapor) return;
    try {
      setLoadingSelectRapor(true);
      const res = await api.get("/spa/data-select/rapor");
      if (res.data.status === "success") setSelectRapor(res.data.data);
    } catch {
      Swal.fire({ icon: "error", title: "Gagal memuat pilihan rapor!" });
    } finally {
      setLoadingSelectRapor(false);
    }
  };

  const raporSemesterOptions = useMemo(() => {
    if (!selectRapor || !raporTahun) return [];
    return selectRapor.tahun_dan_semester.find((t) => String(t.tahun_akademik_id) === raporTahun)?.semester ?? [];
  }, [selectRapor, raporTahun]);

  // ── Cetak Rapor PDF — buka di tab baru ────────────────────────────────────
  const handleCetakRapor = async () => {
    if (!raporTahun || !raporSemester || !raporJenis || !raporRombel) {
      Swal.fire({ icon: "warning", title: "Filter belum lengkap" });
      return;
    }
    try {
      setLoadingCetakRapor(true);

      const res = await api.get("/spa/data-nilai-siswa/export/rapor", {
        params: {
          tahun_akademik_id: raporTahun,
          semester_id: raporSemester,
          jenis_penilaian: raporJenis,
          rombel_id: raporRombel,
        },
        responseType: "blob",
      });

      // Cek apakah backend mengembalikan error JSON bukan PDF
      const contentType = res.headers["content-type"] ?? "";
      if (contentType.includes("application/json")) {
        const text = await (res.data as Blob).text();
        const json = JSON.parse(text);
        throw new Error(json.message || "Server error");
      }

      const rombelLabel = selectRapor?.rombel.find((r) => String(r.rombel_id) === raporRombel)?.nama_rombel ?? raporRombel;
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Buka PDF di tab baru agar user bisa preview + print langsung
      window.open(url, "_blank");

      // Juga tawarkan download
      const link = document.createElement("a");
      link.href = url;
      link.download = `Rapor_${rombelLabel}_${raporJenis}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Jangan revoke terlalu cepat agar tab baru sempat load
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);

      setDialogRapor(false);
      Swal.fire({ icon: "success", title: "Rapor berhasil diunduh!", showConfirmButton: false, timer: 1500 });
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Cetak rapor gagal!", text: err.message || "Terjadi kesalahan saat mengunduh PDF." });
    } finally {
      setLoadingCetakRapor(false);
    }
  };

  const toggleRombel = (id: number) =>
    setExpandedRombels((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const rombels = legerData?.semesters[0]?.rombels ?? [];

  const duplicatePar = useMemo(() => {
    const all = rombels.flatMap((r) => r.siswas);
    const parCounts: Record<number, number> = {};
    all.forEach((s) => {
      parCounts[s.peringkat.par] = (parCounts[s.peringkat.par] ?? 0) + 1;
    });
    return new Set(
      Object.entries(parCounts)
        .filter(([, c]) => c > 1)
        .map(([k]) => Number(k)),
    );
  }, [rombels]);

  const filteredRombels = useMemo(() => {
    if (!searchTerm.trim()) return rombels;
    const lower = searchTerm.toLowerCase();
    return rombels
      .map((r) => ({
        ...r,
        siswas: r.siswas.filter((s) => s.nama_siswa.toLowerCase().includes(lower) || s.nisn.includes(lower) || s.nis.includes(lower)),
      }))
      .filter((r) => r.siswas.length > 0 || r.nama_rombel.toLowerCase().includes(lower));
  }, [rombels, searchTerm]);

  const stats = useMemo(() => {
    const allSiswa = rombels.flatMap((r) => r.siswas);
    const totalSiswa = allSiswa.length;
    const rataRataKelas = totalSiswa > 0 ? allSiswa.reduce((s, x) => s + x.peringkat.rata_rata, 0) / totalSiswa : 0;
    return { totalRombel: rombels.length, totalSiswa, rataRataKelas: rataRataKelas.toFixed(1) };
  }, [rombels]);

  const mapelColumns = useMemo(() => {
    const rombelDenganSiswa = rombels.find((r) => r.siswas.length > 0);
    if (!rombelDenganSiswa) return [];
    return rombelDenganSiswa.siswas[0]?.data_nilai_siswa.map((d) => d.mata_pelajaran) ?? [];
  }, [rombels]);

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-gray-50 transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Nilai Siswa" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8 space-y-5">
          {/* ── Page Header ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Data Nilai Siswa</h1>
              <p className="text-sm text-gray-500 mt-0.5">Leger nilai per kelas, semester, dan tahun akademik</p>
            </div>
            {legerData && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleExportLeger} disabled={loadingExport}>
                  {loadingExport ? <Loader2Icon size={15} className="animate-spin mr-1.5" /> : <FileSpreadsheetIcon size={15} className="mr-1.5" />}
                  Export Leger
                </Button>
                <Button size="sm" className="bg-primary" onClick={handleOpenDialogRapor}>
                  <PrinterIcon size={15} className="mr-1.5" />
                  Cetak Rapor
                </Button>
              </div>
            )}
          </div>

          {/* ── Filter Card ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Filter Data Leger</p>
            {loadingSelect ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Loader2Icon size={16} className="animate-spin" /> Memuat pilihan...
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-3 items-end">
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-xs text-gray-500 mb-1 font-medium">Tahun Akademik</label>
                  <Select
                    value={selectedTahun}
                    onValueChange={(v) => {
                      setSelectedTahun(v);
                      setLegerData(null);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih tahun..." />
                    </SelectTrigger>
                    <SelectContent>
                      {selectData?.tahun_dan_semester.map((t) => (
                        <SelectItem key={t.tahun_akademik_id} value={String(t.tahun_akademik_id)}>
                          <div className="flex items-center gap-2">
                            {t.tahun_akademik}
                            <Badge className={`text-xs ${t.status === "aktif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{t.status}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs text-gray-500 mb-1 font-medium">Semester</label>
                  <Select
                    value={selectedSemester}
                    onValueChange={(v) => {
                      setSelectedSemester(v);
                      setLegerData(null);
                    }}
                    disabled={!selectedTahun}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih semester..." />
                    </SelectTrigger>
                    <SelectContent>
                      {semesterOptions.map((s) => (
                        <SelectItem key={s.semester_id} value={String(s.semester_id)}>
                          <div className="flex items-center gap-2">
                            Semester {s.semester}
                            <Badge className={`text-xs ${s.status === "aktif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{s.status}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-[130px]">
                  <label className="block text-xs text-gray-500 mb-1 font-medium">Kelas</label>
                  <Select
                    value={selectedKelas}
                    onValueChange={(v) => {
                      setSelectedKelas(v);
                      setLegerData(null);
                    }}
                    disabled={!selectedSemester}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih kelas..." />
                    </SelectTrigger>
                    <SelectContent>
                      {selectData?.kelas
                        .filter((k) => k.status === "aktif")
                        .map((k) => (
                          <SelectItem key={k.kelas_id} value={String(k.kelas_id)}>
                            Kelas {k.kelas} (Tingkat {k.tingkat})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button className="bg-primary shrink-0" onClick={fetchLeger} disabled={loadingLeger || !selectedTahun || !selectedSemester || !selectedKelas}>
                  {loadingLeger ? <Loader2Icon size={15} className="animate-spin mr-1.5" /> : <SearchIcon size={15} className="mr-1.5" />}
                  Tampilkan
                </Button>
              </div>
            )}
          </div>

          {/* ── Belum search ── */}
          {!legerData && !loadingLeger && (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-14 text-center text-gray-400">
              <BookOpenIcon size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="font-semibold text-base text-gray-500">Pilih filter di atas lalu klik Tampilkan</p>
              <p className="text-sm mt-1">untuk melihat data leger nilai siswa.</p>
            </div>
          )}

          {loadingLeger && (
            <div className="flex flex-col items-center justify-center h-52 text-gray-500">
              <Loader2Icon className="animate-spin mb-3" size={30} />
              <p className="font-medium">Memuat data leger...</p>
            </div>
          )}

          {legerData && !loadingLeger && (
            <>
              {/* ── Stats ── */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Rombel", value: stats.totalRombel, icon: <UsersIcon size={16} className="text-indigo-500" />, border: "border-indigo-100", bg: "bg-indigo-50" },
                  { label: "Total Siswa", value: stats.totalSiswa, icon: <UsersIcon size={16} className="text-emerald-500" />, border: "border-emerald-100", bg: "bg-emerald-50" },
                  { label: "Rata-rata Kelas", value: stats.rataRataKelas, icon: <TrophyIcon size={16} className="text-amber-500" />, border: "border-amber-100", bg: "bg-amber-50" },
                ].map(({ label, value, icon, border, bg }) => (
                  <div key={label} className={`rounded-xl border ${border} ${bg} p-4 shadow-sm`}>
                    <div className="flex items-center gap-2 mb-1">
                      {icon}
                      <span className="text-xs font-medium text-gray-500">{label}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              {duplicatePar.size > 0 && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                  <AlertCircleIcon size={16} className="text-red-500 shrink-0" />
                  <p className="text-sm text-red-700">
                    <strong>Baris merah</strong> = peringkat PAR sama (rata-rata nilai akhir identik). PAR duplikat: {Array.from(duplicatePar).join(", ")}
                  </p>
                </div>
              )}

              <div className="relative w-full md:w-72">
                <SearchIcon className="absolute left-3 top-2.5 text-gray-400" size={15} />
                <Input placeholder="Cari nama siswa, NISN, NIS..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 text-sm" />
              </div>

              <div className="space-y-4">
                {filteredRombels.map((rombel) => {
                  const isOpen = expandedRombels.has(rombel.rombel_id);
                  return (
                    <div key={rombel.rombel_id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <button type="button" className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors text-left" onClick={() => toggleRombel(rombel.rombel_id)}>
                        <div className="flex items-center gap-3">
                          {isOpen ? <ChevronDownIcon size={17} className="text-gray-400 shrink-0" /> : <ChevronRightIcon size={17} className="text-gray-400 shrink-0" />}
                          <div>
                            <span className="font-bold text-gray-800 text-sm">{rombel.nama_rombel}</span>
                            {rombel.jurusan && <Badge className="ml-2 bg-indigo-100 text-indigo-700 text-xs">{rombel.jurusan}</Badge>}
                            {rombel.wali_rombel && <span className="ml-2 text-xs text-gray-400">Wali: {rombel.wali_rombel}</span>}
                          </div>
                        </div>
                        <Badge className="bg-gray-100 text-gray-600 text-xs">{rombel.siswas.length} siswa</Badge>
                      </button>

                      {isOpen && (
                        <div className="border-t border-gray-100">
                          {rombel.siswas.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">Belum ada siswa di rombel ini.</div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-center py-2.5 px-2 font-semibold text-gray-600 w-8">No</th>
                                    <th className="py-2.5 px-3 font-semibold text-gray-600 text-left min-w-[150px]">Nama Siswa</th>
                                    <th className="py-2.5 px-2 font-semibold text-gray-600 text-center w-20">NISN</th>
                                    {mapelColumns.map((mp) => (
                                      <th key={mp} className="py-2.5 px-2 font-semibold text-gray-600 text-center min-w-[80px]">
                                        {mp}
                                      </th>
                                    ))}
                                    <th className="py-2.5 px-2 font-semibold text-gray-600 text-center w-10">H</th>
                                    <th className="py-2.5 px-2 font-semibold text-gray-600 text-center w-10">S</th>
                                    <th className="py-2.5 px-2 font-semibold text-gray-600 text-center w-10">I</th>
                                    <th className="py-2.5 px-2 font-semibold text-gray-600 text-center w-10">A</th>
                                    <th className="py-2.5 px-2 font-semibold text-gray-600 text-center w-14">Rata</th>
                                    <th className="py-2.5 px-2 font-semibold text-gray-600 text-center w-14">P.Kls</th>
                                    <th className="py-2.5 px-2 font-semibold text-gray-600 text-center w-12">PAR</th>
                                    <th className="py-2.5 px-2 font-semibold text-gray-600 text-center w-20">Rapor</th>
                                    <th className="py-2.5 px-2 font-semibold text-gray-600 text-center w-14">Aksi</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {rombel.siswas.map((siswa, idx) => {
                                    const isDuplikatPar = duplicatePar.has(siswa.peringkat.par);
                                    return (
                                      <tr key={siswa.siswa_id} className={`border-b transition-colors ${isDuplikatPar ? "bg-red-50 hover:bg-red-100" : "hover:bg-indigo-50/40 even:bg-gray-50/50"}`}>
                                        <td className="text-center py-2.5 px-2 text-gray-400">{idx + 1}</td>
                                        <td className={`py-2.5 px-3 font-medium ${isDuplikatPar ? "text-red-800" : "text-gray-800"}`}>
                                          <div>{siswa.nama_siswa}</div>
                                          <div className="text-gray-400 font-normal text-xs">{siswa.nis}</div>
                                        </td>
                                        <td className="py-2.5 px-2 text-center text-gray-500">{siswa.nisn}</td>
                                        {mapelColumns.map((mp) => {
                                          const dataNilai = siswa.data_nilai_siswa.find((d) => d.mata_pelajaran === mp);
                                          const nilaiAkhir = dataNilai?.point?.nilai_akhir;
                                          const n = nilaiAkhir !== null && nilaiAkhir !== undefined ? parseFloat(String(nilaiAkhir)) : null;
                                          const colorClass = n === null ? "text-gray-300" : n >= 75 ? "text-emerald-600 font-semibold" : "text-red-500 font-semibold";
                                          return (
                                            <td key={mp} className={`py-2.5 px-2 text-center ${colorClass}`}>
                                              {n !== null ? n.toFixed(0) : "—"}
                                            </td>
                                          );
                                        })}
                                        <td className="py-2.5 px-2 text-center text-emerald-600 font-medium">{siswa.absensi.hadir}</td>
                                        <td className="py-2.5 px-2 text-center text-blue-500 font-medium">{siswa.absensi.sakit}</td>
                                        <td className="py-2.5 px-2 text-center text-amber-500 font-medium">{siswa.absensi.izin}</td>
                                        <td className="py-2.5 px-2 text-center text-red-500 font-medium">{siswa.absensi.alpa}</td>
                                        <td className="py-2.5 px-2 text-center font-semibold text-gray-700">{siswa.peringkat.rata_rata}</td>
                                        <td className="py-2.5 px-2 text-center">
                                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">{siswa.peringkat.kelas}</span>
                                        </td>
                                        <td className="py-2.5 px-2 text-center">
                                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${isDuplikatPar ? "bg-red-500 text-white" : "bg-amber-100 text-amber-700"}`}>
                                            {siswa.peringkat.par}
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-2 text-center">{siswa.rapor ? <RaporStatusBadge status={siswa.rapor.status} /> : <span className="text-gray-300">—</span>}</td>
                                        <td className="py-2.5 px-2 text-center">
                                          <Button size="sm" variant="outline" className="h-7 px-2" title="Histori rapor siswa" onClick={() => navigate(`/superadmin/informasi-nilai-siswa/rapor-siswa/${siswa.siswa_id}`)}>
                                            <EyeIcon size={13} />
                                          </Button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-4 text-xs text-gray-500">
                <p className="font-semibold text-gray-600 mb-2">Keterangan kolom</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                  <span>H = Hadir</span>
                  <span>S = Sakit</span>
                  <span>I = Izin</span>
                  <span>A = Alpha</span>
                  <span>Rata = Rata-rata nilai akhir</span>
                  <span>P.Kls = Peringkat rombel</span>
                  <span>PAR = Peringkat paralel</span>
                </div>
              </div>
            </>
          )}
        </div>
        <Footer />
      </main>

      {/* ── Dialog Cetak Rapor ── */}
      <Dialog open={dialogRapor} onOpenChange={setDialogRapor}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <PrinterIcon size={18} /> Cetak Rapor PDF
            </DialogTitle>
          </DialogHeader>

          {loadingSelectRapor ? (
            <div className="flex justify-center py-8">
              <Loader2Icon className="animate-spin text-gray-400" size={28} />
            </div>
          ) : selectRapor ? (
            <div className="space-y-3 py-2">
              <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">📄 PDF akan dibuka di tab baru dan otomatis diunduh. Pastikan popup tidak diblokir browser.</p>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tahun Akademik</label>
                <Select
                  value={raporTahun}
                  onValueChange={(v) => {
                    setRaporTahun(v);
                    setRaporSemester("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tahun..." />
                  </SelectTrigger>
                  <SelectContent>
                    {selectRapor.tahun_dan_semester.map((t) => (
                      <SelectItem key={t.tahun_akademik_id} value={String(t.tahun_akademik_id)}>
                        {t.tahun_akademik} <Badge className={`ml-1 text-xs ${t.status === "aktif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{t.status}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Semester</label>
                <Select value={raporSemester} onValueChange={setRaporSemester} disabled={!raporTahun}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih semester..." />
                  </SelectTrigger>
                  <SelectContent>
                    {raporSemesterOptions.map((s) => (
                      <SelectItem key={s.semester_id} value={String(s.semester_id)}>
                        Semester {s.semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Jenis Penilaian</label>
                <Select value={raporJenis} onValueChange={setRaporJenis}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(selectRapor.jenis_penilaian).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Rombel</label>
                <Select value={raporRombel} onValueChange={setRaporRombel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih rombel..." />
                  </SelectTrigger>
                  <SelectContent>
                    {selectRapor.rombel.map((r) => (
                      <SelectItem key={r.rombel_id} value={String(r.rombel_id)}>
                        {r.nama_rombel}
                        {r.jurusan && <span className="ml-1 text-gray-400 text-xs">({r.jurusan})</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogRapor(false)} disabled={loadingCetakRapor}>
              Batal
            </Button>
            <Button className="bg-primary gap-2" onClick={handleCetakRapor} disabled={loadingCetakRapor || !raporTahun || !raporSemester || !raporJenis || !raporRombel}>
              {loadingCetakRapor ? <Loader2Icon size={14} className="animate-spin" /> : <FileTextIcon size={14} />}
              Cetak PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default DataNilaiSiswa;
