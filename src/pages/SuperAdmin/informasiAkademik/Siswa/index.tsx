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
import Swal from "sweetalert2";
import { Badge } from "@/components/ui/badge";
import { DialogDetailSiswa } from "./DialogDetailSiswa";

interface TahunAkademik {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status: string;
}

interface SiswaItem {
  siswa_id: number;
  nama: string;
  nisn: string | null;
  nis: string | null;
  status_akhir: string | null;
  catatan: string | null;
  status: string;
  rombel: string;
  jurusan: string | null;
}

const DataSiswa = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ── Tahun Akademik ───────────────────────────────────────────────────────
  const [tahunList, setTahunList] = useState<TahunAkademik[]>([]);
  const [selectedTahun, setSelectedTahun] = useState<number | null>(null);
  const [loadingTahun, setLoadingTahun] = useState(true);

  // ── Data Siswa ───────────────────────────────────────────────────────────
  const [dataSiswa, setDataSiswa] = useState<SiswaItem[]>([]);
  const [loading, setLoading] = useState(false);

  // ── Filter & Pagination ──────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Fetch daftar tahun akademik ──────────────────────────────────────────
  useEffect(() => {
    const fetchTahun = async () => {
      try {
        setLoadingTahun(true);
        const res = await api.get("/spa/tahun-akademik");

        if (res.data.status === "success") {
          // FIX: gunakan tahun_akademik_id (bukan 'id') sesuai interface TahunAkademik
          const list: TahunAkademik[] = res.data.data.map((t: any) => ({
            tahun_akademik_id: t.tahun_akademik_id,
            tahun_akademik: t.tahun_akademik,
            status: t.status,
          }));

          setTahunList(list);

          // AUTO SELECT tahun pertama
          if (list.length > 0) {
            setSelectedTahun(Number(list[0].tahun_akademik_id));
          }
        }
      } catch (err) {
        console.error("Gagal fetch tahun akademik:", err);
      } finally {
        setLoadingTahun(false);
      }
    };
    fetchTahun();
  }, []);

  // ── Fetch siswa saat tahun berubah ───────────────────────────────────────
  useEffect(() => {
    if (!selectedTahun) return;

    const fetchSiswa = async () => {
      try {
        setLoading(true);
        setDataSiswa([]);
        const res = await api.get("/spa/siswa", {
          params: {
            tahun_akademik_id: Number(selectedTahun),
          },
        });

        if (res.data.status === "success") {
          const flat: SiswaItem[] = [];
          res.data.data.forEach((tahun: any) => {
            tahun.rombels?.forEach((rombel: any) => {
              rombel.siswas?.forEach((siswa: any) => {
                flat.push({
                  siswa_id: siswa.siswa_id,
                  nama: siswa.nama,
                  nisn: siswa.nisn ?? null,
                  nis: siswa.nis ?? null,
                  status_akhir: siswa.status_akhir ?? null,
                  catatan: siswa.catatan ?? null,
                  status: tahun.status,
                  rombel: rombel.rombel,
                  jurusan: rombel.jurusan ?? null,
                });
              });
            });
          });
          setDataSiswa(flat);
        }
      } catch (err: any) {
        setDataSiswa([]);
        if (err.response?.status !== 400) {
          Swal.fire({ icon: "error", title: "Gagal memuat data!", text: "Tidak dapat memuat data siswa." });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSiswa();
  }, [selectedTahun]);

  // ── Filter pencarian ─────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    if (searchTerm.trim() === "") return dataSiswa;
    const lower = searchTerm.toLowerCase();
    return dataSiswa.filter((s) => s.nama.toLowerCase().includes(lower) || s.nisn?.toLowerCase().includes(lower) || s.nis?.toLowerCase().includes(lower) || s.rombel?.toLowerCase().includes(lower));
  }, [searchTerm, dataSiswa]);

  // ── Pagination ───────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTahun]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data siswa yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const res = await api.delete(`/spa/siswa/${id}`);
      if (res.data.status === "success") {
        setDataSiswa((prev) => prev.filter((s) => s.siswa_id !== id));
        Swal.fire({ icon: "success", title: "Berhasil!", text: "Data siswa berhasil dihapus.", showConfirmButton: false, timer: 1800 });
      }
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Gagal menghapus!", text: err.response?.data?.message || "Terjadi kesalahan." });
    } finally {
      setLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Siswa" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Siswa</h1>

          {/* ── Toolbar ── */}
          <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
            <Link to="/superadmin/informasi-akademik/siswa/create" className="w-full md:w-auto">
              <Button className="bg-primary w-full md:w-auto">
                <Plus size={18} />
                Tambah Siswa
              </Button>
            </Link>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              {/* Filter Tahun Akademik */}
              {/* FIX: selectedTahun bisa null saat awal, pastikan value string atau "" */}
              <Select value={selectedTahun !== null ? selectedTahun.toString() : ""} onValueChange={(val) => setSelectedTahun(Number(val))}>
                <SelectTrigger className="w-full md:w-56 cursor-pointer">
                  <SelectValue placeholder={loadingTahun ? "Memuat tahun..." : "Pilih Tahun Akademik"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Tahun Akademik</SelectLabel>
                    {/* FIX: key & value pakai tahun_akademik_id yang sudah benar */}
                    {tahunList.map((t) => (
                      <SelectItem key={t.tahun_akademik_id} value={String(t.tahun_akademik_id)}>
                        {t.tahun_akademik}
                        {t.status === "aktif" && <span className="ml-2 text-xs text-green-600 font-medium">(Aktif)</span>}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* Search */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                <Input type="text" placeholder="Cari nama, NISN, NIS, rombel..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" disabled={!selectedTahun} />
              </div>
            </div>
          </div>

          {/* ── Konten Utama ── */}
          {!selectedTahun ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              <Users size={40} className="mb-3 opacity-50" />
              <p className="text-lg font-medium">Pilih tahun akademik terlebih dahulu</p>
              <p className="text-sm mt-1">
                Gunakan dropdown <span className="font-semibold">"Pilih Tahun Akademik"</span> di atas untuk menampilkan data siswa.
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
                      <TableHead className="font-semibold text-white">NISN</TableHead>
                      <TableHead className="font-semibold text-white">NIS</TableHead>
                      <TableHead className="font-semibold text-white">Nama Lengkap</TableHead>
                      <TableHead className="font-semibold text-white">Rombel</TableHead>
                      <TableHead className="font-semibold text-white">Jurusan</TableHead>
                      <TableHead className="font-semibold text-white">Status Akhir</TableHead>
                      <TableHead className="font-semibold text-center text-white">Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginated.length > 0 ? (
                      paginated.map((siswa, index) => (
                        <TableRow key={siswa.siswa_id} className="hover:bg-indigo-50 even:bg-gray-50 border-b border-gray-100">
                          <TableCell className="text-center font-medium">{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                          <TableCell>{siswa.nisn ?? "-"}</TableCell>
                          <TableCell>{siswa.nis ?? "-"}</TableCell>
                          <TableCell>{siswa.nama}</TableCell>
                          <TableCell>{siswa.rombel ?? "-"}</TableCell>
                          <TableCell>{siswa.jurusan ?? "-"}</TableCell>
                          <TableCell>{siswa.status_akhir ? <Badge variant="outline">{siswa.status_akhir}</Badge> : <span className="text-gray-400 text-xs">-</span>}</TableCell>
                          <TableCell>
                            <div className="flex gap-1 justify-center">
                              <DialogDetailSiswa siswaId={siswa.siswa_id} />

                              <Link to={`/superadmin/informasi-akademik/siswa/edit/${siswa.siswa_id}`}>
                                <Button className="bg-primary" size="sm">
                                  <PenBox size={16} />
                                </Button>
                              </Link>

                              <Button className="bg-muted-foreground hover:bg-muted-foreground/90" size="sm" onClick={() => handleDelete(siswa.siswa_id)}>
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                          Tidak ada data siswa pada tahun akademik ini
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
                  <Button size="sm" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
                    Prev
                  </Button>
                  <span className="text-sm">
                    Halaman <strong>{currentPage}</strong> dari <strong>{totalPages || 1}</strong>
                  </span>
                  <Button size="sm" disabled={currentPage === totalPages || totalPages === 0} onClick={() => handlePageChange(currentPage + 1)}>
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

export default DataSiswa;
