import { useState, useEffect, useMemo } from "react";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PenBox, Trash2, Search, Loader2, Plus, Users } from "lucide-react";
import Footer from "@/pages/Footer";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import api from "@/api/axios";
import type { Kepegawaian } from "@/types/kepegawaian";
import Swal from "sweetalert2";
import { Badge } from "@/components/ui/badge";
import { DialogDetailKepegawaian } from "./DialogDetailKepegawaian";

const ROLE_OPTIONS = [
  { value: "kepsek", label: "Kepala Sekolah" },
  { value: "guru",   label: "Guru" },
  { value: "tu",     label: "Tata Usaha" },
  { value: "staff",  label: "Staff" },
];

const DataKepegawaian = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Role yang dipilih — null = belum pilih
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const [dataKepegawaian, setDataKepegawaian] = useState<Kepegawaian[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // ── Fetch saat role berubah ──────────────────────────────────────────────
  useEffect(() => {
    if (!selectedRole) {
      setDataKepegawaian([]);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setDataKepegawaian([]);
        const res = await api.get("/spa/kepegawaian", {
          params: { role: selectedRole },
        });

        if (res.data.status === "success") {
          // Backend mengelompokkan per status → flatten
          const flattened: Kepegawaian[] = res.data.data.flatMap((group: any) =>
            group.pegawai.map((pegawai: any) => ({
              ...pegawai,
              status: group.status,
              email: pegawai.email ?? "",
            }))
          );
          setDataKepegawaian(flattened);
        }
      } catch (error) {
        console.error("Gagal mengambil data kepegawaian:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: "Tidak dapat memuat data kepegawaian.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedRole]);

  // ── Filter pencarian ─────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    if (searchTerm.trim() === "") return dataKepegawaian;
    const lower = searchTerm.toLowerCase();
    return dataKepegawaian.filter(
      (item) =>
        item.nama.toLowerCase().includes(lower) ||
        item.nip?.toLowerCase().includes(lower) ||
        item.nuptk?.toLowerCase().includes(lower) ||
        item.email?.toLowerCase().includes(lower)
    );
  }, [searchTerm, dataKepegawaian]);

  // ── Pagination ───────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  // Reset page saat search/role berubah
  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedRole]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data kepegawaian yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const res = await api.delete(`/spa/kepegawaian/${id}`);

      if (res.data.status === "success") {
        setDataKepegawaian((prev) => prev.filter((item) => item.id !== id));
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data kepegawaian berhasil dihapus.",
          showConfirmButton: false,
          timer: 1800,
        });
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal menghapus!",
        text: err.response?.data?.message || "Terjadi kesalahan.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className={`w-full min-h-screen bg-background transition-all duration-300 ${
          isCollapsed ? "md:ml-16" : "md:ml-[300px]"
        }`}
      >
        <PageTitle title="Data Kepegawaian" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Kepegawaian</h1>

          {/* ── Toolbar ── */}
          <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
            <Link to="/superadmin/informasi-sekolah/kepegawaian/create" className="w-full md:w-auto">
              <Button className="bg-primary w-full md:w-auto">
                <Plus size={18} />
                Tambah Kepegawaian
              </Button>
            </Link>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              {/* Filter Role — tanpa super_admin */}
              <Select
                value={selectedRole ?? ""}
                onValueChange={(value) => setSelectedRole(value)}
              >
                <SelectTrigger className="w-full md:w-48 cursor-pointer">
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Pilih Role</SelectLabel>
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* Search — aktif hanya jika sudah pilih role */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Cari Nama, NIP, NUPTK..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                  disabled={!selectedRole}
                />
              </div>
            </div>
          </div>

          {/* ── Konten Utama ── */}
          {!selectedRole ? (
            /* Belum pilih role */
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              <Users size={40} className="mb-3 opacity-50" />
              <p className="text-lg font-medium">Pilih role terlebih dahulu</p>
              <p className="text-sm mt-1">
                Gunakan dropdown <span className="font-semibold">"Pilih Role"</span> di atas untuk menampilkan data kepegawaian.
              </p>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2 className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* ── Tabel ── */}
              <div className="w-full overflow-x-auto rounded">
                <Table className="min-w-full border border-gray-200 rounded shadow-sm bg-white">
                  <TableHeader className="bg-primary">
                    <TableRow>
                      <TableHead className="w-[60px] text-center font-semibold text-white">No</TableHead>
                      <TableHead className="font-semibold text-white">NIP</TableHead>
                      <TableHead className="font-semibold text-white">NUPTK</TableHead>
                      <TableHead className="font-semibold text-white">Nama Lengkap</TableHead>
                      <TableHead className="font-semibold text-white">Role</TableHead>
                      <TableHead className="font-semibold text-white">Keterangan</TableHead>
                      <TableHead className="font-semibold text-center text-white">Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginated.length > 0 ? (
                      paginated.map((item, index) => (
                        <TableRow
                          key={item.id}
                          className="hover:bg-indigo-50 even:bg-gray-50 border-b border-gray-100"
                        >
                          <TableCell className="text-center font-medium">
                            {(currentPage - 1) * rowsPerPage + index + 1}
                          </TableCell>
                          <TableCell>{item.nip ?? "-"}</TableCell>
                          <TableCell>{item.nuptk ?? "-"}</TableCell>
                          <TableCell>{item.nama}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {item.role?.replace("_", " ") ?? "-"}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.keterangan ?? "-"}</TableCell>
                          <TableCell>
                            <div className="flex gap-1 justify-center">
                              <DialogDetailKepegawaian kepegawaianId={item.id} />

                              <Link
                                to={`/superadmin/informasi-sekolah/kepegawaian/edit/${item.id}`}
                              >
                                <Button className="bg-primary" size="sm">
                                  <PenBox size={16} />
                                </Button>
                              </Link>

                              <Button
                                className="bg-muted-foreground hover:bg-muted-foreground/90"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                          Tidak ada data kepegawaian dengan role{" "}
                          <span className="font-semibold">
                            {ROLE_OPTIONS.find((r) => r.value === selectedRole)?.label}
                          </span>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* ── Pagination ── */}
              <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Tampilkan:</span>
                  <Select
                    value={rowsPerPage.toString()}
                    onValueChange={(val) => {
                      setRowsPerPage(Number(val));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-auto cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-600">data per halaman</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Prev
                  </Button>
                  <span className="text-sm">
                    Halaman <strong>{currentPage}</strong> dari <strong>{totalPages || 1}</strong>
                  </span>
                  <Button
                    size="sm"
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </Button>
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

export default DataKepegawaian;