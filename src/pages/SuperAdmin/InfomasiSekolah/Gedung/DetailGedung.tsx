import { useEffect, useState } from "react";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Layers, Ruler, Calendar, AlertCircle, Info, DoorOpen, PlusIcon, PenBoxIcon, Trash2Icon, Loader2Icon, ArrowLeftIcon, Eye } from "lucide-react";
import Footer from "@/pages/Footer";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import Swal from "sweetalert2";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RuanganItem {
  id: number;
  nama_ruangan: string;
  kode_ruangan: string;
  jenis_ruangan: string | null;
  lantai: number | null;
  status_ruangan: string;
}

interface GedungDetail {
  id: number;
  foto_gedung: string | null;
  nama_gedung: string;
  kode_gedung: string;
  jumlah_lantai: number | null;
  luas_bangunan: string | null;
  tahun_dibangun: string | null;
  kondisi: string | null;
  lokasi: string | null;
  keterangan: string | null;
  status_gedung: string;
  ruangan: RuanganItem[];
}

interface RuanganDetail {
  id: number;
  nama_gedung: string;
  kode_ruangan: string;
  nama_ruangan: string;
  jenis_ruangan: string | null;
  lantai: number | null;
  kapasitas: number | null;
  luas_ruangan: string | null;
  kondisi: string | null;
  fasilitas: string | null;
  keterangan: string | null;
  status: string;
}

interface RuanganFormData {
  kode_ruangan: string;
  nama_ruangan: string;
  jenis_ruangan: string;
  lantai: string;
  kapasitas: string;
  luas_ruangan: string;
  kondisi: string;
  fasilitas: string;
  keterangan: string;
  status: string;
}

interface FormErrors {
  kode_ruangan?: string[];
  nama_ruangan?: string[];
  jenis_ruangan?: string[];
  lantai?: string[];
  kapasitas?: string[];
  luas_ruangan?: string[];
  kondisi?: string[];
  fasilitas?: string[];
  keterangan?: string[];
  status?: string[];
}

