import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Eye,
  Loader2,
  GraduationCap,
  Trophy,
  BookOpen,
  ClipboardList,
  Users,
  ExternalLink,
  KeyRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { KepegawaianDetail } from "@/types/kepegawaian";
import api from "@/api/axios";

interface DialogDetailKepegawaianProps {
  kepegawaianId: number;
}

export function DialogDetailKepegawaian({ kepegawaianId }: DialogDetailKepegawaianProps) {
  const [detail, setDetail] = useState<KepegawaianDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && !detail) {
      fetchDetail();
    }
  }, [open]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/spa/kepegawaian/${kepegawaianId}`);
      if (res.data.status === "success") {
        setDetail(res.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil detail:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hanya guru yang punya link wali rombel, jadwal pelajaran, absensi guru-pelajaran
  const isGuru = detail?.role === "guru";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Detail Kepegawaian
          </DialogTitle>
          <DialogDescription>
            Informasi data kepegawaian dan tautan ke histori terkait.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin mb-3 text-primary" size={32} />
            <p className="text-sm text-gray-500">Memuat data...</p>
          </div>
        ) : detail ? (
          <div className="space-y-5 py-2">

            {/* ── Info Dasar ── */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Informasi Pribadi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow label="Nama Lengkap" value={detail.nama} />
                <Separator />
                <InfoRow label="NIP" value={detail.nip} />
                <Separator />
                <InfoRow label="NUPTK" value={detail.nuptk} />
                <Separator />
                <InfoRow label="Email" value={detail.email} />
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Role</span>
                  <Badge variant="outline" className="capitalize">
                    {detail.role?.replace("_", " ") ?? "-"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Status</span>
                  <Badge
                    className={
                      detail.status === "aktif"
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-red-100 text-red-700 border-red-300"
                    }
                  >
                    {detail.status}
                  </Badge>
                </div>
                <Separator />
                <InfoRow label="Keterangan" value={detail.keterangan} />
              </CardContent>
            </Card>

            {/* ── Link Histori ── */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lihat Histori</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">

                {/* ── Semua role: Absensi Pegawai, Pembina, Pelatih ── */}
                <LinkButton
                  to={`/superadmin/informasi-laporan-umum/absensi-pegawai?kepegawaian_id=${kepegawaianId}`}
                  icon={<ClipboardList size={15} />}
                  label="Histori Absensi Pegawai"
                  onClick={() => setOpen(false)}
                />
                <LinkButton
                  to={`/superadmin/informasi-akademik/pembina-ekskul/histori/${kepegawaianId}`}
                  icon={<Trophy size={15} />}
                  label="Histori Membina Ekstrakurikuler"
                  onClick={() => setOpen(false)}
                />
                <LinkButton
                  to={`/superadmin/informasi-akademik/pelatih-ekskul/histori/${kepegawaianId}`}
                  icon={<Trophy size={15} />}
                  label="Histori Melatih Ekstrakurikuler"
                  onClick={() => setOpen(false)}
                />

                {/* ── Khusus Guru ── */}
                {isGuru && (
                  <>
                    <Separator />
                    <p className="text-xs text-gray-400 pt-1">Khusus Guru</p>
                    <LinkButton
                      to={`/superadmin/informasi-sekolah/wali-rombel?kepegawaian_id=${kepegawaianId}`}
                      icon={<Users size={15} />}
                      label="Histori Menjadi Wali Rombel"
                      onClick={() => setOpen(false)}
                    />
                    <LinkButton
                      to={`/superadmin/informasi-akademik/jadwal-pelajaran-guru?kepegawaian_id=${kepegawaianId}`}
                      icon={<BookOpen size={15} />}
                      label="Histori Jadwal Pelajaran"
                      onClick={() => setOpen(false)}
                    />
                    <LinkButton
                      to={`/superadmin/informasi-laporan-umum/absensi-pelajaran?kepegawaian_id=${kepegawaianId}`}
                      icon={<ClipboardList size={15} />}
                      label="Histori Absensi Guru - Pelajaran"
                      onClick={() => setOpen(false)}
                    />
                  </>
                )}

              </CardContent>
            </Card>
            {/* ── Ubah Password ── */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Keamanan Akun</CardTitle>
              </CardHeader>
              <CardContent>
                <LinkButton
                  to={`/superadmin/informasi-sekolah/kepegawaian/ubah-password/${kepegawaianId}`}
                  icon={<KeyRound size={15} />}
                  label="Ubah Password"
                  onClick={() => setOpen(false)}
                />
              </CardContent>
            </Card>

          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">Data tidak ditemukan</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Helper Components ─────────────────────────────────────────────────────────

const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex justify-between items-center">
    <span className="font-semibold text-gray-700">{label}</span>
    <span className="text-gray-900 text-right max-w-[60%]">{value ?? "-"}</span>
  </div>
);

const LinkButton = ({
  to,
  icon,
  label,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) => (
  <Link to={to} onClick={onClick}>
    <Button
      variant="outline"
      className="w-full justify-between text-sm font-normal hover:bg-indigo-50 hover:border-indigo-300"
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <ExternalLink size={14} className="text-gray-400" />
    </Button>
  </Link>
);