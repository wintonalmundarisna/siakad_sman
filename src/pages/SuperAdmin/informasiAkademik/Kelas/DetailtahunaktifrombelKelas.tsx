/**
 * DetailTahunAktifRombelKelas
 * GET /spa/rombel/aktif/:id
 * - Refetch otomatis setiap navigate back via location.key
 * - Tombol Histori → Dialog inline (data dari state, tidak fetch ulang)
 */
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, BookOpen, ClockIcon, Loader2, PenBoxIcon, PlusIcon, Trash2Icon, UserCheck, Users } from "lucide-react";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";

// ── Types ──────────────────────────────────────────────────────────────────────
interface SiswaItem {
  siswa_rombel_id: number | null;
  siswa_id: number | null;
  nama_siswa: string | null;
  nisn: string | null;
  nis: string | null;
  status_akhir: string | null;
  catatan: string | null;
}

interface JadwalItem {
  jadwal_pelajaran_id: number;
  kurikulum_mata_pelajaran_id: number | null;
  guru_id: number | null;
  ruangan_id: number | null;
  mata_pelajaran: string | null;
  hari: string | null;
  guru_pengajar: string | null;
  jam_mulai: string | null;
  jam_selesai: string | null;
  ruangan: string | null;
  link_opsional: string | null;
}

interface SemesterItem {
  semester_id: number | null;
  semester: string | null;
  jadwal_pelajaran: JadwalItem[];
}

interface WaliItem {
  wali_rombel_id: number | null;
  wali_id: number | null;
  nama_wali: string | null;
}

interface Periode {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: string;
  wali: WaliItem | null;
  siswa: SiswaItem[];
  semester: SemesterItem[];
}

interface RombelDetail {
  rombel_id: number;
  nama_rombel: string;
  status_rombel: string;
  kelas: { kelas_id: number; kelas: string; tingkat: string | number | null };
  jurusan: { jurusan_id: number | null; nama_jurusan: string | null };
  periode: Periode[];
}

