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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Footer from "@/pages/Footer";
import { Loader2Icon, SearchIcon, Trash2Icon, FileSpreadsheet, FileArchive, PenBoxIcon, CircleXIcon, FilePlus, UserCheck, FileCheck, FileX, XCircle, CalendarIcon, EyeIcon, ImageIcon } from "lucide-react";
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
  // Pakai VITE_API_BASE_URL, fallback ke 127.0.0.1:8000
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

      // editableOverride dipakai saat backend belum return status (cek dari filter yang dipilih)
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
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
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
    setCurrentPage(1);

    api
      .get("/spa/absensi/siswa/pelajaran", {
        params: {
          tahun_akademik_id: Number(selectedTahun),
          semester_id: Number(selectedSemester),
        },
      })
      .then((res) => {
        if (res.data.status === "success") {
          // Cek apakah semester yang dipilih aktif dari dropdown options
          const semTerpilih = semesterOptions.find((s) => String(s.semester_id) === selectedSemester);
          const tahunTerpilih = tahunOptions.find((t) => String(t.tahun_akademik_id) === selectedTahun);
          const isAktif = semTerpilih?.status === "aktif" && tahunTerpilih?.status === "aktif";
          setDataFlat(flattenData(res.data.data, isAktif));
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
      hadir: dataFlat.filter((x) => x.status === "hadir").length,
      izin: dataFlat.filter((x) => x.status === "izin").length,
      sakit: dataFlat.filter((x) => x.status === "sakit").length,
      alpa: dataFlat.filter((x) => x.status === "alpa").length,
    }),
    [dataFlat],
  );

  // ── Filter & Pagination ─────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
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

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  // ── Checkbox ────────────────────────────────────────────────────────────────
  const isAllSelected = paginated.length > 0 && paginated.every((i) => selectedIds.includes(i.absensi_id));
  const isSomeSelected = paginated.some((i) => selectedIds.includes(i.absensi_id)) && !isAllSelected;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = isSomeSelected;
  }, [isSomeSelected]);

  const handleSelectAll = (checked: boolean) => setSelectedIds(checked ? paginated.map((i) => i.absensi_id) : []);
  const handleSelectOne = (id: number, checked: boolean) => setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));

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
      // Update local state
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

      // Cek apakah response adalah error JSON (bukan file ZIP)
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
      // Jika error, coba baca pesan dari blob
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
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tahun Akademik</label>
                    <Select value={selectedTahun} onValueChange={handleTahunChange}>
                      <SelectTrigger>
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
                        setCurrentPage(1);
                      }}
                      disabled={!selectedTahun || semesterOptions.length === 0}
                    >
                      <SelectTrigger>
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
                      <Input
                        placeholder="Cari nama, rombel, mata pelajaran..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="pl-9"
                        disabled={dataFlat.length === 0}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Statistik ── */}
              {!loadingData && dataFlat.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                  <Card className="border-green-200">
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-full">
                          <UserCheck className="text-green-600" size={22} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Hadir</p>
                          <p className="text-2xl font-bold text-green-600">{stats.hadir}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-200">
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <FileCheck className="text-blue-600" size={22} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Izin</p>
                          <p className="text-2xl font-bold text-blue-600">{stats.izin}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-yellow-200">
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-100 rounded-full">
                          <FileX className="text-yellow-600" size={22} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Sakit</p>
                          <p className="text-2xl font-bold text-yellow-600">{stats.sakit}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200">
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-full">
                          <XCircle className="text-red-600" size={22} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Alpa</p>
                          <p className="text-2xl font-bold text-red-600">{stats.alpa}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

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

                  {/* ── Tabel ── */}
                  <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
                    <Table className="min-w-full">
                      <TableHeader className="bg-primary">
                        <TableRow>
                          <TableHead className="w-12 text-center">
                            <input type="checkbox" ref={selectAllRef} checked={isAllSelected} onChange={(e) => handleSelectAll(e.target.checked)} className="w-4 h-4 cursor-pointer" />
                          </TableHead>
                          <TableHead className="text-center text-white font-semibold w-12">No</TableHead>
                          <TableHead className="text-white font-semibold">Nama Siswa</TableHead>
                          <TableHead className="text-white font-semibold">Rombel</TableHead>
                          <TableHead className="text-white font-semibold">Mata Pelajaran</TableHead>
                          <TableHead className="text-white font-semibold">Tanggal</TableHead>
                          <TableHead className="text-white font-semibold">Status</TableHead>
                          <TableHead className="text-center text-white font-semibold">H/I/S/A</TableHead>
                          <TableHead className="text-center text-white font-semibold">Bukti</TableHead>
                          <TableHead className="text-center text-white font-semibold w-24">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={10} className="text-center text-gray-400 py-10">
                              {searchTerm ? "Tidak ada data yang sesuai pencarian" : "Tidak ada data absensi pada periode ini"}
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginated.map((item, idx) => (
                            <TableRow key={item.absensi_id} className="hover:bg-indigo-50 even:bg-gray-50 border-b border-gray-100">
                              <TableCell className="text-center">
                                <Checkbox checked={selectedIds.includes(item.absensi_id)} onCheckedChange={(checked) => handleSelectOne(item.absensi_id, !!checked)} />
                              </TableCell>
                              <TableCell className="text-center text-gray-400 text-sm">{(currentPage - 1) * rowsPerPage + idx + 1}</TableCell>
                              <TableCell>
                                <p className="font-semibold text-gray-900">{item.nama_siswa}</p>
                                {item.nisn && <p className="text-xs text-gray-400">NISN: {item.nisn}</p>}
                              </TableCell>
                              <TableCell className="text-sm">{item.rombel ?? "—"}</TableCell>
                              <TableCell className="text-sm">{item.mata_pelajaran ?? "—"}</TableCell>
                              <TableCell className="text-sm">{item.hari}</TableCell>
                              <TableCell>
                                <Badge className={statusBadgeClass(item.status)}>{item.status}</Badge>
                              </TableCell>
                              <TableCell className="text-center text-xs">
                                <span className="text-green-600 font-medium">{item.hadir_per_semester}</span>
                                <span className="text-gray-400">/</span>
                                <span className="text-blue-500 font-medium">{item.izin_per_semester}</span>
                                <span className="text-gray-400">/</span>
                                <span className="text-yellow-500 font-medium">{item.sakit_per_semester}</span>
                                <span className="text-gray-400">/</span>
                                <span className="text-red-500 font-medium">{item.alpa_per_semester}</span>
                              </TableCell>
                              <TableCell className="text-center">
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
                              </TableCell>
                              <TableCell className="text-center">
                                {item.is_editable ? (
                                  <Button size="sm" className="bg-primary" onClick={() => handleEdit(item)}>
                                    <PenBoxIcon size={14} />
                                  </Button>
                                ) : (
                                  <span className="text-xs text-gray-300">arsip</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* ── Pagination ── */}
                  {filteredData.length > 0 && (
                    <div className="flex flex-col md:flex-row justify-between items-center mt-5 gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Tampilkan:</span>
                        <select
                          value={rowsPerPage}
                          onChange={(e) => {
                            setRowsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value={10}>10</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                        <span>per halaman · total {filteredData.length} data</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                          Prev
                        </Button>
                        <span className="text-sm">
                          Halaman <strong>{currentPage}</strong> dari <strong>{totalPages || 1}</strong>
                        </span>
                        <Button size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                          Next
                        </Button>
                      </div>
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

                {/* Upload bukti — hanya tampil jika izin/sakit */}
                {(editStatus === "izin" || editStatus === "sakit") && (
                  <div>
                    <Label className="text-sm font-semibold">
                      Bukti Foto <span className="text-red-500">*</span>
                    </Label>
                    <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleFileChange} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm cursor-pointer" />
                    <p className="text-xs text-gray-400 mt-1">JPG, JPEG, PNG · Maks 2 MB</p>
                  </div>
                )}

                {/* Preview bukti */}
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
                variant="secondary"
                className="gap-2"
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
