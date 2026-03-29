import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2Icon, FolderOpenIcon, PlusIcon, CalendarIcon, FileSpreadsheetIcon, ArchiveIcon, PenBoxIcon, Trash2Icon } from "lucide-react";
import Footer from "@/pages/Footer";
import Swal from "sweetalert2";
import api from "@/api/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Berkas {
  berkas_id: number;
  nama_berkas: string;
  berkas: string | null;
  hari: string;
}

interface SemesterItem {
  semester_id: number;
  semester: string;
  status_semester: string;
  berkas: Berkas[];
}

interface BerkasAdministrasiData {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: string;
  semester: SemesterItem[];
}

interface TahunAkademikOption {
  id: number;
  tahun_akademik: string;
  status: string;
}

interface FlatBerkas extends Berkas {
  semester: string;
  status_semester: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const tahunBadge = (status: string) => (status === "aktif" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600");

const semesterBadge = (status: string) => (status === "aktif" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500");

// ─── Component ────────────────────────────────────────────────────────────────

const DataBerkasAdministrasi = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [tahunList, setTahunList] = useState<TahunAkademikOption[]>([]);
  const [selectedTahun, setSelectedTahun] = useState<string>("");
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [selectLoaded, setSelectLoaded] = useState(false);

  const [data, setData] = useState<BerkasAdministrasiData | null>(null);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Fetch tahun akademik ──
  useEffect(() => {
    const fetchTahun = async () => {
      try {
        setLoadingSelect(true);
        const res = await api.get("/spa/tahun-akademik");
        const rawData = res.data?.data ?? [];

        let list: TahunAkademikOption[] = [];
        if (Array.isArray(rawData)) {
          list = rawData.map((item: any) => ({
            id: item.id ?? item.tahun_akademik_id,
            tahun_akademik: item.tahun_akademik,
            status: item.status ?? item.status_tahun_akademik ?? "",
          }));
        } else if (typeof rawData === "object") {
          list = Object.values(rawData).map((item: any) => ({
            id: item.id ?? item.tahun_akademik_id,
            tahun_akademik: item.tahun_akademik,
            status: item.status ?? item.status_tahun_akademik ?? "",
          }));
        }

        setTahunList(list);
        const aktif = list.find((t) => t.status === "aktif");
        const defaultId = aktif ? String(aktif.id) : list[0] ? String(list[0].id) : "";
        setSelectedTahun(defaultId);
        setSelectLoaded(true);
      } catch (err) {
        console.error("[TahunAkademik] error:", err);
        Swal.fire({ icon: "error", title: "Gagal", text: "Tidak dapat memuat data tahun akademik." });
      } finally {
        setLoadingSelect(false);
      }
    };
    fetchTahun();
  }, []);

  // ── Fetch berkas ──
  useEffect(() => {
    if (!selectLoaded || !selectedTahun) return;
    fetchBerkas();
  }, [selectedTahun, selectLoaded]);

  const fetchBerkas = async () => {
    setLoading(true);
    setData(null);
    setCurrentPage(1);
    try {
      const res = await api.get("/spa/berkas-administrasi", {
        params: { tahun_akademik_id: selectedTahun },
      });
      const result = res.data?.data;
      setData(Array.isArray(result) ? result[0] : (result ?? null));
    } catch (err: any) {
      if (err.response?.status !== 404) {
        Swal.fire({ icon: "error", title: "Gagal", text: err.response?.data?.message || "Gagal mengambil data berkas." });
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (id: number, nama: string) => {
    const result = await Swal.fire({
      title: "Hapus Berkas?",
      html: `Berkas <b>${nama}</b> akan dihapus secara permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;

    try {
      await api.delete(`/spa/berkas-administrasi/${id}`);
      Swal.fire({ icon: "success", title: "Berhasil", timer: 1500, showConfirmButton: false });
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          semester: prev.semester.map((sem) => ({
            ...sem,
            berkas: sem.berkas.filter((b) => b.berkas_id !== id),
          })),
        };
      });
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Gagal", text: err.response?.data?.message || "Gagal menghapus berkas." });
    }
  };

  // ── Navigate ke Edit — kirim data via state ──
  const handleEdit = (b: FlatBerkas) => {
    navigate(`/superadmin/informasi-laporan-umum/berkas-administrasi/edit/${b.berkas_id}`, {
      state: {
        berkas_id: b.berkas_id,
        nama_berkas: b.nama_berkas,
        berkas: b.berkas,
        hari: b.hari,
      },
    });
  };

  // ── Export Excel ──
  const handleExportExcel = async () => {
    if (!selectedTahun) return;
    try {
      const res = await api.get("/berkas-administrasi-excel", {
        params: { tahun_akademik_id: selectedTahun },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Berkas_Administrasi.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      Swal.fire({ icon: "success", title: "Export berhasil!", showConfirmButton: false, timer: 1500 });
    } catch {
      Swal.fire({ icon: "error", title: "Gagal", text: "Gagal export Excel." });
    }
  };

  // ── Export ZIP ──
  const handleExportZip = async () => {
    if (!selectedTahun) return;
    try {
      const res = await api.get("/berkas-administrasi-zip", {
        params: { tahun_akademik_id: selectedTahun },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Berkas_Administrasi.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      Swal.fire({ icon: "success", title: "Export berhasil!", showConfirmButton: false, timer: 1500 });
    } catch {
      Swal.fire({ icon: "error", title: "Gagal", text: "Gagal export ZIP." });
    }
  };

  // ── Flatten + Pagination ──
  const allBerkas: FlatBerkas[] = useMemo(() => data?.semester.flatMap((sem) => sem.berkas.map((b) => ({ ...b, semester: sem.semester, status_semester: sem.status_semester }))) ?? [], [data]);

  const totalPages = Math.ceil(allBerkas.length / rowsPerPage);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return allBerkas.slice(start, start + rowsPerPage);
  }, [allBerkas, currentPage, rowsPerPage]);

  const selectedTahunObj = tahunList.find((t) => String(t.id) === selectedTahun);

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-gray-50 transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Berkas Administrasi" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8 space-y-6">
          {/* ── Page Header ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Berkas Administrasi</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manajemen berkas administrasi sekolah per tahun akademik</p>
            </div>
            <Button className="bg-primary w-fit" onClick={() => navigate("/superadmin/informasi-laporan-umum/berkas-administrasi/create")}>
              <PlusIcon size={16} className="mr-1.5" />
              Tambah Berkas
            </Button>
          </div>

          {/* ── Loading select ── */}
          {loadingSelect ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Loader2Icon className="animate-spin mb-3" size={28} />
              <p className="font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* ── Filter + Export ── */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <CalendarIcon size={16} className="text-primary shrink-0" />
                    <span className="text-sm font-medium text-gray-700">Tahun Akademik</span>

                    {tahunList.length === 0 ? (
                      <span className="text-sm text-gray-400 italic">Tidak ada data tahun akademik.</span>
                    ) : (
                      <Select
                        value={selectedTahun}
                        onValueChange={(val) => {
                          setSelectedTahun(val);
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="w-56">
                          <SelectValue placeholder="Pilih tahun akademik..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Tahun Akademik</SelectLabel>
                            {tahunList.map((t) => (
                              <SelectItem key={t.id} value={String(t.id)}>
                                {t.tahun_akademik}
                                {t.status === "aktif" && " (Aktif)"}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}

                    {selectedTahunObj && <Badge className={`text-xs ${tahunBadge(selectedTahunObj.status)}`}>{selectedTahunObj.status}</Badge>}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportExcel}>
                      <FileSpreadsheetIcon size={15} className="mr-1.5" />
                      Export Excel
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportZip}>
                      <ArchiveIcon size={15} className="mr-1.5" />
                      Export ZIP
                    </Button>
                  </div>
                </div>
              </div>

              {/* ── Loading data ── */}
              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                  <Loader2Icon className="animate-spin mb-3" size={28} />
                  <p className="font-medium">Memuat data berkas...</p>
                </div>
              ) : allBerkas.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-400">
                  <FolderOpenIcon size={36} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">Belum ada berkas pada tahun akademik ini.</p>
                </div>
              ) : (
                <>
                  {/* ── Info count + rows per page ── */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      <strong>{allBerkas.length}</strong> berkas · {data?.tahun_akademik}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Tampilkan:</span>
                      <select
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="border border-gray-200 rounded px-2 py-1 text-sm"
                      >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                      </select>
                    </div>
                  </div>

                  {/* ── Table ── */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table className="min-w-full">
                        <TableHeader>
                          <TableRow className="bg-primary hover:bg-primary">
                            <TableHead className="text-center text-white font-semibold w-12">No</TableHead>
                            <TableHead className="text-white font-semibold">Nama Berkas</TableHead>
                            <TableHead className="text-white font-semibold">Semester</TableHead>
                            <TableHead className="text-white font-semibold">Tanggal Upload</TableHead>
                            <TableHead className="text-center text-white font-semibold">File</TableHead>
                            <TableHead className="text-center text-white font-semibold">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginated.length > 0 ? (
                            paginated.map((b, idx) => (
                              <TableRow key={b.berkas_id} className="hover:bg-indigo-50/60 even:bg-gray-50/60 border-b border-gray-100 transition-colors">
                                <TableCell className="text-center text-gray-400 text-sm">{(currentPage - 1) * rowsPerPage + idx + 1}</TableCell>
                                <TableCell className="font-medium text-gray-800">{b.nama_berkas}</TableCell>
                                <TableCell>
                                  <Badge className={`text-xs ${semesterBadge(b.status_semester)}`}>{b.semester}</Badge>
                                </TableCell>
                                <TableCell className="text-sm text-gray-600">{b.hari}</TableCell>
                                <TableCell className="text-center">
                                  {b.berkas ? (
                                    <a href={b.berkas} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline underline-offset-2 hover:text-blue-800 transition-colors">
                                      Lihat Berkas
                                    </a>
                                  ) : (
                                    <span className="text-gray-300 text-sm">—</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1.5 justify-center">
                                    {/* ✅ Kirim data berkas via navigate state */}
                                    <Button size="sm" className="bg-primary" onClick={() => handleEdit(b)} title="Edit">
                                      <PenBoxIcon size={14} />
                                    </Button>
                                    <Button size="sm" variant="destructive" className="bg-muted-foreground hover:bg-muted-foreground/90"   onClick={() => handleDelete(b.berkas_id, b.nama_berkas)} title="Hapus">
                                      <Trash2Icon size={14} />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-gray-400 py-10">
                                Tidak ada data.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* ── Pagination ── */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                      <p className="text-sm text-gray-500">
                        Halaman <strong>{currentPage}</strong> dari <strong>{totalPages || 1}</strong>
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                          Prev
                        </Button>
                        <Button size="sm" variant="outline" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage((p) => p + 1)}>
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default DataBerkasAdministrasi;