// ── Component ──────────────────────────────────────────────────────────────────
const DetailTahunAktifRombelKelas = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [data, setData] = useState<RombelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogHistori, setDialogHistori] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get(`/spa/rombel/aktif/${id}`);
      if (res.data.status === "success") setData(res.data.data);
    } catch (err: any) {
      Swal.fire({
        icon: err.response?.status === 404 ? "warning" : "error",
        title: err.response?.status === 404 ? "Tidak Ditemukan" : "Gagal",
        text: err.response?.data?.message || "Tidak dapat memuat data rombel.",
      });
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [id]);
  useEffect(() => {
    fetchData();
  }, [location.key]);

  const periode = data?.periode?.[0] ?? null;
  const allJadwal = periode?.semester.flatMap((s) => s.jadwal_pelajaran) ?? [];

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleDeleteWali = async (waliRombelId: number) => {
    const ok = await Swal.fire({
      title: "Hapus wali rombel?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!ok.isConfirmed) return;
    try {
      await api.delete(`/spa/wali-rombel/${waliRombelId}`);
      await fetchData();
      Swal.fire({ icon: "success", title: "Berhasil dihapus!", showConfirmButton: false, timer: 1500 });
    } catch (err: any) {
      const d = err.response?.data;
      Swal.fire({ icon: "error", title: "Gagal!", text: d?.errors?.arsip?.[0] || d?.message || "Terjadi kesalahan." });
    }
  };

  const handleDeleteSiswa = async (siswaRombelId: number, nama: string) => {
    const ok = await Swal.fire({
      title: `Hapus ${nama} dari rombel?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!ok.isConfirmed) return;
    try {
      await api.delete(`/spa/siswa-rombel/${siswaRombelId}`);
      await fetchData();
      Swal.fire({ icon: "success", title: "Berhasil dihapus!", showConfirmButton: false, timer: 1500 });
    } catch (err: any) {
      const d = err.response?.data;
      Swal.fire({ icon: "error", title: "Gagal!", text: d?.message || "Terjadi kesalahan." });
    }
  };

  const handleDeleteJadwal = async (jadwalId: number) => {
    const ok = await Swal.fire({
      title: "Hapus jadwal pelajaran?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!ok.isConfirmed) return;
    try {
      await api.delete(`/spa/jadwal-pelajaran/${jadwalId}`);
      await fetchData();
      Swal.fire({ icon: "success", title: "Berhasil dihapus!", showConfirmButton: false, timer: 1500 });
    } catch (err: any) {
      const d = err.response?.data;
      const errMsg = d?.errors?.tahun_akademik || d?.errors?.arsip || d?.errors?.jadwal || d?.message || "Terjadi kesalahan.";
      Swal.fire({ icon: "error", title: "Gagal!", text: errMsg });
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Detail Tahun Aktif Rombel" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(`/superadmin/informasi-akademik/kelas/${data?.kelas?.kelas_id}`)}>
              <ArrowLeft size={16} />
              Kembali
            </Button>
            <h1 className="text-3xl font-bold">Detail Tahun Aktif Rombel</h1>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2 className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : !data ? (
            <div className="text-center text-gray-500 py-16">Data tidak tersedia</div>
          ) : (
            <div className="space-y-6">
              {/* ── Info Rombel ── */}
              <div className="bg-white rounded shadow p-5">
                <h2 className="text-lg font-semibold mb-4 text-primary">Informasi Rombel</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  {(
                    [
                      ["Nama Rombel", data.nama_rombel],
                      ["Kelas", `${data.kelas?.kelas ?? "-"} (Tingkat ${data.kelas?.tingkat ?? "-"})`],
                      ["Jurusan", data.jurusan?.nama_jurusan ?? "-"],
                      ["Status Rombel", <Badge className={data.status_rombel === "aktif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>{data.status_rombel}</Badge>],
                      ...(periode
                        ? [
                            ["Tahun Akademik", periode.tahun_akademik],
                            ["Status Tahun", <Badge className={periode.status_tahun_akademik === "aktif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>{periode.status_tahun_akademik}</Badge>],
                          ]
                        : []),
                    ] as [string, React.ReactNode][]
                  ).map(([label, val], i) => (
                    <div key={i} className="flex justify-between border-b pb-2">
                      <span className="font-medium text-gray-600">{label}</span>
                      <span>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Wali Rombel ── */}
              <div className="bg-white rounded shadow p-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <UserCheck size={18} className="text-primary" />
                    <h2 className="text-lg font-semibold text-primary">Wali Rombel</h2>
                  </div>
                  <Link to={`/superadmin/informasi-akademik/wali-rombel/create?rombel_id=${data.rombel_id}&nama_rombel=${encodeURIComponent(data.nama_rombel)}`}>
                    <Button className="bg-primary" size="sm">
                      <PlusIcon size={16} className="mr-1" /> Tambah Wali
                    </Button>
                  </Link>
                </div>
                <Separator className="mb-4" />

                {periode?.wali ? (
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                    <div>
                      <p className="font-medium text-sm">{periode.wali.nama_wali ?? "-"}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Wali Rombel Aktif</p>
                    </div>
                    <div className="flex gap-1">
                      <Link
                        to={
                          `/superadmin/informasi-akademik/wali-rombel/edit/${periode.wali.wali_rombel_id}` +
                          `?rombel_id=${data.rombel_id}` +
                          `&nama_rombel=${encodeURIComponent(data.nama_rombel)}` +
                          `&guru_id=${periode.wali.wali_id}` +
                          `&nama_guru=${encodeURIComponent(periode.wali.nama_wali ?? "")}`
                        }
                      >
                        <Button className="bg-primary" size="sm">
                          <PenBoxIcon size={15} />
                        </Button>
                      </Link>
                      <Button
                        className="bg-muted-foreground hover:bg-muted-foreground/90"
                        size="sm"
                        onClick={() => {
                          if (periode.wali?.wali_rombel_id) handleDeleteWali(periode.wali.wali_rombel_id);
                        }}
                      >
                        <Trash2Icon size={15} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Belum ada wali rombel pada tahun ini</p>
                )}
              </div>

              {/* ── Daftar Siswa ── */}
              <div className="bg-white rounded shadow p-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-primary" />
                    <h2 className="text-lg font-semibold text-primary">
                      Daftar Siswa <span className="text-sm font-normal text-gray-500">({periode?.siswa.length ?? 0} siswa)</span>
                    </h2>
                  </div>
                  <Link to={`/superadmin/informasi-akademik/siswa-rombel/create?rombel_id=${data.rombel_id}&nama_rombel=${encodeURIComponent(data.nama_rombel)}`}>
                    <Button className="bg-primary" size="sm">
                      <PlusIcon size={16} className="mr-1" /> Tambah Siswa
                    </Button>
                  </Link>
                </div>
                <Separator className="mb-4" />

                {periode && periode.siswa.length > 0 ? (
                  <div className="overflow-x-auto rounded">
                    <Table className="min-w-full border border-gray-200 bg-white">
                      <TableHeader className="bg-primary">
                        <TableRow>
                          <TableHead className="w-[50px] text-center text-white">No</TableHead>
                          <TableHead className="text-white">NISN</TableHead>
                          <TableHead className="text-white">NIS</TableHead>
                          <TableHead className="text-white">Nama Siswa</TableHead>
                          <TableHead className="text-white">Status Akhir</TableHead>
                          <TableHead className="text-white">Catatan</TableHead>
                          <TableHead className="text-center text-white">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {periode.siswa.map((siswa, idx) => (
                          <TableRow key={siswa.siswa_rombel_id ?? idx} className="hover:bg-indigo-50 even:bg-gray-50 border-b">
                            <TableCell className="text-center">{idx + 1}</TableCell>
                            <TableCell>{siswa.nisn ?? "-"}</TableCell>
                            <TableCell>{siswa.nis ?? "-"}</TableCell>
                            <TableCell className="font-medium">{siswa.nama_siswa ?? "-"}</TableCell>
                            <TableCell>{siswa.status_akhir ? <Badge variant="outline">{siswa.status_akhir.replace(/_/g, " ")}</Badge> : <span className="text-gray-400 text-xs">-</span>}</TableCell>
                            <TableCell className="text-sm text-gray-600 max-w-[150px] truncate">{siswa.catatan ?? "-"}</TableCell>
                            <TableCell>
                              <div className="flex gap-1 justify-center">
                                <Link
                                  to={
                                    `/superadmin/informasi-akademik/siswa-rombel/edit/${siswa.siswa_rombel_id}` +
                                    `?rombel_id=${data.rombel_id}` +
                                    `&nama_rombel=${encodeURIComponent(data.nama_rombel)}` +
                                    `&nama_siswa=${encodeURIComponent(siswa.nama_siswa ?? "")}` +
                                    `&status_akhir=${siswa.status_akhir ?? ""}` +
                                    `&catatan=${encodeURIComponent(siswa.catatan ?? "")}`
                                  }
                                >
                                  <Button className="bg-primary" size="sm">
                                    <PenBoxIcon size={15} />
                                  </Button>
                                </Link>
                                <Button
                                  className="bg-muted-foreground hover:bg-muted-foreground/90"
                                  size="sm"
                                  onClick={() => {
                                    if (siswa.siswa_rombel_id) handleDeleteSiswa(siswa.siswa_rombel_id, siswa.nama_siswa ?? "");
                                  }}
                                >
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
                  <p className="text-sm text-gray-500 italic">Belum ada siswa pada tahun ini</p>
                )}
              </div>

              {/* ── Jadwal Pelajaran ── */}
              <div className="bg-white rounded shadow p-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-primary" />
                    <h2 className="text-lg font-semibold text-primary">
                      Jadwal Pelajaran <span className="text-sm font-normal text-gray-500">({allJadwal.length})</span>
                    </h2>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Link to={`/superadmin/informasi-akademik/jadwal-pelajaran-guru/create?rombel_id=${data.rombel_id}&nama_rombel=${encodeURIComponent(data.nama_rombel)}`}>
                      <Button className="bg-primary" size="sm">
                        <PlusIcon size={16} className="mr-1" /> Tambah Jadwal
                      </Button>
                    </Link>
                    {/* ✅ Tombol Histori → buka Dialog inline */}
                    <Button variant="outline" size="sm" onClick={() => setDialogHistori(true)}>
                      <ClockIcon size={16} className="mr-1" /> Histori
                    </Button>
                  </div>
                </div>
                <Separator className="mb-4" />

                {periode && periode.semester.length > 0 ? (
                  <div className="space-y-6">
                    {periode.semester.map((sem) => (
                      <div key={sem.semester_id}>
                        <h3 className="font-semibold text-gray-700 mb-2 border-b pb-1">Semester {sem.semester}</h3>
                        {sem.jadwal_pelajaran.length > 0 ? (
                          <div className="overflow-x-auto rounded">
                            <Table className="min-w-full border border-gray-200 bg-white">
                              <TableHeader className="bg-gray-100">
                                <TableRow>
                                  <TableHead>Mata Pelajaran</TableHead>
                                  <TableHead>Hari</TableHead>
                                  <TableHead>Jam</TableHead>
                                  <TableHead>Guru</TableHead>
                                  <TableHead>Ruangan</TableHead>
                                  <TableHead className="text-center">Aksi</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {sem.jadwal_pelajaran.map((j) => (
                                  <TableRow key={j.jadwal_pelajaran_id} className="hover:bg-indigo-50 border-b">
                                    <TableCell className="font-medium">{j.mata_pelajaran ?? "-"}</TableCell>
                                    <TableCell>{j.hari ?? "-"}</TableCell>
                                    <TableCell className="whitespace-nowrap">{j.jam_mulai && j.jam_selesai ? `${j.jam_mulai.slice(0, 5)} - ${j.jam_selesai.slice(0, 5)}` : "-"}</TableCell>
                                    <TableCell>{j.guru_pengajar ?? "-"}</TableCell>
                                    <TableCell>{j.ruangan ?? "-"}</TableCell>
                                    <TableCell>
                                      <div className="flex gap-1 justify-center">
                                        <Link
                                          to={
                                            `/superadmin/informasi-akademik/jadwal-pelajaran-guru/edit/${j.jadwal_pelajaran_id}` +
                                            `?rombel_id=${data.rombel_id}` +
                                            `&nama_rombel=${encodeURIComponent(data.nama_rombel)}` +
                                            `&kurmap_id=${j.kurikulum_mata_pelajaran_id ?? ""}` +
                                            `&hari=${j.hari ?? ""}` +
                                            `&guru_id=${j.guru_id ?? ""}` +
                                            `&jam_mulai=${j.jam_mulai ?? ""}` +
                                            `&jam_selesai=${j.jam_selesai ?? ""}` +
                                            `&ruangan_id=${j.ruangan_id ?? ""}` +
                                            `&link=${encodeURIComponent(j.link_opsional ?? "")}`
                                          }
                                        >
                                          <Button className="bg-primary" size="sm">
                                            <PenBoxIcon size={15} />
                                          </Button>
                                        </Link>
                                        <Button className="bg-muted-foreground hover:bg-muted-foreground/90" size="sm" onClick={() => handleDeleteJadwal(j.jadwal_pelajaran_id)}>
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
                          <p className="text-sm text-gray-500 italic pl-2">Belum ada jadwal pada semester ini</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Belum ada jadwal pelajaran pada tahun ini</p>
                )}
              </div>
            </div>
          )}
        </div>
        <Footer />
      </main>

      {/* ── Dialog Histori Jadwal ── */}
      <Dialog open={dialogHistori} onOpenChange={setDialogHistori}>
        <DialogContent className="sm:max-w-[900px] max-w-[96vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary">Histori Jadwal Pelajaran</DialogTitle>
            <DialogDescription>
              Jadwal pelajaran tahun aktif — <span className="font-medium">{data?.nama_rombel}</span>
              {periode && (
                <span className="ml-2 text-xs">
                  ({periode.tahun_akademik} • {allJadwal.length} jadwal)
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {!periode || periode.semester.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Belum ada jadwal pelajaran pada tahun ini.</p>
          ) : (
            <div className="space-y-4 mt-2">
              {/* Info rombel */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-indigo-500 mb-1 uppercase tracking-wide">Rombel</p>
                <p className="text-lg font-bold text-indigo-900">{data?.nama_rombel}</p>
                <p className="text-sm text-indigo-700 mt-0.5">
                  {data?.kelas?.kelas} • Tingkat {data?.kelas?.tingkat} • {data?.jurusan?.nama_jurusan ?? "Tanpa Jurusan"}
                </p>
                <p className="text-xs text-indigo-500 mt-1">
                  Tahun Aktif: {periode.tahun_akademik} • <Badge className="bg-green-100 text-green-700 text-xs">{periode.status_tahun_akademik}</Badge>
                </p>
              </div>

              {/* Per semester */}
              {periode.semester.map((sem) => (
                <div key={sem.semester_id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Header semester */}
                  <div className="bg-primary px-4 py-2 flex items-center justify-between">
                    <span className="text-white font-semibold text-sm">Semester {sem.semester}</span>
                    <span className="text-white text-xs">{sem.jadwal_pelajaran.length} jadwal</span>
                  </div>

                  {sem.jadwal_pelajaran.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-4">Tidak ada jadwal di semester ini.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-gray-50 text-xs text-gray-600">
                            <th className="text-left p-2 font-semibold">No</th>
                            <th className="text-left p-2 font-semibold">Mata Pelajaran</th>
                            <th className="text-left p-2 font-semibold">Hari</th>
                            <th className="text-left p-2 font-semibold">Jam</th>
                            <th className="text-left p-2 font-semibold">Guru</th>
                            <th className="text-left p-2 font-semibold">Ruangan</th>
                            <th className="text-left p-2 font-semibold">Link</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sem.jadwal_pelajaran.map((j, idx) => (
                            <tr key={j.jadwal_pelajaran_id} className="border-b hover:bg-gray-50">
                              <td className="p-2 text-gray-400">{idx + 1}</td>
                              <td className="p-2 font-medium">{j.mata_pelajaran || "-"}</td>
                              <td className="p-2">{j.hari || "-"}</td>
                              <td className="p-2 text-xs whitespace-nowrap">{j.jam_mulai && j.jam_selesai ? `${j.jam_mulai.slice(0, 5)} – ${j.jam_selesai.slice(0, 5)}` : "-"}</td>
                              <td className="p-2">{j.guru_pengajar || "-"}</td>
                              <td className="p-2 text-xs">{j.ruangan || "-"}</td>
                              <td className="p-2 text-xs">
                                {j.link_opsional ? (
                                  <a href={j.link_opsional} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    Link
                                  </a>
                                ) : (
                                  "-"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default DetailTahunAktifRombelKelas;
