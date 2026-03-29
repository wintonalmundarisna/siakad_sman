import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2Icon, SearchIcon, Trash2Icon, FileSpreadsheet, PenBoxIcon, EyeIcon, PlusIcon, TrendingUp, TrendingDown, Wallet, CalendarIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Footer from "@/pages/Footer";
import type { Keuangan } from "@/types/keuanganSekolah";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { keuanganService } from "@/services/keuanganService";
import api from "@/api/axios";

// ── Types ──────────────────────────────────────────────────────────────────────
interface TahunAkademikOption {
  id: number;
  tahun_akademik: string;
  status: string; // "aktif" | "arsip"
}

interface KeuanganGroup {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: string;
  data: Keuangan[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const formatRupiah = (value: string | number) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(isNaN(num) ? 0 : num);
};

const tahunBadge = (status: string) => (status === "aktif" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600");

// ── Component ──────────────────────────────────────────────────────────────────
const DataKeuangan = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Tahun akademik — pakai /spa/tahun-akademik (sama seperti pola DataPrestasiSiswa)
  const [tahunList, setTahunList] = useState<TahunAkademikOption[]>([]);
  const [selectedTahun, setSelectedTahun] = useState<string>("");
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [selectLoaded, setSelectLoaded] = useState(false);

  // Data keuangan
  const [dataKeuangan, setDataKeuangan] = useState<Keuangan[]>([]);
  const [currentGroup, setCurrentGroup] = useState<KeuanganGroup | null>(null);
  const [loading, setLoading] = useState(false);

  // Table state
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const selectAllRef = useRef<HTMLInputElement>(null);

  // ── Fetch tahun akademik dari /spa/tahun-akademik ──────────────────────────
  useEffect(() => {
    const fetchTahun = async () => {
      try {
        setLoadingSelect(true);
        const res = await api.get("/spa/tahun-akademik");

        if (res.data.status === "success") {
          const rawData = res.data.data ?? [];

          // Normalise: backend mungkin return array flat atau nested
          // Contoh flat:   [{ id, tahun_akademik, status }, ...]
          // Contoh nested: { data: [...] } atau object keyed by id
          let list: TahunAkademikOption[] = [];

          if (Array.isArray(rawData)) {
            list = rawData.map((item: any) => ({
              id: item.id ?? item.tahun_akademik_id,
              tahun_akademik: item.tahun_akademik,
              status: item.status ?? item.status_tahun_akademik ?? "",
            }));
          } else if (typeof rawData === "object") {
            // Kemungkinan object { "1": {...}, "2": {...} }
            list = Object.values(rawData).map((item: any) => ({
              id: item.id ?? item.tahun_akademik_id,
              tahun_akademik: item.tahun_akademik,
              status: item.status ?? item.status_tahun_akademik ?? "",
            }));
          }

          setTahunList(list);

          // Auto-select tahun aktif, fallback ke index 0
          const aktif = list.find((t) => t.status === "aktif");
          const defaultId = aktif ? String(aktif.id) : list[0] ? String(list[0].id) : "";
          setSelectedTahun(defaultId);
          setSelectLoaded(true);
        }
      } catch (err) {
        console.error("[TahunAkademik] error:", err);
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Tidak dapat memuat data tahun akademik.",
        });
      } finally {
        setLoadingSelect(false);
      }
    };
    fetchTahun();
  }, []);

  // ── Fetch data keuangan saat tahun berubah ─────────────────────────────────
  useEffect(() => {
    if (!selectLoaded || !selectedTahun) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        setDataKeuangan([]);
        setCurrentGroup(null);
        setSelectedIds([]);
        setCurrentPage(1);

        const response = await keuanganService.getAll(Number(selectedTahun));
        if (response.status === "success" && response.data.length > 0) {
          const group: KeuanganGroup = response.data[0];
          setCurrentGroup(group);
          setDataKeuangan(group.data ?? []);
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          Swal.fire({
            icon: "error",
            title: "Gagal memuat data!",
            text: error.response?.data?.message || "Tidak dapat memuat data keuangan.",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedTahun, selectLoaded]);

  // ── Filter & Pagination ────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return dataKeuangan;
    const lower = searchTerm.toLowerCase();
    return dataKeuangan.filter((item) => item.nama_akun.toLowerCase().includes(lower) || item.keterangan?.toLowerCase().includes(lower));
  }, [searchTerm, dataKeuangan]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  // ── Summary stats ──────────────────────────────────────────────────────────
  const totalDebit = useMemo(() => dataKeuangan.reduce((s, i) => s + parseFloat(i.debit || "0"), 0), [dataKeuangan]);
  const totalKredit = useMemo(() => dataKeuangan.reduce((s, i) => s + parseFloat(i.kredit || "0"), 0), [dataKeuangan]);
  const saldo = totalDebit - totalKredit;

  // ── Checkbox ───────────────────────────────────────────────────────────────
  const isAllSelected = paginated.length > 0 && paginated.every((i) => selectedIds.includes(i.id));
  const isSomeSelected = paginated.some((i) => selectedIds.includes(i.id)) && !isAllSelected;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = isSomeSelected;
  }, [isSomeSelected]);

  const handleSelectAll = (checked: boolean) => setSelectedIds(checked ? paginated.map((i) => i.id) : []);

  const handleSelectOne = (id: number, checked: boolean) => setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteMultiple = async () => {
    if (selectedIds.length === 0) return;
    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: `${selectedIds.length} data akan dihapus.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      setLoading(true);
      await keuanganService.deleteMultiple(selectedIds);
      setDataKeuangan((prev) => prev.filter((i) => !selectedIds.includes(i.id)));
      setSelectedIds([]);
      Swal.fire({ icon: "success", title: "Berhasil dihapus!", showConfirmButton: false, timer: 1500 });
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Gagal!", text: err.response?.data?.message || "Terjadi kesalahan." });
    } finally {
      setLoading(false);
    }
  };

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExportExcel = async (selected = false) => {
    try {
      const ids = selected ? selectedIds : undefined;
      const blob = await keuanganService.exportExcel(ids);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "data-keuangan.xlsx";
      link.click();
      window.URL.revokeObjectURL(url);
      Swal.fire({ icon: "success", title: "Export berhasil!", showConfirmButton: false, timer: 1500 });
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Export gagal!", text: error.response?.data?.message });
    }
  };

  const selectedTahunObj = tahunList.find((t) => String(t.id) === selectedTahun);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-gray-50 transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Keuangan" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8 space-y-6">
          {/* ── Page Header ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Data Keuangan</h1>
              <p className="text-sm text-gray-500 mt-0.5">Kelola data keuangan sekolah per tahun akademik</p>
            </div>
            <Button className="bg-primary w-fit" onClick={() => navigate("/superadmin/informasi-laporan-umum/data-keuangan/create")}>
              <PlusIcon size={16} className="mr-1.5" /> Buat Keuangan
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
              {/* ── Filter Tahun Akademik ── */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <CalendarIcon size={16} className="text-primary shrink-0" />
                  <span className="text-sm font-medium text-gray-700">Tahun Akademik</span>

                  {tahunList.length === 0 ? (
                    <span className="text-sm text-gray-400 italic">Tidak ada data tahun akademik.</span>
                  ) : (
                    <Select value={selectedTahun} onValueChange={setSelectedTahun}>
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
              </div>

              {/* ── Loading data keuangan ── */}
              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                  <Loader2Icon className="animate-spin mb-3" size={28} />
                  <p className="font-medium">Memuat data keuangan...</p>
                </div>
              ) : selectedTahun ? (
                <>
                  {/* ── Summary Cards ── */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-500">Total Debit</span>
                        <span className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                          <ArrowUpRight size={18} className="text-green-600" />
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{formatRupiah(totalDebit)}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <TrendingUp size={13} className="text-green-500" />
                        <span className="text-xs text-green-600 font-medium">Pemasukan</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-500">Total Kredit</span>
                        <span className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                          <ArrowDownRight size={18} className="text-red-500" />
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{formatRupiah(totalKredit)}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <TrendingDown size={13} className="text-red-500" />
                        <span className="text-xs text-red-500 font-medium">Pengeluaran</span>
                      </div>
                    </div>

                    <div className={`rounded-xl border shadow-sm p-5 ${saldo >= 0 ? "bg-primary border-primary/20" : "bg-red-600 border-red-200"}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white/80">Saldo Bersih</span>
                        <span className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                          <Wallet size={18} className="text-white" />
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-white">{formatRupiah(saldo)}</p>
                      <p className="text-xs text-white/70 mt-1.5">Debit − Kredit</p>
                    </div>
                  </div>

                  {/* ── Toolbar ── */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex flex-col md:flex-row justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="destructive" size="sm" onClick={handleDeleteMultiple} disabled={selectedIds.length === 0}>
                          <Trash2Icon size={15} className="mr-1" />
                          Hapus ({selectedIds.length})
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleExportExcel(false)}>
                          <FileSpreadsheet size={15} className="mr-1" />
                          Export Semua
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleExportExcel(true)} disabled={selectedIds.length === 0}>
                          <FileSpreadsheet size={15} className="mr-1" />
                          Export Terpilih ({selectedIds.length})
                        </Button>
                      </div>

                      <div className="relative w-full md:w-72">
                        <SearchIcon className="absolute left-3 top-2.5 text-gray-400" size={15} />
                        <Input
                          placeholder="Cari nama akun atau keterangan..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="pl-9 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── Info count ── */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {filteredData.length === 0 ? (
                        "Tidak ada data keuangan."
                      ) : (
                        <>
                          <strong>{filteredData.length}</strong> transaksi · {currentGroup?.tahun_akademik}
                        </>
                      )}
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
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                    </div>
                  </div>

                  {/* ── Table ── */}
                  {dataKeuangan.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-400">
                      <Wallet size={36} className="mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">Belum ada data keuangan pada tahun akademik ini.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table className="min-w-full">
                          <TableHeader>
                            <TableRow className="bg-primary hover:bg-primary">
                              <TableHead className="w-12 text-center text-white">
                                <input type="checkbox" ref={selectAllRef} checked={isAllSelected} onChange={(e) => handleSelectAll(e.target.checked)} className="w-4 h-4 cursor-pointer" />
                              </TableHead>
                              <TableHead className="text-center text-white font-semibold w-12">No</TableHead>
                              <TableHead className="text-white font-semibold">Nama Akun</TableHead>
                              <TableHead className="text-white font-semibold text-right">Debit</TableHead>
                              <TableHead className="text-white font-semibold text-right">Kredit</TableHead>
                              <TableHead className="text-white font-semibold">Keterangan</TableHead>
                              <TableHead className="text-center text-white font-semibold">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginated.length > 0 ? (
                              paginated.map((item, index) => (
                                <TableRow key={item.id} className="hover:bg-indigo-50/60 even:bg-gray-50/60 border-b border-gray-100 transition-colors">
                                  <TableCell className="text-center">
                                    <Checkbox checked={selectedIds.includes(item.id)} onCheckedChange={(c) => handleSelectOne(item.id, !!c)} />
                                  </TableCell>
                                  <TableCell className="text-center text-gray-400 text-sm">{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                                  <TableCell className="font-medium text-gray-800">{item.nama_akun || "-"}</TableCell>
                                  <TableCell className="text-right">
                                    <span className="font-semibold text-green-600">{formatRupiah(item.debit)}</span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <span className="font-semibold text-red-500">{formatRupiah(item.kredit)}</span>
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-600 max-w-[180px] truncate">{item.keterangan || <span className="text-gray-300">—</span>}</TableCell>
                                  <TableCell>
                                    <div className="flex gap-1.5 justify-center">
                                      <Button size="sm" variant="outline" onClick={() => navigate(`/superadmin/informasi-laporan-umum/data-keuangan/detail/${item.id}`)} title="Lihat Detail">
                                        <EyeIcon size={14} />
                                      </Button>
                                      <Button size="sm" className="bg-primary" onClick={() => navigate(`/superadmin/informasi-laporan-umum/data-keuangan/edit/${item.id}`)} title="Edit Data">
                                        <PenBoxIcon size={14} />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center text-gray-400 py-10">
                                  Tidak ada data yang sesuai pencarian.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination */}
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
                  )}
                </>
              ) : null}
            </>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default DataKeuangan;
