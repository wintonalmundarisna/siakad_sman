import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth pages
import LoginKepegawaian from "@/pages/Auth/LoginKepegawaian";
import LoginSiswa from "../pages/Auth/LoginSiswa";
import RegisterKepegawaian from "../pages/Auth/RegisterKepegawaian";
import RegisterSiswa from "../pages/Auth/RegisterSiswa";

// Shared
import { NotFound } from "@/pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";

// Dashboard pages
import { DashboardSuperAdmin } from "@/pages/SuperAdmin/DashboardSuperAdmin";

// Super Admin pages
import DataKelas from "../pages/SuperAdmin/informasiAkademik/Kelas";
import CreateKelas from "@/pages/SuperAdmin/informasiAkademik/Kelas/CreateKelas";
import EditKelas from "@/pages/SuperAdmin/informasiAkademik/Kelas/EditKelas";
import DataJurusan from "@/pages/SuperAdmin/InfomasiSekolah/Jurusan";
import CreateJurusan from "@/pages/SuperAdmin/InfomasiSekolah/Jurusan/CreateJurusan";
import EditJurusan from "@/pages/SuperAdmin/InfomasiSekolah/Jurusan/EditJurusan";
import DataSiswa from "@/pages/SuperAdmin/InfomasiSekolah/Siswa";
import EditSiswa from "@/pages/SuperAdmin/InfomasiSekolah/Siswa/EditSiswa";
// import UserSiswa from "@/pages/SuperAdmin/ManajemenUser/Siswa";
// import EditUserSiswa from "@/pages/SuperAdmin/ManajemenUser/Siswa/EditUserSiswa";
// import UserGuru from "@/pages/SuperAdmin/ManajemenUser/Guru";
// import EditUserGuru from "@/pages/SuperAdmin/ManajemenUser/Guru/EditUserGuru";
// import UserKepsek from "@/pages/SuperAdmin/ManajemenUser/Kepsek";
// import EditUserKepsek from "@/pages/SuperAdmin/ManajemenUser/Kepsek/EditUserKepsek";
// import UserTu from "@/pages/SuperAdmin/ManajemenUser/Tu";
// import EditUserTu from "@/pages/SuperAdmin/ManajemenUser/Tu/EditUserTu";
// import UserStaff from "@/pages/SuperAdmin/ManajemenUser/Staff";
// import EditUserStaff from "@/pages/SuperAdmin/ManajemenUser/Staff/EditUserStaff";
import EditPasswordSuperAdmin from "@/pages/SuperAdmin/SettingsProfile/EditPasswordSuperAdmin";
import DataEkstrakurikuler from "@/pages/SuperAdmin/informasiAkademik/Ekstrakurikuler";
import CreateEkskul from "@/pages/SuperAdmin/informasiAkademik/Ekstrakurikuler/CreateEkskul";
import EditEkskul from "@/pages/SuperAdmin/informasiAkademik/Ekstrakurikuler/EditEkskul";
import ForgotPassword from "@/pages/Auth/ForgotPassword";
import ResetPassword from "@/pages/Auth/ResetPassword";
import EditProfileSuperAdmin from "@/pages/SuperAdmin/SettingsProfile/EditProfileSuperAdmin";
import CreateKepegawaian from "@/pages/SuperAdmin/InfomasiSekolah/Kepegawaian/CreateKepegawaian";
import CreateSiswa from "@/pages/SuperAdmin/InfomasiSekolah/Siswa/CreateSiswa";
import DataMataPelajaran from "@/pages/SuperAdmin/InfomasiSekolah/MataPelajaran";
import CreateMataPelajaran from "@/pages/SuperAdmin/InfomasiSekolah/MataPelajaran/CreateMapel";
import EditMataPelajaran from "@/pages/SuperAdmin/InfomasiSekolah/MataPelajaran/EditMapel";
import EditJadwalPelajaranSiswa from "@/pages/SuperAdmin/informasiAkademik/JadwalPelajaranSiswa/EditJadwalPelajaranSiswa";
import DataJadwalPelajaranSiswa from "@/pages/SuperAdmin/informasiAkademik/JadwalPelajaranSiswa";
import DataKurikulum from "@/pages/SuperAdmin/InfomasiSekolah/Kurikulum";
import CreateKurikulum from "@/pages/SuperAdmin/InfomasiSekolah/Kurikulum/CreateKurikulum";
import EditKurikulum from "@/pages/SuperAdmin/InfomasiSekolah/Kurikulum/EditKurikulum";
import DataGedung from "@/pages/SuperAdmin/InfomasiSekolah/Gedung";
import CreateGedung from "@/pages/SuperAdmin/InfomasiSekolah/Gedung/CreateGedung";
import EditGedung from "@/pages/SuperAdmin/InfomasiSekolah/Gedung/EditGedung";
import DataIdentitasSekolah from "@/pages/SuperAdmin/InfomasiSekolah/IdentitasSekolah";
import CreateIdentitasSekolah from "@/pages/SuperAdmin/InfomasiSekolah/IdentitasSekolah/CreateIdentitasSekolah";
import EditIdentitasSekolah from "@/pages/SuperAdmin/InfomasiSekolah/IdentitasSekolah/EditIdentitasSekolah";
import PublicRoute from "./PublicRoute";
import DataTahunAkademik from "@/pages/SuperAdmin/informasiAkademik/TahunAkademik";
import CreateTahunAkademik from "@/pages/SuperAdmin/informasiAkademik/TahunAkademik/CreateTahunAkademik";
import EditTahunAkademik from "@/pages/SuperAdmin/informasiAkademik/TahunAkademik/EditTahunAkademik";
import DataPrestasiSiswa from "@/pages/SuperAdmin/InformasiLaporanUmum/PrestasiSiswa";
import CreatePrestasiSiswa from "@/pages/SuperAdmin/InformasiLaporanUmum/PrestasiSiswa/CreatePrestasiSiswa";
import EditPrestasiSiswa from "@/pages/SuperAdmin/InformasiLaporanUmum/PrestasiSiswa/EditPrestasiSiswa";
import DataPsb from "@/pages/SuperAdmin/PSB";
import DetailPsb from "@/pages/SuperAdmin/PSB/DetailPsb";
import CreatePsb from "@/pages/SuperAdmin/PSB/CreatePsb";
import EditPsb from "@/pages/SuperAdmin/PSB/EditPsb";
import HomePage from "@/pages/PublicPsb/HomePsbSiswa";
import FormPsbPublic from "@/pages/PublicPsb/FormPsbSiswa";
import PsbSuccess from "@/pages/PublicPsb/PsbSuccess";
import DataAbsensiPegawai from "@/pages/SuperAdmin/InformasiLaporanUmum/DataAbsensi/AbsensiPegawai";
import DataAbsensiPelajaran from "@/pages/SuperAdmin/InformasiLaporanUmum/DataAbsensi/AbsensiPelajaran";
import DataAbsensiSiswa from "@/pages/SuperAdmin/InformasiLaporanUmum/DataAbsensi/AbsensiSiswa";
import DataKeuangan from "@/pages/SuperAdmin/InformasiLaporanUmum/Keuangan";
import CreateKeuangan from "@/pages/SuperAdmin/InformasiLaporanUmum/Keuangan/CreateKeuangan";
import EditKeuangan from "@/pages/SuperAdmin/InformasiLaporanUmum/Keuangan/EditKeuangan";
import DetailKeuangan from "@/pages/SuperAdmin/InformasiLaporanUmum/Keuangan/DetailKeuangan";
import DataKepegawaian from "@/pages/SuperAdmin/InfomasiSekolah/Kepegawaian";
import EditKepegawaian from "@/pages/SuperAdmin/InfomasiSekolah/Kepegawaian/EditKepegawaian";
import CreateSemester from "@/pages/SuperAdmin/informasiAkademik/Semester/CreateSemester";
import EditSemester from "@/pages/SuperAdmin/informasiAkademik/Semester/EditSemester";
import DataKurikulumMataPelajaran from "@/pages/SuperAdmin/informasiAkademik/KurikulumMataPelajaran";
import CreateKurikulumMataPelajaran from "@/pages/SuperAdmin/informasiAkademik/KurikulumMataPelajaran/CreateKurikulumMataPelajaran";
import EditKurikulumMataPelajaran from "@/pages/SuperAdmin/informasiAkademik/KurikulumMataPelajaran/EditKurikulumMataPelajaran";
import AlurTujuanPembelajaran from "@/pages/SuperAdmin/informasiAkademik/AlurTujuanPembelajaran";
import HistoriPrestasiSiswa from "@/pages/SuperAdmin/InformasiLaporanUmum/PrestasiSiswa/HistoriPrestasiSiswa";
import DetailGedung from "@/pages/SuperAdmin/InfomasiSekolah/Gedung/DetailGedung";
import UbahPasswordKepegawaian from "@/pages/SuperAdmin/InfomasiSekolah/Kepegawaian/UbahPasswordKepegawaian";
import UbahPasswordSiswa from "@/pages/SuperAdmin/InfomasiSekolah/Siswa/UbahPasswordSiswa";
import DetailKelas from "@/pages/SuperAdmin/informasiAkademik/Kelas/DetailKelas";
import DetailTahunAktifRombelKelas from "@/pages/SuperAdmin/informasiAkademik/Kelas/DetailtahunaktifrombelKelas";
import CreateRombel from "@/pages/SuperAdmin/informasiAkademik/Kelas/Rombel/CreateRombel";
import EditRombel from "@/pages/SuperAdmin/informasiAkademik/Kelas/Rombel/EditRombel";
import CreateWaliRombel from "@/pages/SuperAdmin/informasiAkademik/Kelas/WaliRombel/CreateWaliRombel";
import EditWaliRombel from "@/pages/SuperAdmin/informasiAkademik/Kelas/WaliRombel/EditWaliRombel";
import CreateSiswaRombel from "@/pages/SuperAdmin/informasiAkademik/Kelas/SiswaRombel/CreateSiswaRombel";
import EditSiswaRombel from "@/pages/SuperAdmin/informasiAkademik/Kelas/SiswaRombel/EditSiswaRombel";
import CreateJadwalPelajaranGuruSpa from "@/pages/SuperAdmin/informasiAkademik/Kelas/JadwalPelajaranGuruSpa/CreateJadwalPelajaranGuruSpa";
import EditJadwalPelajaranGuruSpa from "@/pages/SuperAdmin/informasiAkademik/Kelas/JadwalPelajaranGuruSpa/EditJadwalPelajaranGuruSpa";
import DetailTahunAktifRombelJurusan from "@/pages/SuperAdmin/InfomasiSekolah/Jurusan/DetailTahunAktifRombelJurusan";
import EditKompetensi from "@/pages/SuperAdmin/informasiAkademik/KompetensiDasar/EditKompetensiDasar";
import CreateKompetensi from "@/pages/SuperAdmin/informasiAkademik/KompetensiDasar/CreateKompetensiDasar";
import DetailKompetensi from "@/pages/SuperAdmin/informasiAkademik/KompetensiDasar/DetailKompetensi";
import DataKompetensi from "@/pages/SuperAdmin/informasiAkademik/KompetensiDasar";
import DataJadwalPelajaranGuruSpa from "@/pages/SuperAdmin/informasiAkademik/JadwalPelajaranGuruSpa";
import DetailEkstrakurikuler from "@/pages/SuperAdmin/informasiAkademik/Ekstrakurikuler/DetailEkstrakurikuler";
import HistoriAbsensiPegawai from "@/pages/SuperAdmin/InfomasiSekolah/Kepegawaian/HistoriAbsensiPegawai";
import HistoriPembinaEkskul from "@/pages/SuperAdmin/InfomasiSekolah/Kepegawaian/HistoriPembinaEkskul";
import HistoriPelatihEkskul from "@/pages/SuperAdmin/InfomasiSekolah/Kepegawaian/HistoriPelatihEkskul";
import HistoriWaliRombel from "@/pages/SuperAdmin/InfomasiSekolah/Kepegawaian/HistoriWaliRombel";
import HistoriJadwalPelajaran from "@/pages/SuperAdmin/InfomasiSekolah/Kepegawaian/HistoriJadwalPelajaran";
import HistoriAbsensiPelajaran from "@/pages/SuperAdmin/InfomasiSekolah/Kepegawaian/HistoriAbsensiPelajaran";
import HistoriRombelSiswa from "@/pages/SuperAdmin/InfomasiSekolah/Siswa/Historirombelsiswa";
import HistoriJadwalSiswa from "@/pages/SuperAdmin/InfomasiSekolah/Siswa/Historijadwalsiswa";
import HistoriAbsensiSiswa from "@/pages/SuperAdmin/InfomasiSekolah/Siswa/Historiabsensisiswa";
import HistoriEkskulSiswa from "@/pages/SuperAdmin/InfomasiSekolah/Siswa/Historiekskulsiswa";
import HistoriPrestasiSiswaReadOnly from "@/pages/SuperAdmin/InfomasiSekolah/Siswa/Historiprestasisiswa";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login-kepegawaian" replace />} />
        {/* ================= AUTH ================= */}
        <Route
          path="/login-kepegawaian"
          element={
            <PublicRoute>
              <LoginKepegawaian />
            </PublicRoute>
          }
        />
        <Route
          path="/login-siswa"
          element={
            <PublicRoute>
              <LoginSiswa />
            </PublicRoute>
          }
        />
        <Route
          path="/register-kepegawaian"
          element={
            <PublicRoute>
              <RegisterKepegawaian />
            </PublicRoute>
          }
        />
        <Route
          path="/register-siswa"
          element={
            <PublicRoute>
              <RegisterSiswa />
            </PublicRoute>
          }
        />
        {/* ================= AUTH LUPA PASSWORD Pegawai ================= */}
        <Route
          path="/lupa-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
        {/* ================= DASHBOARD PER ROLE ================= */}
        <Route
          path="/superadmin/dashboard"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DashboardSuperAdmin />
            </ProtectedRoute>
          }
        />
        {/* ================= DATA DASHBOARD SUPER ADMIN ================= */}
        {/* Setting user super admin */}
        <Route
          path="/superadmin/settings-profile/ubah-password"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditPasswordSuperAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/settings-profile/ubah-profile"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditProfileSuperAdmin />
            </ProtectedRoute>
          }
        />
        {/* USER MANAJEMEN */}
        {/* Data User Siswa */}
        {/* <Route
          path="/superadmin/manajemen-user/siswa"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <UserSiswa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/manajemen-user/siswa/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditUserSiswa />
            </ProtectedRoute>
          }
        /> */}
        {/* Data User Guru */}
        {/* <Route
          path="/superadmin/manajemen-user/guru"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <UserGuru />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/manajemen-user/guru/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditUserGuru />
            </ProtectedRoute>
          }
        /> */}
        {/* Data User Kepsek */}
        {/* <Route
          path="/superadmin/manajemen-user/kepsek"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <UserKepsek />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/manajemen-user/kepsek/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditUserKepsek />
            </ProtectedRoute>
          }
        /> */}
        {/* Data User Tu */}
        {/* <Route
          path="/superadmin/manajemen-user/tu"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <UserTu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/manajemen-user/tu/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditUserTu />
            </ProtectedRoute>
          }
        /> */}
        {/* Data User Staff */}
        {/* <Route
          path="/superadmin/manajemen-user/staff"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <UserStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/manajemen-user/staff/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditUserStaff />
            </ProtectedRoute>
          }
        /> */}
        {/* Data User Ortu */}
        {/* INFORMASI SEKOLAH */}
        {/* Data Kepegawaian */}
        <Route
          path="/superadmin/informasi-sekolah/kepegawaian"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataKepegawaian />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/kepegawaian/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateKepegawaian />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/kepegawaian/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditKepegawaian />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/kepegawaian/ubah-password/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <UbahPasswordKepegawaian />
            </ProtectedRoute>
          }
        />
        {/* HISTORI */}
        <Route
          path="/superadmin/informasi-sekolah/kepegawaian/absensi-pegawai/histori/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <HistoriAbsensiPegawai />{" "}
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/kepegawaian/pembina-ekskul/histori/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <HistoriPembinaEkskul />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/kepegawaian/pelatih-ekskul/histori/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <HistoriPelatihEkskul />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/kepegawaian/wali-rombel/histori/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <HistoriWaliRombel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/kepegawaian/jadwal-pelajaran-guru/histori/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <HistoriJadwalPelajaran />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/kepegawaian/absensi-pelajaran/histori/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <HistoriAbsensiPelajaran />
            </ProtectedRoute>
          }
        />
        {/* Data Kelas */}
        <Route
          path="/superadmin/informasi-akademik/kelas"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataKelas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/kelas/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateKelas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/kelas/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditKelas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/kelas/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DetailKelas />
            </ProtectedRoute>
          }
        />
        // ── Rombel (nested dalam Kelas, bukan halaman sidebar terpisah) ──────────────
        <Route
          path="/superadmin/informasi-akademik/rombel/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateRombel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/rombel/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditRombel />
            </ProtectedRoute>
          }
        />
        // ── Wali Rombel (nested dalam DetailTahunAktifRombel) ───────────────────────
        <Route
          path="/superadmin/informasi-akademik/wali-rombel/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateWaliRombel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/wali-rombel/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditWaliRombel />
            </ProtectedRoute>
          }
        />
        // ── Siswa Rombel (nested dalam DetailTahunAktifRombel) ──────────────────────
        <Route
          path="/superadmin/informasi-akademik/siswa-rombel/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateSiswaRombel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/siswa-rombel/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditSiswaRombel />
            </ProtectedRoute>
          }
        />
        // jadwal pelajaran
        <Route
          path="/superadmin/informasi-akademik/jadwal-pelajaran-guru/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateJadwalPelajaranGuruSpa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/jadwal-pelajaran-guru/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditJadwalPelajaranGuruSpa />
            </ProtectedRoute>
          }
        />
        // ── Detail Tahun Aktif Rombel ─────────────────────────────────────────────── // GANTI path lama jika ada: /rombel/:id/tahun-aktif → pakai yang baru
        <Route
          path="/superadmin/informasi-akademik/rombel/aktif/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DetailTahunAktifRombelKelas />
            </ProtectedRoute>
          }
        />
        {/* Data Jurusan */}
        <Route
          path="/superadmin/informasi-sekolah/jurusan"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataJurusan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/jurusan/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateJurusan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/jurusan/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditJurusan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/rombel/aktif/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DetailTahunAktifRombelJurusan />
            </ProtectedRoute>
          }
        />
        {/* Data Mata Pelajaran */}
        <Route
          path="/superadmin/informasi-sekolah/mata-pelajaran"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataMataPelajaran />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/mata-pelajaran/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateMataPelajaran />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/mata-pelajaran/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditMataPelajaran />
            </ProtectedRoute>
          }
        />
        {/* Data Kurikulum */}
        <Route
          path="/superadmin/informasi-sekolah/kurikulum"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataKurikulum />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/kurikulum/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateKurikulum />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/kurikulum/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditKurikulum />
            </ProtectedRoute>
          }
        />
        {/* Data Siswa */}
        <Route
          path="/superadmin/informasi-sekolah/siswa"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataSiswa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/siswa/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateSiswa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/siswa/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditSiswa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/siswa/ubah-password/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <UbahPasswordSiswa />
            </ProtectedRoute>
          }
        />
        {/* HISTORI */}
        <Route
          path="/superadmin/informasi-sekolah/siswa/histori/rombel/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <HistoriRombelSiswa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/siswa/histori/jadwal-pelajaran/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <HistoriJadwalSiswa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/siswa/histori/absensi-pelajaran/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <HistoriAbsensiSiswa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/siswa/histori/ekstrakurikuler/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <HistoriEkskulSiswa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/siswa/histori/prestasi/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <HistoriPrestasiSiswaReadOnly />
            </ProtectedRoute>
          }
        />
        {/* Data Gedung + Ruangan */}
        <Route
          path="/superadmin/informasi-sekolah/gedung"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataGedung />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/gedung/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DetailGedung />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/gedung/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateGedung />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/gedung/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditGedung />
            </ProtectedRoute>
          }
        />
        {/* Data Identitas Sekolah */}
        <Route
          path="/superadmin/informasi-sekolah/identitas-sekolah"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataIdentitasSekolah />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/identitas-sekolah/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateIdentitasSekolah />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/identitas-sekolah/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditIdentitasSekolah />
            </ProtectedRoute>
          }
        />
        {/* INFORMASI AKADEMIK */}
        {/* Data Tahun Akademik + Semester */}
        <Route
          path="/superadmin/informasi-akademik/tahun-akademik"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataTahunAkademik />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/tahun-akademik/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateTahunAkademik />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/tahun-akademik/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditTahunAkademik />
            </ProtectedRoute>
          }
        />
        // Semester — route tetap ada, tapi tidak ada halaman DataSemester terpisah lagi
        <Route
          path="/superadmin/informasi-akademik/semester/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateSemester />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/semester/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditSemester />
            </ProtectedRoute>
          }
        />
        {/* Data Ekstrakurikuler */}
        <Route
          path="/superadmin/informasi-akademik/ekstrakurikuler"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataEkstrakurikuler />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/ekstrakurikuler/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateEkskul />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/ekstrakurikuler/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditEkskul />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/ekstrakurikuler/detail/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DetailEkstrakurikuler />
            </ProtectedRoute>
          }
        />
        {/* Data Kurikulum Mata Pelajaran */}
        <Route
          path="/superadmin/informasi-sekolah/kurikulum-mata-pelajaran"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataKurikulumMataPelajaran />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/kurikulum-mata-pelajaran/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateKurikulumMataPelajaran />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/kurikulum-mata-pelajaran/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditKurikulumMataPelajaran />
            </ProtectedRoute>
          }
        />
        {/* Data Jadwal Pelajaran */}
        <Route
          path="/superadmin/informasi-akademik/jadwal-pelajaran-guru"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataJadwalPelajaranGuruSpa />
            </ProtectedRoute>
          }
        />
        {/* Data Jadwal Pelajaran Siswa */}
        <Route
          path="/superadmin/informasi-akademik/jadwal-pelajaran-siswa"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataJadwalPelajaranSiswa />
            </ProtectedRoute>
          }
        />
        <Route
          path="//superadmin/informasi-akademik/jadwal-pelajaran-siswa/edit/:siswaId/:pivotId"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditJadwalPelajaranSiswa />
            </ProtectedRoute>
          }
        />
        {/* Data Kompetensi Dasar */}
        <Route
          path="/superadmin/informasi-sekolah/kompetensi"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataKompetensi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/kompetensi/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DetailKompetensi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/kompetensi/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateKompetensi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/kompetensi/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditKompetensi />
            </ProtectedRoute>
          }
        />
        {/* Alur Tujuan Pembelajaran */}
        <Route
          path="/superadmin/informasi-akademik/alur-tujuan-pembelajaran"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <AlurTujuanPembelajaran />
            </ProtectedRoute>
          }
        />
        {/* Data Prestasi Siswa */}
        <Route
          path="/superadmin/informasi-laporan-umum/prestasi-siswa"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataPrestasiSiswa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/prestasi-siswa/histori/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <HistoriPrestasiSiswa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-laporan-umum/prestasi-siswa/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreatePrestasiSiswa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-laporan-umum/prestasi-siswa/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditPrestasiSiswa />
            </ProtectedRoute>
          }
        />
        {/* Data PSB */}
        <Route
          path="/superadmin/psb"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataPsb />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/psb/detail/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DetailPsb />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/psb/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreatePsb />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/psb/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditPsb />
            </ProtectedRoute>
          }
        />
        {/* INFORMASI LAPORAN UMUM */}
        {/* Data Absensi Pegawai */}
        <Route
          path="/superadmin/informasi-laporan-umum/absensi/absensi-pegawai"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataAbsensiPegawai />
            </ProtectedRoute>
          }
        />
        {/* Data Absensi Pelajaran */}
        <Route
          path="/superadmin/informasi-laporan-umum/absensi/absensi-pelajaran"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataAbsensiPelajaran />
            </ProtectedRoute>
          }
        />
        {/* Data Absensi Siswa */}
        <Route
          path="/superadmin/informasi-laporan-umum/absensi/absensi-siswa"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataAbsensiSiswa />
            </ProtectedRoute>
          }
        />
        {/* Data Keuangan */}
        <Route
          path="/superadmin/informasi-laporan-umum/data-keuangan"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataKeuangan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-laporan-umum/data-keuangan/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateKeuangan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-laporan-umum/data-keuangan/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditKeuangan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-laporan-umum/data-keuangan/detail/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DetailKeuangan />
            </ProtectedRoute>
          }
        />
        {/* ================= DATA DASHBOARD GURU ================= */}
        {/* ================= DATA DASHBOARD SISWA ================= */}
        {/* ================= PUBLIC PSB SISWA ================= */}
        <Route path="/public-psb/" element={<HomePage />} />
        <Route path="/public-psb/form-psb-siswa" element={<FormPsbPublic />} />
        <Route path="/public-psb/psb-success" element={<PsbSuccess />} />
        {/* ================= ERROR PAGE ================= */}
        <Route path="/unauthorized" element={<div>Akses tidak diizinkan</div>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
