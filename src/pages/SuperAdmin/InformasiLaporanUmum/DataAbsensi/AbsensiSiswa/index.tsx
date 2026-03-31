/**
 * DataAbsensiSiswa
 * Route: /superadmin/informasi-laporan-umum/absensi-siswa
 *
 * Backend:
 *  GET    /spa/absensi/siswa/pelajaran/data-select                              → filter options
 *  GET    /spa/absensi/siswa/pelajaran?tahun_akademik_id=X&semester_id=Y        → list
 *  PUT    /spa/absensi/siswa/pelajaran/:id                                      → update status + bukti
 *  DELETE /spa/absensi/siswa/pelajaran/destroy?ids[]=X                          → delete bulk
 *  GET    /spa/absensi/siswa/pelajaran/export?tahun_akademik_id=X&semester_id=Y → export excel
 *  GET    /spa/absensi/siswa/pelajaran/zip?tahun_akademik_id=X&semester_id=Y    → export zip bukti
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
import { Label } from "@/components/ui/label";
import Footer from "@/pages/Footer";
import {
  Loader2Icon,
  SearchIcon,
  Trash2Icon,
  FileSpreadsheet,
  FileArchive,
  PenBoxIcon,
  CircleXIcon,
  FilePlus,
  UserCheck,
  FileCheck,
  FileX,
  XCircle,
  CalendarIcon,
  EyeIcon,
  ImageIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BookOpenIcon,
} from "lucide-react";
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

interface AbsensiItem {
  absensi_id: number;
  siswa_id: number;
  nama_siswa: string;
  nisn: string | null;
  nis: string | null;
  rombel: string | null;
  mata_pelajaran: string | null;
  hari: string;
  status: "hadir" | "izin" | "sakit" | "alpa";
  bukti: string | null;
  tahun_akademik: string;
  status_tahun_akademik: string;
  semester: string;
  status_semester: string;
  hadir_per_semester: number;
  sakit_per_semester: number;
  izin_per_semester: number;
  alpa_per_semester: number;
  is_editable: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const resolveBuktiUrl = (bukti: string | null): string | null => {
  if (!bukti) return null;
  if (bukti.startsWith("Bukti dihapus")) return null;
  if (bukti.startsWith("http://") || bukti.startsWith("https://")) return bukti;
  const relativePath = bukti.replace(/^public\//, "storage/");
  const base = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
  return `${base}/${relativePath}`;
};

const statusBadgeClass = (status: string) => {
  switch (status) {
    case "hadir":
      return "bg-green-100 text-green-700 hover:bg-green-100";
    case "izin":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    case "sakit":
      return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
    case "alpa":
      return "bg-red-100 text-red-700 hover:bg-red-100";
    default:
      return "bg-gray-100 text-gray-700 hover:bg-gray-100";
  }
};

// ── Flatten helper ─────────────────────────────────────────────────────────────
const flattenData = (rawData: any[], editableOverride?: boolean): AbsensiItem[] => {
  const result: AbsensiItem[] = [];

  rawData.forEach((taGroup) => {
    const statusTahun = taGroup.status_tahun_akademik ?? taGroup.status_tahun ?? "";

    taGroup.semesters?.forEach((semGroup: any) => {
      const statusSemester = semGroup.status_semester ?? semGroup.status ?? "";
      const isEditable = editableOverride !== undefined ? editableOverride : statusTahun === "aktif" && statusSemester === "aktif";

      semGroup.rombels?.forEach((rombelGroup: any) => {
        rombelGroup.siswas?.forEach((siswaItem: any) => {
          siswaItem.absensi?.forEach((abs: any) => {
            result.push({
              absensi_id: abs.absensi_id,
              siswa_id: siswaItem.siswa_id,
              nama_siswa: siswaItem.nama,
              nisn: siswaItem.nisn ?? null,
              nis: siswaItem.nis ?? null,
              rombel: rombelGroup.nama_rombel ?? null,
              mata_pelajaran: abs.mata_pelajaran ?? null,
              hari: abs.hari,
              status: abs.status,
              bukti: abs.bukti ?? null,
              tahun_akademik: taGroup.tahun_akademik,
              status_tahun_akademik: statusTahun,
              semester: semGroup.semester,
              status_semester: statusSemester,
              hadir_per_semester: siswaItem.total_per_semester?.hadir ?? 0,
              sakit_per_semester: siswaItem.total_per_semester?.sakit ?? 0,
              izin_per_semester: siswaItem.total_per_semester?.izin ?? 0,
              alpa_per_semester: siswaItem.total_per_semester?.alpa ?? 0,
              is_editable: isEditable,
            });
          });
        });
      });
    });
  });

  return result;
};

// ── Group helpers: Semester → Rombel → Siswa ──────────────────────────────────
interface SiswaGroup {
  siswa_id: number;
  nama_siswa: string;
  nisn: string | null;
  nis: string | null;
  hadir_per_semester: number;
  sakit_per_semester: number;
  izin_per_semester: number;
  alpa_per_semester: number;
  absensi: AbsensiItem[];
}

interface RombelGroup {
  rombel: string;
  siswas: SiswaGroup[];
}

interface SemesterGroup {
  semester_id_key: string;
  semester: string;
  tahun_akademik: string;
  status_semester: string;
  is_editable: boolean;
  rombels: RombelGroup[];
}

const groupData = (flatData: AbsensiItem[]): SemesterGroup[] => {
  const semMap = new Map<string, SemesterGroup>();

  flatData.forEach((item) => {
    const semKey = `${item.semester}|${item.tahun_akademik}`;
    if (!semMap.has(semKey)) {
      semMap.set(semKey, {
        semester_id_key: semKey,
        semester: item.semester,
        tahun_akademik: item.tahun_akademik,
        status_semester: item.status_semester,
        is_editable: item.is_editable,
        rombels: [],
      });
    }
    const semGroup = semMap.get(semKey)!;

    const rombelKey = item.rombel ?? "—";
    let rombelGroup = semGroup.rombels.find((r) => r.rombel === rombelKey);
    if (!rombelGroup) {
      rombelGroup = { rombel: rombelKey, siswas: [] };
      semGroup.rombels.push(rombelGroup);
    }

    let siswaGroup = rombelGroup.siswas.find((s) => s.siswa_id === item.siswa_id);
    if (!siswaGroup) {
      siswaGroup = {
        siswa_id: item.siswa_id,
        nama_siswa: item.nama_siswa,
        nisn: item.nisn,
        nis: item.nis,
        hadir_per_semester: item.hadir_per_semester,
        sakit_per_semester: item.sakit_per_semester,
        izin_per_semester: item.izin_per_semester,
        alpa_per_semester: item.alpa_per_semester,
        absensi: [],
      };
      rombelGroup.siswas.push(siswaGroup);
    }
    siswaGroup.absensi.push(item);
  });

  return Array.from(semMap.values());
};

// ── Component ──────────────────────────────────────────────────────────────────
const DataAbsensiSiswa = () => {
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

  // Edit dialog
  const [editDialog, setEditDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<AbsensiItem["status"]>("hadir");
  const [editingRow, setEditingRow] = useState<AbsensiItem | null>(null);
  const [buktiFoto, setBuktiFoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingAksi, setIsLoadingAksi] = useState(false);

  // Preview bukti
  const [previewDialog, setPreviewDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Accordion state — Semester & Rombel expand per string key, Siswa per number id
  const [expandedSemester, setExpandedSemester] = useState<string[]>([]);
  const [expandedRombel, setExpandedRombel] = useState<string[]>([]); // key = `${semKey}|${rombel}`
  const [expandedSiswa, setExpandedSiswa] = useState<number[]>([]);

  // ── Fetch dropdown ──────────────────────────────────────────────────────────
  useEffect(() => {
    api
      .get("/spa/absensi/siswa/pelajaran/data-select")
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

  // ── Fetch data absensi ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedTahun || !selectedSemester) return;
    setLoadingData(true);
    setDataFlat([]);
    setSelectedIds([]);
    setExpandedSemester([]);
    setExpandedRombel([]);
    setExpandedSiswa([]);

    api
      .get("/spa/absensi/siswa/pelajaran", {
        params: {
          tahun_akademik_id: Number(selectedTahun),
          semester_id: Number(selectedSemester),
        },
      })
      .then((res) => {
        if (res.data.status === "success") {
          const semTerpilih = semesterOptions.find((s) => String(s.semester_id) === selectedSemester);
          const tahunTerpilih = tahunOptions.find((t) => String(t.tahun_akademik_id) === selectedTahun);
          const isAktif = semTerpilih?.status === "aktif" && tahunTerpilih?.status === "aktif";
          const flat = flattenData(res.data.data, isAktif);
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

  // ── Statistik ───────────────────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      totalSiswa: new Set(dataFlat.map((x) => x.siswa_id)).size,
      hadir: dataFlat.filter((x) => x.status === "hadir").length,
      izin: dataFlat.filter((x) => x.status === "izin").length,
      sakit: dataFlat.filter((x) => x.status === "sakit").length,
      alpa: dataFlat.filter((x) => x.status === "alpa").length,
    }),
    [dataFlat],
  );

  // ── Filter & Group ──────────────────────────────────────────────────────────
  const filteredFlat = useMemo(() => {
    if (!searchTerm.trim()) return dataFlat;
    const lower = searchTerm.toLowerCase();
    return dataFlat.filter(
      (item) =>
        item.nama_siswa.toLowerCase().includes(lower) ||
        (item.mata_pelajaran ?? "").toLowerCase().includes(lower) ||
        (item.rombel ?? "").toLowerCase().includes(lower) ||
        item.hari.toLowerCase().includes(lower) ||
        (item.nisn ?? "").toLowerCase().includes(lower),
    );
  }, [searchTerm, dataFlat]);

  const groupedData = useMemo(() => groupData(filteredFlat), [filteredFlat]);

  // ── Checkbox (tanpa pagination, berdasarkan filteredFlat) ───────────────────
  const isAllSelected = filteredFlat.length > 0 && filteredFlat.every((i) => selectedIds.includes(i.absensi_id));
  const isSomeSelected = filteredFlat.some((i) => selectedIds.includes(i.absensi_id)) && !isAllSelected;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = isSomeSelected;
  }, [isSomeSelected]);

  const handleSelectAll = (checked: boolean) => setSelectedIds(checked ? filteredFlat.map((i) => i.absensi_id) : []);
  const handleSelectOne = (id: number, checked: boolean) => setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));

  // ── Accordion helpers ───────────────────────────────────────────────────────
  const toggleSemester = (key: string) => setExpandedSemester((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  const toggleRombel = (key: string) => setExpandedRombel((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  const toggleSiswa = (id: number) => setExpandedSiswa((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  // ── Edit ────────────────────────────────────────────────────────────────────
  const handleEdit = (item: AbsensiItem) => {
    setEditingId(item.absensi_id);
    setEditStatus(item.status);
    setEditingRow(item);
    setBuktiFoto(null);
    setPreviewUrl(resolveBuktiUrl(item.bukti));
    setEditDialog(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      Swal.fire({ icon: "error", title: "Format tidak valid", text: "Hanya JPG, JPEG, PNG." });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({ icon: "error", title: "File terlalu besar", text: "Maksimal 2 MB." });
      return;
    }
    setBuktiFoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpdateStatus = async () => {
    if (!editingId) return;

    if ((editStatus === "izin" || editStatus === "sakit") && !buktiFoto && !editingRow?.bukti) {
      Swal.fire({ icon: "warning", title: "Bukti Diperlukan", text: "Status izin atau sakit wajib menyertakan bukti foto." });
      return;
    }

    try {
      setIsLoadingAksi(true);
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("status", editStatus);
      if (buktiFoto) formData.append("bukti", buktiFoto);

      await api.post(`/spa/absensi/siswa/pelajaran/${editingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setEditDialog(false);
      setBuktiFoto(null);
      setPreviewUrl(null);
      setDataFlat((prev) => prev.map((item) => (item.absensi_id === editingId ? { ...item, status: editStatus } : item)));
      Swal.fire({ icon: "success", title: "Berhasil!", text: "Status absensi berhasil diperbarui.", showConfirmButton: false, timer: 1800 });
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Gagal memperbarui!", text: err.response?.data?.message || "Terjadi kesalahan." });
    } finally {
      setIsLoadingAksi(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
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
      await api.delete("/spa/absensi/siswa/pelajaran/destroy", { params: { ids: deletableIds } });
      setSelectedIds([]);
      setDataFlat((prev) => prev.filter((i) => !deletableIds.includes(i.absensi_id)));
      Swal.fire({ icon: "success", title: "Berhasil!", text: "Data berhasil dihapus.", showConfirmButton: false, timer: 1800 });
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Gagal menghapus!", text: err.response?.data?.message || "Terjadi kesalahan." });
    } finally {
      setLoadingData(false);
    }
  };

  // ── Export ──────────────────────────────────────────────────────────────────
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    if (!selectedTahun || !selectedSemester) {
      Swal.fire({ icon: "warning", title: "Pilih tahun dan semester terlebih dahulu." });
      return;
    }
    try {
      const res = await api.get("/spa/absensi/siswa/pelajaran/export", {
        params: { tahun_akademik_id: Number(selectedTahun), semester_id: Number(selectedSemester) },
        responseType: "blob",
      });
      downloadBlob(res.data, "absensi-siswa-pelajaran.xlsx");
      Swal.fire({ icon: "success", title: "Export Excel berhasil!", showConfirmButton: false, timer: 1500 });
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Export gagal!", text: err.response?.data?.message || "Terjadi kesalahan." });
    }
  };

  const handleExportZip = async () => {
    if (!selectedTahun || !selectedSemester) {
      Swal.fire({ icon: "warning", title: "Pilih tahun dan semester terlebih dahulu." });
      return;
    }
    try {
      const res = await api.get("/spa/absensi/siswa/pelajaran/zip", {
        params: { tahun_akademik_id: Number(selectedTahun), semester_id: Number(selectedSemester) },
        responseType: "blob",
      });
      const contentType = res.headers["content-type"] ?? "";
      if (contentType.includes("application/json")) {
        const text = await res.data.text();
        const json = JSON.parse(text);
        Swal.fire({ icon: "error", title: "Export ZIP gagal!", text: json.message || "Terjadi kesalahan." });
        return;
      }
      downloadBlob(res.data, "bukti-absensi-siswa.zip");
      Swal.fire({ icon: "success", title: "Export ZIP berhasil!", showConfirmButton: false, timer: 1500 });
    } catch (err: any) {
      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const json = JSON.parse(text);
          Swal.fire({ icon: "error", title: "Export ZIP gagal!", text: json.message || json.error || "Terjadi kesalahan." });
        } catch {
          Swal.fire({ icon: "error", title: "Export ZIP gagal!", text: "Terjadi kesalahan server." });
        }
        return;
      }
      Swal.fire({ icon: "error", title: "Export ZIP gagal!", text: err.response?.data?.message || "Terjadi kesalahan." });
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Absensi Siswa - Pelajaran" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Data Absensi Siswa - Pelajaran</h1>
            <p className="text-sm text-muted-foreground mt-1">Kelola data absensi pelajaran siswa per tahun akademik dan semester</p>
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
                    <Select value={selectedSemester} onValueChange={(val) => setSelectedSemester(val)} disabled={!selectedTahun || semesterOptions.length === 0}>
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
                      <Input placeholder="Cari nama, rombel, mata pelajaran..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" disabled={dataFlat.length === 0} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Statistik ── */}
              {!loadingData && dataFlat.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                  {[
                    { label: "Total Siswa", value: stats.totalSiswa, icon: UserCheck, color: "bg-blue-50 text-blue-700 border-blue-200" },
                    { label: "Total Hadir", value: stats.hadir, icon: UserCheck, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                    { label: "Total Izin", value: stats.izin, icon: FileCheck, color: "bg-sky-50 text-sky-700 border-sky-200" },
                    { label: "Total Sakit", value: stats.sakit, icon: FileX, color: "bg-amber-50 text-amber-700 border-amber-200" },
                    { label: "Total Alpa", value: stats.alpa, icon: XCircle, color: "bg-red-50 text-red-700 border-red-200" },
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

              {/* ── Loading / Empty state ── */}
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
                    <Button variant="outline" size="sm" onClick={handleExportExcel}>
                      <FileSpreadsheet size={16} className="mr-1" /> Export Absensi
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportZip}>
                      <FileArchive size={16} className="mr-1" /> Export ZIP Bukti
                    </Button>
                  </div>

                  {/* ── Accordion: Semester → Rombel → Siswa ── */}
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
                        const isSemExpanded = expandedSemester.includes(semGroup.semester_id_key);
                        const totalAbsensi = semGroup.rombels.reduce((a, r) => a + r.siswas.reduce((b, s) => b + s.absensi.length, 0), 0);
                        const totalSiswa = semGroup.rombels.reduce((a, r) => a + r.siswas.length, 0);

                        return (
                          <div key={semGroup.semester_id_key} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* ── Header Semester ── */}
                            <button type="button" className="w-full bg-primary px-5 py-4 flex items-center justify-between hover:bg-primary/90 transition-colors" onClick={() => toggleSemester(semGroup.semester_id_key)}>
                              <div className="flex items-center gap-3">
                                {isSemExpanded ? <ChevronDownIcon className="text-white" size={20} /> : <ChevronRightIcon className="text-white" size={20} />}
                                <div className="text-left">
                                  <p className="text-white font-bold text-base">Semester {semGroup.semester}</p>
                                  <p className="text-white/70 text-xs mt-0.5">{semGroup.tahun_akademik}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge className={semGroup.status_semester === "aktif" ? "bg-white/20 text-white border-white/30 text-xs" : "bg-white/10 text-white/60 border-white/20 text-xs"}>{semGroup.status_semester}</Badge>
                                <div className="text-right">
                                  <p className="text-white font-semibold">{totalSiswa} siswa</p>
                                  <p className="text-white/70 text-xs">{totalAbsensi} catatan</p>
                                </div>
                              </div>
                            </button>

                            {/* ── List Rombel ── */}
                            {isSemExpanded && (
                              <div className="p-4 space-y-3">
                                {semGroup.rombels.map((rombelGroup) => {
                                  const rombelKey = `${semGroup.semester_id_key}|${rombelGroup.rombel}`;
                                  const isRombelExpanded = expandedRombel.includes(rombelKey);
                                  const totalRombelAbs = rombelGroup.siswas.reduce((a, s) => a + s.absensi.length, 0);

                                  return (
                                    <div key={rombelKey} className="border border-gray-200 rounded-lg overflow-hidden">
                                      {/* ── Header Rombel ── */}
                                      <button type="button" className="w-full bg-indigo-50 px-4 py-3 flex items-center justify-between hover:bg-indigo-100 transition-colors" onClick={() => toggleRombel(rombelKey)}>
                                        <div className="flex items-center gap-3">
                                          {isRombelExpanded ? <ChevronDownIcon className="text-indigo-600" size={16} /> : <ChevronRightIcon className="text-indigo-600" size={16} />}
                                          <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-indigo-200 flex items-center justify-center">
                                              <BookOpenIcon size={14} className="text-indigo-700" />
                                            </div>
                                            <span className="font-semibold text-indigo-900 text-sm">{rombelGroup.rombel}</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">{rombelGroup.siswas.length} siswa</span>
                                          <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 text-xs">{totalRombelAbs} catatan</Badge>
                                        </div>
                                      </button>

                                      {/* ── List Siswa ── */}
                                      {isRombelExpanded && (
                                        <div className="p-3 space-y-2 bg-white">
                                          {rombelGroup.siswas.map((siswa) => {
                                            const isSiswaExpanded = expandedSiswa.includes(siswa.siswa_id);

                                            return (
                                              <div key={siswa.siswa_id} className="border border-gray-100 rounded-lg overflow-hidden">
                                                {/* ── Header Siswa ── */}
                                                <button type="button" className="w-full bg-gray-50 px-4 py-2.5 flex items-center justify-between hover:bg-gray-100 transition-colors" onClick={() => toggleSiswa(siswa.siswa_id)}>
                                                  <div className="flex items-center gap-3">
                                                    {isSiswaExpanded ? <ChevronDownIcon className="text-gray-500" size={14} /> : <ChevronRightIcon className="text-gray-500" size={14} />}
                                                    <div className="flex items-center gap-2">
                                                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <UserCheck size={12} className="text-gray-600" />
                                                      </div>
                                                      <div className="text-left">
                                                        <span className="font-semibold text-gray-800 text-sm">{siswa.nama_siswa}</span>
                                                        {siswa.nisn && <p className="text-xs text-gray-400">NISN: {siswa.nisn}</p>}
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center gap-1.5">
                                                    <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">{siswa.hadir_per_semester}H</span>
                                                    <span className="text-xs text-sky-600 font-semibold bg-sky-50 px-2 py-0.5 rounded-full">{siswa.izin_per_semester}I</span>
                                                    <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">{siswa.sakit_per_semester}S</span>
                                                    <span className="text-xs text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded-full">{siswa.alpa_per_semester}A</span>
                                                    <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 text-xs ml-1">{siswa.absensi.length} catatan</Badge>
                                                  </div>
                                                </button>

                                                {/* ── Tabel Absensi Siswa ── */}
                                                {isSiswaExpanded && (
                                                  <div className="overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                      <thead>
                                                        <tr className="bg-gray-50 border-b border-gray-200">
                                                          <th className="text-center px-4 py-2.5 font-semibold text-gray-600 w-10">
                                                            <input type="checkbox" ref={selectAllRef} checked={isAllSelected} onChange={(e) => handleSelectAll(e.target.checked)} className="w-4 h-4 cursor-pointer" />
                                                          </th>
                                                          <th className="text-left px-4 py-2.5 font-semibold text-gray-600 w-10">No</th>
                                                          <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Mata Pelajaran</th>
                                                          <th className="text-left px-4 py-2.5 font-semibold text-gray-600 w-36">Tanggal</th>
                                                          <th className="text-left px-4 py-2.5 font-semibold text-gray-600 w-28">Status</th>
                                                          <th className="text-center px-4 py-2.5 font-semibold text-gray-600 w-20">Bukti</th>
                                                          <th className="text-center px-4 py-2.5 font-semibold text-gray-600 w-24">Aksi</th>
                                                        </tr>
                                                      </thead>
                                                      <tbody>
                                                        {siswa.absensi.map((item, idx) => (
                                                          <tr key={item.absensi_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                            <td className="text-center px-4 py-3">
                                                              <Checkbox checked={selectedIds.includes(item.absensi_id)} onCheckedChange={(checked) => handleSelectOne(item.absensi_id, !!checked)} />
                                                            </td>
                                                            <td className="px-4 py-3 text-center text-gray-400 text-xs font-medium">{idx + 1}</td>
                                                            <td className="px-4 py-3">
                                                              {item.mata_pelajaran ? <span className="font-medium text-gray-900">{item.mata_pelajaran}</span> : <span className="text-xs text-gray-300 italic">Tidak Tercatat</span>}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-700">{item.hari}</td>
                                                            <td className="px-4 py-3">
                                                              <Badge className={statusBadgeClass(item.status)}>{item.status}</Badge>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                              {resolveBuktiUrl(item.bukti) ? (
                                                                <Button
                                                                  size="sm"
                                                                  variant="outline"
                                                                  onClick={() => {
                                                                    setPreviewImage(resolveBuktiUrl(item.bukti));
                                                                    setPreviewDialog(true);
                                                                  }}
                                                                >
                                                                  <EyeIcon size={13} />
                                                                </Button>
                                                              ) : (
                                                                <span className="text-xs text-gray-300">—</span>
                                                              )}
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
        <Dialog
          open={editDialog}
          onOpenChange={(open) => {
            setEditDialog(open);
            if (!open) {
              setBuktiFoto(null);
              setPreviewUrl(null);
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Status Absensi</DialogTitle>
              <DialogDescription>Ubah status kehadiran dan bukti siswa</DialogDescription>
            </DialogHeader>
            {editingRow && (
              <div className="space-y-4 py-2">
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nama Siswa</span>
                    <span className="font-semibold">{editingRow.nama_siswa}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rombel</span>
                    <span className="font-semibold">{editingRow.rombel ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mata Pelajaran</span>
                    <span className="font-semibold">{editingRow.mata_pelajaran ?? "—"}</span>
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
                  <Label className="text-sm font-semibold">Status Kehadiran</Label>
                  <Select value={editStatus} onValueChange={(v) => setEditStatus(v as AbsensiItem["status"])}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hadir">Hadir</SelectItem>
                      <SelectItem value="izin">Izin</SelectItem>
                      <SelectItem value="sakit">Sakit</SelectItem>
                      <SelectItem value="alpa">Alpa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(editStatus === "izin" || editStatus === "sakit") && (
                  <div>
                    <Label className="text-sm font-semibold">
                      Bukti Foto <span className="text-red-500">*</span>
                    </Label>
                    <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleFileChange} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm cursor-pointer" />
                    <p className="text-xs text-gray-400 mt-1">JPG, JPEG, PNG · Maks 2 MB</p>
                  </div>
                )}

                {previewUrl && (editStatus === "izin" || editStatus === "sakit") && (
                  <div className="border rounded-lg p-3 bg-gray-50 flex justify-center">
                    <div className="text-center">
                      <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded shadow" />
                      <p className="text-xs text-gray-400 mt-1">
                        <ImageIcon size={12} className="inline mr-1" />
                        {buktiFoto ? buktiFoto.name : "Bukti saat ini"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button
                className="gap-2 bg-muted-foreground hover:bg-muted-foreground/90"
                onClick={() => {
                  setEditDialog(false);
                  setBuktiFoto(null);
                  setPreviewUrl(null);
                }}
                disabled={isLoadingAksi}
              >
                <CircleXIcon size={15} /> Batal
              </Button>
              <Button className="bg-primary gap-2" onClick={handleUpdateStatus} disabled={isLoadingAksi}>
                {isLoadingAksi ? <Loader2Icon size={15} className="animate-spin" /> : <FilePlus size={15} />}
                {isLoadingAksi ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Dialog Preview Bukti ── */}
        <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Preview Bukti</DialogTitle>
              <DialogDescription>Bukti izin / sakit yang diunggah siswa</DialogDescription>
            </DialogHeader>
            <div className="flex justify-center items-center p-4 bg-gray-50 rounded-lg">
              {previewImage ? <img src={previewImage} alt="Bukti" className="max-w-full max-h-[60vh] rounded-lg shadow-lg" /> : <p className="text-gray-500">Tidak ada gambar</p>}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </SidebarProvider>
  );
};

export default DataAbsensiSiswa;
