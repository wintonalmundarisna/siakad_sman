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
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectGroup, SelectItem,
  SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Footer from "@/pages/Footer";
import {
  Loader2Icon, SearchIcon, Trash2Icon, FileSpreadsheet,
  PenBoxIcon, CircleXIcon, FilePlus, CalendarCheck,
  XCircle, UserCheck, CalendarIcon,
} from "lucide-react";
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
      const isEditable =
        taGroup.status_tahun_akademik === "aktif" &&
        semGroup.status_semester === "aktif";

      semGroup.guru?.forEach((guruItem: any) => {
        guruItem.absensi?.forEach((abs: any) => {
          result.push({
            absensi_id:               abs.absensi_id,
            guru_id:                  guruItem.guru_id,
            nama_guru:                guruItem.nama_guru,
            nip:                      guruItem.nip ?? null,
            role:                     guruItem.role ?? null,
            mengajar:                 abs.mengajar ?? null,
            hari:                     abs.hari,
            status:                   abs.status,
            tahun_akademik:           taGroup.tahun_akademik,
            status_tahun_akademik:    taGroup.status_tahun_akademik,
            semester:                 semGroup.semester,
            status_semester:          semGroup.status_semester,
            hadir_per_semester:       guruItem.hadir_per_semester ?? 0,
            tidak_hadir_per_semester: guruItem.tidak_hadir_per_semester ?? 0,
            is_editable:              isEditable,
          });
        });
      });
    });
  });

  return result;
};

