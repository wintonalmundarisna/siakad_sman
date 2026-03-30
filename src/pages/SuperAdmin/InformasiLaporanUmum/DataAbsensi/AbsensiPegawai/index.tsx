/**
 * DataAbsensiPegawai
 * Route: /superadmin/informasi-laporan-umum/absensi-pegawai
 *
 * Backend (URL sudah disesuaikan dengan api.php):
 *  GET  /spa/absensi/pegawai/sekolah?tahun_akademik_id=X&semester_id=Y
 *  PUT  /spa/absensi/pegawai/sekolah/:id
 *  DELETE /spa/absensi/pegawai/sekolah/destroy?ids[]=X
 *  GET  /spa/absensi/pegawai/data-select
 *  GET  /spa/absensi/pegawai/sekolah/export?ids[]=X
 */
import { useEffect, useMemo, useRef, useState } from "react";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Footer from "@/pages/Footer";
import { Loader2Icon, SearchIcon, Trash2Icon, FileSpreadsheet, PenBoxIcon, CircleXIcon, FilePlus, CalendarCheck, XCircle, UserCheck, CalendarIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import api from "@/api/axios";
import Swal from "sweetalert2";

// ── Types ─────────────────────────────────────────────────────────────────────
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

interface AbsensiItem {
  absensi_id: number;
  guru_id: number;
  nama_guru: string;
  nip: string | null;
  role: string | null;
  mengajar: string | null;
  hari: string;
  status: "hadir" | "tidak hadir";
  tahun_akademik: string;
  status_tahun_akademik: string;
  semester: string;
  status_semester: string;
  hadir_per_semester: number;
  tidak_hadir_per_semester: number;
  is_editable: boolean;
}

// ── Flatten helper ────────────────────────────────────────────────────────────
const flattenData = (rawData: any[]): AbsensiItem[] => {
  const result: AbsensiItem[] = [];

  rawData.forEach((taGroup) => {
    taGroup.semesters?.forEach((semGroup: any) => {
      const isEditable = taGroup.status_tahun_akademik === "aktif" && semGroup.status_semester === "aktif";

      semGroup.guru?.forEach((guruItem: any) => {
        guruItem.absensi?.forEach((abs: any) => {
          result.push({
            absensi_id: abs.absensi_id,
            guru_id: guruItem.guru_id,
            nama_guru: guruItem.nama_guru,
            nip: guruItem.nip ?? null,
            role: guruItem.role ?? null,
            mengajar: abs.mengajar ?? null,
            hari: abs.hari,
            status: abs.status,
            tahun_akademik: taGroup.tahun_akademik,
            status_tahun_akademik: taGroup.status_tahun_akademik,
            semester: semGroup.semester,
            status_semester: semGroup.status_semester,
            hadir_per_semester: guruItem.hadir_per_semester ?? 0,
            tidak_hadir_per_semester: guruItem.tidak_hadir_per_semester ?? 0,
            is_editable: isEditable,
          });
        });
      });
    });
  });

  return result;
};

// ── Group helper: group flat data per semester → per guru ────────────────────
interface GuruGroup {
  guru_id: number;
  nama_guru: string;
  nip: string | null;
  role: string | null;
  hadir_per_semester: number;
  tidak_hadir_per_semester: number;
  absensi: AbsensiItem[];
}

interface SemesterGroup {
  semester_id_key: string;
  semester: string;
  tahun_akademik: string;
  status_semester: string;
  is_editable: boolean;
  gurus: GuruGroup[];
}

const groupData = (flatData: AbsensiItem[]): SemesterGroup[] => {
  const semMap = new Map<string, SemesterGroup>();

  flatData.forEach((item) => {
    const key = `${item.semester}|${item.tahun_akademik}`;
    if (!semMap.has(key)) {
      semMap.set(key, {
        semester_id_key: key,
        semester: item.semester,
        tahun_akademik: item.tahun_akademik,
        status_semester: item.status_semester,
        is_editable: item.is_editable,
        gurus: [],
      });
    }
    const semGroup = semMap.get(key)!;
    let guruGroup = semGroup.gurus.find((g) => g.guru_id === item.guru_id);
    if (!guruGroup) {
      guruGroup = {
        guru_id: item.guru_id,
        nama_guru: item.nama_guru,
        nip: item.nip,
        role: item.role,
        hadir_per_semester: item.hadir_per_semester,
        tidak_hadir_per_semester: item.tidak_hadir_per_semester,
        absensi: [],
      };
      semGroup.gurus.push(guruGroup);
    }
    guruGroup.absensi.push(item);
  });

  return Array.from(semMap.values());
};

// ── Component ─────────────────────────────────────────────────────────────────
const DataAbsensiPegawai = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tahunOptions, setTahunOptions] = useState<TahunOption[]>([]);
  const [selectedTahun, setSelectedTahun] = useState<string>("");
  const [semesterOptions, setSemesterOptions] = useState<SemesterOption[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [dataFlat, setDataFlat] = useState<AbsensiItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<"hadir" | "tidak hadir">("hadir");
  const [editingRow, setEditingRow] = useState<AbsensiItem | null>(null);
  const [isLoadingAksi, setIsLoadingAksi] = useState(false);

  // Accordion state
  const [expandedSemester, setExpandedSemester] = useState<string[]>([]);
  const [expandedGuru, setExpandedGuru] = useState<number[]>([]);

  // ── Fetch dropdown ────────────────────────────────────────────────────────
  useEffect(() => {
    api
      .get("/spa/absensi/pegawai/data-select")
      .then((res) => {
        if (res.data.status === "success") {
          const list: TahunOption[] = res.data.data.tahun_semester ?? [];
          setTahunOptions(list);
          const aktif = list.find((t) => t.status === "aktif");
          if (aktif) {
            setSelectedTahun(String(aktif.tahun_akademik_id));
            setSemesterOptions(aktif.semester);
            const semAktif = aktif.semester.find((s) => s.status === "aktif");
            if (semAktif) setSelectedSemester(String(semAktif.semester_id));
          }
        }
      })
      .catch(() => Swal.fire({ icon: "error", title: "Gagal memuat filter!" }))
      .finally(() => setLoadingSelect(false));
  }, []);

  const handleTahunChange = (val: string) => {
    setSelectedTahun(val);
    setSelectedSemester("");
    setDataFlat([]);
    const found = tahunOptions.find((t) => String(t.tahun_akademik_id) === val);
    setSemesterOptions(found?.semester ?? []);
  };

  // ── Fetch data absensi ────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedTahun || !selectedSemester) return;
    setLoadingData(true);
    setDataFlat([]);
    setSelectedIds([]);
    setExpandedSemester([]);
    setExpandedGuru([]);

    api
      .get("/spa/absensi/pegawai/sekolah", {
        params: {
          tahun_akademik_id: Number(selectedTahun),
          semester_id: Number(selectedSemester),
        },
      })
      .then((res) => {
        if (res.data.status === "success") {
          const flat = flattenData(res.data.data);
          setDataFlat(flat);
          // Auto-expand semester pertama
          const grouped = groupData(flat);
          if (grouped.length > 0) {
            setExpandedSemester([grouped[0].semester_id_key]);
          }
        }
      })
      .catch((err) => {
        if (err.response?.status !== 404) {
          Swal.fire({
            icon: "error",
            title: "Gagal memuat data!",
            text: err.response?.data?.message || "Tidak dapat memuat absensi.",
          });
        }
        setDataFlat([]);
      })
      .finally(() => setLoadingData(false));
  }, [selectedTahun, selectedSemester]);

  // ── Statistik ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const hadir = dataFlat.filter((x) => x.status === "hadir").length;
    const tidakHadir = dataFlat.filter((x) => x.status === "tidak hadir").length;
    const persen = hadir + tidakHadir > 0 ? ((hadir / (hadir + tidakHadir)) * 100).toFixed(1) : "0";
    const totalPegawai = new Set(dataFlat.map((x) => x.guru_id)).size;
    return { hadir, tidakHadir, persen, totalPegawai };
  }, [dataFlat]);

  // ── Group & Filter ─────────────────────────────────────────────────────────
  const filteredFlat = useMemo(() => {
    if (!searchTerm.trim()) return dataFlat;
    const lower = searchTerm.toLowerCase();
    return dataFlat.filter((item) => item.nama_guru.toLowerCase().includes(lower) || (item.mengajar ?? "").toLowerCase().includes(lower) || item.hari.toLowerCase().includes(lower) || (item.nip ?? "").toLowerCase().includes(lower));
  }, [searchTerm, dataFlat]);

  const groupedData = useMemo(() => groupData(filteredFlat), [filteredFlat]);

  // ── Checkbox — menggunakan filteredFlat (tanpa pagination) ────────────────
  const isAllSelected = filteredFlat.length > 0 && filteredFlat.every((i) => selectedIds.includes(i.absensi_id));
  const isSomeSelected = filteredFlat.some((i) => selectedIds.includes(i.absensi_id)) && !isAllSelected;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = isSomeSelected;
  }, [isSomeSelected]);

  const handleSelectAll = (checked: boolean) => setSelectedIds(checked ? filteredFlat.map((i) => i.absensi_id) : []);
  const handleSelectOne = (id: number, checked: boolean) => setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));

  // ── Accordion helpers ─────────────────────────────────────────────────────
  const toggleSemester = (key: string) => setExpandedSemester((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  const toggleGuru = (id: number) => setExpandedGuru((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEdit = (item: AbsensiItem) => {
    setEditingId(item.absensi_id);
    setEditStatus(item.status);
    setEditingRow(item);
    setEditDialog(true);
  };

  const handleUpdateStatus = async () => {
    if (!editingId) return;
    try {
      setIsLoadingAksi(true);
      await api.put(`/spa/absensi/pegawai/sekolah/${editingId}`, { status: editStatus });
      setEditDialog(false);
      setDataFlat((prev) => prev.map((item) => (item.absensi_id === editingId ? { ...item, status: editStatus } : item)));
      Swal.fire({ icon: "success", title: "Berhasil!", text: "Status absensi berhasil diperbarui.", showConfirmButton: false, timer: 1800 });
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Gagal memperbarui!", text: err.response?.data?.message || "Terjadi kesalahan." });
    } finally {
      setIsLoadingAksi(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteMultiple = async () => {
    if (selectedIds.length === 0) {
      Swal.fire({ icon: "warning", title: "Tidak ada data dipilih" });
      return;
    }
    const selectedRows = dataFlat.filter((i) => selectedIds.includes(i.absensi_id));
    const deletableIds = selectedRows.filter((i) => i.is_editable).map((i) => i.absensi_id);
    const arsipCount = selectedRows.length - deletableIds.length;

    if (deletableIds.length === 0) {
      Swal.fire({ icon: "warning", title: "Tidak ada data yang bisa dihapus", text: "Semua data yang dipilih berasal dari semester/TA yang sudah arsip.", confirmButtonColor: "#4F46E5" });
      return;
    }

    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      html: `<b>${deletableIds.length} data aktif</b> akan dihapus permanen.${arsipCount > 0 ? `<br/><br/><span style="color:#f59e0b">⚠️ ${arsipCount} data arsip dilewati.</span>` : ""}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;

    try {
      setLoadingData(true);
      await api.delete("/spa/absensi/pegawai/sekolah/destroy", { params: { ids: deletableIds } });
      setSelectedIds([]);
      setDataFlat((prev) => prev.filter((i) => !deletableIds.includes(i.absensi_id)));
      Swal.fire({ icon: "success", title: "Berhasil!", text: "Data berhasil dihapus.", showConfirmButton: false, timer: 1800 });
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Gagal menghapus!", text: err.response?.data?.message || "Terjadi kesalahan." });
    } finally {
      setLoadingData(false);
    }
  };

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = async (selected = false) => {
    const ids = selected ? selectedIds : dataFlat.map((i) => i.absensi_id);
    if (ids.length === 0) {
      Swal.fire({ icon: "warning", title: "Tidak ada data untuk diekspor." });
      return;
    }
    try {
      const res = await api.get("/spa/absensi/pegawai/sekolah/export", {
        params: {
          ids,
          tahun_akademik_id: Number(selectedTahun),
          semester_id: Number(selectedSemester),
        },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "absensi-pegawai.xlsx";
      link.click();
      window.URL.revokeObjectURL(url);
      Swal.fire({ icon: "success", title: "Export berhasil!", showConfirmButton: false, timer: 1500 });
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Export gagal!", text: err.response?.data?.message || "Terjadi kesalahan." });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Absensi Pegawai" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Data Absensi Pegawai</h1>
            <p className="text-sm text-muted-foreground mt-1">Kelola data absensi pegawai per tahun akademik dan semester</p>
          </div>

          {loadingSelect ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Loader2Icon className="animate-spin mb-3" size={32} />
              <p className="font-medium">Memuat filter...</p>
            </div>
          ) : (
            <>
              {/* ── Filter ── */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
                <div className="flex flex-col md:flex-row gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tahun Akademik</label>
                    <Select value={selectedTahun} onValueChange={handleTahunChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="-- pilih tahun akademik --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Pilih Tahun Akademik</SelectLabel>
                          {tahunOptions.map((t) => (
                            <SelectItem key={t.tahun_akademik_id} value={String(t.tahun_akademik_id)}>
                              <div className="flex items-center gap-2">
                                <span>{t.tahun_akademik}</span>
                                <Badge className={t.status === "aktif" ? "bg-green-100 text-green-700 text-xs" : "bg-gray-100 text-gray-500 text-xs"}>{t.status}</Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Semester</label>
                    <Select
                      value={selectedSemester}
                      onValueChange={(val) => {
                        setSelectedSemester(val);
                      }}
                      disabled={!selectedTahun || semesterOptions.length === 0}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="-- pilih semester --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Pilih Semester</SelectLabel>
                          {semesterOptions.map((s) => (
                            <SelectItem key={s.semester_id} value={String(s.semester_id)}>
                              <div className="flex items-center gap-2">
                                <span>{s.semester}</span>
                                <Badge className={s.status === "aktif" ? "bg-green-100 text-green-700 text-xs" : "bg-gray-100 text-gray-500 text-xs"}>{s.status}</Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Cari</label>
                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-2.5 text-gray-400" size={16} />
                      <Input placeholder="Cari nama, mata pelajaran, tanggal..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" disabled={dataFlat.length === 0} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Statistik ── */}
              {!loadingData && dataFlat.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: "Total Pegawai", value: stats.totalPegawai, icon: UserCheck, color: "bg-blue-50 text-blue-700 border-blue-200" },
                    { label: "Total Hadir", value: stats.hadir, icon: CalendarCheck, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                    { label: "Total Tidak Hadir", value: stats.tidakHadir, icon: XCircle, color: "bg-red-50 text-red-700 border-red-200" },
                    { label: "Persentase Kehadiran", value: `${stats.persen}%`, icon: CalendarIcon, color: "bg-amber-50 text-amber-700 border-amber-200" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className={`rounded-xl border p-4 ${color}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={16} />
                        <span className="text-xs font-medium">{label}</span>
                      </div>
                      <p className="text-2xl font-bold">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Loading ── */}
              {loadingData ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Loader2Icon className="animate-spin mb-3" size={32} />
                  <p className="font-medium">Memuat data absensi...</p>
                </div>
              ) : !selectedTahun || !selectedSemester ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
                  <CalendarIcon size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">Pilih tahun akademik dan semester untuk melihat data</p>
                </div>
              ) : (
                <>
                  {/* ── Action bar ── */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Button variant="destructive" size="sm" onClick={handleDeleteMultiple} disabled={selectedIds.length === 0}>
                      <Trash2Icon size={16} className="mr-1" /> Hapus Terpilih ({selectedIds.length})
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport(false)}>
                      <FileSpreadsheet size={16} className="mr-1" /> Export Absensi
                    </Button>
                  </div>

                  {/* ── Accordion per Semester → per Guru ── */}
                  {groupedData.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
                      <CalendarIcon size={40} className="mx-auto mb-3 text-gray-300" />
                      <p className="font-medium text-lg">{searchTerm ? "Tidak ada data yang sesuai pencarian" : "Tidak ada data absensi pada periode ini"}</p>
                      {searchTerm && (
                        <Button variant="outline" size="sm" className="mt-3" onClick={() => setSearchTerm("")}>
                          Reset pencarian
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {groupedData.map((semGroup) => {
                        const isExpanded = expandedSemester.includes(semGroup.semester_id_key);
                        const totalAbsensi = semGroup.gurus.reduce((a, g) => a + g.absensi.length, 0);

                        return (
                          <div key={semGroup.semester_id_key} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* ── Header Semester ── */}
                            <button type="button" className="w-full bg-primary px-5 py-4 flex items-center justify-between hover:bg-primary/90 transition-colors" onClick={() => toggleSemester(semGroup.semester_id_key)}>
                              <div className="flex items-center gap-3">
                                {isExpanded ? <ChevronDownIcon className="text-white" size={20} /> : <ChevronRightIcon className="text-white" size={20} />}
                                <div className="text-left">
                                  <p className="text-white font-bold text-base">Semester {semGroup.semester}</p>
                                  <p className="text-white/70 text-xs mt-0.5">{semGroup.tahun_akademik}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge className={semGroup.status_semester === "aktif" ? "bg-white/20 text-white border-white/30 text-xs" : "bg-white/10 text-white/60 border-white/20 text-xs"}>{semGroup.status_semester}</Badge>
                                <div className="text-right">
                                  <p className="text-white font-semibold">{semGroup.gurus.length} pegawai</p>
                                  <p className="text-white/70 text-xs">{totalAbsensi} catatan</p>
                                </div>
                              </div>
                            </button>

                            {/* ── List Guru ── */}
                            {isExpanded && (
                              <div className="p-4 space-y-3">
                                {semGroup.gurus.map((guru) => {
                                  const isGuruExpanded = expandedGuru.includes(guru.guru_id);
                                  const hadirCount = guru.absensi.filter((a) => a.status === "hadir").length;
                                  const tidakHadirCount = guru.absensi.filter((a) => a.status === "tidak hadir").length;

                                  return (
                                    <div key={guru.guru_id} className="border border-gray-200 rounded-lg overflow-hidden">
                                      {/* ── Header Guru ── */}
                                      <button type="button" className="w-full bg-indigo-50 px-4 py-3 flex items-center justify-between hover:bg-indigo-100 transition-colors" onClick={() => toggleGuru(guru.guru_id)}>
                                        <div className="flex items-center gap-3">
                                          {isGuruExpanded ? <ChevronDownIcon className="text-indigo-600" size={16} /> : <ChevronRightIcon className="text-indigo-600" size={16} />}
                                          <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-indigo-200 flex items-center justify-center">
                                              <UserCheck size={14} className="text-indigo-700" />
                                            </div>
                                            <div className="text-left">
                                              <span className="font-semibold text-indigo-900 text-sm">{guru.nama_guru}</span>
                                              {guru.role && <p className="text-xs text-indigo-400 capitalize">{guru.role}</p>}
                                            </div>
                                          </div>
                                          {guru.nip && <span className="text-xs text-gray-400 hidden md:inline">NIP: {guru.nip}</span>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">{hadirCount} hadir</span>
                                          <span className="text-xs text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded-full">{tidakHadirCount} tdk hadir</span>
                                          <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 text-xs">{guru.absensi.length} catatan</Badge>
                                        </div>
                                      </button>

                                      {/* ── Tabel Absensi ── */}
                                      {isGuruExpanded && (
                                        <div className="overflow-x-auto">
                                          <table className="w-full text-sm">
                                            <thead>
                                              <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="text-center px-4 py-2.5 font-semibold text-gray-600 w-10">
                                                  <input type="checkbox" ref={selectAllRef} checked={isAllSelected} onChange={(e) => handleSelectAll(e.target.checked)} className="w-4 h-4 cursor-pointer" />
                                                </th>
                                                <th className="text-left px-4 py-2.5 font-semibold text-gray-600 w-10">No</th>
                                                <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Mengajar</th>
                                                <th className="text-left px-4 py-2.5 font-semibold text-gray-600 w-36">Tanggal</th>
                                                <th className="text-left px-4 py-2.5 font-semibold text-gray-600 w-28">Status</th>
                                                <th className="text-center px-4 py-2.5 font-semibold text-gray-600 w-24">Aksi</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {guru.absensi.map((item, idx) => (
                                                <tr key={item.absensi_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                  <td className="text-center px-4 py-3">
                                                    <Checkbox checked={selectedIds.includes(item.absensi_id)} onCheckedChange={(checked) => handleSelectOne(item.absensi_id, !!checked)} />
                                                  </td>
                                                  <td className="px-4 py-3 text-center text-gray-400 text-xs font-medium">{idx + 1}</td>
                                                  {/* FIX: tampilkan mengajar, fallback ke role jika null */}
                                                  <td className="px-4 py-3">
                                                    {item.mengajar ? (
                                                      <span className="font-medium text-gray-900">{item.mengajar}</span>
                                                    ) : (
                                                      <span className="text-xs text-gray-300 italic">Tidak Tercatat</span>
                                                    )}
                                                  </td>
                                                  <td className="px-4 py-3 text-sm text-gray-700">{item.hari}</td>
                                                  <td className="px-4 py-3">
                                                    <Badge className={item.status === "hadir" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>{item.status}</Badge>
                                                  </td>
                                                  <td className="px-4 py-3 text-center">
                                                    {item.is_editable ? (
                                                      <Button size="sm" className="bg-primary" onClick={() => handleEdit(item)}>
                                                        <PenBoxIcon size={14} />
                                                      </Button>
                                                    ) : (
                                                      <span className="text-xs text-gray-300">arsip</span>
                                                    )}
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <Footer />

        {/* ── Dialog Edit Status ── */}
        <Dialog open={editDialog} onOpenChange={setEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Status Absensi</DialogTitle>
              <DialogDescription>Ubah status kehadiran pegawai</DialogDescription>
            </DialogHeader>
            {editingRow && (
              <div className="space-y-4 py-2">
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nama Pegawai</span>
                    <span className="font-semibold">{editingRow.nama_guru}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mengajar</span>
                    <span className="font-semibold">{editingRow.mengajar ?? editingRow.role ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tanggal</span>
                    <span className="font-semibold">{editingRow.hari}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Semester</span>
                    <span className="font-semibold">
                      {editingRow.semester} · {editingRow.tahun_akademik}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Status Kehadiran</label>
                  <Select value={editStatus} onValueChange={(v: "hadir" | "tidak hadir") => setEditStatus(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hadir">Hadir</SelectItem>
                      <SelectItem value="tidak hadir">Tidak Hadir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button className="gap-2 bg-muted-foreground hover:bg-muted-foreground/90" onClick={() => setEditDialog(false)} disabled={isLoadingAksi}>
                <CircleXIcon size={15} /> Batal
              </Button>
              <Button className="bg-primary gap-2" onClick={handleUpdateStatus} disabled={isLoadingAksi}>
                {isLoadingAksi ? <Loader2Icon size={15} className="animate-spin" /> : <FilePlus size={15} />}
                {isLoadingAksi ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </SidebarProvider>
  );
};

export default DataAbsensiPegawai;