const emptyForm: RuanganFormData = {
  kode_ruangan: "",
  nama_ruangan: "",
  jenis_ruangan: "",
  lantai: "",
  kapasitas: "",
  luas_ruangan: "",
  kondisi: "",
  fasilitas: "",
  keterangan: "",
  status: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

const DetailGedung = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Data
  const [gedung, setGedung] = useState<GedungDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Dialog Detail Ruangan
  const [detailRuangan, setDetailRuangan] = useState<RuanganDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  // Dialog Create / Edit Ruangan
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState<RuanganFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch detail gedung ────────────────────────────────────────────────────
  const fetchGedung = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/spa/gedung/${id}`);
      if (res.data.status === "success") {
        setGedung(res.data.data);
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat data!",
        text: err.response?.data?.message || "Tidak dapat memuat data gedung.",
      });
      navigate("/superadmin/informasi-sekolah/gedung");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchGedung();
  }, [id]);

  // ── Helper badges ──────────────────────────────────────────────────────────
  const getStatusBadge = (status: string) => {
    const color = status === "aktif" ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-600 border-gray-300";
    return (
      <Badge variant="outline" className={color}>
        {status}
      </Badge>
    );
  };

  const getKondisiColor = (kondisi: string | null) => {
    if (kondisi === "Baik") return "bg-green-100 text-green-700 border-green-300";
    if (kondisi === "Rusak Ringan") return "bg-yellow-100 text-yellow-700 border-yellow-300";
    if (kondisi === "Rusak Berat") return "bg-red-100 text-red-700 border-red-300";
    return "bg-blue-100 text-blue-600 border-blue-300";
  };

  // ── Detail Ruangan ─────────────────────────────────────────────────────────
  const handleDetailRuangan = async (ruanganId: number) => {
    setLoadingDetail(true);
    setShowDetail(true);
    try {
      const res = await api.get(`/spa/ruangan/${ruanganId}`);
      if (res.data.status === "success") {
        setDetailRuangan(res.data.data);
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat detail ruangan!",
        text: err.response?.data?.message || "Terjadi kesalahan.",
      });
      setShowDetail(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ── Create Ruangan ─────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditId(null);
    setFormData(emptyForm);
    setFormErrors({});
    setShowForm(true);
  };

  // ── Edit Ruangan ───────────────────────────────────────────────────────────
  const handleOpenEdit = async (ruanganId: number) => {
    setFormErrors({});
    setSubmitting(false);
    setShowForm(true);
    setEditId(ruanganId);
    try {
      const res = await api.get(`/spa/ruangan/${ruanganId}`);
      if (res.data.status === "success") {
        const d = res.data.data as RuanganDetail;
        setFormData({
          kode_ruangan: d.kode_ruangan ?? "",
          nama_ruangan: d.nama_ruangan ?? "",
          jenis_ruangan: d.jenis_ruangan ?? "",
          lantai: d.lantai?.toString() ?? "",
          kapasitas: d.kapasitas?.toString() ?? "",
          luas_ruangan: d.luas_ruangan ?? "",
          kondisi: d.kondisi ?? "",
          fasilitas: d.fasilitas ?? "",
          keterangan: d.keterangan ?? "",
          status: d.status ?? "",
        });
      }
    } catch {
      Swal.fire({ icon: "error", title: "Gagal memuat data ruangan!" });
      setShowForm(false);
    }
  };

  // ── Submit Create / Edit ───────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    try {
      const payload = {
        gedung_id: id,
        kode_ruangan: formData.kode_ruangan,
        nama_ruangan: formData.nama_ruangan,
        jenis_ruangan: formData.jenis_ruangan || null,
        lantai: formData.lantai || null,
        kapasitas: formData.kapasitas || null,
        luas_ruangan: formData.luas_ruangan || null,
        kondisi: formData.kondisi || null,
        fasilitas: formData.fasilitas || null,
        keterangan: formData.keterangan || null,
        ...(editId ? { status: formData.status || null } : {}),
      };

      let res;
      if (editId) {
        res = await api.put(`/spa/ruangan/${editId}`, payload);
      } else {
        res = await api.post("/spa/ruangan", payload);
      }

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: editId ? "Data ruangan berhasil diperbarui." : "Ruangan berhasil ditambahkan.",
          showConfirmButton: false,
          timer: 1500,
        });
        setShowForm(false);
        fetchGedung(); // refresh list ruangan
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        setFormErrors(err.response.data.errors || {});
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: err.response?.data?.message || "Terjadi kesalahan.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete Ruangan ─────────────────────────────────────────────────────────
  const handleDelete = async (ruanganId: number, namaRuangan: string) => {
    const result = await Swal.fire({
      title: `Hapus "${namaRuangan}"?`,
      text: "Data ruangan yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await api.delete(`/spa/ruangan/${ruanganId}`);
      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data ruangan berhasil dihapus.",
          showConfirmButton: false,
          timer: 1500,
        });
        fetchGedung();
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal menghapus!",
        text: err.response?.data?.message || "Terjadi kesalahan.",
      });
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Detail Gedung" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link to="/superadmin/informasi-sekolah/gedung">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <ArrowLeftIcon size={16} />
                Kembali
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Detail Gedung</h1>
          </div>

          {/* ── Loading ── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : gedung ? (
            <div className="space-y-6">
              {/* ── Info Gedung ── */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Foto */}
                <div className="md:col-span-1">
                  <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 shadow-lg bg-gray-50">
                    <img
                      src={
                        gedung.foto_gedung ||
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="20"%3ENo Image%3C/text%3E%3C/svg%3E'
                      }
                      alt={gedung.nama_gedung}
                      className="w-full aspect-square object-cover"
                      onError={(e) => {
                        const t = e.currentTarget;
                        t.onerror = null;
                        t.src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="20"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                </div>

                {/* Info Cards */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Building2 className="w-4 h-4" /> Kode Gedung
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-gray-900">{gedung.kode_gedung}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Layers className="w-4 h-4" /> Jumlah Lantai
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-gray-900">{gedung.jumlah_lantai ?? "-"} Lantai</p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Ruler className="w-4 h-4" /> Luas Bangunan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-gray-900">{gedung.luas_bangunan ?? "-"}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Tahun Dibangun
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-gray-900">{gedung.tahun_dibangun ?? "-"}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Info Lengkap */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" /> Informasi Gedung
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Nama Gedung</p>
                      <p className="text-lg font-semibold text-gray-900">{gedung.nama_gedung}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Kondisi</p>
                      {gedung.kondisi ? (
                        <Badge className={`${getKondisiColor(gedung.kondisi)} border`}>
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {gedung.kondisi}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Status Gedung</p>
                      {getStatusBadge(gedung.status_gedung)}
                    </div>
                  </div>

                  {gedung.lokasi && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Lokasi</p>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{gedung.lokasi}</p>
                      </div>
                    </div>
                  )}

                  {gedung.keterangan && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Keterangan</p>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{gedung.keterangan}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ── Daftar Ruangan ── */}
              <Card className="border-2 border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DoorOpen className="w-5 h-5 text-blue-600" />
                      Daftar Ruangan ({gedung.ruangan.length})
                    </CardTitle>
                    <Button className="bg-primary flex items-center gap-2" size="sm" onClick={handleOpenCreate}>
                      <PlusIcon size={16} />
                      Tambah Ruangan
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  {gedung.ruangan.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                      <DoorOpen className="w-12 h-12 mb-3 opacity-40" />
                      <p className="text-base italic">Belum ada ruangan pada gedung ini.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded">
                      <table className="min-w-full border border-gray-200 rounded shadow-sm bg-white text-sm">
                        <thead className="bg-primary">
                          <tr>
                            <th className="text-center font-semibold text-white px-4 py-3">No</th>
                            <th className="font-semibold text-white px-4 py-3 text-center">Kode</th>
                            <th className="font-semibold text-white px-4 py-3">Nama Ruangan</th>
                            <th className="font-semibold text-white px-4 py-3">Jenis</th>
                            <th className="font-semibold text-white px-4 py-3 text-center">Lantai</th>
                            <th className="font-semibold text-white px-4 py-3 text-center">Status</th>
                            <th className="font-semibold text-white px-4 py-3 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gedung.ruangan.map((r, idx) => (
                            <tr key={r.id} className="hover:bg-indigo-50 even:bg-gray-50 border-b border-gray-100">
                              <td className="text-center px-4 py-3 font-medium">{idx + 1}</td>
                              <td className="text-center px-4 py-3">{r.kode_ruangan}</td>
                              <td className="px-4 py-3 font-medium">{r.nama_ruangan}</td>
                              <td className="px-4 py-3">{r.jenis_ruangan ?? "-"}</td>
                              <td className="text-center px-4 py-3">{r.lantai ?? "-"}</td>
                              <td className="text-center px-4 py-3">{getStatusBadge(r.status_ruangan)}</td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1 justify-center">
                                  {/* Detail */}
                                  <Button variant="outline" size="sm" onClick={() => handleDetailRuangan(r.id)}>
                                    <Eye size={15} />
                                  </Button>
                                  {/* Edit */}
                                  <Button className="bg-primary" size="sm" onClick={() => handleOpenEdit(r.id)}>
                                    <PenBoxIcon size={15} />
                                  </Button>
                                  {/* Delete */}
                                  <Button className="bg-muted-foreground hover:bg-muted-foreground/90" size="sm" onClick={() => handleDelete(r.id, r.nama_ruangan)}>
                                    <Trash2Icon size={15} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Building2 className="w-16 h-16 mb-4 opacity-40" />
              <p className="text-lg italic">Data gedung tidak ditemukan.</p>
            </div>
          )}
        </div>

        <Footer />
      </main>

      {/* ══════════════════════════════════════════════════════════════════════
          Dialog Detail Ruangan
      ══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DoorOpen className="w-5 h-5 text-blue-600" />
              Detail Ruangan
            </DialogTitle>
            <DialogDescription>Informasi lengkap ruangan.</DialogDescription>
          </DialogHeader>

          {loadingDetail ? (
            <div className="flex justify-center items-center py-12 text-muted-foreground">
              <Loader2Icon className="animate-spin mr-2 w-5 h-5" />
              <span>Memuat data...</span>
            </div>
          ) : detailRuangan ? (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Nama Gedung" value={detailRuangan.nama_gedung} />
                <InfoRow label="Kode Ruangan" value={detailRuangan.kode_ruangan} />
                <InfoRow label="Nama Ruangan" value={detailRuangan.nama_ruangan} />
                <InfoRow label="Jenis Ruangan" value={detailRuangan.jenis_ruangan} />
                <InfoRow label="Lantai" value={detailRuangan.lantai?.toString()} />
                <InfoRow label="Kapasitas" value={detailRuangan.kapasitas?.toString()} />
                <InfoRow label="Luas Ruangan" value={detailRuangan.luas_ruangan} />
                <InfoRow label="Kondisi" value={detailRuangan.kondisi} />
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                  <Badge variant="outline" className={detailRuangan.status === "aktif" ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-600 border-gray-300"}>
                    {detailRuangan.status}
                  </Badge>
                </div>
              </div>

              {detailRuangan.fasilitas && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Fasilitas</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-gray-700 text-sm">{detailRuangan.fasilitas}</p>
                  </div>
                </div>
              )}

              {detailRuangan.keterangan && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Keterangan</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{detailRuangan.keterangan}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8 italic">Data tidak tersedia.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════
          Dialog Create / Edit Ruangan
      ══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DoorOpen className="w-5 h-5 text-blue-600" />
              {editId ? "Edit Ruangan" : "Tambah Ruangan"}
            </DialogTitle>
            <DialogDescription>{editId ? "Perbarui data ruangan." : "Isi data ruangan baru."}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kode Ruangan */}
              <div>
                <label className="block font-semibold text-sm mb-1">
                  Kode Ruangan <span className="text-red-500">*</span>
                </label>
                <input type="text" placeholder="cth: RG_01" value={formData.kode_ruangan} onChange={(e) => setFormData({ ...formData, kode_ruangan: e.target.value })} className="border p-2 w-full rounded text-sm" />
                {formErrors.kode_ruangan && <p className="text-red-500 text-xs mt-1">{formErrors.kode_ruangan[0]}</p>}
              </div>

              {/* Nama Ruangan */}
              <div>
                <label className="block font-semibold text-sm mb-1">
                  Nama Ruangan <span className="text-red-500">*</span>
                </label>
                <input type="text" placeholder="cth: Lab Fisika" value={formData.nama_ruangan} onChange={(e) => setFormData({ ...formData, nama_ruangan: e.target.value })} className="border p-2 w-full rounded text-sm" />
                {formErrors.nama_ruangan && <p className="text-red-500 text-xs mt-1">{formErrors.nama_ruangan[0]}</p>}
              </div>

              {/* Jenis Ruangan */}
              <div>
                <label className="block font-semibold text-sm mb-1">Jenis Ruangan</label>
                <input type="text" placeholder="cth: Laboratorium" value={formData.jenis_ruangan} onChange={(e) => setFormData({ ...formData, jenis_ruangan: e.target.value })} className="border p-2 w-full rounded text-sm" />
              </div>

              {/* Lantai */}
              <div>
                <label className="block font-semibold text-sm mb-1">Lantai</label>
                <input type="number" placeholder="cth: 2" value={formData.lantai} onChange={(e) => setFormData({ ...formData, lantai: e.target.value })} className="border p-2 w-full rounded text-sm" />
                {formErrors.lantai && <p className="text-red-500 text-xs mt-1">{formErrors.lantai[0]}</p>}
              </div>

              {/* Kapasitas */}
              <div>
                <label className="block font-semibold text-sm mb-1">Kapasitas</label>
                <input type="number" placeholder="cth: 30" value={formData.kapasitas} onChange={(e) => setFormData({ ...formData, kapasitas: e.target.value })} className="border p-2 w-full rounded text-sm" />
              </div>

              {/* Luas Ruangan */}
              <div>
                <label className="block font-semibold text-sm mb-1">Luas Ruangan</label>
                <input type="text" placeholder="cth: 72 m²" value={formData.luas_ruangan} onChange={(e) => setFormData({ ...formData, luas_ruangan: e.target.value })} className="border p-2 w-full rounded text-sm" />
              </div>

              {/* Kondisi */}
              <div>
                <label className="block font-semibold text-sm mb-1">Kondisi</label>
                <Select value={formData.kondisi} onValueChange={(v) => setFormData({ ...formData, kondisi: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- pilih kondisi --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Kondisi</SelectLabel>
                      <SelectItem value="Baik">Baik</SelectItem>
                      <SelectItem value="Rusak Ringan">Rusak Ringan</SelectItem>
                      <SelectItem value="Rusak Berat">Rusak Berat</SelectItem>
                      <SelectItem value="Dalam Perbaikan">Dalam Perbaikan</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Status — hanya saat edit */}
              {editId && (
                <div>
                  <label className="block font-semibold text-sm mb-1">Status</label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- pilih status --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Status</SelectLabel>
                        <SelectItem value="aktif">Aktif</SelectItem>
                        <SelectItem value="arsip">Arsip</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {formErrors.status && <p className="text-red-500 text-xs mt-1">{formErrors.status[0]}</p>}
                </div>
              )}
            </div>

            {/* Fasilitas */}
            <div>
              <label className="block font-semibold text-sm mb-1">Fasilitas</label>
              <textarea placeholder="cth: AC, Proyektor, Papan Tulis" value={formData.fasilitas} onChange={(e) => setFormData({ ...formData, fasilitas: e.target.value })} className="border p-2 w-full rounded text-sm h-20 resize-none" />
            </div>

            {/* Keterangan */}
            <div>
              <label className="block font-semibold text-sm mb-1">Keterangan</label>
              <textarea placeholder="Keterangan tambahan..." value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} className="border p-2 w-full rounded text-sm h-20 resize-none" />
            </div>

            {/* Tombol */}
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={submitting} className="bg-primary">
                {submitting ? (
                  <>
                    <Loader2Icon className="animate-spin mr-2" size={16} />
                    Menyimpan...
                  </>
                ) : editId ? (
                  "Simpan Perubahan"
                ) : (
                  "Tambah Ruangan"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={submitting}>
                Batal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

// ─── Helper kecil ──────────────────────────────────────────────────────────────
const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
    <p className="text-gray-900 font-semibold">{value ?? "-"}</p>
  </div>
);

export default DetailGedung;