// ── Component ─────────────────────────────────────────────────────────────────
const DataAbsensiPegawai = () => {
  const [isCollapsed, setIsCollapsed]           = useState(false);
  const [tahunOptions, setTahunOptions]         = useState<TahunOption[]>([]);
  const [selectedTahun, setSelectedTahun]       = useState<string>("");
  const [semesterOptions, setSemesterOptions]   = useState<SemesterOption[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [loadingSelect, setLoadingSelect]       = useState(true);
  const [dataFlat, setDataFlat]                 = useState<AbsensiItem[]>([]);
  const [loadingData, setLoadingData]           = useState(false);
  const [searchTerm, setSearchTerm]             = useState("");
  const [rowsPerPage, setRowsPerPage]           = useState(10);
  const [currentPage, setCurrentPage]           = useState(1);
  const [selectedIds, setSelectedIds]           = useState<number[]>([]);
  const selectAllRef                            = useRef<HTMLInputElement>(null);
  const [editDialog, setEditDialog]             = useState(false);
  const [editingId, setEditingId]               = useState<number | null>(null);
  const [editStatus, setEditStatus]             = useState<"hadir" | "tidak hadir">("hadir");
  const [editingRow, setEditingRow]             = useState<AbsensiItem | null>(null);
  const [isLoadingAksi, setIsLoadingAksi]       = useState(false);

  // ── Fetch dropdown ────────────────────────────────────────────────────────
  useEffect(() => {
    api.get("/spa/absensi/pegawai/data-select")   // ✅ sesuai api.php
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
    setCurrentPage(1);

    api.get("/spa/absensi/pegawai/sekolah", {   // ✅ sesuai api.php
      params: {
        tahun_akademik_id: Number(selectedTahun),
        semester_id:       Number(selectedSemester),
      },
    })
      .then((res) => {
        if (res.data.status === "success") setDataFlat(flattenData(res.data.data));
      })
      .catch((err) => {
        if (err.response?.status !== 404) {
          Swal.fire({
            icon: "error", title: "Gagal memuat data!",
            text: err.response?.data?.message || "Tidak dapat memuat absensi.",
          });
        }
        setDataFlat([]);
      })
      .finally(() => setLoadingData(false));
  }, [selectedTahun, selectedSemester]);

  // ── Statistik ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const hadir      = dataFlat.filter((x) => x.status === "hadir").length;
    const tidakHadir = dataFlat.filter((x) => x.status === "tidak hadir").length;
    const persen     = hadir + tidakHadir > 0
      ? ((hadir / (hadir + tidakHadir)) * 100).toFixed(1) : "0";
    return { hadir, tidakHadir, persen };
  }, [dataFlat]);

  // ── Filter & Pagination ───────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return dataFlat;
    const lower = searchTerm.toLowerCase();
    return dataFlat.filter(
      (item) =>
        item.nama_guru.toLowerCase().includes(lower) ||
        (item.mengajar ?? "").toLowerCase().includes(lower) ||
        item.hari.toLowerCase().includes(lower) ||
        (item.nip ?? "").toLowerCase().includes(lower)
    );
  }, [searchTerm, dataFlat]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginated  = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  // ── Checkbox ──────────────────────────────────────────────────────────────
  const isAllSelected  = paginated.length > 0 && paginated.every((i) => selectedIds.includes(i.absensi_id));
  const isSomeSelected = paginated.some((i) => selectedIds.includes(i.absensi_id)) && !isAllSelected;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = isSomeSelected;
  }, [isSomeSelected]);

  const handleSelectAll = (checked: boolean) =>
    setSelectedIds(checked ? paginated.map((i) => i.absensi_id) : []);
  const handleSelectOne = (id: number, checked: boolean) =>
    setSelectedIds((prev) => checked ? [...prev, id] : prev.filter((x) => x !== id));

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
      await api.put(`/spa/absensi/pegawai/sekolah/${editingId}`, { status: editStatus }); // ✅
      setEditDialog(false);
      setDataFlat((prev) =>
        prev.map((item) =>
          item.absensi_id === editingId ? { ...item, status: editStatus } : item
        )
      );
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
    const arsipCount   = selectedRows.length - deletableIds.length;

    if (deletableIds.length === 0) {
      Swal.fire({ icon: "warning", title: "Tidak ada data yang bisa dihapus", text: "Semua data yang dipilih berasal dari semester/TA yang sudah arsip.", confirmButtonColor: "#4F46E5" });
      return;
    }

    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      html: `<b>${deletableIds.length} data aktif</b> akan dihapus permanen.${arsipCount > 0 ? `<br/><br/><span style="color:#f59e0b">⚠️ ${arsipCount} data arsip dilewati.</span>` : ""}`,
      icon: "warning", showCancelButton: true,
      confirmButtonColor: "#4F46E5", confirmButtonText: "Ya, hapus!", cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;

    try {
      setLoadingData(true);
      await api.delete("/spa/absensi/pegawai/sekolah/destroy", { params: { ids: deletableIds } }); // ✅
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
    if (ids.length === 0) { Swal.fire({ icon: "warning", title: "Tidak ada data untuk diekspor." }); return; }
    try {
      const res = await api.get("/spa/absensi/pegawai/sekolah/export", { params: { ids }, responseType: "blob" }); // ✅
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href  = url;
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
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tahun Akademik</label>
                    <Select value={selectedTahun} onValueChange={handleTahunChange}>
                      <SelectTrigger><SelectValue placeholder="-- pilih tahun akademik --" /></SelectTrigger>
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
                    <Select value={selectedSemester} onValueChange={(val) => { setSelectedSemester(val); setCurrentPage(1); }} disabled={!selectedTahun || semesterOptions.length === 0}>
                      <SelectTrigger><SelectValue placeholder="-- pilih semester --" /></SelectTrigger>
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
                      <Input placeholder="Cari nama, mata pelajaran, tanggal..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-9" disabled={dataFlat.length === 0} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Statistik ── */}
              {!loadingData && dataFlat.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <Card className="border-blue-200">
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-full"><UserCheck className="text-blue-600" size={22} /></div>
                        <div><p className="text-sm text-gray-500">Total Hadir</p><p className="text-2xl font-bold text-blue-600">{stats.hadir}</p></div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200">
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-full"><XCircle className="text-red-600" size={22} /></div>
                        <div><p className="text-sm text-gray-500">Total Tidak Hadir</p><p className="text-2xl font-bold text-red-600">{stats.tidakHadir}</p></div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-green-200">
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-full"><CalendarCheck className="text-green-600" size={22} /></div>
                        <div><p className="text-sm text-gray-500">Persentase Kehadiran</p><p className="text-2xl font-bold text-green-600">{stats.persen}%</p></div>
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
                    <Button variant="outline" size="sm" onClick={() => handleExport(false)}>
                      <FileSpreadsheet size={16} className="mr-1" /> Export Semua
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport(true)} disabled={selectedIds.length === 0}>
                      <FileSpreadsheet size={16} className="mr-1" /> Export Terpilih
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
                          <TableHead className="text-white font-semibold">Nama Pegawai</TableHead>
                          <TableHead className="text-white font-semibold">NIP</TableHead>
                          <TableHead className="text-white font-semibold">Mengajar</TableHead>
                          <TableHead className="text-white font-semibold">Tanggal</TableHead>
                          <TableHead className="text-white font-semibold">Status</TableHead>
                          <TableHead className="text-center text-white font-semibold">Hadir/Tdk</TableHead>
                          <TableHead className="text-center text-white font-semibold w-24">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center text-gray-400 py-10">
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
                                <p className="font-semibold text-gray-900">{item.nama_guru}</p>
                                {item.role && <p className="text-xs text-gray-400 capitalize">{item.role}</p>}
                              </TableCell>
                              <TableCell className="text-sm text-gray-500">{item.nip ?? "—"}</TableCell>
                              <TableCell className="text-sm">{item.mengajar ?? "—"}</TableCell>
                              <TableCell className="text-sm">{item.hari}</TableCell>
                              <TableCell>
                                <Badge className={item.status === "hadir" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>
                                  {item.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center text-sm">
                                <span className="text-green-600 font-medium">{item.hadir_per_semester}</span>
                                <span className="text-gray-400 mx-1">/</span>
                                <span className="text-red-500 font-medium">{item.tidak_hadir_per_semester}</span>
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
                        <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="border border-gray-300 rounded px-2 py-1 text-sm">
                          <option value={10}>10</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                        <span>per halaman · total {filteredData.length} data</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Prev</Button>
                        <span className="text-sm">Halaman <strong>{currentPage}</strong> dari <strong>{totalPages || 1}</strong></span>
                        <Button size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next</Button>
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
        <Dialog open={editDialog} onOpenChange={setEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Status Absensi</DialogTitle>
              <DialogDescription>Ubah status kehadiran pegawai</DialogDescription>
            </DialogHeader>
            {editingRow && (
              <div className="space-y-4 py-2">
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Nama Pegawai</span><span className="font-semibold">{editingRow.nama_guru}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Mengajar</span><span className="font-semibold">{editingRow.mengajar ?? "—"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Tanggal</span><span className="font-semibold">{editingRow.hari}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Semester</span><span className="font-semibold">{editingRow.semester} · {editingRow.tahun_akademik}</span></div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Status Kehadiran</label>
                  <Select value={editStatus} onValueChange={(v: "hadir" | "tidak hadir") => setEditStatus(v)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
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