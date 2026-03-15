/**
 * DetailKompetensi
 * Route: /superadmin/informasi-sekolah/kompetensi/:id?kurikulum_mata_pelajaran_id=X
 *
 * CRUD ATP Master inline (Dialog) karena:
 * - GET /spa/atp-master/:id → di-comment di backend (tidak tersedia)
 * - GET /spa/data-select/atp-master → di-comment di backend (tidak tersedia)
 * - kompetensi_id sudah diketahui dari halaman ini
 * - Semua data yang dibutuhkan untuk create/edit sudah ada di state lokal
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import Footer from "@/pages/Footer";
import {
  ArrowLeft, Loader2Icon, PlusIcon, PenBoxIcon,
  Trash2Icon, BookOpenIcon, GraduationCapIcon,
  TagIcon, HashIcon, LayersIcon, CheckCircle2Icon,
  XIcon,
} from "lucide-react";
import api from "@/api/axios";
import Swal from "sweetalert2";

// ── Types ──────────────────────────────────────────────────────────────────────
interface AtpMaster {
  atp_master_id: number;
  urutan: number;
  tujuan_pembelajaran: string;
  status_atp: string;
}

interface KompetensiDetail {
  kompetensi_id: number;
  kurikulum: string;
  mata_pelajaran: string;
  judul_kompetensi: string;
  jenis: "KD" | "CP";
  kode: string | null;
  tingkat?: number | null;
  aspek?: string | null;
  fase?: string | null;
  deskripsi?: string | null;
  status_kompetensi: string;
  atp_masters?: AtpMaster[];
}

type DialogMode = "create" | "edit" | null;

interface AtpFormData {
  urutan: string;
  tujuan_pembelajaran: string;
  status: string;
}

interface AtpFormErrors {
  urutan?: string[];
  tujuan_pembelajaran?: string[];
  status?: string[];
  data?: string[];
}

// ── Badge helpers ──────────────────────────────────────────────────────────────
const jenisBadge = (jenis: string) =>
  jenis === "KD"
    ? "bg-blue-100 text-blue-700 border-blue-200"
    : "bg-emerald-100 text-emerald-700 border-emerald-200";

const aspekBadge = (aspek?: string | null) => {
  switch (aspek) {
    case "sikap":        return "bg-purple-100 text-purple-700 border-purple-200";
    case "pengetahuan":  return "bg-sky-100 text-sky-700 border-sky-200";
    case "keterampilan": return "bg-orange-100 text-orange-700 border-orange-200";
    default:             return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

const atpStatusBadge = (status: string) => {
  switch (status) {
    case "disetujui": return "bg-green-100 text-green-700";
    case "ditolak":   return "bg-red-100 text-red-700";
    default:          return "bg-yellow-100 text-yellow-700";
  }
};

// ── Component ──────────────────────────────────────────────────────────────────
const DetailKompetensi = () => {
  const { id }             = useParams<{ id: string }>();
  const navigate           = useNavigate();
  const [searchParams]     = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const kurmapId = searchParams.get("kurikulum_mata_pelajaran_id") || "";
  const backUrl  = kurmapId
    ? `/superadmin/informasi-sekolah/kompetensi?kurikulum_mata_pelajaran_id=${kurmapId}`
    : "/superadmin/informasi-sekolah/kompetensi";

  // ── Detail state ─────────────────────────────────────────────────────────────
  const [data, setData]       = useState<KompetensiDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // ── Dialog ATP state ──────────────────────────────────────────────────────────
  const [dialogMode, setDialogMode]         = useState<DialogMode>(null);
  const [editingAtpId, setEditingAtpId]     = useState<number | null>(null);
  const [initialAtpStatus, setInitialAtpStatus] = useState<string>("");
  const [atpLoading, setAtpLoading]         = useState(false);
  const [atpErrors, setAtpErrors]           = useState<AtpFormErrors>({});
  const [atpForm, setAtpForm]               = useState<AtpFormData>({
    urutan: "",
    tujuan_pembelajaran: "",
    status: "aktif",
  });

  // ── Fetch detail kompetensi ───────────────────────────────────────────────────
  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/spa/kompetensi/${id}`);
      if (res.data.status === "success") {
        setData(res.data.data);
      } else {
        setError("Data tidak ditemukan");
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError("Kompetensi tidak ditemukan.");
      } else {
        setError(err.response?.data?.message || "Gagal memuat data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) { navigate(backUrl); return; }
    fetchDetail();
  }, [id]);

  // ── Dialog helpers ────────────────────────────────────────────────────────────
  const openCreateDialog = () => {
    setAtpForm({ urutan: "", tujuan_pembelajaran: "", status: "aktif" });
    setAtpErrors({});
    setEditingAtpId(null);
    setInitialAtpStatus("");
    setDialogMode("create");
  };

  const openEditDialog = (atp: AtpMaster) => {
    setAtpForm({
      urutan: String(atp.urutan),
      tujuan_pembelajaran: atp.tujuan_pembelajaran,
      status: atp.status_atp,
    });
    setAtpErrors({});
    setEditingAtpId(atp.atp_master_id);
    setInitialAtpStatus(atp.status_atp);
    setDialogMode("edit");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setAtpErrors({});
  };

  // ── Create ATP ────────────────────────────────────────────────────────────────
  const handleCreateAtp = async () => {
    setAtpErrors({});
    const fe: AtpFormErrors = {};
    if (!atpForm.urutan || isNaN(Number(atpForm.urutan)) || Number(atpForm.urutan) < 1)
      fe.urutan = ["Urutan wajib diisi (minimal 1)"];
    if (!atpForm.tujuan_pembelajaran.trim())
      fe.tujuan_pembelajaran = ["Tujuan pembelajaran wajib diisi"];
    if (Object.keys(fe).length) { setAtpErrors(fe); return; }

    setAtpLoading(true);
    try {
      const res = await api.post("/spa/atp-master", {
        kompetensi_id:       data!.kompetensi_id,
        urutan:              Number(atpForm.urutan),
        tujuan_pembelajaran: atpForm.tujuan_pembelajaran.trim(),
      });

      if (res.data.status === "success") {
        closeDialog();
        await fetchDetail();
        Swal.fire({
          icon: "success", title: "Berhasil!",
          text: "ATP berhasil ditambahkan.",
          showConfirmButton: false, timer: 1500,
        });
      }
    } catch (err: any) {
      const errData = err.response?.data;
      if (err.response?.status === 400 || err.response?.status === 422) {
        if (errData?.errors?.data) {
          setAtpErrors({ data: [Array.isArray(errData.errors.data) ? errData.errors.data[0] : errData.errors.data] });
        } else if (errData?.errors) {
          setAtpErrors(errData.errors);
        }
      } else {
        Swal.fire({ icon: "error", title: "Gagal!", text: errData?.message || "Terjadi kesalahan." });
      }
    } finally {
      setAtpLoading(false);
    }
  };

  // ── Edit ATP ──────────────────────────────────────────────────────────────────
  const handleEditAtp = async () => {
    setAtpErrors({});
    const fe: AtpFormErrors = {};
    if (!atpForm.urutan || isNaN(Number(atpForm.urutan)) || Number(atpForm.urutan) < 1)
      fe.urutan = ["Urutan wajib diisi (minimal 1)"];
    if (!atpForm.tujuan_pembelajaran.trim())
      fe.tujuan_pembelajaran = ["Tujuan pembelajaran wajib diisi"];
    if (!atpForm.status)
      fe.status = ["Status wajib dipilih"];
    if (Object.keys(fe).length) { setAtpErrors(fe); return; }

    setAtpLoading(true);
    try {
      const res = await api.put(`/spa/atp-master/${editingAtpId}`, {
        kompetensi_id:       data!.kompetensi_id,
        urutan:              Number(atpForm.urutan),
        tujuan_pembelajaran: atpForm.tujuan_pembelajaran.trim(),
        status:              atpForm.status,
      });

      if (res.data.status === "success") {
        closeDialog();
        await fetchDetail();
        Swal.fire({
          icon: "success", title: "Berhasil!",
          text: "ATP berhasil diperbarui.",
          showConfirmButton: false, timer: 1500,
        });
      }
    } catch (err: any) {
      const errData = err.response?.data;
      if (err.response?.status === 400 || err.response?.status === 422) {
        if (errData?.errors?.data) {
          setAtpErrors({ data: [Array.isArray(errData.errors.data) ? errData.errors.data[0] : errData.errors.data] });
        } else if (errData?.errors) {
          setAtpErrors(errData.errors);
        }
      } else {
        Swal.fire({ icon: "error", title: "Gagal!", text: errData?.message || "Terjadi kesalahan." });
      }
    } finally {
      setAtpLoading(false);
    }
  };

  // ── Delete ATP ────────────────────────────────────────────────────────────────
  const handleDeleteAtp = async (atpId: number, tujuan: string) => {
    const ok = await Swal.fire({
      title: "Hapus ATP ini?",
      html: `<span class="text-sm text-gray-700">${tujuan}</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!ok.isConfirmed) return;

    try {
      await api.delete(`/spa/atp-master/${atpId}`);
      await fetchDetail();
      Swal.fire({
        icon: "success", title: "Berhasil dihapus!",
        showConfirmButton: false, timer: 1500,
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error", title: "Gagal!",
        text: err.response?.data?.message || "Terjadi kesalahan.",
      });
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SidebarProvider>
        <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
          <PageTitle title="Detail Kompetensi" />
          <div className="flex flex-col items-center justify-center h-72 text-gray-500">
            <Loader2Icon className="animate-spin mb-3" size={32} />
            <p className="font-medium">Memuat data...</p>
          </div>
          <Footer />
        </main>
      </SidebarProvider>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <SidebarProvider>
        <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
          <PageTitle title="Detail Kompetensi" />
          <div className="mx-auto p-6">
            <div className="flex items-center gap-3 mb-4">
              <Button variant="outline" size="sm" onClick={() => navigate(backUrl)}>
                <ArrowLeft size={16} />
              </Button>
              <h1 className="text-2xl font-bold text-red-600">Data Tidak Ditemukan</h1>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button className="bg-primary" onClick={() => navigate(backUrl)}>
              Kembali ke Daftar
            </Button>
          </div>
          <Footer />
        </main>
      </SidebarProvider>
    );
  }

  const atpMasters: AtpMaster[] = (data.atp_masters ?? []).slice().sort((a, b) => a.urutan - b.urutan);

  // ── Main Render ───────────────────────────────────────────────────────────────
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Detail Kompetensi" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8 w-full">
          {/* ── Header ── */}
          <div className="flex items-start gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(backUrl)} className="mt-1">
              <ArrowLeft size={16} />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">Detail Kompetensi</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Informasi lengkap kompetensi yang dipilih</p>
            </div>
            <Link to={`/superadmin/informasi-sekolah/kompetensi/edit/${data.kompetensi_id}${kurmapId ? `?kurikulum_mata_pelajaran_id=${kurmapId}` : ""}`}>
              <Button className="bg-primary gap-2">
                <PenBoxIcon size={16} />
                Edit
              </Button>
            </Link>
          </div>

          {/* ── Card Info Kompetensi ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-5">
            <div className="flex items-center gap-2 mb-5">
              <BookOpenIcon size={20} className="text-primary" />
              <h2 className="text-lg font-bold text-gray-900">Informasi Kompetensi</h2>
            </div>

            <div className="grid gap-4">
              {/* Kurikulum */}
              <div className="flex items-start gap-3 py-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <LayersIcon size={16} className="text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Kurikulum</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{data.kurikulum}</p>
                </div>
              </div>

              {/* Mata Pelajaran */}
              <div className="flex items-start gap-3 py-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <GraduationCapIcon size={16} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mata Pelajaran</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{data.mata_pelajaran}</p>
                </div>
              </div>

              {/* Judul Kompetensi */}
              <div className="flex items-start gap-3 py-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2Icon size={16} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Judul Kompetensi</p>
                  <p className="font-semibold text-gray-900 mt-0.5 leading-snug">{data.judul_kompetensi}</p>
                </div>
              </div>

              {/* Jenis & Kode */}
              <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <TagIcon size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Jenis</p>
                    <Badge className={`mt-1 ${jenisBadge(data.jenis)}`}>{data.jenis}</Badge>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HashIcon size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Kode</p>
                    <p className="font-medium text-gray-900 mt-0.5">{data.kode || "—"}</p>
                  </div>
                </div>
              </div>

              {/* KD: Tingkat & Aspek */}
              {data.jenis === "KD" && (
                <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-100">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tingkat</p>
                    <p className="font-semibold text-gray-900 mt-0.5">{data.tingkat ? `Kelas ${data.tingkat}` : "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Aspek</p>
                    <Badge className={`mt-1 ${aspekBadge(data.aspek)}`}>{data.aspek || "—"}</Badge>
                  </div>
                </div>
              )}

              {/* CP: Fase & Deskripsi */}
              {data.jenis === "CP" && (
                <>
                  <div className="py-3 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fase</p>
                    <p className="font-semibold text-gray-900 mt-0.5">{data.fase ? `Fase ${data.fase}` : "—"}</p>
                  </div>
                  {data.deskripsi && (
                    <div className="py-3 border-b border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Deskripsi</p>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{data.deskripsi}</p>
                    </div>
                  )}
                </>
              )}

              {/* Status */}
              <div className="py-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</p>
                <Badge className={`mt-1 ${data.status_kompetensi === "aktif" ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>{data.status_kompetensi}</Badge>
              </div>
            </div>
          </div>

          {/* ── Section ATP Master (CP only) ── */}
          {data.jenis === "CP" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Alur Tujuan Pembelajaran</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{atpMasters.length} ATP terdaftar pada kompetensi ini</p>
                </div>
                <Button className="bg-primary gap-2" size="sm" onClick={openCreateDialog}>
                  <PlusIcon size={14} />
                  Tambah ATP
                </Button>
              </div>

              <Separator className="mb-5" />

              {atpMasters.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <p className="font-medium">Belum ada ATP untuk kompetensi ini.</p>
                  <p className="text-sm mt-1">Klik tombol "Tambah ATP" untuk menambahkan.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {atpMasters.map((atp) => (
                    <div key={atp.atp_master_id} className="flex items-start gap-4 bg-gray-50 rounded-lg border border-gray-200 p-4 hover:bg-gray-100/60 transition-colors">
                      {/* Nomor urutan */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center mt-0.5">{atp.urutan}</div>

                      {/* Konten */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 leading-relaxed">{atp.tujuan_pembelajaran}</p>
                        <Badge className={`mt-2 text-xs ${atpStatusBadge(atp.status_atp)}`}>{atp.status_atp}</Badge>
                      </div>

                      {/* Aksi */}
                      <div className="flex gap-1.5 flex-shrink-0">
                        <Button size="sm" className="bg-primary" title="Edit ATP" onClick={() => openEditDialog(atp)}>
                          <PenBoxIcon size={13} />
                        </Button>
                        <Button size="sm" className="bg-muted-foreground hover:bg-muted-foreground/90" title="Hapus ATP" onClick={() => handleDeleteAtp(atp.atp_master_id, atp.tujuan_pembelajaran)}>
                          <Trash2Icon size={13} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Info KD */}
          {data.jenis === "KD" && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
              <p className="font-semibold mb-1">ℹ️ Informasi</p>
              <p>
                Kompetensi jenis <strong>KD (Kurikulum 2013)</strong> tidak memiliki Alur Tujuan Pembelajaran (ATP). ATP hanya tersedia untuk jenis CP (Kurikulum Merdeka).
              </p>
            </div>
          )}
        </div>

        <Footer />

        {/* ════════════════════════════════════════════════════════════
            DIALOG — Tambah / Edit ATP Master
        ════════════════════════════════════════════════════════════ */}
        <Dialog
          open={dialogMode !== null}
          onOpenChange={(open) => {
            if (!open) closeDialog();
          }}
        >
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-primary">{dialogMode === "create" ? "Tambah ATP" : "Edit ATP"}</DialogTitle>
              <DialogDescription>{dialogMode === "create" ? `Tambah Alur Tujuan Pembelajaran untuk: ${data?.judul_kompetensi}` : `Edit Alur Tujuan Pembelajaran — Urutan ${atpForm.urutan}`}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Error banner (duplikasi urutan, dsb) */}
              {atpErrors.data && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">⚠️ {atpErrors.data[0]}</div>}

              {/* Urutan */}
              <div>
                <label className="block font-semibold text-sm mb-1">
                  Urutan <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="contoh: 1"
                  value={atpForm.urutan}
                  onChange={(e) => {
                    setAtpForm({ ...atpForm, urutan: e.target.value });
                    setAtpErrors({ ...atpErrors, urutan: undefined });
                  }}
                  className={`border rounded w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${atpErrors.urutan ? "border-red-500" : "border-gray-300"}`}
                />
                {atpErrors.urutan && <p className="text-red-500 text-xs mt-1">{atpErrors.urutan[0]}</p>}
                <p className="text-xs text-gray-400 mt-1">Urutan menentukan posisi ATP dalam daftar. Tidak boleh duplikat untuk kompetensi yang sama.</p>
              </div>

              {/* Tujuan Pembelajaran */}
              <div>
                <label className="block font-semibold text-sm mb-1">
                  Tujuan Pembelajaran <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="contoh: Peserta didik mampu memahami konsep bilangan real dan operasinya."
                  value={atpForm.tujuan_pembelajaran}
                  onChange={(e) => {
                    setAtpForm({ ...atpForm, tujuan_pembelajaran: e.target.value });
                    setAtpErrors({ ...atpErrors, tujuan_pembelajaran: undefined });
                  }}
                  className={`border rounded w-full p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 ${atpErrors.tujuan_pembelajaran ? "border-red-500" : "border-gray-300"}`}
                />
                {atpErrors.tujuan_pembelajaran && <p className="text-red-500 text-xs mt-1">{atpErrors.tujuan_pembelajaran[0]}</p>}
              </div>

              {/* Status — hanya saat edit */}
              {dialogMode === "edit" && (
                <div>
                  <label className="block font-semibold text-sm mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={atpForm.status}
                    onChange={(e) => {
                      setAtpForm({ ...atpForm, status: e.target.value });
                      setAtpErrors({ ...atpErrors, status: undefined });
                    }}
                    className={`border rounded w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${atpErrors.status ? "border-red-500" : "border-gray-300"}`}
                  >
                    <option value="aktif">Aktif</option>
                    <option value="arsip">Arsip</option>
                  </select>
                  {atpErrors.status && <p className="text-red-500 text-xs mt-1">{atpErrors.status[0]}</p>}

                  {/* Peringatan perubahan status */}
                  {atpForm.status !== initialAtpStatus && (
                    <div className={`mt-2 border rounded p-2 text-xs ${atpForm.status === "arsip" ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-blue-50 border-blue-200 text-blue-700"}`}>
                      ⚠️ Status akan diubah menjadi <strong>{atpForm.status}</strong>.{atpForm.status === "arsip" && " ATP yang diarsipkan dapat diaktifkan kembali."}
                    </div>
                  )}
                </div>
              )}

              {/* Info create */}
              {dialogMode === "create" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-800">
                  Status otomatis menjadi <strong>Aktif</strong> setelah disimpan.
                </div>
              )}
            </div>

            {/* Footer tombol */}
            <div className="flex gap-2 pt-2">
              <Button className="bg-primary gap-2 flex-1" disabled={atpLoading} onClick={dialogMode === "create" ? handleCreateAtp : handleEditAtp}>
                {atpLoading ? (
                  <>
                    <Loader2Icon size={14} className="animate-spin" /> Menyimpan...
                  </>
                ) : dialogMode === "create" ? (
                  <>
                    <PlusIcon size={14} /> Simpan ATP
                  </>
                ) : (
                  <>
                    <PenBoxIcon size={14} /> Simpan Perubahan
                  </>
                )}
              </Button>
              <Button className="gap-2 bg-muted-foreground hover:bg-muted-foreground/90" onClick={closeDialog} disabled={atpLoading}>
                <XIcon size={14} /> Batal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </SidebarProvider>
  );
};

export default DetailKompetensi;