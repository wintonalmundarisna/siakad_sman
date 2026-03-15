import { useEffect, useMemo, useState } from "react";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Loader2Icon, PenBoxIcon, PlusIcon, Trash2Icon, EyeIcon } from "lucide-react";
import Footer from "@/pages/Footer";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Badge } from "@/components/ui/badge";

// ── Types sesuai KelasController::index() ────────────────────────────────────
interface Kelas {
  kelas_id: number;
  nama_kelas: string | null;
  tingkat: number | null;
  status: string | null;
}

const DataKelas = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dataKelas, setDataKelas] = useState<Kelas[]>([]);
  const [selectedTingkat, setSelectedTingkat] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/spa/kelas");
        if (res.data.status === "success") {
          setDataKelas(res.data.data);
        }
      } catch {
        Swal.fire({ icon: "error", title: "Gagal!", text: "Tidak dapat mengambil data kelas dari server." });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Filter (useMemo, tidak perlu useEffect terpisah) ──────────────────────
  const filteredKelas = useMemo(() => {
    return dataKelas.filter((k) => {
      if (selectedTingkat && k.tingkat !== Number(selectedTingkat)) return false;
      if (selectedStatus && k.status !== selectedStatus) return false;
      return true;
    });
  }, [dataKelas, selectedTingkat, selectedStatus]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredKelas.length / rowsPerPage);
  const paginatedKelas = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredKelas.slice(start, start + rowsPerPage);
  }, [filteredKelas, currentPage, rowsPerPage]);

  useEffect(() => { setCurrentPage(1); }, [selectedTingkat, selectedStatus]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data kelas yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const res = await api.delete(`/spa/kelas/${id}`);
      if (res.data.status === "success") {
        setDataKelas((prev) => prev.filter((k) => k.kelas_id !== id));
        Swal.fire({ icon: "success", title: "Berhasil!", text: "Data kelas berhasil dihapus.", showConfirmButton: false, timer: 1800 });
      }
    } catch (err: any) {
      const status = err.response?.status;
      const errors = err.response?.data?.errors;
      if (status === 422 && errors) {
        // Backend: "Tidak bisa dihapus, update status sebagai solusi"
        const msg = Object.values(errors).flat().join("\n");
        Swal.fire({ icon: "error", title: "Tidak Bisa Dihapus", text: msg });
      } else {
        Swal.fire({ icon: "error", title: "Gagal!", text: err.response?.data?.message || "Terjadi kesalahan." });
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Kelas" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Kelas</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* ── Toolbar ── */}
              <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                <Link to="/superadmin/informasi-sekolah/kelas/create" className="w-full md:w-auto">
                  <Button className="bg-primary w-full md:w-auto">
                    <PlusIcon size={18} /> Tambah Kelas
                  </Button>
                </Link>

                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                  {/* Filter Tingkat */}
                  <Select value={selectedTingkat ?? "semua"} onValueChange={(v) => setSelectedTingkat(v === "semua" ? null : v)}>
                    <SelectTrigger className="w-full md:w-[180px] cursor-pointer">
                      <SelectValue placeholder="Filter Tingkat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Tingkat</SelectLabel>
                        <SelectItem value="semua">Tampilkan Semua</SelectItem>
                        <SelectItem value="10">Tingkat 10</SelectItem>
                        <SelectItem value="11">Tingkat 11</SelectItem>
                        <SelectItem value="12">Tingkat 12</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {/* Filter Status */}
                  <Select value={selectedStatus ?? "semua"} onValueChange={(v) => setSelectedStatus(v === "semua" ? null : v)}>
                    <SelectTrigger className="w-full md:w-[180px] cursor-pointer">
                      <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Status</SelectLabel>
                        <SelectItem value="semua">Tampilkan Semua</SelectItem>
                        <SelectItem value="aktif">Aktif</SelectItem>
                        <SelectItem value="arsip">Arsip</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* ── Tabel ── */}
              <div className="w-full overflow-x-auto rounded">
                <Table className="min-w-full border border-gray-200 rounded shadow-sm bg-white">
                  <TableHeader className="bg-primary">
                    <TableRow>
                      <TableHead className="text-center font-semibold text-white">No</TableHead>
                      <TableHead className="font-semibold text-white">Nama Kelas</TableHead>
                      <TableHead className="font-semibold text-white">Tingkat</TableHead>
                      <TableHead className="font-semibold text-white">Status</TableHead>
                      <TableHead className="font-semibold text-center text-white">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedKelas.length > 0 ? (
                      paginatedKelas.map((kelas, index) => (
                        <TableRow key={kelas.kelas_id} className="hover:bg-indigo-50 even:bg-gray-50 border-b border-gray-100">
                          <TableCell className="text-center font-medium">{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                          <TableCell>{kelas.nama_kelas ?? "-"}</TableCell>
                          <TableCell>{kelas.tingkat ?? "-"}</TableCell>
                          <TableCell>
                            <Badge className={kelas.status === "aktif" ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-700 border-gray-300"}>
                              {kelas.status ?? "-"}
                            </Badge>
                          </TableCell>
                          <TableCell className="flex gap-1 justify-center">
                            {/* Detail → halaman baru (bukan dialog) sesuai ketentuan */}
                            <Link to={`/superadmin/informasi-sekolah/kelas/${kelas.kelas_id}`}>
                              <Button variant="outline" size="sm"><EyeIcon size={16} /></Button>
                            </Link>
                            <Link to={`/superadmin/informasi-sekolah/kelas/edit/${kelas.kelas_id}`}>
                              <Button className="bg-primary" size="sm"><PenBoxIcon size={16} /></Button>
                            </Link>
                            <Button className="bg-muted-foreground hover:bg-muted-foreground/90" size="sm" onClick={() => handleDelete(kelas.kelas_id)}>
                              <Trash2Icon size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-4">Tidak ada data kelas yang ditemukan</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* ── Pagination ── */}
              <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Tampilkan:</span>
                  <Select value={rowsPerPage.toString()} onValueChange={(v) => { setRowsPerPage(Number(v)); setCurrentPage(1); }}>
                    <SelectTrigger className="w-auto cursor-pointer"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-600">data per halaman</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>Prev</Button>
                  <span className="text-sm">Halaman <strong>{currentPage}</strong> dari <strong>{totalPages || 1}</strong></span>
                  <Button size="sm" disabled={currentPage === totalPages || totalPages === 0} onClick={() => handlePageChange(currentPage + 1)}>Next</Button>
                </div>
              </div>
            </>
          )}
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default DataKelas;