import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ArrowLeft, Users, BookOpen, UserCheck } from "lucide-react";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";

// ── Types sesuai RombelController::dataTahunAktif() ──────────────────────────
interface SiswaItem {
  siswa_id: number | null;
  nama_siswa: string | null;
  nisn: string | null;
  nis: string | null;
  status_akhir: string | null;
  catatan: string | null;
}

interface JadwalItem {
  jadwal_id: number;
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

interface Periode {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: string;
  wali: { wali_id: number | null; nama_wali: string | null } | null;
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

const DetailTahunAktifRombelJurusan = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [data, setData] = useState<RombelDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Backend route: GET /spa/rombel/aktif/{id}
        const res = await api.get(`/spa/rombel/aktif/${id}`);
        if (res.data.status === "success") {
          setData(res.data.data);
        }
      } catch (err: any) {
        const status = err.response?.status;
        if (status === 404) {
          Swal.fire({
            icon: "warning",
            title: "Tidak Ditemukan",
            text: err.response?.data?.message || "Rombel atau tahun akademik aktif tidak ditemukan.",
          });
        } else {
          Swal.fire({ icon: "error", title: "Gagal memuat", text: "Tidak dapat memuat data rombel." });
        }
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const periode = data?.periode?.[0] ?? null;

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Detail Tahun Aktif Rombel" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} />
            </Button>
            <h1 className="text-3xl font-bold">Detail Tahun Aktif Rombel</h1>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2 className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : !data || !periode ? (
            <div className="text-center text-gray-500 py-16 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-lg font-medium">Belum ada data pada tahun ini</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* ── Info Rombel ── */}
              <div className="bg-white rounded shadow p-5">
                <h2 className="text-lg font-semibold mb-4 text-primary">Informasi Rombel</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium text-gray-600">Nama Rombel</span>
                    <span>{data.nama_rombel}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium text-gray-600">Status Rombel</span>
                    <Badge className={data.status_rombel === "aktif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>{data.status_rombel}</Badge>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium text-gray-600">Kelas</span>
                    <span>
                      {data.kelas?.kelas ?? "-"} (Tingkat {data.kelas?.tingkat ?? "-"})
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium text-gray-600">Jurusan</span>
                    <span>{data.jurusan?.nama_jurusan ?? "-"}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium text-gray-600">Tahun Akademik</span>
                    <span>{periode.tahun_akademik}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium text-gray-600">Status Tahun</span>
                    <Badge className={periode.status_tahun_akademik === "aktif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>{periode.status_tahun_akademik}</Badge>
                  </div>
                </div>
              </div>

              {/* ── Wali Rombel ── */}
              <div className="bg-white rounded shadow p-5">
                <div className="flex items-center gap-2 mb-3">
                  <UserCheck size={18} className="text-primary" />
                  <h2 className="text-lg font-semibold text-primary">Wali Rombel</h2>
                </div>
                {periode.wali ? (
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">Nama Wali: </span>
                    {periode.wali.nama_wali ?? "-"}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 italic">Belum ada wali rombel pada tahun ini</p>
                )}
              </div>

              {/* ── Daftar Siswa ── */}
              <div className="bg-white rounded shadow p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Users size={18} className="text-primary" />
                  <h2 className="text-lg font-semibold text-primary">
                    Daftar Siswa
                    <span className="ml-2 text-sm font-normal text-gray-500">({periode.siswa.length} siswa)</span>
                  </h2>
                </div>
                {periode.siswa.length > 0 ? (
                  <div className="overflow-x-auto rounded">
                    <Table className="min-w-full border border-gray-200 bg-white">
                      <TableHeader className="bg-primary">
                        <TableRow>
                          <TableHead className="w-[50px] text-center text-white font-semibold">No</TableHead>
                          <TableHead className="text-white font-semibold">NISN</TableHead>
                          <TableHead className="text-white font-semibold">NIS</TableHead>
                          <TableHead className="text-white font-semibold">Nama Siswa</TableHead>
                          <TableHead className="text-white font-semibold">Status Akhir</TableHead>
                          <TableHead className="text-white font-semibold">Catatan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {periode.siswa.map((siswa, index) => (
                          <TableRow key={siswa.siswa_id ?? index} className="hover:bg-indigo-50 even:bg-gray-50 border-b border-gray-100">
                            <TableCell className="text-center">{index + 1}</TableCell>
                            <TableCell>{siswa.nisn ?? "-"}</TableCell>
                            <TableCell>{siswa.nis ?? "-"}</TableCell>
                            <TableCell>{siswa.nama_siswa ?? "-"}</TableCell>
                            <TableCell>{siswa.status_akhir ? <Badge variant="outline">{siswa.status_akhir}</Badge> : <span className="text-gray-400 text-xs">-</span>}</TableCell>
                            <TableCell>{siswa.catatan ?? "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Belum ada siswa pada tahun ini</p>
                )}
              </div>

              {/* ── Jadwal Pelajaran per Semester ── */}
              <div className="bg-white rounded shadow p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={18} className="text-primary" />
                  <h2 className="text-lg font-semibold text-primary">Jadwal Pelajaran</h2>
                </div>
                {periode.semester.length > 0 ? (
                  <div className="space-y-6">
                    {periode.semester.map((sem) => (
                      <div key={sem.semester_id}>
                        <h3 className="font-semibold text-gray-700 mb-2 border-b pb-1">Semester {sem.semester}</h3>
                        {sem.jadwal_pelajaran.length > 0 ? (
                          <div className="overflow-x-auto rounded">
                            <Table className="min-w-full border border-gray-200 bg-white">
                              <TableHeader className="bg-gray-100">
                                <TableRow>
                                  <TableHead className="font-semibold">Mata Pelajaran</TableHead>
                                  <TableHead className="font-semibold">Hari</TableHead>
                                  <TableHead className="font-semibold">Jam</TableHead>
                                  <TableHead className="font-semibold">Guru</TableHead>
                                  <TableHead className="font-semibold">Ruangan</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {sem.jadwal_pelajaran.map((jadwal) => (
                                  <TableRow key={jadwal.jadwal_id} className="hover:bg-indigo-50 border-b border-gray-100">
                                    <TableCell>{jadwal.mata_pelajaran ?? "-"}</TableCell>
                                    <TableCell>{jadwal.hari ?? "-"}</TableCell>
                                    <TableCell>{jadwal.jam_mulai && jadwal.jam_selesai ? `${jadwal.jam_mulai} - ${jadwal.jam_selesai}` : "-"}</TableCell>
                                    <TableCell>{jadwal.guru_pengajar ?? "-"}</TableCell>
                                    <TableCell>{jadwal.ruangan ?? "-"}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">Belum ada jadwal pada semester ini</p>
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
    </SidebarProvider>
  );
};

export default DetailTahunAktifRombelJurusan;
