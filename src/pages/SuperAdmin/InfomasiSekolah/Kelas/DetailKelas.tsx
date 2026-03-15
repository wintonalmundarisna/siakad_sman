/**
 * DetailKelas — Halaman detail kelas dengan daftar rombel.
 *
 * Link ke CreateRombel:
 *   /superadmin/informasi-sekolah/rombel/create?kelas_id=X&nama_kelas=Y
 *
 * Link ke EditRombel:
 *   /superadmin/informasi-sekolah/rombel/edit/:rombelId
 *     ?back_kelas_id=X&nama_kelas=Y
 *     &nama_rombel=Z&jurusan_id=W&status=aktif
 *   (prefill semua field via query params — EditRombel tidak pakai show())
 *
 * Link ke DetailTahunAktifRombel:
 *   /superadmin/informasi-akademik/rombel/aktif/:rombelId
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, EyeIcon, Loader2, PenBoxIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";

// ── Types sesuai KelasController::show() ─────────────────────────────────────
interface RombelItem {
  rombel_id: number;
  nama_rombel: string;
  jurusan: string | null;
  jurusan_id?: number | null; // tidak di response, diisi manual jika perlu
  wali_saat_ini: string | null;
  status_rombel: string;
}

interface KelasDetail {
  kelas_id: number;
  nama_kelas: string;
  kode_kelas: string;
  tingkat: number | string;
  status: string;
  daftar_rombel: RombelItem[];
}

const DetailKelas = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [data, setData] = useState<KelasDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch detail kelas ─────────────────────────────────────────────────────
  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/spa/kelas/${id}`);
      if (res.data.status === "success") {
        setData(res.data.data);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        Swal.fire({ icon: "error", title: "Tidak Ditemukan", text: "Data kelas tidak ditemukan." });
      } else {
        Swal.fire({ icon: "error", title: "Gagal!", text: "Tidak dapat memuat data kelas." });
      }
      navigate("/superadmin/informasi-sekolah/kelas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  // ── Delete rombel ──────────────────────────────────────────────────────────
  const handleDeleteRombel = async (rombelId: number, namaRombel: string) => {
    const result = await Swal.fire({
      title: "Hapus rombel?",
      text: `Rombel "${namaRombel}" akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;

    try {
      await api.delete(`/spa/rombel/${rombelId}`);
      fetchDetail();
      Swal.fire({ icon: "success", title: "Berhasil!", showConfirmButton: false, timer: 1500 });
    } catch (err: any) {
      const status = err.response?.status;
      const errors = err.response?.data?.errors;
      if (status === 422 && errors) {
        const msg = Object.values(errors).flat().join("\n");
        Swal.fire({ icon: "error", title: "Tidak Bisa Dihapus", text: msg });
      } else {
        Swal.fire({ icon: "error", title: "Gagal!", text: err.response?.data?.message || "Terjadi kesalahan." });
      }
    }
  };

  // ── Helper: bangun query string edit rombel ───────────────────────────────
  // EditRombel tidak bisa pakai show() (butuh tahun_akademik_id)
  // Jadi semua data prefill dikirim lewat query params
  const buildEditRombelUrl = (rombel: RombelItem) => {
    const params = new URLSearchParams({
      back_kelas_id: String(data?.kelas_id ?? ""),
      nama_kelas: data?.nama_kelas ?? "",
      nama_rombel: rombel.nama_rombel,
      status: rombel.status_rombel,
    });
    // jurusan_id tidak ada di response KelasController::show()
    // dibiarkan kosong — user bisa pilih ulang di form edit
    return `/superadmin/informasi-sekolah/rombel/edit/${rombel.rombel_id}?${params.toString()}`;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Detail Kelas" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate("/superadmin/informasi-sekolah/kelas")}>
              <ArrowLeft size={16} />
            </Button>
            <h1 className="text-3xl font-bold">Detail Kelas</h1>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2 className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : !data ? (
            <div className="text-center py-16 text-gray-500">Data tidak tersedia</div>
          ) : (
            <div className="space-y-6">
              {/* ── Info Kelas ── */}
              <div className="bg-white rounded shadow p-5">
                <h2 className="text-lg font-semibold mb-4 text-primary">Informasi Kelas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium text-gray-600">Nama Kelas</span>
                    <span>{data.nama_kelas}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium text-gray-600">Kode Kelas</span>
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{data.kode_kelas}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium text-gray-600">Tingkat</span>
                    <span>{data.tingkat}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium text-gray-600">Status</span>
                    <Badge className={data.status === "aktif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>{data.status}</Badge>
                  </div>
                </div>
              </div>

              {/* ── Daftar Rombel ── */}
              <div className="bg-white rounded shadow p-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                  <h2 className="text-lg font-semibold text-primary">
                    Daftar Rombel
                    <span className="ml-2 text-sm font-normal text-gray-500">({data.daftar_rombel.length} rombel)</span>
                  </h2>

                  {/* ⬇ Link ke CreateRombel dengan query param kelas */}
                  <Link to={`/superadmin/informasi-sekolah/rombel/create?kelas_id=${data.kelas_id}&nama_kelas=${encodeURIComponent(data.nama_kelas)}`}>
                    <Button className="bg-primary" size="sm">
                      <PlusIcon size={16} className="mr-1" /> Tambah Rombel
                    </Button>
                  </Link>
                </div>

                <Separator className="mb-4" />

                {data.daftar_rombel.length > 0 ? (
                  <div className="overflow-x-auto rounded">
                    <Table className="min-w-full border border-gray-200 bg-white">
                      <TableHeader className="bg-primary">
                        <TableRow>
                          <TableHead className="w-[50px] text-center text-white font-semibold">No</TableHead>
                          <TableHead className="text-white font-semibold">Nama Rombel</TableHead>
                          <TableHead className="text-white font-semibold">Jurusan</TableHead>
                          <TableHead className="text-white font-semibold">Wali Saat Ini</TableHead>
                          <TableHead className="text-white font-semibold">Status</TableHead>
                          <TableHead className="text-center text-white font-semibold">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.daftar_rombel.map((rombel, index) => (
                          <TableRow key={rombel.rombel_id} className="hover:bg-indigo-50 even:bg-gray-50 border-b border-gray-100">
                            <TableCell className="text-center">{index + 1}</TableCell>
                            <TableCell>{rombel.nama_rombel}</TableCell>
                            <TableCell>{rombel.jurusan ?? "-"}</TableCell>
                            <TableCell>{rombel.wali_saat_ini ?? <span className="text-gray-400 text-xs italic">Belum ada wali</span>}</TableCell>
                            <TableCell>
                              <Badge className={rombel.status_rombel === "aktif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>{rombel.status_rombel}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1 justify-center">
                                {/* Detail → DetailTahunAktifRombel */}
                                <Link to={`/superadmin/informasi-sekolah/rombel/aktif/${rombel.rombel_id}`}>
                                  <Button variant="outline" size="sm" title="Detail Tahun Aktif">
                                    <EyeIcon size={15} />
                                  </Button>
                                </Link>

                                {/* Edit → EditRombel dengan semua data di query params */}
                                <Link to={buildEditRombelUrl(rombel)}>
                                  <Button className="bg-primary" size="sm" title="Edit Rombel">
                                    <PenBoxIcon size={15} />
                                  </Button>
                                </Link>

                                {/* Delete */}
                                <Button className="bg-muted-foreground hover:bg-muted-foreground/90" size="sm" title="Hapus Rombel" onClick={() => handleDeleteRombel(rombel.rombel_id, rombel.nama_rombel)}>
                                  <Trash2Icon size={15} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="font-medium">Belum ada rombel untuk kelas ini</p>
                    <p className="text-sm mt-1">Klik "Tambah Rombel" untuk menambahkan</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default DetailKelas;
