/**
 * HistoriJadwalRombelGuru
 * Route: /superadmin/informasi-akademik/rombel/:id/histori-jadwal
 * Endpoint: GET /spa/rombel/:id?tahun_akademik_id=X
 *
 * User memilih tahun akademik dulu via select,
 * baru data jadwal per semester ditampilkan.
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, BookOpen, CalendarIcon, Loader2Icon } from "lucide-react";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";

// ── Types ──────────────────────────────────────────────────────────────────────
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
  semester_id: number;
  semester: string;
  jadwal_pelajaran: JadwalItem[];
}

interface PeriodeItem {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: string;
  semester: SemesterItem[];
}

interface RombelData {
  rombel_id: number;
  nama_rombel: string;
  status_rombel: string;
  kelas: { kelas_id: number; kelas: string; tingkat: string | number | null };
  jurusan: { jurusan_id: number | null; nama_jurusan: string | null };
  periode: PeriodeItem[];
}

interface TahunOption {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status: string;
}

// ── Component ──────────────────────────────────────────────────────────────────
const HistoriJadwalRombelGuru = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Daftar opsi tahun akademik (dari select data)
  const [tahunOptions, setTahunOptions] = useState<TahunOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Tahun yang dipilih user
  const [selectedTahun, setSelectedTahun] = useState<string>("");

  // Data rombel + jadwal setelah tahun dipilih
  const [rombelData, setRombelData] = useState<RombelData | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // ── Fetch daftar tahun akademik saat mount ────────────────────────────────
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await api.get("/spa/data-select/jadwal-pelajaran");
        if (res.data.status === "success") {
          const tahuns: TahunOption[] = res.data.data.tahun_akademik ?? [];
          setTahunOptions(tahuns);
        }
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat daftar tahun!",
          text: err.response?.data?.message || "Terjadi kesalahan.",
        });
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  // ── Fetch data rombel saat tahun dipilih ─────────────────────────────────
  useEffect(() => {
    if (!selectedTahun || !id) return;

    const fetchRombel = async () => {
      try {
        setLoadingData(true);
        setRombelData(null);
        const res = await api.get(`/spa/rombel/${id}`, {
          params: { tahun_akademik_id: selectedTahun },
        });
        if (res.data.status === "success") {
          setRombelData(res.data.data);
        }
      } catch (err: any) {
        if (err.response?.status !== 404) {
          Swal.fire({
            icon: "error",
            title: "Gagal memuat data!",
            text: err.response?.data?.message || "Terjadi kesalahan.",
          });
        } else {
          setRombelData(null);
        }
      } finally {
        setLoadingData(false);
      }
    };

    fetchRombel();
  }, [selectedTahun, id]);

  const selectedPeriode = rombelData?.periode?.[0] ?? null;
  const allJadwal = selectedPeriode?.semester.flatMap((s) => s.jadwal_pelajaran) ?? [];

  const toAbsoluteUrl = (url: string) =>
    /^https?:\/\//i.test(url) ? url : `https://${url}`;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Histori Jadwal Rombel" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Kembali
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Histori Jadwal Rombel</h1>
              {rombelData && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {rombelData.nama_rombel}
                  <span className="mx-1.5 text-gray-300">·</span>
                  {rombelData.kelas?.kelas} Tingkat {rombelData.kelas?.tingkat}
                  {rombelData.jurusan?.nama_jurusan && (
                    <>
                      <span className="mx-1.5 text-gray-300">·</span>
                      {rombelData.jurusan.nama_jurusan}
                    </>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Loading opsi tahun */}
          {loadingOptions ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Loader2Icon className="animate-spin mb-3" size={32} />
              <p className="font-medium">Memuat daftar tahun akademik...</p>
            </div>
          ) : (
            <div className="space-y-6">

              {/* ── Pilih Tahun Akademik ── */}
              <div className="flex items-center gap-3">
                <CalendarIcon size={16} className="text-primary shrink-0" />
                <Select value={selectedTahun} onValueChange={setSelectedTahun}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Pilih tahun akademik..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tahunOptions.map((t) => (
                      <SelectItem key={t.tahun_akademik_id} value={String(t.tahun_akademik_id)}>
                        <div className="flex items-center gap-2">
                          {t.tahun_akademik}
                          <Badge
                            className={`text-xs ${
                              t.status === "aktif"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {t.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ── Belum pilih tahun ── */}
              {!selectedTahun && (
                <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-400">
                  <CalendarIcon size={36} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-medium text-base">Pilih tahun akademik terlebih dahulu</p>
                  <p className="text-sm mt-1">untuk melihat histori jadwal pelajaran rombel ini.</p>
                </div>
              )}

              {/* ── Loading data jadwal ── */}
              {selectedTahun && loadingData && (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                  <Loader2Icon className="animate-spin mb-3" size={28} />
                  <p className="font-medium">Memuat data jadwal...</p>
                </div>
              )}

              {/* ── Tidak ada data ── */}
              {selectedTahun && !loadingData && !selectedPeriode && (
                <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400">
                  <BookOpen size={36} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">Tidak ada jadwal pelajaran pada tahun akademik ini.</p>
                </div>
              )}

              {/* ── Data jadwal ── */}
              {selectedTahun && !loadingData && selectedPeriode && (
                <div className="space-y-4">
                  {/* Info ringkas periode */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Tahun akademik <strong>{selectedPeriode.tahun_akademik}</strong>
                      <Badge
                        className={`ml-2 text-xs ${
                          selectedPeriode.status_tahun_akademik === "aktif"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {selectedPeriode.status_tahun_akademik}
                      </Badge>
                      <span className="ml-2 text-gray-400">· {allJadwal.length} jadwal</span>
                    </p>
                  </div>

                  {/* Per semester */}
                  {selectedPeriode.semester.map((sem) => (
                    <div key={sem.semester_id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      {/* Header semester */}
                      <div className="bg-primary px-5 py-3 flex items-center justify-between">
                        <span className="text-white font-semibold text-sm">Semester {sem.semester}</span>
                        <span className="text-white/70 text-xs">{sem.jadwal_pelajaran.length} jadwal</span>
                      </div>

                      {sem.jadwal_pelajaran.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-6">
                          Tidak ada jadwal pada semester ini.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table className="min-w-full">
                            <TableHeader className="bg-gray-50">
                              <TableRow>
                                <TableHead className="w-10 text-center">No</TableHead>
                                <TableHead>Mata Pelajaran</TableHead>
                                <TableHead>Hari</TableHead>
                                <TableHead>Jam</TableHead>
                                <TableHead>Guru</TableHead>
                                <TableHead>Ruangan</TableHead>
                                <TableHead>Link</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sem.jadwal_pelajaran.map((j, idx) => (
                                <TableRow key={j.jadwal_id} className="hover:bg-indigo-50 border-b">
                                  <TableCell className="text-center text-gray-400 text-xs">{idx + 1}</TableCell>
                                  <TableCell className="font-medium">{j.mata_pelajaran ?? "-"}</TableCell>
                                  <TableCell>{j.hari ?? "-"}</TableCell>
                                  <TableCell className="whitespace-nowrap text-sm">
                                    {j.jam_mulai && j.jam_selesai
                                      ? `${j.jam_mulai.slice(0, 5)} – ${j.jam_selesai.slice(0, 5)}`
                                      : "-"}
                                  </TableCell>
                                  <TableCell>{j.guru_pengajar ?? "-"}</TableCell>
                                  <TableCell className="text-sm">{j.ruangan ?? "-"}</TableCell>
                                  <TableCell className="text-sm">
                                    {j.link_opsional ? (
                                      <a
                                        href={toAbsoluteUrl(j.link_opsional)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                      >
                                        Link
                                      </a>
                                    ) : (
                                      "-"
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default HistoriJadwalRombelGuru;