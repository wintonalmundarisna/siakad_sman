import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Loader2Icon, PenBoxIcon, PlusIcon, SearchIcon, Trash2Icon, ChevronDownIcon, ChevronRightIcon, EyeIcon, ArrowLeft, ArrowLeftIcon } from "lucide-react";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ── Types ──────────────────────────────────────────────────────────────────────
interface KompetensiItem {
  kompetensi_id: number;
  judul_kompetensi: string;
  jenis: string;
  kode: string | null;
  aspek?: string | null;
  status: string;
}

interface MataPelajaranGroup {
  mata_pelajaran_id: number;
  mata_pelajaran: string;
  kompetensi: KompetensiItem[];
}

interface LevelGroup {
  tingkat?: number;
  fase?: string;
  mata_pelajaran: MataPelajaranGroup[];
}

interface TipeGroup {
  tipe_kurikulum: string;
  data: LevelGroup[];
}

// ── Component ──────────────────────────────────────────────────────────────────
const DataKompetensi = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dataKompetensi, setDataKompetensi] = useState<TipeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTipe, setExpandedTipe] = useState<string[]>([]);
  const [expandedLevel, setExpandedLevel] = useState<string[]>([]);

  const [searchParams] = useSearchParams();
  const kurmapIdParam = searchParams.get("kurikulum_mata_pelajaran_id");
  const kurikulumId = searchParams.get("kurikulum_id");

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);

      if (kurmapIdParam) {
        // Dari detail kurmap — fetch dengan filter langsung
        try {
          const res = await api.get("/spa/kompetensi", {
            params: { kurikulum_mata_pelajaran_id: kurmapIdParam },
          });
          if (res.data.status === "success") {
            setDataKompetensi(res.data.data);
            if (res.data.data.length > 0) {
              setExpandedTipe([res.data.data[0].tipe_kurikulum]);
            }
          } else {
            setDataKompetensi([]);
          }
        } catch (err: any) {
          if (err.response?.status === 400 || err.response?.status === 404) {
            setDataKompetensi([]);
          } else {
            throw err;
          }
        }
      } else {
        // Fetch semua — ambil semua kurmap aktif dulu, lalu fetch kompetensi per kurmap
        const selectRes = await api.get("/spa/data-select/kompetensi");
        if (selectRes.data.status !== "success") {
          setDataKompetensi([]);
          return;
        }

        const semuaKurmap: { kurikulum_mata_pelajaran_id: number }[] = selectRes.data.data.kurikulum_mata_pelajaran ?? [];

        const results = await Promise.allSettled(
          semuaKurmap.map((k) =>
            api.get("/spa/kompetensi", {
              params: { kurikulum_mata_pelajaran_id: k.kurikulum_mata_pelajaran_id },
            }),
          ),
        );

        // Merge semua hasil per tipe → level → mata_pelajaran
        const mergedMap: Record<string, TipeGroup> = {};

        results.forEach((result) => {
          if (result.status === "fulfilled" && result.value.data.status === "success") {
            const items: TipeGroup[] = result.value.data.data;
            items.forEach((tipeItem) => {
              const tipe = tipeItem.tipe_kurikulum;
              if (!mergedMap[tipe]) {
                mergedMap[tipe] = { tipe_kurikulum: tipe, data: [] };
              }

              tipeItem.data.forEach((levelItem) => {
                const levelKey = levelItem.tingkat ?? levelItem.fase;
                const existingLevel = mergedMap[tipe].data.find((l) => (l.tingkat ?? l.fase) === levelKey);

                if (!existingLevel) {
                  mergedMap[tipe].data.push({
                    ...levelItem,
                    mata_pelajaran: [...levelItem.mata_pelajaran],
                  });
                } else {
                  levelItem.mata_pelajaran.forEach((mapelItem) => {
                    const existingMapel = existingLevel.mata_pelajaran.find((m) => m.mata_pelajaran_id === mapelItem.mata_pelajaran_id);
                    if (!existingMapel) {
                      existingLevel.mata_pelajaran.push({ ...mapelItem });
                    } else {
                      mapelItem.kompetensi.forEach((komp) => {
                        if (!existingMapel.kompetensi.find((k) => k.kompetensi_id === komp.kompetensi_id)) {
                          existingMapel.kompetensi.push(komp);
                        }
                      });
                    }
                  });
                }
              });
            });
          }
        });

        const merged = Object.values(mergedMap);
        setDataKompetensi(merged);
        if (merged.length > 0) {
          setExpandedTipe([merged[0].tipe_kurikulum]);
        }
      }
    } catch (error: any) {
      if (error.response?.status === 400 || error.response?.status === 404) {
        setDataKompetensi([]);
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: error.response?.data?.message || "Tidak dapat memuat data kompetensi",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [kurmapIdParam]);

  // ── Accordion ────────────────────────────────────────────────────────────────
  const toggleTipe = (tipe: string) => setExpandedTipe((prev) => (prev.includes(tipe) ? prev.filter((t) => t !== tipe) : [...prev, tipe]));

  const toggleLevel = (key: string) => setExpandedLevel((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number, judul: string) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      html: `Kompetensi <strong>${judul}</strong> akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const res = await api.delete(`/spa/kompetensi/${id}`);
      if (res.data.status === "success") {
        await fetchData();
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data berhasil dihapus.",
          showConfirmButton: false,
          timer: 1800,
        });
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal menghapus!",
        text: err.response?.data?.message || "Terjadi kesalahan saat menghapus.",
      });
    } finally {
      setLoading(false);
    }
  };

  // URL tambah — bawa kurmapIdParam agar Create bisa pre-select + redirect balik
  const createUrl = kurmapIdParam ? `/superadmin/informasi-sekolah/kompetensi/create?kurikulum_mata_pelajaran_id=${kurmapIdParam}&kurikulum_id=${kurikulumId}` : "/superadmin/informasi-sekolah/kompetensi/create";

  // ── Search filter ────────────────────────────────────────────────────────────
  const filteredData = dataKompetensi
    .map((tipe) => ({
      ...tipe,
      data: tipe.data
        .map((level) => ({
          ...level,
          mata_pelajaran: level.mata_pelajaran
            .map((mapel) => ({
              ...mapel,
              kompetensi: mapel.kompetensi.filter((k) => (searchTerm.trim() === "" ? true : k.judul_kompetensi.toLowerCase().includes(searchTerm.toLowerCase()))),
            }))
            .filter((mapel) => mapel.kompetensi.length > 0),
        }))
        .filter((level) => level.mata_pelajaran.length > 0),
    }))
    .filter((tipe) => tipe.data.length > 0);

  // ── Badge helpers ────────────────────────────────────────────────────────────
  const jenisBadge = (jenis: string) => (jenis === "KD" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100");

  const aspekBadge = (aspek?: string | null) => {
    switch (aspek) {
      case "sikap":
        return "bg-purple-100 text-purple-700 hover:bg-purple-100";
      case "pengetahuan":
        return "bg-sky-100 text-sky-700 hover:bg-sky-100";
      case "keterampilan":
        return "bg-orange-100 text-orange-700 hover:bg-orange-100";
      default:
        return "bg-gray-100 text-gray-600 hover:bg-gray-100";
    }
  };

  const statusBadge = (status: string) => (status === "aktif" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-600 hover:bg-gray-100");

  // ── Render ───────────────────────────────────────────────────────────────────
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Kompetensi" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" onClick={() => navigate(kurikulumId ? `/superadmin/informasi-sekolah/kurikulum-mata-pelajaran?kurikulum_id=${kurikulumId}` : `/superadmin/informasi-sekolah/kurikulum-mata-pelajaran`)}>
              <ArrowLeftIcon size={16} />
              Kembali
            </Button>
            <h1 className="text-3xl font-bold">Data Kompetensi</h1>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Loader2Icon className="animate-spin mb-3" size={32} />
              <p className="font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="mb-5 flex flex-col md:flex-row justify-between items-center gap-3">
                <Link to={createUrl}>
                  <Button className="bg-primary gap-2">
                    <PlusIcon size={16} />
                    Tambah Kompetensi
                  </Button>
                </Link>
                <div className="relative w-full md:w-72">
                  <SearchIcon className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <Input placeholder="Cari kompetensi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                </div>
              </div>

              {/* Accordion */}
              <div className="space-y-4">
                {filteredData.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-500">
                    <p className="font-medium text-lg">Tidak ada data kompetensi</p>
                    <p className="text-sm mt-1">{searchTerm ? "Coba kata kunci lain." : "Belum ada kompetensi yang ditambahkan."}</p>
                    {/* Tombol back jika dibuka dari detail kurmap */}
                    {kurmapIdParam && !searchTerm && (
                      <Button variant="outline" className="mt-4 gap-2" onClick={() => navigate(-1)}>
                        <ArrowLeft size={16} />
                        Kembali
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredData.map((tipe) => (
                    <div key={tipe.tipe_kurikulum} className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
                      {/* Header Tipe */}
                      <button type="button" className="w-full bg-primary px-5 py-4 flex items-center justify-between hover:bg-primary/90 transition-colors" onClick={() => toggleTipe(tipe.tipe_kurikulum)}>
                        <div className="flex items-center gap-3">
                          {expandedTipe.includes(tipe.tipe_kurikulum) ? <ChevronDownIcon className="text-white" size={20} /> : <ChevronRightIcon className="text-white" size={20} />}
                          <span className="text-white font-bold text-lg">{tipe.tipe_kurikulum === "K13" ? "Kurikulum 2013 (KD)" : "Kurikulum Merdeka (CP)"}</span>
                        </div>
                        <span className="text-white/70 text-sm">{tipe.data.reduce((a, l) => a + l.mata_pelajaran.reduce((b, m) => b + m.kompetensi.length, 0), 0)} kompetensi</span>
                      </button>

                      {/* Level accordion */}
                      {expandedTipe.includes(tipe.tipe_kurikulum) && (
                        <div className="p-4 space-y-3">
                          {tipe.data.map((level) => {
                            const levelKey = `${tipe.tipe_kurikulum}-${level.tingkat ?? level.fase}`;
                            const levelLabel = level.tingkat ? `Kelas ${level.tingkat}` : `Fase ${level.fase}`;
                            const totalKomp = level.mata_pelajaran.reduce((acc, m) => acc + m.kompetensi.length, 0);

                            return (
                              <div key={levelKey} className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* Header Level */}
                                <button type="button" className="w-full bg-indigo-50 px-4 py-3 flex items-center justify-between hover:bg-indigo-100 transition-colors" onClick={() => toggleLevel(levelKey)}>
                                  <div className="flex items-center gap-2">
                                    {expandedLevel.includes(levelKey) ? <ChevronDownIcon className="text-indigo-600" size={16} /> : <ChevronRightIcon className="text-indigo-600" size={16} />}
                                    <span className="font-semibold text-indigo-900">{levelLabel}</span>
                                  </div>
                                  <span className="text-indigo-600 text-sm">{totalKomp} kompetensi</span>
                                </button>

                                {/* Tabel per Mata Pelajaran */}
                                {expandedLevel.includes(levelKey) &&
                                  level.mata_pelajaran.map((mapel) => (
                                    <div key={mapel.mata_pelajaran_id} className="border-t border-gray-200">
                                      <div className="bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700 border-b border-gray-200">{mapel.mata_pelajaran}</div>
                                      <div className="overflow-x-auto">
                                        <Table>
                                          <TableHeader className="bg-gray-50/50">
                                            <TableRow>
                                              <TableHead className="text-center w-12">No</TableHead>
                                              <TableHead>Judul Kompetensi</TableHead>
                                              <TableHead className="w-20">Jenis</TableHead>
                                              <TableHead className="w-28">Kode</TableHead>
                                              {tipe.tipe_kurikulum === "K13" && <TableHead className="w-28">Aspek</TableHead>}
                                              <TableHead className="w-20">Status</TableHead>
                                              <TableHead className="text-center w-32">Aksi</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {mapel.kompetensi.map((komp, idx) => (
                                              <TableRow key={komp.kompetensi_id} className="hover:bg-gray-50 border-b border-gray-100">
                                                <TableCell className="text-center font-medium text-gray-500">{idx + 1}</TableCell>
                                                <TableCell className="font-medium">{komp.judul_kompetensi}</TableCell>
                                                <TableCell>
                                                  <Badge className={jenisBadge(komp.jenis)}>{komp.jenis}</Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">{komp.kode || "-"}</TableCell>
                                                {tipe.tipe_kurikulum === "K13" && (
                                                  <TableCell>
                                                    <Badge className={aspekBadge(komp.aspek)}>{komp.aspek || "-"}</Badge>
                                                  </TableCell>
                                                )}
                                                <TableCell>
                                                  <Badge className={statusBadge(komp.status)}>{komp.status}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                  <div className="flex gap-1 justify-center">
                                                    {/* Detail — halaman baru */}
                                                    <Link to={`/superadmin/informasi-sekolah/kompetensi/${komp.kompetensi_id}?kurikulum_mata_pelajaran_id=${kurmapIdParam}&kurikulum_id=${kurikulumId}`}>
                                                      <Button variant="outline" size="sm" title="Detail">
                                                        <EyeIcon size={14} />
                                                      </Button>
                                                    </Link>
                                                    {/* Edit */}
                                                    <Link to={`/superadmin/informasi-sekolah/kompetensi/edit/${komp.kompetensi_id}?kurikulum_mata_pelajaran_id=${kurmapIdParam}&kurikulum_id=${kurikulumId}`}>
                                                      <Button className="bg-primary" size="sm" title="Edit">
                                                        <PenBoxIcon size={14} />
                                                      </Button>
                                                    </Link>
                                                    {/* Delete */}
                                                    <Button
                                                      className="bg-muted-foreground hover:bg-muted-foreground/90"
                                                      size="sm"
                                                      title="Hapus"
                                                      disabled={komp.status === "arsip"}
                                                      onClick={() => handleDelete(komp.kompetensi_id, komp.judul_kompetensi)}
                                                    >
                                                      <Trash2Icon size={14} />
                                                    </Button>
                                                  </div>
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default DataKompetensi;
