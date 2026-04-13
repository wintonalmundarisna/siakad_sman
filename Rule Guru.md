<!-- Data Master -->
- Register
- Login
- Logout
- Ubah Password
- Get Detail Diri
- Update Diri
- Lupa Password
  
------------------------------------------------------------------------------

- Identitas Sekolah : GET
  
------------------------------------------------------------------------------

- Gedung            : GET All, Detail
  - Ruangan         : Get Detail
  
------------------------------------------------------------------------------


<!-- Data Akademik -->
- Rombel            : Detail Tahun Aktif
  - 
  - Siswa           : Get Detail, Prestasi

------------------------------------------------------------------------------
- Wali Rombel     : Histori
  - Rombel
  
------------------------------------------------------------------------------

- Guru Jadwal Pelajaran : 
  - Otomatis get all jadwal sendiri pada tahun aktif, masing-masing jadwal dikasih button "lihat pertemuan" yang mengarah ke API Pertemuan: All
    - Masing masing pertemuan dikasih button "Detail" yang kalo diklik mengarah ke API Pertemuan: Detail
    - Pada Pertemuan: Detail, bagian absensi guru (mau null atau ada data), berikan button CRUD untuk guru kelola absen diri sendiri
    - Pada Pertemuan: Detail, bagian absensi siswa ()
    - 





  - Pertemuan (Update Jurnal KBM, CRUD Forum Dskusi, CRUD Tugas, Pengumpulan Tugas) // Pengumpulan tugas terbuat otomatis ketika tugas dibuat

  - ☑️ Pertemuan
    - Letakkan button "lihat pertemuan" di masing masing jadwal guru dan siswa
      - Letakkan button "lihat jurnal kbm", "Lihat Materi", "Lihat Forum Diskusi", dan "lihat tugas" secara sejajar pada masing masing pertemuan


  - Kurikulum + Mata Pelajaran + KURMAP + Kompetensi

------------------------------------------------------------------------------

- Alur Tujuan Pembelajaran  : Memilih atp master dan mengajukannya
  - ATP Master

------------------------------------------------------------------------------

- Ekstrakurikuler
  - Pembina
  - Pelatih
  - Siswa Ekskul : Siswa Didaftarkan Ekskul, Delete
  
------------------------------------------------------------------------------

<!-- Data Laporan Umum -->

- Absensi Pegawai   : Create Absensi, Histori, Export absen sendiri
  
------------------------------------------------------------------------------

- Absensi Guru - Pelajaran  : Create Absensi, Histori, export absen sendiri
  
------------------------------------------------------------------------------

- Absensi Siswa - Pelajaran : Get All, export
  
------------------------------------------------------------------------------

- Data Nilai Siswa  : Semua, termasuk cara pandang dia sebagai walas
  
------------------------------------------------------------------------------

