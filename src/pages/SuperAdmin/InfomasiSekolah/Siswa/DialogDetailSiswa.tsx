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
  UserIcon,
  Trophy,
  BookOpen,
  ClipboardList,
  ExternalLink,
  KeyRound,
  GraduationCap,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/api/axios";

interface SiswaDetail {
  siswa_id: number;
  nama: string;
  nisn: string | null;
  nis: string | null;
  email: string | null;
  status: string | null;
  jurusan: string | null;
}

interface DialogDetailSiswaProps {
  siswaId: number;
}

export function DialogDetailSiswa({ siswaId }: DialogDetailSiswaProps) {
  const [detail, setDetail] = useState<SiswaDetail | null>(null);
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
      const res = await api.get(`/spa/siswa/${siswaId}`);
      if (res.data.status === "success") {
        setDetail(res.data.data);
      }
    } catch (err) {
      console.error("Gagal mengambil detail siswa:", err);
    } finally {
      setLoading(false);
    }
  };

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
            <UserIcon className="w-5 h-5" />
            Detail Siswa
          </DialogTitle>
          <DialogDescription>Informasi data siswa dan tautan ke histori terkait.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin mb-3 text-primary" size={32} />
            <p className="text-sm text-gray-500">Memuat data...</p>
          </div>
        ) : detail ? (
          <div className="space-y-5 py-2">
            {/* ── Informasi Pribadi ── */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Informasi Pribadi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow label="Nama Lengkap" value={detail.nama} />
                <Separator />
                <InfoRow label="NISN" value={detail.nisn} />
                <Separator />
                <InfoRow label="NIS" value={detail.nis} />
                <Separator />
                <InfoRow label="Email" value={detail.email} />
                <Separator />
                <InfoRow label="Jurusan" value={detail.jurusan} />
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Status</span>
                  <Badge className={detail.status === "aktif" ? "bg-green-100 text-green-700 border-green-300" : "bg-red-100 text-red-700 border-red-300"}>{detail.status ?? "-"}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* ── Link Histori ── */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lihat Histori</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {/* Semua siswa */}
                <LinkButton to={`/superadmin/informasi-sekolah/siswa/histori/rombel/${siswaId}`} icon={<GraduationCap size={15} />} label="Histori Rombel" onClick={() => setOpen(false)} />
                <LinkButton to={`/superadmin/informasi-sekolah/siswa/histori/jadwal-pelajaran/${siswaId}`} icon={<BookOpen size={15} />} label="Histori Jadwal Pelajaran" onClick={() => setOpen(false)} />
                <LinkButton to={`/superadmin/informasi-sekolah/siswa/histori/absensi-pelajaran/${siswaId}`} icon={<ClipboardList size={15} />} label="Histori Absensi Siswa - Pelajaran" onClick={() => setOpen(false)} />
                <LinkButton to={`/superadmin/informasi-sekolah/siswa/histori/ekstrakurikuler/${siswaId}`} icon={<Trophy size={15} />} label="Histori Ekstrakurikuler" onClick={() => setOpen(false)} />
                <LinkButton to={`/superadmin/informasi-sekolah/siswa/histori/prestasi/${siswaId}`} icon={<Star size={15} />} label="Histori Prestasi" onClick={() => setOpen(false)} />
                {/* <LinkButton
                  to={`/superadmin/informasi-akademik/nilai-siswa/${siswaId}`}
                  icon={<Users size={15} />}
                  label="Cetak Data Nilai Siswa"
                  onClick={() => setOpen(false)}
                /> */}
              </CardContent>
            </Card>

            {/* ── Keamanan Akun ── */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Keamanan Akun</CardTitle>
              </CardHeader>
              <CardContent>
                <LinkButton to={`/superadmin/informasi-akademik/siswa/ubah-password/${siswaId}`} icon={<KeyRound size={15} />} label="Ubah Password" onClick={() => setOpen(false)} />
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

// ─── Helper Components ──────────────────────────────────────────────────────

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