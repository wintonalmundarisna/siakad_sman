<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\IdentitasSekolah;
use App\Models\Gedung;
use App\Models\Psb;
use App\Models\Ruangan;
use App\Models\TahunAkademik;
use App\Models\Semester;
use App\Models\Kepegawaian;
use App\Models\Jurusan;
use App\Models\MataPelajaran;
use App\Models\AbsensiPegawai;
use App\Models\AbsensiPelajaran;
use App\Models\Keuangan;
use App\Models\AbsensiSiswa;
use App\Models\Prestasi;
use App\Models\Kelas;
use App\Models\Rombel;
use App\Models\WaliRombel;
use App\Models\SiswaRombel;
use App\Models\JadwalPelajaran;
use App\Models\Kurikulum;
use App\Models\KurikulumMataPelajaran;
use App\Models\Kompetensi;
use App\Models\AtpMaster;
use App\Models\AlurTujuanPembelajaran;
use App\Models\Ekstrakurikuler;
use App\Models\PembinaEkskul;
use App\Models\PelatihEkskul;
use App\Models\Siswa;
use App\Models\Rapor;
use App\Models\EkskulSiswaPivot;
use App\Models\DataNilaiSiswa;
use App\Models\DataBerkas;
use App\Models\Pertemuan;
use App\Models\JurnalKbm;
use App\Models\Materi;
use App\Models\ForumDiskusi;
use App\Models\ForumKomentar;
use App\Models\Tugas;
use App\Models\TugasPengumpulan;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        /**
         * 🎯✅ spa: C.R.U.D 
         * tu: C.R.U.D
         * kepsek: Index
         * ✅ guru: Index
         * ✅ staff: Index (samakan dengan guru)
         * ✅ siswa: Index
         * 
        */
        IdentitasSekolah::insert([
            'npsn' => 'SMA/001/2020',
            'nama_sekolah' => 'SMA Negeri 42 Jakarta',
            'status_sekolah' => 'Negeri',
            'jenjang' => 'SMA',
            'akreditasi' => 'A',
            'alamat' => 'Jl. Raya Bogor',
            'desa_kelurahan' => 'Abadijaya',
            'kecamatan' => 'Sukmajaya',
            'kabupaten_kota' => 'Bogor',
            'provinsi' => 'Jawa Barat',
            'kode_pos' => '16417',
            'email' => 'smanegeri@gmail.com',
            'no_telepon' => '021 112 5567 82',
            'kepala_sekolah' => 'Deden Suhendi, M.Pd',
            'nip_kepala_sekolah' => '196711111998031005',
            'visi' => 'Menciptakan generasi yang unggul dan sejahtera',
            'misi' => 'Mencerdaskan bangsa melalui pendidikan',
            'logo' => 'public/logo/sma.png'
        ]);

        /**
         * 🎯✅ spa: C.R.U.D
         * tu: C.R.U.D
         *  */ 
        Gedung::insert([
            [
                'foto_gedung' => 'gedung1.jpg',
                'kode_gedung' => 'GD_01',
                'nama_gedung' => 'Gedung Pratama',
                'jumlah_lantai' => 3,
                'luas_bangunan' => '24 Meter Persegi',
                'tahun_dibangun' => 2019,
                'kondisi' => 'Baik',
                'lokasi' => 'Jl. Ampit Raya',
                'Keterangan' => 'Silakan isi sendiri',
                'status' => 'arsip'
            ],
            [
                'foto_gedung' => 'gedung2.jpg',
                'kode_gedung' => 'GD_02',
                'nama_gedung' => 'Gedung Secondary',
                'jumlah_lantai' => 2,
                'luas_bangunan' => '17 Meter Persegi',
                'tahun_dibangun' => 2024,
                'kondisi' => 'Rusak Ringan',
                'lokasi' => 'Jl. Raya',
                'Keterangan' => 'Silakan isi sendiri',
                'status' => 'aktif'
            ],
            [
                'foto_gedung' => 'gedung3.jpg',
                'kode_gedung' => 'GD_03',
                'nama_gedung' => 'Gedung Third',
                'jumlah_lantai' => 2,
                'luas_bangunan' => '17 Meter Persegi',
                'tahun_dibangun' => 2001,
                'kondisi' => 'Rusak Berat',
                'lokasi' => 'Jl. Raya',
                'Keterangan' => 'Silakan isi sendiri',
                'status' => 'arsip'
            ],
        ]);

        /**
         * 🎯✅ spa: C.R.U.D
         * tu: C.R.U.D
         *  */ 
        Ruangan::insert([
           [
            'gedung_id' => 1, // GD_01
            'kode_ruangan' => '1.3.3', // gedung, lantai, ruangan
            'nama_ruangan' => 'Ruang Olahraga',
            'jenis_ruangan' => 'Aula',
            'lantai' => 3,
            'kapasitas' => 50,
            'luas_ruangan' => 50,
            'kondisi' => 'Dalam Perbaikan',
            'fasilitas' => 'Matras, Voli, Basket',
            'keterangan' => 'Buka sampai jam 8 malam',
            'status' => 'arsip'
           ],
           [
            'gedung_id' => 2, // GD_02
            'kode_ruangan' => '2.2.1', // gedung, lantai, ruangan
            'nama_ruangan' => 'Kantor Kepala Sekolah',
            'jenis_ruangan' => 'Kantor',
            'lantai' => 2,
            'kapasitas' => 15,
            'luas_ruangan' => 30,
            'kondisi' => 'Baik',
            'fasilitas' => 'ATK, Dispenser, Rak Buku',
            'keterangan' => 'Tutup saat jam makan siang',
            'status' => 'aktif'
           ],
           [
            'gedung_id' => 2, // GD_02
            'kode_ruangan' => '2.2.2', // gedung, lantai, ruangan
            'nama_ruangan' => 'Lab Komputer',
            'jenis_ruangan' => 'Lab',
            'lantai' => 2,
            'kapasitas' => 42,
            'luas_ruangan' => 30,
            'kondisi' => 'Baik',
            'fasilitas' => 'Komputer',
            'keterangan' => 'Khusus praktik dan ujian',
            'status' => 'aktif'
           ]
        ]);

         /**
          * 🎯✅ spa: C.R.U.D
          * tu: C.R.U.D          
          * kepsek : GET, SHOW
          * guru: 
          *
        */ 
        Kepegawaian::insert([
            [
                // 1
                'nama' => 'Super Admin',
                'email' => 'sp@gmail.com',
                'nip' => '123450',
                'nuptk' => '0123450',
                'keterangan' => 'Super Admin',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'super_admin',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 2
                'nama' => 'Kepsek',
                'email' => 'kepsek@gmail.com',
                'nip' => '123451',
                'nuptk' => '0123451',
                'keterangan' => 'Kepala Sekolah',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'kepsek',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 3
                'nama' => 'TU',
                'email' => 'tu@gmail.com',
                'nip' => '123452',
                'nuptk' => '0123452',
                'keterangan' => 'Staff TU',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'tu',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 4
                'nama' => 'Staff Kebersihan',
                'email' => 'staff@gmail.com',
                'nip' => '123453',
                'nuptk' => '0123453',
                'keterangan' => 'Staff Kebersihan',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'staff',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 5
                'nama' => 'Guru PAI',
                'email' => 'gurupai@gmail.com',
                'nip' => '123456',
                'nuptk' => '0123456',
                'keterangan' => 'Guru PAI',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 6
                'nama' => 'Guru PPKn',
                'email' => 'guruppkn@gmail.com',
                'nip' => '123454',
                'nuptk' => '0123454',
                'keterangan' => 'Guru PPKn',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 7
                'nama' => 'Guru Bahasa Indonesia',
                'email' => 'guruindonesia@gmail.com',
                'nip' => '123455',
                'nuptk' => '0123455',
                'keterangan' => 'Guru Bahasa Indonesia',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],            
            [
                // 8
                'nama' => 'Guru Bahasa Inggris',
                'email' => 'guruinggris@gmail.com',
                'nip' => '123457',
                'nuptk' => '0123457',
                'keterangan' => 'Guru Bahasa Inggris',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 9
                'nama' => 'Guru Matematika',
                'email' => 'gurumtk@gmail.com',
                'nip' => '123458',
                'nuptk' => '0123458',
                'keterangan' => 'Guru Matematika',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 10
                'nama' => 'Guru Sejarah',
                'email' => 'gurusejarah@gmail.com',
                'nip' => '123459',
                'nuptk' => '0123459',
                'keterangan' => 'Guru Sejarah',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 11
                'nama' => 'Guru PJOK',
                'email' => 'gurupjok@gmail.com',
                'nip' => '123460',
                'nuptk' => '0123460',
                'keterangan' => 'Guru PJOK',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 12
                'nama' => 'Guru Seni Budaya',
                'email' => 'gurusenibudaya@gmail.com',
                'nip' => '123461',
                'nuptk' => '0123461',
                'keterangan' => 'Guru Seni Budaya',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],            
            [
                // 13
                'nama' => 'Guru Informatika',
                'email' => 'guruinformatika@gmail.com',
                'nip' => '123462',
                'nuptk' => '0123462',
                'keterangan' => 'Guru Informatika',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 14
                'nama' => 'Guru Tidak Aktif',
                'email' => 'gurutidakaktif@gmail.com',
                'nip' => '123463',
                'nuptk' => '0123463',
                'keterangan' => 'Guru Tidak Aktif',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'tidak aktif',
            ],
            [
                // 15
                'nama' => 'Guru Projek P5',
                'email' => 'guruprojekp5@gmail.com',
                'nip' => '123464',
                'nuptk' => '0123464',
                'keterangan' => 'Guru Projek P5',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],

            // Kelompok Sains
            [
                // 16
                'nama' => 'Guru Fisika',
                'email' => 'gurufisika@gmail.com',
                'nip' => '123465',
                'nuptk' => '0123465',
                'keterangan' => 'Guru Fisika',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 17
                'nama' => 'Guru Kimia',
                'email' => 'gurukimia@gmail.com',
                'nip' => '123466',
                'nuptk' => '0123466',
                'keterangan' => 'Guru Kimia',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],

            // Kelompok Sosial
            [
                // 18
                'nama' => 'Guru Ekonomi',
                'email' => 'guruekonomi@gmail.com',
                'nip' => '123467',
                'nuptk' => '0123467',
                'keterangan' => 'Guru Ekonomi',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 19
                'nama' => 'Guru Sosiologi',
                'email' => 'gurusosiologi@gmail.com',
                'nip' => '123468',
                'nuptk' => '0123468',
                'keterangan' => 'Guru Sosiologi',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],

            // Kelompok Bahasa
            [
                // 20
                'nama' => 'Guru Bahasa Jepang',
                'email' => 'gurujepang@gmail.com',
                'nip' => '123469',
                'nuptk' => '0123469',
                'keterangan' => 'Guru Bahasa Jepang',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 21
                'nama' => 'Guru Bahasa Jerman',
                'email' => 'gurujerman@gmail.com',
                'nip' => '123470',
                'nuptk' => '0123470',
                'keterangan' => 'Guru Bahasa Jerman',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
        ]);

        /**
         * 🎯✅ SPA: C.R.U.D
         */
        // Penerimaan Siswa Baru
        Psb::insert([
            [
                'foto_siswa'            => 'foto_satu.jpg',
                'nama_siswa'            => 'Siswa Baru Pertama',
                'nisn'                  => '202143500076',
                'jk'                    => 'Laki-laki',
                'tempat_lahir'          => 'Cirebon',
                'tanggal_lahir'         =>  '2003-08-24',
                'agama'                 => 'Islam',
                'alamat'                => 'Jl. Satria, No. 59 B',
                'no_hp_siswa'           => '087820624415',
                'nama_ayah'             => 'Ayah Siswa Baru Pertama',
                'pekerjaan_ayah'        => 'Guru',
                'no_hp_ayah'            => '08777647826',
                'nama_ibu'              => 'Ibu Siswa Baru Pertama',
                'pekerjaan_ibu'         => 'Dosen',
                'no_hp_ibu'             => '08777647832',
                'nama_wali'             => 'Wali Siswa Baru Pertama',
                'pekerjaan_wali'        => 'Wirausaha',
                'no_hp_wali'            => '08777647543',
                'sekolah_asal'          => 'SMP Citra Bangsa',
                'alamat_sekolah_asal'   => 'Jl. Citra',
                'kelas_terakhir'        => null,
                'nilai_raport_terakhir' => '90',
                'alasan_pindah'         => null,
                'berkas_raport'         => 'berkas_raport_pertama.pdf',
                'suket_pindah'          => 'suket_pindah_pertama.pdf',
                'berkas_kartu_keluarga' => 'kk_pertama.jpg',
                'berkas_akta_lahir'     => 'akta_pertama.png'
            ],
            [
                'foto_siswa'            => 'foto_dua.jpg',
                'nama_siswa'            => 'Siswa Baru Kedua',
                'nisn'                  => '202143500090',
                'jk'                    => 'Laki-laki',
                'tempat_lahir'          => 'Depok',
                'tanggal_lahir'         =>  '2001-05-25',
                'agama'                 => 'Kristen',
                'alamat'                => 'Jl. Kenangan',
                'no_hp_siswa'           => '087820629990',
                'nama_ayah'             => 'Ayah Siswa Baru Kedua',
                'pekerjaan_ayah'        => 'Nelayan',
                'no_hp_ayah'            => '08777647887',
                'nama_ibu'              => 'Ibu Siswa Baru Kedua',
                'pekerjaan_ibu'         => 'Dokter',
                'no_hp_ibu'             => '08777647634',
                'nama_wali'             => null,
                'pekerjaan_wali'        => null,
                'no_hp_wali'            => null,
                'sekolah_asal'          => 'SMA Dharma Bakti',
                'alamat_sekolah_asal'   => 'Jl. Kebaktian',
                'kelas_terakhir'        => 'XI-IPA',
                'nilai_raport_terakhir' => '90',
                'alasan_pindah'         => 'Pindah Domisili',
                'berkas_raport'         => 'berkas_raport_kedua.pdf',
                'suket_pindah'          => 'suket_pindah_kedua.pdf',
                'berkas_kartu_keluarga' => 'kk_kedua.jpg',
                'berkas_akta_lahir'     => 'akta_kedua.png'
            ],
            [
                'foto_siswa'            => 'foto_tiga.jpg',
                'nama_siswa'            => 'Siswa Baru Ketiga',
                'nisn'                  => '202143500005',
                'jk'                    => 'Perempuan',
                'tempat_lahir'          => 'Jakarta',
                'tanggal_lahir'         =>  '2003-01-17',
                'agama'                 => 'Katolik',
                'alamat'                => 'Jl. Bumi Bersama',
                'no_hp_siswa'           => '087820629100',
                'nama_ayah'             => 'Ayah Siswa Baru Ketiga',
                'pekerjaan_ayah'        => 'Satpam',
                'no_hp_ayah'            => '08777647887',
                'nama_ibu'              => 'Ibu Siswa Baru Ketiga',
                'pekerjaan_ibu'         => 'Asisten Rumah Tangga',
                'no_hp_ibu'             => '08777647634',
                'nama_wali'             => null,
                'pekerjaan_wali'        => null,
                'no_hp_wali'            => null,
                'sekolah_asal'          => 'SMP Ganesha',
                'alamat_sekolah_asal'   => 'Jl. Merdeka',
                'kelas_terakhir'        => null,
                'nilai_raport_terakhir' => null,
                'alasan_pindah'         => null,
                'berkas_raport'         => 'berkas_raport_kedua.pdf',
                'suket_pindah'          => null,
                'berkas_kartu_keluarga' => 'kk_kedua.jpg',
                'berkas_akta_lahir'     => 'akta_kedua.png'
            ],
        ]);

        /**
         * 🎯✅ spa: C.R.U.D
         * tu:
         * kepsek: GET, SHOW
         * guru: GET, SHOW
         */
        Siswa::insert([
            [
                // 1
                'nisn' => '123451',
                'nama' => 'Bagas Pratama',
                'nis' => '123451',                
                'email' => 'bagas@gmail.com',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'siswa',
                'remember_token' => Str::random(10),
                'status' => 'tidak aktif'
            ],
            [
                // 2
                'nisn' => '123452',
                'nama' => 'Winton Almundarisna',
                'nis' => '123452',                
                'email' => 'winton@gmail.com',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'siswa',
                'remember_token' => Str::random(10),
                'status' => 'aktif'
            ],
            [
                // 3
                'nisn' => '123453',
                'nama' => 'Sanita Permata Sari',
                'nis' => '123453',                
                'email' => 'sanita@gmail.com',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'siswa',
                'remember_token' => Str::random(10),
                'status' => 'aktif'
            ],
            [
                // 4
                'nisn' => '123454',
                'nama' => 'Rehan Anggra Wirya',
                'nis' => '123454',                
                'email' => 'rehan@gmail.com',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'siswa',
                'remember_token' => Str::random(10),
                'status' => 'tidak aktif'
            ],
            [
                // 5
                'nisn' => '123455',
                'nama' => 'Yulianthy Noor Annisa',
                'nis' => '123455',                
                'email' => 'yuli@gmail.com',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'siswa',
                'remember_token' => Str::random(10),
                'status' => 'tidak aktif'
            ],
            [
                // 6
                'nisn' => '123456',
                'nama' => 'Danang Supratman',
                'nis' => '123456',                
                'email' => 'danang@gmail.com',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'siswa',
                'remember_token' => Str::random(10),
                'status' => 'aktif'
            ],
            [
                // 7
                'nisn' => '123457',
                'nama' => 'Selma Dwi Anggara',
                'nis' => '123457',                
                'email' => 'selma@gmail.com',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'siswa',
                'remember_token' => Str::random(10),
                'status' => 'aktif'
            ],
            [
                // 8
                'nisn' => '123458',
                'nama' => 'Devi Yani Putri',
                'nis' => '123458',                
                'email' => 'devi@gmail.com',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'siswa',
                'remember_token' => Str::random(10),
                'status' => 'tidak aktif'
            ],
        ]);

        /**
         * 🎯✅ spa: C.R.U.D
         */
        Jurusan::insert([
            [
                'nama_jurusan' => 'IPA',
                'kode_jurusan' => '1',
                'status' => 'aktif',
            ],
            [
                'nama_jurusan' => 'IPS',
                'kode_jurusan' => '2',
                'status' => 'aktif',
            ],
            [
                'nama_jurusan' => 'Bahasa',
                'kode_jurusan' => '3',
                'status' => 'arsip',
            ],
        ]);

        /**
         * 🎯✅ spa: C.R.U.D
         * tu: C.R.U.D 
         * kepsek: GET, SHOW
         * guru:
         * **/
        Kelas::insert([
            [
                'nama_kelas' => 'X',
                'kode_kelas' => 'K10',                
                'tingkat' => 10,                                
                'status' => 'aktif'
            ],
            [
                'nama_kelas' => 'XI',
                'kode_kelas' => 'K11',                
                'tingkat' => 11,                                
                'status' => 'aktif'
            ],
            [
                'nama_kelas' => 'XII',
                'kode_kelas' => 'K112',                
                'tingkat' => 12,                                
                'status' => 'aktif'
            ],            
            [
                'nama_kelas' => 'XII-arsip',
                'kode_kelas' => 'K12-arsip',                
                'tingkat' => 12,                                
                'status' => 'arsip'
            ],            
        ]);

        /**
         * 🎯✅ spa: C.R.U.D
         * tu (tidak berubah sampe ada kurikulum baru): C.R.U.D
         *  */ 
        Kurikulum::insert([
            [
                'nama_kurikulum' => 'Kurikulum Tingkat Satuan Pendidikan (KTSP)',
                'kode_kurikulum' => 'KTSP-2006',
                'tipe' => 'KTSP',
                'tahun_mulai' => 2006,
                'tahun_selesai' => 2012,
                'deskripsi' => '
                - Sekolah Bebas Menentukan Kurikulum
                - Ada Standar Kompetensi (SK) dan Kompetensi Dasar (KD)',
                'status' => 'arsip',
            ],
            [
                'nama_kurikulum' => 'Kurikulum 2013',
                'kode_kurikulum' => 'KUR-2013',
                'tipe' => 'K13',
                'tahun_mulai' => 2013,
                'tahun_selesai' => 2021,
                'deskripsi' => '
                - Ada Kompetensi Inti (KI) dan Kompetensi Dasar (KD)
                1. KI 1: Sikap Spriritual
                2. KI 2: Sikap Sosial
                3. KI 3: Pengetahuan
                4. KI 4: Keterampilan
                - Banyak Penilaian Formatif
                - Buku Tematik untuk SD
                - SMA Terbagi Menjadi:
                1. Mata Pelajaran Wajib
                2. Peminatan',
                'status' => 'arsip',
            ],
            [
                'nama_kurikulum' => 'Kurikulum Merdeka',
                'kode_kurikulum' => 'K-M-2022',
                'tipe' => 'MERDEKA',
                'tahun_mulai' => 2022,
                'tahun_selesai' => 2025,
                'deskripsi' => '
                - Tidak ada lagi KI & KD, diganti Capaian Pembelajaran (CP)
                - Lebih fleksibel
                - Terdapat Projek Penguatan Profil Pelajar Pancasila (P5)
                - Mata Pelajaran Informatika Menjadi Wajib
                - SMA Kembali ke Umum Tanpa Jurusan (IPA/IPS dihapus)',
                'status' => 'aktif',
            ],
        ]);

        /**
         * 🎯✅ spa: C.R.U.D
         * tu: C.R.U.D
         * Kepsek: GET, SHOW
         * guru: GET, SHOW
         * */ 
        MataPelajaran::insert([            
            // Mapel Umum Fase E (10)
            [
                // 1
                'nama_pelajaran' => 'Pendidikan Agama & Budi Pekerti',
                'kode_mapel_diknas' => 'sesuai agama',                
                'kelompok' => 'umum',
                'status' => 'aktif',                
            ],
            [
                // 2
                'nama_pelajaran' => 'PPKn',
                'kode_mapel_diknas' => '154',                
                'kelompok' => 'umum',
                'status' => 'aktif',                
            ],  
            [
                // 3
                'nama_pelajaran' => 'Bahasa Indonesia',
                'kode_mapel_diknas' => '156',                
                'kelompok' => 'umum',
                'status' => 'aktif',                
            ],
            [
                // 4
                'nama_pelajaran' => 'Bahasa Inggris',
                'kode_mapel_diknas' => '157',                
                'kelompok' => 'umum',
                'status' => 'aktif',                
            ],
            [
                // 5
                'nama_pelajaran' => 'Matematika',
                'kode_mapel_diknas' => '180',                
                'kelompok' => 'umum',
                'status' => 'aktif',                
            ],
            [
                // 6
                'nama_pelajaran' => 'Sejarah',
                'kode_mapel_diknas' => '204',                
                'kelompok' => 'umum',
                'status' => 'aktif',                
            ],
            [
                // 7
                'nama_pelajaran' => 'PJOK',
                'kode_mapel_diknas' => '220',                
                'kelompok' => 'umum',
                'status' => 'aktif',                
            ],
            [
                // 8
                'nama_pelajaran' => 'Seni Budaya',
                'kode_mapel_diknas' => '217',                
                'kelompok' => 'umum',
                'status' => 'aktif',                
            ],
            [
                // 9
                'nama_pelajaran' => 'Informatika',
                'kode_mapel_diknas' => '224',                
                'kelompok' => 'umum',
                'status' => 'aktif',                
            ],
            [
                // 10
                'nama_pelajaran' => 'Projek P5',
                'kode_mapel_diknas' => 'tidak ada standar',                
                'kelompok' => 'umum',
                'status' => 'aktif',                
            ],            

            // ---------------------------

            // Mapel Pilihan Fase F (11 dan 12)
            // Kelompok Sains
            [
                // 11
                'nama_pelajaran' => 'Fisika',
                'kode_mapel_diknas' => '184',                
                'kelompok' => 'sains',
                'status' => 'aktif',                
            ],
            [
                // 12
                'nama_pelajaran' => 'Kimia',
                'kode_mapel_diknas' => '187',                
                'kelompok' => 'sains',
                'status' => 'aktif',                
            ],                        
            [
                // 13
                'nama_pelajaran' => 'Biologi',
                'kode_mapel_diknas' => '190',                
                'kelompok' => 'sains',
                'status' => 'aktif',                
            ],
            [
                // 14
                'nama_pelajaran' => 'Matematika Tingkat Lanjut',
                'kode_mapel_diknas' => 'MTL',                
                'kelompok' => 'sains',
                'status' => 'aktif',                
            ],       
            
            // Kelompok sosial
            [
                // 15
                'nama_pelajaran' => 'Ekonomi',
                'kode_mapel_diknas' => '210',                
                'kelompok' => 'sosial',
                'status' => 'aktif',                
            ],                                  
            [
                // 16
                'nama_pelajaran' => 'Geografi',
                'kode_mapel_diknas' => '207',                
                'kelompok' => 'sosial',
                'status' => 'aktif',                
            ],                                  
            [
                // 17
                'nama_pelajaran' => 'Sosiologi',
                'kode_mapel_diknas' => '214',                
                'kelompok' => 'sosial',
                'status' => 'aktif',                
            ],                                  
            [
                // 18
                'nama_pelajaran' => 'Antropologi',
                'kode_mapel_diknas' => '215',                
                'kelompok' => 'sosial',
                'status' => 'aktif',                
            ],                             
            [
                // 19
                'nama_pelajaran' => 'Sejarah Lanjutan',
                'kode_mapel_diknas' => '204-L',                
                'kelompok' => 'sosial',
                'status' => 'aktif',                
            ],
            
            // Kelompok bahasa
            [
                // 20
                'nama_pelajaran' => 'Bahasa Jepang',
                'kode_mapel_diknas' => 'JP',                
                'kelompok' => 'bahasa',
                'status' => 'aktif',                
            ],
            [
                // 21
                'nama_pelajaran' => 'Bahasa Mandarin',
                'kode_mapel_diknas' => 'MAN',                
                'kelompok' => 'bahasa',
                'status' => 'aktif',                
            ],
            [
                // 22
                'nama_pelajaran' => 'Bahasa Korea',
                'kode_mapel_diknas' => 'KR',                
                'kelompok' => 'bahasa',
                'status' => 'aktif',                
            ],
            [
                // 23
                'nama_pelajaran' => 'Bahasa Arab',
                'kode_mapel_diknas' => '239',                
                'kelompok' => 'bahasa',
                'status' => 'aktif',                
            ],
            [
                // 24
                'nama_pelajaran' => 'Bahasa Jerman',
                'kode_mapel_diknas' => '160',                
                'kelompok' => 'bahasa',
                'status' => 'aktif',                
            ],
            [
                // 25
                'nama_pelajaran' => 'Bahasa Perancis',
                'kode_mapel_diknas' => '164',                
                'kelompok' => 'bahasa',
                'status' => 'arsip',                
            ],            
            [
                // 26
                'nama_pelajaran' => 'Bahasa Sunda',
                'kode_mapel_diknas' => 'SUND',                
                'kelompok' => 'bahasa',
                'status' => 'arsip',                
            ],            
        ]);  

        /**
         * 🎯✅ spa: C.R.U.D
         */
        KurikulumMataPelajaran::insert([
            [
                // 1
                'kurikulum_id' => 2, // Kurtilas
                'mata_pelajaran_id' => 26, // Bahasa Sunda
                'tingkat' => 10,
                'nilai_kkm' => 75.55,
                'status_mata_pelajaran' => 'wajib',
                'status' => 'aktif'
            ],
            // ==========================================
            [
                // Kelompok Umum (E)
                // Kelas 10
                // 2
                'kurikulum_id' => 3, // Merdeka
                'mata_pelajaran_id' => 1, // Agama
                'tingkat' => 10,
                'nilai_kkm' => 80,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],            
            [
                // 3
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 2, // PPKn
                'tingkat' => 10,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 4
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 3, // Indo
                'tingkat' => 10,
                'nilai_kkm' => 80,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],            
            [
                // 5
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 4, // Inggris
                'tingkat' => 10,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 6
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 5, // Matematika
                'tingkat' => 10,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 7
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 6, // Sejarah
                'tingkat' => 10,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 8
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 7, // PJOK
                'tingkat' => 10,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 9
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 8, // Seni Budaya
                'tingkat' => 10,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 10
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 9, // Informatika
                'tingkat' => 10,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 11
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 10, // Projek P5
                'tingkat' => 10,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // Kelas 11
                // 12
                'kurikulum_id' => 3, // Merdeka
                'mata_pelajaran_id' => 1, // Agama
                'tingkat' => 11,
                'nilai_kkm' => 80,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],            
            [
                // 13
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 2, // PPKn
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 14
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 3, // Indo
                'tingkat' => 11,
                'nilai_kkm' => 80,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],            
            [
                // 15
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 4, // Inggris
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 16
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 5, // Matematika
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 17
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 6, // Sejarah
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 18
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 7, // PJOK
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 19
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 8, // Seni Budaya
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 20
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 9, // Informatika
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 21
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 10, // Projek P5
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // Kelas 12
                // 22
                'kurikulum_id' => 3, // Merdeka
                'mata_pelajaran_id' => 1, // Agama
                'tingkat' => 12,
                'nilai_kkm' => 80,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],            
            [
                // 23
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 2, // PPKn
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 24
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 3, // Indo
                'tingkat' => 12,
                'nilai_kkm' => 80,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],            
            [
                // 25
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 4, // Inggris
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 26
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 5, // Matematika
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 27
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 6, // Sejarah
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 28
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 7, // PJOK
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 29
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 8, // Seni Budaya
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 30
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 9, // Informatika
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 31
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 10, // Projek P5
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],

            // Kelompok Sains (F)
            // Kelas 11
            [
                // 32
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 11, // Fisika
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 33
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 12, // Kimia
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 34
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 13, // Biologi
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 35
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 14, // MTK Lanjut
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            // Kelas 12
            [
                // 36
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 11, // Fisika
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 37
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 12, // Kimia
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 38
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 13, // Biologi
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 39
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 14, // MTK Lanjut
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],

            // Kelompok Sosial (F)
            // Kelas 11
            [
                // 40
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 15, // Ekonomi
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 41
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 16, // Geografi
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 42
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 17, // Sosiologi
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 43
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 18, // Antropologi
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 44
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 19, // Sejarah Lanjutan
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            // Kelas 12
            [
                // 45
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 15, // Ekonomi
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 46
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 16, // Geografi
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 47
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 17, // Sosiologi
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 48
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 18, // Antropologi
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 49
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 19, // Sejarah Lanjutan
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],

            // Kelompok bahasa (F)
            // Kelas 11
            [
                // 50
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 20, // Bahasa Jepang
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 51
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 21, // Bahasa Mandarin
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 52
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 22, // Bahasa Korea
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 53
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 23, // Bahasa Arab
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 54
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 24, // Bahasa Jerman
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 55
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 25, // Bahasa Perancis
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'arsip'
            ],            
            // Kelas 12
            [
                // 56
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 20, // Bahasa Jepang
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 57
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 21, // Bahasa Mandarin
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 58
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 22, // Bahasa Korea
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 59
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 23, // Bahasa Arab
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 60
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 24, // Bahasa Jerman
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 61
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 25, // Bahasa Perancis
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'arsip'
            ],            
        ]);

        /**
         * 🎯✅ spa: C.R.U.D
         * tu: C.R.U.D
         * 
         */
        TahunAkademik::insert([
            [
                'tahun_akademik' => '2023/2024',                
                'keterangan' => 'Kurikulum 2013',
                'status' => 'arsip',
            ],
            [
                'tahun_akademik' => '2024/2025',                
                'keterangan' => 'Kurikulum Merdeka',
                'status' => 'aktif',
            ]
        ]);  
    
        /**
         * 🎯✅ spa: C.R.U.D
         */
        Semester::insert([
            [
                'tahun_akademik_id' => 1,
                'semester' => 'Ganjil',
                'status' => 'arsip'
            ],
            [
                'tahun_akademik_id' => 1,
                'semester' => 'Genap',
                'status' => 'arsip'
            ],
            [
                'tahun_akademik_id' => 2,
                'semester' => 'Ganjil',
                'status' => 'aktif'
            ],
            [
                'tahun_akademik_id' => 2,
                'semester' => 'Genap',
                'status' => 'arsip'
            ],
        ]);

        /**
         * tidak berubah selama kurikulum sama
         * 🎯✅ spa: C.R.U.D
         * tu: C.R.U.D
         * Kepsek: GET, SHOW
         * guru: GET, SHOW
         * */  
        Kompetensi::insert([
            [
                // 1
                // 'kurikulum_id' => 2, // K13
                // 'mata_pelajaran_id' => 26, // Bahasa Sunda
                'kurikulum_mata_pelajaran_id' => 1,
                'judul_kompetensi' => 'Memahami Bahasa Sunda',
                'jenis' => 'KD',                
                'kode' => 'KD-1.1',
                'tingkat' => '10',
                'aspek' => 'pengetahuan',
                'fase' => null,
                'deskripsi' => 'Memahami bahasa Sunda dalam kehidupan sehari-hari',
                'status' => 'arsip'
            ],
            [
                // 2
                // 'kurikulum_id' => 2, // K13
                // 'mata_pelajaran_id' => 26,
                'kurikulum_mata_pelajaran_id' => 1,
                'judul_kompetensi' => 'Mahir berbahasa Sunda',
                'jenis' => 'KD',                
                'kode' => 'KD-1.2',
                'tingkat' => '10',
                'aspek' => 'keterampilan',
                'fase' => null,
                'deskripsi' => 'Mahir menggunakan bahasa Sunda dalam kehidupan sehari-hari',
                'status' => 'aktif'
            ],            
            // ============================================== 

            // Fase E
            // Tingkat 10
            // MTK (10) (E)
            [
                // 3
                // 'kurikulum_id' => 3, // MERDEKA
                // 'mata_pelajaran_id' => 5, // Matematika (10)
                'kurikulum_mata_pelajaran_id' => 6,
                'judul_kompetensi' => 'Pemahaman Konsep Aljabar dan Bilangan Real',
                'jenis' => 'CP',                
                'kode' => 'CP-MAT-10-E1',
                'tingkat' => '10',
                'aspek' => null,
                'fase' => 'E',
                'deskripsi' => 'Peserta didik mampu memahami dan menerapkan konsep bilangan real, bentuk aljabar, persamaan, dan pertidaksamaan linear dalam menyelesaikan masalah matematis dan kontekstual secara sistematis, menggunakan penalaran logis dan prosedur yang tepat.',
                'status' => 'aktif'
            ],
            [
                // 4
                // 'kurikulum_id' => 3, // MERDEKA
                // 'mata_pelajaran_id' => 5, // Matematika (10)
                'kurikulum_mata_pelajaran_id' => 6,
                'judul_kompetensi' => 'Representasi dan Komunikasi Matematis',
                'jenis' => 'CP',                
                'kode' => 'CP-MAT-10-E2',
                'tingkat' => '10',
                'aspek' => null,
                'fase' => 'E',
                'deskripsi' => 'Peserta didik mampu menyajikan dan mengomunikasikan ide matematika melalui berbagai representasi seperti simbol, tabel, grafik, dan bahasa matematika, serta menunjukkan sikap teliti, jujur, dan percaya diri dalam proses pemecahan masalah.',
                'status' => 'aktif'
            ],

            // MTK (11) (F)
            [
                // 5
                // 'kurikulum_id' => 3, // MERDEKA
                // 'mata_pelajaran_id' => 5, // Matematika (11)
                'kurikulum_mata_pelajaran_id' => 16,
                'judul_kompetensi' => 'Analisis Fungsi dan Trigonometri',
                'jenis' => 'CP',                
                'kode' => 'CP-MAT-11-F1',
                'tingkat' => '11',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu menganalisis dan menerapkan konsep fungsi, trigonometri, dan transformasinya untuk menyelesaikan masalah matematis dan masalah kontekstual, serta menjelaskan hubungan antar konsep secara logis dan sistematis.',      
                'status' => 'aktif'
            ],
            [
                // 6
                // 'kurikulum_id' => 3, // MERDEKA
                // 'mata_pelajaran_id' => 5, // Matematika (11)
                'kurikulum_mata_pelajaran_id' => 16,
                'judul_kompetensi' => 'Penalaran dan Pemecahan Masalah Matematis',
                'jenis' => 'CP',                
                'kode' => 'CP-MAT-11-F2',
                'tingkat' => '11',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu menggunakan penalaran induktif dan deduktif dalam menyusun argumen matematis, memecahkan masalah, serta mengomunikasikan proses dan hasil penyelesaian secara runtut dan akurat.',
                'status' => 'aktif'
            ],

            // MTK (12) (F)
            [
                // 7
                // 'kurikulum_id' => 3, // MERDEKA
                // 'mata_pelajaran_id' => 5, // Matematika (12)
                'kurikulum_mata_pelajaran_id' => 26,
                'judul_kompetensi' => 'Penerapan Kalkulus dalam Pemecahan Masalah',
                'jenis' => 'CP',                
                'kode' => 'CP-MAT-12-F1',
                'tingkat' => '12',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu memahami dan menerapkan konsep limit dan turunan fungsi aljabar untuk menganalisis perubahan, menentukan nilai optimum, dan menyelesaikan masalah kontekstual secara kritis dan bertanggung jawab.',      
                'status' => 'aktif'
            ],
            [
                // 8
                // 'kurikulum_id' => 3, // MERDEKA
                // 'mata_pelajaran_id' => 5, // Matematika (12)
                'kurikulum_mata_pelajaran_id' => 26,
                'judul_kompetensi' => 'Analisis Data dan Peluang',
                'jenis' => 'CP',                
                'kode' => 'CP-MAT-12-F2',
                'tingkat' => '12',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu menganalisis data, menentukan peluang suatu kejadian, serta menggunakan konsep statistika dan peluang untuk menarik kesimpulan dan membuat keputusan berdasarkan data secara logis dan objektif.',
                'status' => 'aktif'
            ],


            // Fase E
            // Tingkat 10
            // Indonesia (10) (E)
            [
                // 9
                // 'kurikulum_id' => 3, // MERDEKA
                // 'mata_pelajaran_id' => 3, // B. Indo (10)
                'kurikulum_mata_pelajaran_id' => 4,
                'judul_kompetensi' => 'Pemahaman dan Analisis Teks Informasi',
                'jenis' => 'CP',                
                'kode' => 'CP-IND-10-E1',
                'tingkat' => '10',
                'aspek' => null,
                'fase' => 'E',
                'deskripsi' => 'Peserta didik mampu memahami, mengidentifikasi, dan menganalisis isi, struktur, serta kebahasaan berbagai teks informasi (seperti teks laporan hasil observasi, eksposisi, dan prosedur) secara kritis, serta menyimpulkan informasi secara logis dan sistematis.',
                'status' => 'aktif'
            ],
            [
                // 10
                // 'kurikulum_id' => 3, // MERDEKA
                // 'mata_pelajaran_id' => 3, // B. Indo (10)
                'kurikulum_mata_pelajaran_id' => 4,
                'judul_kompetensi' => 'Produksi Teks Informatif dan Komunikatif',
                'jenis' => 'CP',                
                'kode' => 'CP-IND-10-E2',
                'tingkat' => '10',
                'aspek' => null,
                'fase' => 'E',
                'deskripsi' => 'Peserta didik mampu menulis dan menyajikan teks informasi secara runtut, efektif, dan sesuai kaidah bahasa Indonesia dengan memperhatikan tujuan, konteks, serta audiens, serta menunjukkan sikap bertanggung jawab dalam berbahasa.',
                'status' => 'aktif'
            ],

            // Indo (11) (F)
            [
                // 11
                // 'kurikulum_id' => 3, // MERDEKA
                // 'mata_pelajaran_id' => 3, // B. Indo (11)
                'kurikulum_mata_pelajaran_id' => 14,
                'judul_kompetensi' => 'Analisis dan Evaluasi Teks Sastra dan Nonfiksi',
                'jenis' => 'CP',                
                'kode' => 'CP-IND-11-F1',
                'tingkat' => '11',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu menganalisis, mengevaluasi, dan membandingkan isi, struktur, serta nilai-nilai dalam berbagai teks sastra dan nonfiksi, serta mengaitkannya dengan konteks sosial dan budaya secara kritis dan reflektif.',      
                'status' => 'aktif'
            ],
            [
                // 12
                // 'kurikulum_id' => 3, // MERDEKA
                // 'mata_pelajaran_id' => 3, // B. Indo (11)
                'kurikulum_mata_pelajaran_id' => 14,
                'judul_kompetensi' => 'Keterampilan Berbahasa untuk Berargumentasi',
                'jenis' => 'CP',                
                'kode' => 'CP-IND-11-F2',
                'tingkat' => '11',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu mengemukakan pendapat, argumen, dan tanggapan secara lisan dan tulis dengan bahasa yang santun, logis, dan persuasif, serta menggunakan sumber informasi yang relevan dan dapat dipercaya.',
                'status' => 'aktif'
            ],

            // Indo (12) (F)
            [
                // 13
                // 'kurikulum_id' => 3, // MERDEKA
                // 'mata_pelajaran_id' => 3, // B. Indo (12)
                'kurikulum_mata_pelajaran_id' => 24,
                'judul_kompetensi' => 'Kreasi dan Apresiasi Teks Sastra dan Nonfiksi',
                'jenis' => 'CP',                
                'kode' => 'CP-IND-12-F1',
                'tingkat' => '12',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu mengapresiasi dan mencipta teks sastra dan nonfiksi secara kreatif dengan memperhatikan struktur, kaidah kebahasaan, serta nilai estetika, serta merefleksikan makna teks dalam konteks kehidupan nyata.',      
                'status' => 'aktif'
            ],
            [
                // 14
                // 'kurikulum_id' => 3, // MERDEKA
                // 'mata_pelajaran_id' => 3, // B. Indo (12)
                'kurikulum_mata_pelajaran_id' => 24,
                'judul_kompetensi' => 'Komunikasi Akademik dan Publik',
                'jenis' => 'CP',                
                'kode' => 'CP-IND-12-F2',
                'tingkat' => '12',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu menyampaikan gagasan, hasil kajian, dan pendapat secara lisan dan tulis dalam konteks akademik dan publik dengan bahasa Indonesia yang baik dan benar, serta bertanggung jawab dalam penggunaan informasi.',
                'status' => 'aktif'
            ],



            // Sains (F)
            // Fisika (F) (11)
            [
                // 15
                // 'kurikulum_id' => 3, // MERDEKA
                // 'mata_pelajaran_id' => 11, // Fisika (11)
                'kurikulum_mata_pelajaran_id' => 32,
                'judul_kompetensi' => 'Pemahaman Konsep dan Hukum Dasar Fisika',
                'jenis' => 'CP',                
                'kode' => 'CP-FIS-11-F1',
                'tingkat' => '11',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu memahami, menganalisis, dan menerapkan konsep serta hukum dasar fisika pada materi mekanika dan gelombang untuk menjelaskan fenomena alam secara kuantitatif dan kualitatif dengan menggunakan penalaran ilmiah.',      
                'status' => 'aktif'
            ],
            [
                // 16
                // 'kurikulum_id' => 3, // MERDEKA
                // 'mata_pelajaran_id' => 11, // Fisika (11)
                'kurikulum_mata_pelajaran_id' => 32,
                'judul_kompetensi' => 'Penerapan Metode Ilmiah dan Analisis Eksperimen',
                'jenis' => 'CP',                
                'kode' => 'CP-FIS-11-F2',
                'tingkat' => '11',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu menerapkan metode ilmiah melalui kegiatan eksperimen fisika, mengolah dan menganalisis data hasil percobaan, serta mengomunikasikan hasilnya secara logis dan bertanggung jawab.',
                'status' => 'aktif'
            ],

            // Fisika (F) (12)
            [
                // 17
                // 'kurikulum_id' => 3, // MERDEKA
                // 'mata_pelajaran_id' => 11, // Fisika (12)
                'kurikulum_mata_pelajaran_id' => 36,
                'judul_kompetensi' => 'Analisis Fenomena Fisika Lanjutan',
                'jenis' => 'CP',                
                'kode' => 'CP-FIS-12-F1',
                'tingkat' => '12',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu menganalisis, mengevaluasi, dan membandingkan isi, struktur, serta nilai-nilai dalam berbagai teks sastra dan nonfiksi, serta mengaitkannya dengan konteks sosial dan budaya secara kritis dan reflektif.',      
                'status' => 'aktif'
            ],
            [
                // 18
                // 'kurikulum_id' => 3, // MERDEKA
                // 'mata_pelajaran_id' => 11, // Fisika (12)
                'kurikulum_mata_pelajaran_id' => 36,
                'judul_kompetensi' => 'Pemodelan, Eksperimen, dan Aplikasi Fisika',
                'jenis' => 'CP',                
                'kode' => 'CP-FIS-12-F2',
                'tingkat' => '12',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu mengemukakan pendapat, argumen, dan tanggapan secara lisan dan tulis dengan bahasa yang santun, logis, dan persuasif, serta menggunakan sumber informasi yang relevan dan dapat dipercaya.',
                'status' => 'aktif'
            ],


            // Sosial (F)
            // Ekonomi (F) (11)
            [
                // 19
                // 'kurikulum_id' => 3, // MERDEKA
                // 'mata_pelajaran_id' => 15, // Ekonomi (11)
                'kurikulum_mata_pelajaran_id' => 40,
                'judul_kompetensi' => 'Pemahaman Konsep Dasar Ekonomi dan Permasalahan Ekonomi',
                'jenis' => 'CP',                
                'kode' => 'CP-EKN-11-F1',
                'tingkat' => '11',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu memahami konsep kelangkaan, kebutuhan manusia, pilihan, biaya peluang, serta permasalahan ekonomi yang dihadapi individu, rumah tangga, dan masyarakat dalam kegiatan ekonomi sehari-hari.',      
                'status' => 'aktif'
            ],
            [
                // 20
                // 'kurikulum_id' => 3, // MERDEKA
                // 'mata_pelajaran_id' => 15, // Ekonomi (11)
                'kurikulum_mata_pelajaran_id' => 40,
                'judul_kompetensi' => 'Analisis Kegiatan dan Pelaku Ekonomi dalam Sistem Perekonomian',
                'jenis' => 'CP',                
                'kode' => 'CP-EKN-11-F2',
                'tingkat' => '11',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu menganalisis peran pelaku ekonomi (rumah tangga, perusahaan, pemerintah, dan masyarakat luar negeri) serta interaksinya dalam kegiatan produksi, distribusi, dan konsumsi.',
                'status' => 'aktif'
            ],

            // Ekonomi (F) (12)
            [
                // 21
                // 'kurikulum_id' => 3, // MERDEKA
                // 'mata_pelajaran_id' => 15, // Ekonomi (12)
                'kurikulum_mata_pelajaran_id' => 45,
                'judul_kompetensi' => 'Ekonomi Makro dan Kebijakan Pemerintah',
                'jenis' => 'CP',                
                'kode' => 'CP-EKN-12-F1',
                'tingkat' => '12',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu memahami konsep ekonomi makro seperti pendapatan nasional, inflasi, pengangguran, serta menganalisis peran pemerintah melalui kebijakan fiskal dan moneter dalam menjaga stabilitas ekonomi.',      
                'status' => 'aktif'
            ],
            [
                // 22
                // 'kurikulum_id' => 3, // MERDEKA
                // 'mata_pelajaran_id' => 15, // Ekonomi (12)
                'kurikulum_mata_pelajaran_id' => 45,
                'judul_kompetensi' => 'Analisis Pembangunan Ekonomi dan Tantangan Global',
                'jenis' => 'CP',                
                'kode' => 'CP-EKN-12-F2',
                'tingkat' => '12',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu menganalisis konsep pembangunan ekonomi, indikator keberhasilan pembangunan, serta dampak globalisasi dan perdagangan internasional terhadap perekonomian nasional.',
                'status' => 'aktif'
            ],


            // Bahasa (F)
            // Jepang (F) (11)
            [
                // 23
                // 'kurikulum_id' => 3, // MERDEKA
                // 'mata_pelajaran_id' => 20, // Jepang (11)
                'kurikulum_mata_pelajaran_id' => 50,
                'judul_kompetensi' => 'Pemahaman Dasar Bahasa Jepang dalam Konteks Kehidupan Sehari-hari',
                'jenis' => 'CP',                
                'kode' => 'CP-JPN-11-F1',
                'tingkat' => '11',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu memahami dan menggunakan ungkapan dasar Bahasa Jepang untuk memperkenalkan diri, menyampaikan informasi sederhana, serta berinteraksi dalam situasi sehari-hari dengan memperhatikan unsur kebahasaan dan budaya.',      
                'status' => 'aktif'
            ],
            [
                // 24
                // 'kurikulum_id' => 3, // MERDEKA
                // 'mata_pelajaran_id' => 20, // Jepang (11)
                'kurikulum_mata_pelajaran_id' => 50,
                'judul_kompetensi' => 'Pemahaman Struktur Bahasa Jepang dan Budaya dalam Konteks Sederhana',
                'jenis' => 'CP',                
                'kode' => 'CP-JPN-11-F2',
                'tingkat' => '11',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu memahami penggunaan kosakata, tata bahasa dasar, serta mengenal unsur budaya Jepang yang berkaitan dengan penggunaan bahasa dalam komunikasi sederhana.',
                'status' => 'aktif'
            ],

            // Jepang (F) (12)
            [
                // 25
                // 'kurikulum_id' => 3, // MERDEKA
                // 'mata_pelajaran_id' => 16, // Jepang (12)
                'kurikulum_mata_pelajaran_id' => 56,
                'judul_kompetensi' => 'Penggunaan Bahasa Jepang untuk Komunikasi Fungsional',
                'jenis' => 'CP',                
                'kode' => 'CP-JPN-12-F1',
                'tingkat' => '12',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu menggunakan Bahasa Jepang untuk menyampaikan pendapat, pengalaman, dan rencana sederhana baik secara lisan maupun tulisan dengan memperhatikan struktur bahasa dan konteks budaya.',      
                'status' => 'aktif'
            ],
            [
                // 26
                // 'kurikulum_id' => 3, // MERDEKA
                // 'mata_pelajaran_id' => 16, // Jepang (12)
                'kurikulum_mata_pelajaran_id' => 56,
                'judul_kompetensi' => 'Pemahaman Teks Sederhana dan Budaya Jepang dalam Konteks Global',
                'jenis' => 'CP',                
                'kode' => 'CP-JPN-12-F2',
                'tingkat' => '12',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu memahami teks sederhana Bahasa Jepang serta menganalisis informasi budaya Jepang dan keterkaitannya dengan kehidupan global dan interaksi antarbudaya.',
                'status' => 'aktif'
            ],
        ]);

        // 🎯✅ spa/tu
        AtpMaster::insert([
            // MTK (E) (10)
            [
                // 1
                'kompetensi_id' => 3, // Ganjil || Aljabar dan Bilangan real
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Memahami sifat-sifat bilangan real dan operasinya.',
                'status' => 'arsip'
            ],
            [
                // 2
                'kompetensi_id' => 3,
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menyusun dan menyederhanakan bentuk aljabar.',
                'status' => 'arsip'
            ],
            [
                // 3
                'kompetensi_id' => 3,
                'urutan' => 3,
                'tujuan_pembelajaran' => 'Menyelesaikan persamaan dan pertidaksamaan linear satu variabel.',
                'status' => 'aktif'
            ],            
            [
                // 4
                'kompetensi_id' => 4, // Genap || Respresentasi dan Komunikasi Matematis                 
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Memahami konsep relasi dan fungsi.',
                'status' => 'aktif'
            ],
            [
                // 5
                'kompetensi_id' => 4,
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menentukan domain, kodomain, dan range suatu fungsi.',
                'status' => 'aktif'
            ],
            [
                // 6
                'kompetensi_id' => 4,
                'urutan' => 3,
                'tujuan_pembelajaran' => 'Menyajikan fungsi dalam bentuk tabel, grafik, dan persamaan.',
                'status' => 'aktif'
            ],            

            // MTK (F) (11)
            [
                // 7
                'kompetensi_id' => 5, // Ganjil || Fungsi & Trigonometri
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Memahami perbandingan trigonometri pada segitiga siku-siku.',
                'status' => 'aktif'
            ],
            [
                // 8
                'kompetensi_id' => 5,                
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menentukan nilai fungsi trigonometri sudut istimewa.',
                'status' => 'aktif'
            ],
            [
                // 9
                'kompetensi_id' => 5,    
                'urutan' => 3,
                'tujuan_pembelajaran' => 'Menyelesaikan persamaan trigonometri sederhana.',
                'status' => 'aktif'
            ],            
            [
                // 10
                'kompetensi_id' => 6, // Genap || Penalaran dan Pemecahan Masalah Matematis          
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Memahami konsep, jenis, dan notasi matriks.',
                'status' => 'aktif'
            ],
            [
                // 11
                'kompetensi_id' => 6,    
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Melakukan operasi dasar pada matriks.',
                'status' => 'aktif'
            ],
            [
                // 12
                'kompetensi_id' => 6,                
                'urutan' => 3,
                'tujuan_pembelajaran' => 'Menentukan determinan dan invers matriks ordo 2x2.',
                'status' => 'aktif'
            ],            

            // MTK (F) (12)
            [
                // 13
                'kompetensi_id' => 7, // Ganjil || Penerapan Kalkulus dalam Pemecahan Masalah
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Memahami konsep limit fungsi aljabar.',
                'status' => 'aktif'
            ],
            [
                // 14
                'kompetensi_id' => 7,                
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menentukan nilai limit secara analitik.',
                'status' => 'aktif'
            ],
            [
                // 15
                'kompetensi_id' => 7,    
                'urutan' => 3,
                'tujuan_pembelajaran' => 'Memahami konsep turunan sebagai laju perubahan.',
                'status' => 'aktif'
            ],                 
            [
                // 16
                'kompetensi_id' => 8, // Genap || Data dan Peluang  
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Memahami konsep ruang sampel dan kejadian.',
                'status' => 'aktif'
            ],
            [
                // 17
                'kompetensi_id' => 8,    
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menentukan peluang suatu kejadian.',
                'status' => 'aktif'
            ],
            [
                // 18
                'kompetensi_id' => 8,                
                'urutan' => 3,
                'tujuan_pembelajaran' => 'Menerapkan aturan penjumlahan dan perkalian peluang.',
                'status' => 'aktif'
            ],           



            // Bahasa Indonesia (E) (10)
            [
                // 19
                'kompetensi_id' => 9, // Ganjil || Analisis Teks Informasi
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Mengidentifikasi tujuan dan informasi penting dalam teks informasi.',
                'status' => 'aktif'
            ],
            [
                // 20
                'kompetensi_id' => 9,                
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menganalisis struktur dan unsur kebahasaan teks informasi.',
                'status' => 'aktif'
            ],
            [
                // 21
                'kompetensi_id' => 10, // Genap || Produksi teks informatif dan produktif
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Memahami ciri dan struktur teks laporan hasil observasi.',
                'status' => 'aktif'
            ],
            [
                // 22
                'kompetensi_id' => 10,                
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Mengumpulkan data dari hasil pengamatan.',
                'status' => 'aktif'
            ],            

            // Bahasa Indonesia (F) (11)
            [
                // 23
                'kompetensi_id' => 11, // Ganjil || Analisis Teks Sastra
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Mengidentifikasi unsur dan karakteristik teks sastra dan nonfiksi.',
                'status' => 'aktif'
            ],
            [
                // 24
                'kompetensi_id' => 11,    
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menganalisis struktur, isi, dan nilai dalam teks.',
                'status' => 'aktif'
            ],
            [
                // 25
                'kompetensi_id' => 12, // Genap || Keterampilan Argumentasi
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Mengidentifikasi ciri dan tujuan teks argumentasi.',
                'status' => 'aktif'
            ],
            [
                // 26
                'kompetensi_id' => 12,
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menganalisis penggunaan fakta dan opini dalam teks argumentasi.',
                'status' => 'aktif'
            ],

            // Indonesia (F) (12)
            [
                // 27
                'kompetensi_id' => 13, // Ganjil || Kreasi Teks Sastra
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Menganalisis unsur pembangun teks sastra modern.',
                'status' => 'aktif'
            ],
            [
                // 28
                'kompetensi_id' => 13,    
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Mengapresiasi nilai estetika dan pesan dalam teks sastra.',
                'status' => 'aktif'
            ],
            [
                // 29
                'kompetensi_id' => 14, // Genap || Komunikasi Akademik dan Publik
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Mengidentifikasi ciri dan sistematika komunikasi akademik.',
                'status' => 'aktif'
            ],
            [
                // 30
                'kompetensi_id' => 14,
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Merumuskan topik dan tujuan penyampaian gagasan.',
                'status' => 'aktif'
            ],



            // Fisika (F)
            // Fisika (F) (11)
             [
                // 31
                'kompetensi_id' => 15, // Ganjil || Pemahaman Konsep dan Hukum Dasar Fisika
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Menganalisis besaran fisis pada gerak lurus dan gerak melingkar.',
                'status' => 'aktif'
            ],
            [
                // 32
                'kompetensi_id' => 15,
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menjelaskan konsep usaha, energi kinetik, dan energi potensial.',
                'status' => 'aktif'
            ],
            [
                // 33
                'kompetensi_id' => 16, // Genap || Penerapan Metode Ilmiah dan Analisis Eksperimen
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Mengidentifikasi karakteristik gelombang mekanik.',
                'status' => 'aktif'
            ],
            [
                // 34
                'kompetensi_id' => 16,
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Merancang percobaan fisika sederhana sesuai tujuan.',
                'status' => 'aktif'
            ],

            // Fisika (F) (12)
            [
                // 35
                'kompetensi_id' => 17, // Ganjil || Analisis Fenomena Fisika Lanjutan                 
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Menjelaskan konsep arus, tegangan, dan hambatan listrik.',
                'status' => 'aktif'
            ],
            [
                // 36
                'kompetensi_id' => 17,
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Mengidentifikasi konsep medan magnet dan gaya Lorentz.',
                'status' => 'aktif'
            ],
            [
                // 37
                'kompetensi_id' => 18, // Genap || Pemodel, Eksperimen dan Aplikasi Fisika
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Menjelaskan karakteristik gelombang elektromagnetik.',
                'status' => 'aktif'
            ],
            [
                // 38
                'kompetensi_id' => 18,
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Merancang proyek atau eksperimen fisika berbasis masalah.',
                'status' => 'aktif'
            ],



            // Ekonomi (F)
            // Ekonomi (F) (11)
            [
                // 39
                'kompetensi_id' => 19, // Ganjil || Konsep dasar ekonomi & permasalahannya
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Menganalisis konsep kelangkaan dan kebutuhan manusia dalam kehidupan sehari-hari.',
                'status' => 'aktif'
            ],
            [
                // 40
                'kompetensi_id' => 19,
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menjelaskan konsep pilihan dan biaya peluang dalam pengambilan keputusan ekonomi.',
                'status' => 'aktif'
            ],
            [
                // 41
                'kompetensi_id' => 20, // Genap || Analisis kegiatan dan pelaku ekonomi
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Mengidentifikasi peran pelaku ekonomi dalam kegiatan produksi, distribusi, dan konsumsi.',
                'status' => 'aktif'
            ],
            [
                // 42
                'kompetensi_id' => 20,
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menganalisis interaksi antar pelaku ekonomi dalam sistem perekonomian sederhana.',
                'status' => 'aktif'
            ],

            // Ekonomi (F) (12)
            [
                // 43
                'kompetensi_id' => 21, // Ganjil || Ekonomi Makro dan Kebijakan Pemerintah     
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Menjelaskan konsep pendapatan nasional, inflasi, dan pengangguran.',
                'status' => 'aktif'
            ],
            [
                // 44
                'kompetensi_id' => 21,
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menganalisis peran kebijakan fiskal dan moneter dalam mengatasi permasalahan ekonomi.',
                'status' => 'aktif'
            ],
            [
                // 45
                'kompetensi_id' => 22, // Genap || Analisis Pembangunan Ekonomi dan Tantangan Global
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Menganalisis indikator dan tujuan pembangunan ekonomi.',
                'status' => 'aktif'
            ],
            [
                // 46
                'kompetensi_id' => 22,
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Mengevaluasi dampak globalisasi dan perdagangan internasional terhadap perekonomian Indonesia.',
                'status' => 'aktif'
            ],



            // Bahasa (F)
            // B. Jepang (F) (11)
            [
                // 47
                'kompetensi_id' => 23, // Ganjil || Pemahaman Dasar Bahasa Jepang
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Memahami dan menggunakan ungkapan perkenalan diri, salam, dan identitas pribadi dalam Bahasa Jepang secara lisan dan tulisan.',
                'status' => 'aktif'
            ],
            [
                // 48
                'kompetensi_id' => 23,                
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menggunakan kosakata dan pola kalimat sederhana untuk menyampaikan informasi tentang aktivitas sehari-hari.',
                'status' => 'aktif'
            ],
            [
                // 49
                'kompetensi_id' => 24, // Genap || Pemahaman Struktur Bahasa Jepang
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Menggunakan pola kalimat dasar Bahasa Jepang (partikel, kata kerja dasar) dalam kalimat sederhana.',
                'status' => 'aktif'
            ],
            [
                // 50
                'kompetensi_id' => 24,                
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Mengidentifikasi unsur budaya Jepang yang berkaitan dengan kebiasaan berkomunikasi dan kehidupan sehari-hari.',
                'status' => 'aktif'
            ],     

            // B. Jepang (F) (12)
            [
                // 47
                'kompetensi_id' => 25, // Ganjil || Penggunaan Bahasa Jepang untuk Komunikasi Fungsional
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Mengungkapkan pengalaman dan rencana sederhana menggunakan pola kalimat Bahasa Jepang yang sesuai.',
                'status' => 'aktif'
            ],
            [
                // 48
                'kompetensi_id' => 25,                
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Melakukan percakapan sederhana terkait kegiatan sekolah dan kehidupan sehari-hari dengan lafal dan intonasi yang tepat.',
                'status' => 'aktif'
            ],
            [
                // 49
                'kompetensi_id' => 26, // Genap || Pemahaman teks sederhana
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Memahami isi teks sederhana (dialog, pengumuman, deskripsi singkat) dalam Bahasa Jepang.',
                'status' => 'aktif'
            ],
            [
                // 50
                'kompetensi_id' => 26,                
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menganalisis nilai budaya Jepang yang tercermin dalam teks dan praktik komunikasi sehari-hari.',
                'status' => 'aktif'
            ],            
        ]);

        // guru (tiap awal tahun akademik/ganjil)
        /**
         * 🎯✅ spa: Index, Show, Diterima, Ditolak
         */
        AlurTujuanPembelajaran::insert([  
            //   MTK (E) (10)
            [
                // 1
                'atp_master_id' => 1,
                'guru_id' => 9, // Guru MTK
                'tahun_akademik_id' => 1, // 2013/2024
                'semester_id' => 2, // Ganjil                
                'approval_status' => 'disetujui',
                'approved_by' => 1,
                'approved_at' => '2026-01-14 21:35:51',
                'catatan_penolakan' => null,
                'is_locked' => true,                
            ],            
            [
                // 2
                'atp_master_id' => 2,
                'guru_id' => 9, // Guru MTK
                'tahun_akademik_id' => 1,
                'semester_id' => 2, // Ganjil                
                'approval_status' => 'disetujui',
                'approved_by' => 1,
                'approved_at' => '2026-01-14 21:35:51',
                'catatan_penolakan' => null,
                'is_locked' => true,                
            ],
            [
                // 3
                'atp_master_id' => 3,
                'guru_id' => 9, // Guru MTK
                'tahun_akademik_id' => 1,
                'semester_id' => 2, // Genap
                'approval_status' => 'disetujui',
                'approved_by' => 1,
                'approved_at' => '2026-01-14 21:35:51',
                'catatan_penolakan' => null,
                'is_locked' => true,                
            ],
            [
                // 4
                'atp_master_id' => 4,
                'guru_id' => 9,
                'tahun_akademik_id' => 1,
                'semester_id' => 2,  
                'approval_status' => 'diajukan',
                'approved_by' => null,
                'approved_at' => null,
                'catatan_penolakan' => null,
                'is_locked' => false,                
            ],    
            [
                // 6
                'atp_master_id' => 5,
                'guru_id' => 9,
                'tahun_akademik_id' => 1,
                'semester_id' => 2,   
                'approval_status' => 'ditolak',
                'approved_by' => 1,
                'approved_at' => '2026-01-14 21:35:51',
                'catatan_penolakan' => 'ATP master terlalu banyak',
                'is_locked' => false,                
            ],
            [
                // 7
                'atp_master_id' => 6,
                'guru_id' => 9,
                'tahun_akademik_id' => 1,
                'semester_id' => 2,   
                'approval_status' => 'diajukan',
                'approved_by' => null,
                'approved_at' => null,
                'catatan_penolakan' => null,
                'is_locked' => false,                
            ],         
            
            // --------------------

            [
                // 2
                'atp_master_id' => 23,
                'guru_id' => 7, // Guru Indon
                'tahun_akademik_id' => 2,
                'semester_id' => 3, // Ganjil
                'approval_status' => 'disetujui',
                'approved_by' => 1,
                'approved_at' => '2026-01-14 21:35:51',
                'catatan_penolakan' => null,
                'is_locked' => true,                
            ],
            [
                // 3
                'atp_master_id' => 24,
                'guru_id' => 7, // Guru Indon
                'tahun_akademik_id' => 2,
                'semester_id' => 3,   
                'approval_status' => 'disetujui',
                'approved_by' => 1,
                'approved_at' => '2026-01-14 21:35:51',
                'catatan_penolakan' => null,
                'is_locked' => true,                
            ],
            [
                // 4
                'atp_master_id' => 25,
                'guru_id' => 7,
                'tahun_akademik_id' => 2,
                'semester_id' => 4, // Genap
                'approval_status' => 'diajukan',
                'approved_by' => null,
                'approved_at' => null,
                'catatan_penolakan' => null,
                'is_locked' => false,                
            ],    
            [
                // 6
                'atp_master_id' => 26,
                'guru_id' => 7,
                'tahun_akademik_id' => 2,
                'semester_id' => 4,   
                'approval_status' => 'ditolak',
                'approved_by' => 1,
                'approved_at' => '2026-01-14 21:35:51',
                'catatan_penolakan' => 'ATP master terlalu banyak',
                'is_locked' => false,                
            ],
        ]);        

        // modul_ajar

        // asesmen

        /**
         * 🎯✅ spa: C.R.U.D    
         */
        Rombel::insert([
            // X-1
            [
                // 1
                'kelas_id' => 1, // X                
                'nama_rombel' => 'X-A-1',
                'jurusan_id' => 1,
                'status' => 'aktif',
            ],
            [
                // 2
                'kelas_id' => 1, // X                
                'nama_rombel' => 'X-B-1',
                'jurusan_id' => 1,
                'status' => 'aktif',
            ],                    
            [
                // 3
                'kelas_id' => 1, // X                
                'nama_rombel' => 'X-C-1',
                'jurusan_id' => 1,
                'status' => 'aktif',
            ],           
            
            // XI-1
            [
                // 4
                'kelas_id' => 2, // XI                
                'nama_rombel' => 'XI-A-1',
                'jurusan_id' => 1,
                'status' => 'aktif',
            ],                        
            [
                // 5
                'kelas_id' => 2, // XI                
                'nama_rombel' => 'XI-B-1',
                'jurusan_id' => 1,
                'status' => 'aktif',
            ],                                     
            [
                // 6
                'kelas_id' => 2, // XI                
                'nama_rombel' => 'XI-C-1',
                'jurusan_id' => 1,
                'status' => 'aktif',
            ],                                     

            // XII-1
            [
                // 7
                'kelas_id' => 3, // XII                
                'nama_rombel' => 'XII-A-1',
                'jurusan_id' => 1,
                'status' => 'aktif',
            ],                        
            [
                // 8
                'kelas_id' => 3, // XII                
                'nama_rombel' => 'XII-B-1',
                'jurusan_id' => 1,
                'status' => 'aktif',
            ],                        
            [
                // 9
                'kelas_id' => 3, // XII                
                'nama_rombel' => 'XII-C-1',
                'jurusan_id' => 1,
                'status' => 'aktif',
            ],                        

            // IPS
            // X 2
            [
                // 10
                'kelas_id' => 1, // X                
                'nama_rombel' => 'X-A-2',
                'jurusan_id' => 2,
                'status' => 'aktif',
            ],
            [
                // 11
                'kelas_id' => 1, // X                
                'nama_rombel' => 'X-B-2',
                'jurusan_id' => 2,
                'status' => 'aktif',
            ],                    
            [
                // 12
                'kelas_id' => 1, // X                
                'nama_rombel' => 'X-C-2',
                'jurusan_id' => 2,
                'status' => 'aktif',
            ],                    
            
            // XI 2
            [
                // 13
                'kelas_id' => 2, // XI                
                'nama_rombel' => 'XI-A-2',
                'jurusan_id' => 2,
                'status' => 'aktif',
            ],                                    
            [
                // 14
                'kelas_id' => 2, // XI                
                'nama_rombel' => 'XI-B-2',
                'jurusan_id' => 2,
                'status' => 'aktif',
            ],                                    
            [
                // 15
                'kelas_id' => 2, // XI                
                'nama_rombel' => 'XI-C-2',
                'jurusan_id' => 2,
                'status' => 'aktif',
            ],                                    

            // XII IPS
            [
                // 16
                'kelas_id' => 3, // XII                
                'nama_rombel' => 'XII-A-2',
                'jurusan_id' => 2,
                'status' => 'aktif',
            ],                                    
            [
                // 17
                'kelas_id' => 3, // XII                
                'nama_rombel' => 'XII-B-2',
                'jurusan_id' => 2,
                'status' => 'aktif',
            ],                                    
            [
                // 18
                'kelas_id' => 3, // XII                
                'nama_rombel' => 'XII-C-2',
                'jurusan_id' => 2,
                'status' => 'aktif',
            ],                                    

            // X ARSIP
            [
                // 19
                'kelas_id' => 1, // X
                'nama_rombel' => 'X-A-IPA-ARSIP',
                'jurusan_id' => 1,
                'status' => 'arsip',
            ],                        
            [
                // 21
                'kelas_id' => 4,
                'nama_rombel' => 'XII-A-IPA-ARSIP',
                'jurusan_id' => 1,
                'status' => 'arsip',
            ],                        
        ]);

        // 🎯✅ spa        
        WaliRombel::insert([
            [
                // 1
                'wali_rombel_id' => 9, // Guru MTK
                'rombel_id' => 2, // X-B-1
                'tahun_akademik_id' => 1, // 2023
            ],
            [
                // 2
                'wali_rombel_id' => 7, // Guru Indon
                'rombel_id' => 5, // XI-B-1
                'tahun_akademik_id' => 2, // 2025
            ],

            [
                // 3
                'wali_rombel_id' => 7, // Guru Indon
                'rombel_id' => 1, // X-A-1
                'tahun_akademik_id' => 1, // 2013
            ],
            [
                // 4
                'wali_rombel_id' => 9, // Guru MTK
                'rombel_id' => 14, // XI-B-2
                'tahun_akademik_id' => 2, // 2025
            ],
            [
                // 5
                'wali_rombel_id' => 5, // Guru PAI
                'rombel_id' => 2, // X-B-1
                'tahun_akademik_id' => 2, // 2025
            ],

            [
                // 6
                'wali_rombel_id' => 5, // Guru PAI
                'rombel_id' => 10, // X-A-2
                'tahun_akademik_id' => 1, // 2023
            ],

            [
                // 7
                'wali_rombel_id' => 10, // Guru Sejarah
                'rombel_id' => 7, // XII-A-1
                'tahun_akademik_id' => 2, // 2024
            ],
             
        ]);


        // 🎯✅ spa: Create dan Delete
        SiswaRombel::insert([
            // XII (24/25)
            [
                // 1
                'siswa_id' => 8, // Devi
                'rombel_id' => 7, // XII-A-1
                'tahun_akademik_id' => 2, // 2024/2025
                'status_akhir' => 'lulus',
                'catatan' => 'Peserta sudah lulus'
            ],            

            // XI (24/25)
            [
                // 2
                'siswa_id' => 1, // Bagas
                'rombel_id' => 5, // XI-B-1
                'tahun_akademik_id' => 2, // 2024/2025
                'status_akhir' => 'berhenti',
                'catatan' => 'Siswa berhenti sekolah pada pertengahan tahun 2024'
            ],
            [
                // 3
                'siswa_id' => 2, // Winton
                'rombel_id' => 5, // XI-B-1
                'tahun_akademik_id' => 2, // 2024/2025
                'status_akhir' => 'pindah',
                'catatan' => 'Pindah ke jurusan IPA',
            ],   
            [
                // 4
                'siswa_id' => 4, // Rehan
                'rombel_id' => 13, // XI-A-2
                'tahun_akademik_id' => 2, // 2024/2025
                'status_akhir' => 'diberhentikan',
                'catatan' => 'Siswa terkena DO oleh pihak sekolah pada tahun 2024',
            ],   
            [
                // 5
                'siswa_id' => 5, // Yuli
                'rombel_id' => 14, // XI-B-2
                'tahun_akademik_id' => 2, // 2024/2025
                'status_akhir' => 'pindah',
                'catatan' => 'Siswa pindah sekolah pada semester genap tahun 2025'
            ],          
            [
                // 6
                'siswa_id' => 7, // Selma
                'rombel_id' => 14, // XI-B-2
                'tahun_akademik_id' => 2, // 2024/2025
                'status_akhir' => 'pindahan',
                'catatan' => 'Siswa bergabung pada semester genap tahun 2025'
            ],          
            
            // X (24/25)
            [
                // 7
                'siswa_id' => 3, // Sanita
                'rombel_id' => 2, // X-B-1
                'tahun_akademik_id' => 2, // 2024/2025
                'status_akhir' => null,
                'catatan' => null
            ],                       
            [
                // 8
                'siswa_id' => 6, // Danang
                'rombel_id' => 11, // X-B-2
                'tahun_akademik_id' => 2, // 2024/2025
                'status_akhir' => null,
                'catatan' => null
            ],                       
            
            // X 23/24
            [
                // 9
                'siswa_id' => 1, // Bagas
                'rombel_id' => 1, // X-A-1
                'tahun_akademik_id' => 1, // 2013/2024
                'status_akhir' => 'naik_kelas',
                'catatan' => 'Naik ke kelas XI'
            ],                      
            [
                // 10
                'siswa_id' => 2, // Winton
                'rombel_id' => 2, // X-B-1
                'tahun_akademik_id' => 1, // 2013/2024
                'status_akhir' => 'naik_kelas',
                'catatan' => 'Naik ke kelas XI'
            ],            
            [
                // 11
                'siswa_id' => 3, // Sanita
                'rombel_id' => 2, // X-B-1
                'tahun_akademik_id' => 1, // 2013/2024
                'status_akhir' => 'tinggal_kelas',
                'catatan' => 'Belum memenuhi syarat untuk naik ke kelas XI'
            ],                      
            [
                // 12
                'siswa_id' => 4, // Rehan
                'rombel_id' => 10, // X-A-2
                'tahun_akademik_id' => 1, // 2013/2024
                'status_akhir' => 'naik_kelas',
                'catatan' => 'Naik ke kelas XI',
            ],              
            [
                // 13
                'siswa_id' => 5, // Yuli
                'rombel_id' => 10, // X-A-2
                'tahun_akademik_id' => 1, // 2013/2024
                'status_akhir' => 'naik_kelas',
                'catatan' => 'Naik ke kelas XI',
            ],              
            [
                // 14
                'siswa_id' => 6, // Danang
                'rombel_id' => 11, // X-B-2
                'tahun_akademik_id' => 1, // 2013/2024
                'status_akhir' => 'tinggal_kelas',
                'catatan' => 'Belum memenuhi syarat untuk naik ke kelas XI'
            ],
        ]);

        /** 
         * 🎯✅ spa: C.R.U.D
         * tu: GET, SHOW
         * guru: GET/SHOW
         * Kepsek: GET, SHOW
         * */ 
        JadwalPelajaran::insert([            
            // X-B-1
            // Ganjil
            [
                // 1
                'kurikulum_mata_pelajaran_id' => 6, // K13 - MTK
                'tahun_akademik_id' => 1, // 2023/2024
                'semester_id' => 1, // Ganjil
                'hari' => 'Senin',
                'guru_id' => 9, // Guru MTK
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '07:30',
                'jam_selesai' => '08:30',
                'ruangan_id' => 2,
                'link_opsional' => '',              
            ],        
            [
                // 2
                'kurikulum_mata_pelajaran_id' => 4, // K13 - Indo
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'hari' => 'Senin',
                'guru_id' => 7, // Guru Indo
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 2,
                'link_opsional' => '',              
            ],        
            [
                // 3
                'kurikulum_mata_pelajaran_id' => 2, // K13 - PAI
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'hari' => 'Selasa',
                'guru_id' => 5, // Guru PAI
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '07:00',
                'jam_selesai' => '08:30',
                'ruangan_id' => 2,
                'link_opsional' => '',              
            ],        
            [
                // 4
                'kurikulum_mata_pelajaran_id' => 3, // K13 - PPKn
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'hari' => 'Selasa',
                'guru_id' => 6, // Guru PPKn
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 2,
                'link_opsional' => '',              
            ],                    
            [
                // 5
                'kurikulum_mata_pelajaran_id' => 5, // merdeka - Inggris
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'hari' => 'Rabu',
                'guru_id' => 8, // Guru Inggris
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '07:30',
                'jam_selesai' => '08:30',
                'ruangan_id' => 1,                
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 6
                'kurikulum_mata_pelajaran_id' => 10, // merdeka - Informatika
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'hari' => 'Rabu',
                'guru_id' => 13, // Guru Informatika
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 7
                'kurikulum_mata_pelajaran_id' => 7, // merdeka - Sejarah
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'hari' => 'Kamis',
                'guru_id' => 10, // Guru Sejarah
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '07:30',
                'jam_selesai' => '08:30',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com', 
            ],    
            [
                // 8
                'kurikulum_mata_pelajaran_id' => 9, // merdeka - Seni Budaya
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'hari' => 'Kamis',
                'guru_id' => 12, // Guru Senbud
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 1,                
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 9
                'kurikulum_mata_pelajaran_id' => 8, // merdeka - PJOK
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'hari' => 'Jumat',
                'guru_id' => 11, // Guru PJOK
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '07:30',
                'jam_selesai' => '08:30',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 10
                'kurikulum_mata_pelajaran_id' => 11, // merdeka - Projek P5
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'hari' => 'Jumat',
                'guru_id' => 15, // Guru P5
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com', 
            ],                                                               

            // Genap
            [
                // 11
                'kurikulum_mata_pelajaran_id' => 6, // K13 - MTK
                'tahun_akademik_id' => 1, // 2024/2025
                'semester_id' => 2, // Genap
                'hari' => 'Senin',
                'guru_id' => 9, // Guru MTK
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '07:30',
                'jam_selesai' => '08:30',
                'ruangan_id' => 2,
                'link_opsional' => '',              
            ],        
            [
                // 12
                'kurikulum_mata_pelajaran_id' => 4, // K13 - Indo
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'hari' => 'Senin',
                'guru_id' => 7, // Guru Indo
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 2,
                'link_opsional' => '',              
            ],        
            [
                // 13
                'kurikulum_mata_pelajaran_id' => 2, // K13 - PAI
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'hari' => 'Selasa',
                'guru_id' => 5, // Guru PAI
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '07:00',
                'jam_selesai' => '08:30',
                'ruangan_id' => 2,
                'link_opsional' => '',              
            ],        
            [
                // 14
                'kurikulum_mata_pelajaran_id' => 3, // K13 - PPKn
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'hari' => 'Selasa',
                'guru_id' => 6, // Guru PPKn
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 2,
                'link_opsional' => '',              
            ],                    
            [
                // 15
                'kurikulum_mata_pelajaran_id' => 5, // merdeka - Inggris
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'hari' => 'Rabu',
                'guru_id' => 8, // Guru Inggris
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '07:30',
                'jam_selesai' => '08:30',
                'ruangan_id' => 1,                
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 16
                'kurikulum_mata_pelajaran_id' => 10, // merdeka - Informatika
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'hari' => 'Rabu',
                'guru_id' => 13, // Guru Informatika
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 17
                'kurikulum_mata_pelajaran_id' => 7, // merdeka - Sejarah
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'hari' => 'Kamis',
                'guru_id' => 10, // Guru Sejarah
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '07:30',
                'jam_selesai' => '08:30',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com', 
            ],    
            [
                // 18
                'kurikulum_mata_pelajaran_id' => 9, // merdeka - Seni Budaya
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'hari' => 'Kamis',
                'guru_id' => 12, // Guru Senbud
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 1,                
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 19
                'kurikulum_mata_pelajaran_id' => 8, // merdeka - PJOK
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'hari' => 'Jumat',
                'guru_id' => 11, // Guru PJOK
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '07:30',
                'jam_selesai' => '08:30',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 20
                'kurikulum_mata_pelajaran_id' => 11, // merdeka - Projek P5
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'hari' => 'Jumat',
                'guru_id' => 15, // Guru P5
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com', 
            ],     


            // X-B-1 (2024/2025)
            // Ganjil
            [
                // 21
                'kurikulum_mata_pelajaran_id' => 6, // K13 - MTK
                'tahun_akademik_id' => 2, // 2024/2025
                'semester_id' => 3, // Ganjil
                'hari' => 'Minggu',
                'guru_id' => 9, // Guru MTK
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '07:30',
                'jam_selesai' => '08:30',
                'ruangan_id' => 2,
                'link_opsional' => '',              
            ],        
            [
                // 22
                'kurikulum_mata_pelajaran_id' => 6, // K13 - MTK
                'tahun_akademik_id' => 2, // 2024/2025
                'semester_id' => 3, // Ganjil
                'hari' => 'Rabu',
                'guru_id' => 9, // Guru MTK
                'rombel_id' => 3, // X-C-1
                'jam_mulai' => '15:30',
                'jam_selesai' => '17:30',
                'ruangan_id' => 2,
                'link_opsional' => '',              
            ],        
            [
                // 23
                'kurikulum_mata_pelajaran_id' => 4, // K13 - Indo
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'hari' => 'Sabtu',
                'guru_id' => 7, // Guru Indo
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 2,
                'link_opsional' => '',              
            ],                    

            // Genap
            [
                // 24
                'kurikulum_mata_pelajaran_id' => 7, // merdeka - Sejarah
                'tahun_akademik_id' => 2,
                'semester_id' => 4,
                'hari' => 'Minggu',
                'guru_id' => 10, // Guru Sejarah
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '07:30',
                'jam_selesai' => '08:30',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com', 
            ],                
            [
                // 25
                'kurikulum_mata_pelajaran_id' => 8, // merdeka - PJOK
                'tahun_akademik_id' => 2,
                'semester_id' => 4,
                'hari' => 'Minggu',
                'guru_id' => 11, // Guru PJOK
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '09:00',
                'jam_selesai' => '10:30',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com',                
            ],            


            // XI-B-1
            // Ganjil
            // [
            //     // 21
            //     'kurikulum_mata_pelajaran_id' => 16, // K13 - MTK
            //     'tahun_akademik_id' => 2, // 2024/2025
            //     'semester_id' => 3, // Ganjil
            //     'hari' => 'Senin',
            //     'guru_id' => 9, // Guru MTK
            //     'rombel_id' => 5, // XI-B-1
            //     'jam_mulai' => '07:30',
            //     'jam_selesai' => '08:30',
            //     'ruangan_id' => 2,
            //     'link_opsional' => '',              
            // ],        
            // [
            //     // 22
            //     'kurikulum_mata_pelajaran_id' => 14, // K13 - Indo
            //     'tahun_akademik_id' => 2,
            //     'semester_id' => 3,
            //     'hari' => 'Senin',
            //     'guru_id' => 7, // Guru Indo
            //     'rombel_id' => 5, // XI-B-1
            //     'jam_mulai' => '08:30',
            //     'jam_selesai' => '10:00',
            //     'ruangan_id' => 2,
            //     'link_opsional' => '',              
            // ],        
            // [
            //     // 23
            //     'kurikulum_mata_pelajaran_id' => 12, // K13 - PAI
            //     'tahun_akademik_id' => 2,
            //     'semester_id' => 3,
            //     'hari' => 'Selasa',
            //     'guru_id' => 5, // Guru PAI
            //     'rombel_id' => 5, // XI-B-1
            //     'jam_mulai' => '07:00',
            //     'jam_selesai' => '08:30',
            //     'ruangan_id' => 2,
            //     'link_opsional' => '',              
            // ],        
            // [
            //     // 24
            //     'kurikulum_mata_pelajaran_id' => 13, // K13 - PPKn
            //     'tahun_akademik_id' => 2,
            //     'semester_id' => 3,
            //     'hari' => 'Selasa',
            //     'guru_id' => 6, // Guru PPKn
            //     'rombel_id' => 5, // XI-B-1
            //     'jam_mulai' => '08:30',
            //     'jam_selesai' => '10:00',
            //     'ruangan_id' => 2,
            //     'link_opsional' => '',              
            // ],                    
            // [
            //     // 25
            //     'kurikulum_mata_pelajaran_id' => 15, // merdeka - Inggris
            //     'tahun_akademik_id' => 2,
            //     'semester_id' => 3,
            //     'hari' => 'Rabu',
            //     'guru_id' => 8, // Guru Inggris
            //     'rombel_id' => 5, // XI-B-1
            //     'jam_mulai' => '07:30',
            //     'jam_selesai' => '08:30',
            //     'ruangan_id' => 1,                
            //     'link_opsional' => 'www.youtube.com',                
            // ],
            // [
            //     // 26
            //     'kurikulum_mata_pelajaran_id' => 20, // merdeka - Informatika
            //     'tahun_akademik_id' => 2,
            //     'semester_id' => 3,
            //     'hari' => 'Rabu',
            //     'guru_id' => 13, // Guru Informatika
            //     'rombel_id' => 5, // XI-B-1
            //     'jam_mulai' => '08:30',
            //     'jam_selesai' => '10:00',
            //     'ruangan_id' => 2,
            //     'link_opsional' => 'www.youtube.com',                
            // ],
            // [
            //     // 27
            //     'kurikulum_mata_pelajaran_id' => 17, // merdeka - Sejarah
            //     'tahun_akademik_id' => 2,
            //     'semester_id' => 3,
            //     'hari' => 'Kamis',
            //     'guru_id' => 10, // Guru Sejarah
            //     'rombel_id' => 5, // XI-B-1
            //     'jam_mulai' => '07:30',
            //     'jam_selesai' => '08:30',
            //     'ruangan_id' => 2,
            //     'link_opsional' => 'www.youtube.com', 
            // ],    
            [
                // 26
                'kurikulum_mata_pelajaran_id' => 9, // merdeka - Seni Budaya
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'hari' => 'Minggu',
                'guru_id' => 12, // Guru Senbud
                'rombel_id' => 5, // XI-B-1
                'jam_mulai' => '01:00',
                'jam_selesai' => '15:00',
                'ruangan_id' => 1,                
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 27
                'kurikulum_mata_pelajaran_id' => 32, // Fisika
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'hari' => 'Kamis',
                'guru_id' => 16, // Guru Fisika
                'rombel_id' => 5, // XI-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 1,                
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 28
                'kurikulum_mata_pelajaran_id' => 50, // Bahasa Jepang
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'hari' => 'Jumat',
                'guru_id' => 20, // Guru Jepang
                'rombel_id' => 5, // XI-B-1
                'jam_mulai' => '07:30',
                'jam_selesai' => '08:30',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 29
                'kurikulum_mata_pelajaran_id' => 54, // Bahasa Jerman
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'hari' => 'Jumat',
                'guru_id' => 21, // Guru Jerman
                'rombel_id' => 5, // XI-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com', 
            ],             
            [
                // 30
                'kurikulum_mata_pelajaran_id' => 6, // K13 - MTK
                'tahun_akademik_id' => 1, // 2023/2024
                'semester_id' => 1, // Ganjil
                'hari' => 'Selasa',
                'guru_id' => 9, // Guru MTK
                'rombel_id' => 5, // XI-B-1
                'jam_mulai' => '10:30',
                'jam_selesai' => '12:30',
                'ruangan_id' => 1,
                'link_opsional' => '',              
            ],              
            [
                // 1
                'kurikulum_mata_pelajaran_id' => 6, // K13 - MTK
                'tahun_akademik_id' => 1, // 2023/2024
                'semester_id' => 1, // Ganjil
                'hari' => 'Minggu',
                'guru_id' => 9, // Guru MTK
                'rombel_id' => 1, // X-A-1
                'jam_mulai' => '07:30',
                'jam_selesai' => '08:30',
                'ruangan_id' => 1,
                'link_opsional' => '',              
                ]          
            
        ]);              

        /**
         * 🎯✅ spa: C.R.U.D
         * kepsek: GET, SHOW
         * guru: CREATE
         */
        AbsensiPegawai::insert([
            [
                'guru_id' => 9, // Guru MTK
                'jadwal_pelajaran_id' => null,
                'hari' => '2014-02-27',
                'status' => 'hadir',
                'tahun_akademik_id' => 1,  // 13/24
                'semester_id' => 1, // Ganjil
            ],
            [
                'guru_id' => 9, // Guru MTK
                'jadwal_pelajaran_id' => 1,
                'hari' => '2026-02-24',
                'status' => 'tidak hadir',
                'tahun_akademik_id' => 1, 
                'semester_id' => 1, // Ganjil
            ],
            [
                'guru_id' => 9, // Guru MTK
                'jadwal_pelajaran_id' => 1,
                'hari' => '2014-02-25',
                'status' => 'hadir',
                'tahun_akademik_id' => 1,  // 13/24
                'semester_id' => 1, // Ganjil
            ],
            [
                'guru_id' => 9, // Guru MTK
                'jadwal_pelajaran_id' => 1,
                'hari' => '2026-01-30',
                'status' => 'tidak hadir',
                'tahun_akademik_id' => 1, 
                'semester_id' => 1, // Ganjil
            ],
            [
                'guru_id' => 9, // Guru MTK
                'jadwal_pelajaran_id' => null,
                'hari' => '2026-01-24',
                'status' => 'hadir',
                'tahun_akademik_id' => 1, 
                'semester_id' => 2, // Genap
            ],
            [
                'guru_id' => 9, // Guru MTK
                'jadwal_pelajaran_id' => 1,
                'hari' => '2026-01-25',
                'status' => 'hadir',
                'tahun_akademik_id' => 1, 
                'semester_id' => 2, // Genap
            ],
            [
                'guru_id' => 9, // Guru MTK
                'jadwal_pelajaran_id' => null,
                'hari' => '2025-05-24',
                'status' => 'hadir',
                'tahun_akademik_id' => 2, 
                'semester_id' => 3, // Ganjil
            ],
            [
                'guru_id' => 9, // Guru MTK
                'jadwal_pelajaran_id' => null,
                'hari' => '2025-05-25',
                'status' => 'hadir',
                'tahun_akademik_id' => 2, 
                'semester_id' => 3, // Ganjil
            ],
            [
                'guru_id' => 9, // Guru MTK
                'jadwal_pelajaran_id' => 1,
                'hari' => '2025-05-26',
                'status' => 'tidak hadir',
                'tahun_akademik_id' => 2, 
                'semester_id' => 4, // Genap
            ],            
            [
                'guru_id' => 9, // Guru MTK
                'jadwal_pelajaran_id' => 1,
                'hari' => '2025-05-27',
                'status' => 'hadir',
                'tahun_akademik_id' => 2, 
                'semester_id' => 4, // Genap
            ],            
            // ---------------------------------------------------
            [
                'guru_id' => 7,
                'jadwal_pelajaran_id' => 2, // Indon
                'hari' => '2025-05-24',
                'status' => 'tidak hadir',
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
            ],
            [
                'guru_id' => 7,
                'jadwal_pelajaran_id' => 2,
                'hari' => '2025-05-25',
                'status' => 'hadir',
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
            ],
            [
                'guru_id' => 7,
                'jadwal_pelajaran_id' => 2,
                'hari' => '2025-05-26',
                'status' => 'hadir',
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
            ],
            [
                'guru_id' => 7,
                'jadwal_pelajaran_id' => 2, // Indon
                'hari' => '2026-01-01',
                'status' => 'tidak hadir',
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
            ],
            [
                'guru_id' => 7,
                'jadwal_pelajaran_id' => 2,
                'hari' => '2026-01-02',
                'status' => 'hadir',
                'tahun_akademik_id' => 2,
                'semester_id' => 4,
            ],
            [
                'guru_id' => 7,
                'jadwal_pelajaran_id' => 2,
                'hari' => '2026-01-03',
                'status' => 'hadir',
                'tahun_akademik_id' => 2,
                'semester_id' => 4,
            ],            
        ]);

        /**
         * 🎯✅ spa: C.R.U.D
         * kepsek: GET, SHOW
         * guru: CREATE
         */
        AbsensiPelajaran::insert([
            [
                // 1
                'guru_pengajar_id' => 5, /// Guru MTK
                'jadwal_pelajaran_id' => 1, // MTK | 13/24 | Ganjil | X-A      
                'pertemuan_id' => 1,
                'hari' => '2023-05-25',
                'status' => 'hadir',                
                'tahun_akademik_id' => 1, // 13/24
                'semester_id' => 1 // Ganjil
            ],
            // ---------------------            
            // Guru MTK
            [
                // 2
                'guru_pengajar_id' => 9, /// Guru MTK
                'jadwal_pelajaran_id' => 1, // MTK | 13/24 | Ganjil | X-A-1
                'pertemuan_id' => 1,
                'hari' => '2024-05-05', // Senin
                'status' => 'hadir',                
                'tahun_akademik_id' => 1, // 13/24
                'semester_id' => 1 // Ganjil
            ],
            [
                // 3
                'guru_pengajar_id' => 9, /// Guru MTK
                'jadwal_pelajaran_id' => 1,
                'pertemuan_id' => 1,
                'hari' => '2024-05-12',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 1,
                'semester_id' => 1 // Ganjil
            ],
            [
                // 4
                'guru_pengajar_id' => 9, /// Guru MTK
                'jadwal_pelajaran_id' => 1,
                'pertemuan_id' => 1,
                'hari' => '2024-05-19',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 1,
                'semester_id' => 1 // Ganjil
            ],
            [
                // 5
                'guru_pengajar_id' => 9, /// Guru MTK
                'jadwal_pelajaran_id' => 11,
                'pertemuan_id' => 1,
                'hari' => '2025-05-05',
                'status' => 'hadir',                
                'tahun_akademik_id' => 1, // 23/24
                'semester_id' => 2  // Genap
            ],
            [
                // 6
                'guru_pengajar_id' => 9, /// Guru MTK
                'jadwal_pelajaran_id' => 11,
                'pertemuan_id' => 1,
                'hari' => '2025-01-02',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 1, // 23/24
                'semester_id' => 2  // Genap
            ],
            [
                // 7
                'guru_pengajar_id' => 9, /// Guru MTK
                'jadwal_pelajaran_id' => 8,
                'pertemuan_id' => 1,
                'hari' => '2024-01-09',
                'status' => 'hadir',                
                'tahun_akademik_id' => 1, // 23/24
                'semester_id' => 2  // Genap
            ],                    
            // 2024/2025
            [
                // 8
                'guru_pengajar_id' => 9, /// Guru MTK
                'jadwal_pelajaran_id' => 1, // MTK | 13/24 | Ganjil | X-A-1
                'pertemuan_id' => 1,
                'hari' => '2024-05-05', // Senin
                'status' => 'hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 3 // Ganjil
            ],
            [
                // 9
                'guru_pengajar_id' => 9, /// Guru MTK
                'jadwal_pelajaran_id' => 1,
                'pertemuan_id' => 1,
                'hari' => '2024-05-12',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 3 // Ganjil
            ],
            [
                // 10
                'guru_pengajar_id' => 9, /// Guru MTK
                'jadwal_pelajaran_id' => 1,
                'pertemuan_id' => 1,
                'hari' => '2024-05-19',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 3 // Ganjil
            ],
            [
                // 11
                'guru_pengajar_id' => 9, /// Guru MTK
                'jadwal_pelajaran_id' => 11,
                'pertemuan_id' => 1,
                'hari' => '2025-05-05',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 4  // Genap
            ],
            [
                // 12
                'guru_pengajar_id' => 9, /// Guru MTK
                'jadwal_pelajaran_id' => 11,
                'pertemuan_id' => 1,
                'hari' => '2025-01-02',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 4  // Genap
            ],
            [
                // 13
                'guru_pengajar_id' => 9, /// Guru MTK
                'jadwal_pelajaran_id' => 8,
                'pertemuan_id' => 1,
                'hari' => '2024-01-09',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 4  // Genap
            ],                    

            // Guru indones
            [
                // 2
                'guru_pengajar_id' => 7, /// Guru Indon
                'jadwal_pelajaran_id' => 23, // Indon
                'pertemuan_id' => 1,
                'hari' => '2024-05-05', // Senin
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 3 // Ganjil
            ],
            [
                // 3
                'guru_pengajar_id' => 7, /// Guru Indon
                'jadwal_pelajaran_id' => 23,
                'pertemuan_id' => 1,
                'hari' => '2024-05-12',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 3 // Ganjil
            ],
            [
                // 4
                'guru_pengajar_id' => 7, /// Guru Indon
                'jadwal_pelajaran_id' => 23,
                'pertemuan_id' => 1,
                'hari' => '2024-05-19',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 3 // Ganjil
            ],
        ]);

        /**
         * 🎯✅ spa: C.R.U.D
         * kepsek: GET, SHOW
         * guru: C.R.U.D
         */
        AbsensiSiswa::insert([
            [
                // 1
                'siswa_id' => 2, // Winton
                'siswa_rombel_id' => 10,  // X-B-1
                'jadwal_pelajaran_id' => 1, // MTK
                'pertemuan_id' => 1,
                'hari' => '2023-12-02',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 2
                'siswa_id' => 2, // Winton
                'siswa_rombel_id' => 10,  // X-B-1
                'jadwal_pelajaran_id' => 1, // MTK
                'pertemuan_id' => 1,
                'hari' => '2023-12-09',
                'status' => 'alpa',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 3
                'siswa_id' => 2, // Winton
                'siswa_rombel_id' => 10,  // X-B-1
                'jadwal_pelajaran_id' => 2, // Indonesia
                'pertemuan_id' => 1,
                'hari' => '2023-12-02',
                'status' => 'izin',
                'bukti' => 'izin.jpg', // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 4
                'siswa_id' => 2, // Winton
                'siswa_rombel_id' => 10,  // X-B-1
                'jadwal_pelajaran_id' => 3, // PAI
                'pertemuan_id' => 1,
                'hari' => '2023-12-03',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],                        
            [
                // 5
                'siswa_id' => 2, // Winton
                'siswa_rombel_id' => 10,  // X-B-1
                'jadwal_pelajaran_id' => 1, // MTK
                'pertemuan_id' => 1,
                'hari' => '2024-01-09',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 2, // Genap
            ],            
            [
                // 6
                'siswa_id' => 2, // Winton
                'siswa_rombel_id' => 10,  // XI-B-1
                'jadwal_pelajaran_id' => 2, // Indonesia
                'pertemuan_id' => 1,
                'hari' => '2024-01-02',
                'status' => 'izin',
                'bukti' => 'izin.jpg', // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 2, // Genap
            ],            
            [
                // 7
                'siswa_id' => 2, // Winton
                'siswa_rombel_id' => 10,  // X-B-1
                'jadwal_pelajaran_id' => 3, // PAI
                'pertemuan_id' => 1,
                'hari' => '2024-01-03',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 2, // Genap
            ],                        
            [
                // 8
                'siswa_id' => 2, // Winton
                'siswa_rombel_id' => 3, // XI-B-I
                'jadwal_pelajaran_id' => 1, // MTK
                'pertemuan_id' => 1,
                'hari' => '2024-12-02',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 3, // Ganjil
            ],            
            [
                // 9
                'siswa_id' => 2, // Winton
                'siswa_rombel_id' => 3, // XI-B-I
                'jadwal_pelajaran_id' => 2, // Indonesia
                'pertemuan_id' => 2,
                'hari' => '2023-12-02',
                'status' => 'izin',
                'bukti' => 'izin.jpg', // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 3, // Ganjil
            ],            
            [
                // 10
                'siswa_id' => 2, // Winton
                'siswa_rombel_id' => 3, // XI-B-I
                'jadwal_pelajaran_id' => 3, // PAI
                'pertemuan_id' => 1,
                'hari' => '2023-12-03',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 3, // Ganjil
            ],                        
            [
                // 11
                'siswa_id' => 2, // Winton
                'siswa_rombel_id' => 3, // XI-B-I
                'jadwal_pelajaran_id' => 1, // MTK
                'pertemuan_id' => 1,
                'hari' => '2024-01-02',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 4, // Genap
            ],            
            [
                // 12
                'siswa_id' => 2, // Winton
                'siswa_rombel_id' => 3, // XI-B-I
                'jadwal_pelajaran_id' => 2, // Indonesia
                'pertemuan_id' => 1,
                'hari' => '2024-01-02',
                'status' => 'izin',
                'bukti' => 'izin.jpg', // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 4, // Genap
            ],            
            [
                // 13
                'siswa_id' => 2, // Winton
                'siswa_rombel_id' => 3, // XI-B-I
                'jadwal_pelajaran_id' => 3, // PAI
                'pertemuan_id' => 1,
                'hari' => '2024-01-03',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 4, // Genap
            ],         
            
            // Bagas
            [
                // 14
                'siswa_id' => 1, // Bagas
                'siswa_rombel_id' => 9,  // X-B-1
                'jadwal_pelajaran_id' => 1, // MTK
                'pertemuan_id' => 1,
                'hari' => '2023-12-02',
                'status' => 'alpa',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 15
                'siswa_id' => 1, // Bagas
                'siswa_rombel_id' => 9,  // XI-B-1
                'jadwal_pelajaran_id' => 2, // Indonesia
                'pertemuan_id' => 1,
                'hari' => '2023-12-02',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 16
                'siswa_id' => 1, // Bagas
                'siswa_rombel_id' => 9,  // X-B-1
                'jadwal_pelajaran_id' => 3, // PAI
                'pertemuan_id' => 1,
                'hari' => '2023-12-03',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],                        
            [
                // 17
                'siswa_id' => 1, // Bagas
                'siswa_rombel_id' => 9,  // X-B-1
                'jadwal_pelajaran_id' => 1, // MTK
                'pertemuan_id' => 1,
                'hari' => '2024-01-02',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 2, // Genap
            ],            
            [
                // 18
                'siswa_id' => 1, // Bagas
                'siswa_rombel_id' => 9,  // XI-B-1
                'jadwal_pelajaran_id' => 2, // Indonesia
                'pertemuan_id' => 1,
                'hari' => '2024-01-02',
                'status' => 'izin',
                'bukti' => 'izin.jpg', // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 2, // Genap
            ],            
            [
                // 19
                'siswa_id' => 1, // Bagas
                'siswa_rombel_id' => 9,  // X-B-1
                'jadwal_pelajaran_id' => 3, // PAI
                'pertemuan_id' => 1,
                'hari' => '2024-01-03',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 2, // Genap
            ],                        
            [
                // 20
                'siswa_id' => 1, // Bagas
                'siswa_rombel_id' => 2, // XI-B-I
                'jadwal_pelajaran_id' => 1, // MTK
                'pertemuan_id' => 1,
                'hari' => '2023-12-02',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 3, // Ganjil
            ],            
            [
                // 21
                'siswa_id' => 1, // Bagas
                'siswa_rombel_id' => 2, // XI-B-I
                'jadwal_pelajaran_id' => 2, // Indonesia
                'pertemuan_id' => 1,
                'hari' => '2023-12-02',
                'status' => 'izin',
                'bukti' => 'izin.jpg', // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 3, // Ganjil
            ],            
            [
                // 22
                'siswa_id' => 1, // Bagas
                'siswa_rombel_id' => 2, // XI-B-I
                'jadwal_pelajaran_id' => 3, // PAI
                'pertemuan_id' => 1,
                'hari' => '2023-12-03',
                'status' => 'sakit',
                'bukti' => 'sakit.jpg', // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 3, // Ganjil
            ],                        
            [
                // 23
                'siswa_id' => 1, // Bagas
                'siswa_rombel_id' => 2, // XI-B-I
                'jadwal_pelajaran_id' => 1, // MTK
                'pertemuan_id' => 1,
                'hari' => '2024-01-02',
                'status' => 'alpa',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 4, // Genap
            ],            
            [
                // 24
                'siswa_id' => 1, // Bagas
                'siswa_rombel_id' => 2, // XI-B-I
                'jadwal_pelajaran_id' => 2, // Indonesia
                'pertemuan_id' => 1,
                'hari' => '2024-01-02',
                'status' => 'izin',
                'bukti' => 'izin.jpg', // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 4, // Genap
            ],            
            [
                // 25
                'siswa_id' => 1, // Bagas
                'siswa_rombel_id' => 2, // XI-B-I
                'jadwal_pelajaran_id' => 3, // PAI
                'pertemuan_id' => 1,
                'hari' => '2024-01-03',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 4, // Genap
            ],    

            // Sanita
            [
                // 26
                'siswa_id' => 3, // Sanita
                'siswa_rombel_id' => 11, // X-B-I
                'jadwal_pelajaran_id' => 1, // MTK
                'pertemuan_id' => 1,
                'hari' => '2023-12-02',
                'status' => 'alpa',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 27
                'siswa_id' => 3, // Sanita
                'siswa_rombel_id' => 11, // X-B-I
                'jadwal_pelajaran_id' => 2, // Indonesia
                'pertemuan_id' => 1,
                'hari' => '2023-12-02',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 28
                'siswa_id' => 3, // Sanita
                'siswa_rombel_id' => 11, // X-B-I
                'jadwal_pelajaran_id' => 3, // PAI
                'pertemuan_id' => 1,
                'hari' => '2023-12-03',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],                        
            [
                // 29
                'siswa_id' => 3, // Sanita
                'siswa_rombel_id' => 11, // X-B-I
                'jadwal_pelajaran_id' => 1, // MTK
                'pertemuan_id' => 1,
                'hari' => '2024-01-02',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 2, // Genap
            ],            
            [
                // 30
                'siswa_id' => 3, // Sanita
                'siswa_rombel_id' => 11, // X-B-I
                'jadwal_pelajaran_id' => 2, // Indonesia
                'pertemuan_id' => 1,
                'hari' => '2024-01-02',
                'status' => 'izin',
                'bukti' => 'izin.jpg', // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 2, // Genap
            ],            
            [
                // 31
                'siswa_id' => 3, // Sanita
                'siswa_rombel_id' => 11, // X-B-I
                'jadwal_pelajaran_id' => 3, // PAI
                'pertemuan_id' => 1,
                'hari' => '2024-01-03',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 2, // Genap
            ],                        
            [
                // 32
                'siswa_id' => 3, // Sanita
                'siswa_rombel_id' => 7, // X-B-I
                'jadwal_pelajaran_id' => 1, // MTK
                'pertemuan_id' => 1,
                'hari' => '2023-12-02',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 3, // Ganjil
            ],            
            [
                // 33
                'siswa_id' => 3, // Sanita
                'siswa_rombel_id' => 7, // X-B-I
                'jadwal_pelajaran_id' => 2, // Indonesia
                'pertemuan_id' => 1,
                'hari' => '2023-12-02',
                'status' => 'izin',
                'bukti' => 'izin.jpg', // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 3, // Ganjil
            ],            
            [
                // 34
                'siswa_id' => 3, // Sanita
                'siswa_rombel_id' => 7, // X-B-I
                'jadwal_pelajaran_id' => 3, // PAI
                'pertemuan_id' => 1,
                'hari' => '2023-12-03',
                'status' => 'alpa',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 3, // Ganjil
            ],                        
            [
                // 35
                'siswa_id' => 3, // Sanita
                'siswa_rombel_id' => 7, // X-B-I
                'jadwal_pelajaran_id' => 1, // MTK
                'pertemuan_id' => 1,
                'hari' => '2024-01-02',
                'status' => 'alpa',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 4, // Genap
            ],            
            [
                // 36
                'siswa_id' => 3, // Sanita
                'siswa_rombel_id' => 7, // X-B-I
                'jadwal_pelajaran_id' => 2, // Indonesia
                'pertemuan_id' => 1,
                'hari' => '2024-01-02',
                'status' => 'izin',
                'bukti' => 'izin.jpg', // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 4, // Genap
            ],            
            [
                // 37
                'siswa_id' => 3, // Sanita
                'siswa_rombel_id' => 7, // X-B-I
                'jadwal_pelajaran_id' => 3, // PAI
                'pertemuan_id' => 1,
                'hari' => '2024-01-03',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alpa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 4, // Genap
            ]
        ]);        

        /**
         * 🎯✅ SPA: C.R.U.D
         *  */ 
        Ekstrakurikuler::insert([
            [
                'nama_ekstrakurikuler' => 'Pramuka',                
                'anggaran' => 1500000,
                'status' => 'wajib',
                'status_aktif' => 'aktif',
            ],
            [
                'nama_ekstrakurikuler' => 'Paskibra',                
                'anggaran' => 2000000,
                'status' => 'pilihan',
                'status_aktif' => 'aktif',
            ],
            [
                'nama_ekstrakurikuler' => 'Tari',                
                'anggaran' => 5000000,
                'status' => 'jurusan',
                'status_aktif' => 'aktif',
            ],
            [
                'nama_ekstrakurikuler' => 'Futsal',                
                'anggaran' => 2000000,
                'status' => 'pilihan',
                'status_aktif' => 'arsip',
            ],
        ]);

        // 🎯✅ seed pembina ekskul
        PembinaEkskul::insert([
            [
                'pembina_id' => 9, // guru MTK
                'ekstrakurikuler_id' => 1, // Pramuka
                'tahun_akademik_id' => 1, // 2023/2024
            ],
            [
                'pembina_id' => 9, // guru MTK
                'ekstrakurikuler_id' => 2, // Paskib
                'tahun_akademik_id' => 2, // 2024/2025
            ],

            [
                'pembina_id' => 7, // Guru Indon
                'ekstrakurikuler_id' => 2, // PASKIB
                'tahun_akademik_id' => 1, // 2013/2024
            ],
            [
                'pembina_id' => 3, // staff tu
                'ekstrakurikuler_id' => 3, // Tari
                'tahun_akademik_id' => 2, // 2024/2025
            ],            
        ]);

        // 🎯✅ seed pelatih ekskul
        PelatihEkskul::insert([
            [
                'pelatih_id' => 9, // Guru MTK
                'ekstrakurikuler_id' => 1, // pramuka
                'tahun_akademik_id' => 1, // 2013/2024
            ],
            [
                'pelatih_id' => 9, // Guru MTK
                'ekstrakurikuler_id' => 3, // Tari
                'tahun_akademik_id' => 2, // 2024/2025
            ],

            [
                'pelatih_id' => 3, // Guru Staff TU
                'ekstrakurikuler_id' => 2, // paskibra
                'tahun_akademik_id' => 1, // 2013/2024
            ],            
        ]);                    

        // 🎯 Seed Siswa daftar ke ekstrakurikuler
        EkskulSiswaPivot::insert([
            [
                'siswa_id' => 1, // Bagas
                'ekstrakurikuler_id' => 1, // Pramuka
                'tahun_akademik_id' => 1, // 13
                'sikap' => 'Baik',
                'status' => 'Aktif'
            ],
            [
                'siswa_id' => 1, // Bagas
                'ekstrakurikuler_id' => 2, // Paskibra
                'tahun_akademik_id' => 1, // 13
                'sikap' => 'Sangat Baik',
                'status' => 'Aktif'
            ],

            [
                'siswa_id' => 2, // Winton
                'ekstrakurikuler_id' => 1, // Pramuka
                'tahun_akademik_id' => 1, // 13
                'sikap' => 'Baik',
                'status' => 'Cukup Aktif'
            ],
            [
                'siswa_id' => 2, // Winton
                'ekstrakurikuler_id' => 2, // Paskibra
                'tahun_akademik_id' => 1, // 13
                'sikap' => 'Baik',
                'status' => 'Aktif'
            ],
            [
                'siswa_id' => 2, // Winton
                'ekstrakurikuler_id' => 2, // Paskibra
                'tahun_akademik_id' => 2, // 24
                'sikap' => 'Baik',
                'status' => 'Aktif'
            ],
            [
                'siswa_id' => 3, // Sanita
                'ekstrakurikuler_id' => 1, // Pramuka
                'tahun_akademik_id' => 2,
                'sikap' => 'Kurang',
                'status' => 'Tidak Aktif'
            ],            
        ]);

        /**
         * 🎯✅ spa: C.R.U.D
         * kepsek: GET, SHOW
         * guru
         */
        Prestasi::insert([
            [
                'siswa_id' => 1, // Bagas                                
                'tahun_akademik_id' => 2, // 2024/2025 (Merdeka)
                'prestasi_diraih' => 'Juara 2 lomba renang tingkat sekolah',
            ],
            [
                'siswa_id' => 2, // Winton                                
                'tahun_akademik_id' => 1,
                'prestasi_diraih' => 'Rangking satu umum angkatan 2021',
            ],
            [
                'siswa_id' => 2, // Winton                                
                'tahun_akademik_id' => 2,
                'prestasi_diraih' => 'Juara lomba paskibra tingkat sekolah',
            ],
            [
                'siswa_id' => 2, // Winton                                
                'tahun_akademik_id' => 2,
                'prestasi_diraih' => 'Juara 1 lomba makan',
            ],
            [
                'siswa_id' => 3, // Sanita                                
                'tahun_akademik_id' => 1,
                'prestasi_diraih' => 'Rangking satu kelas',
            ]
        ]);
        
        /**
         * SPA: C.R.U.D
         * Rapor
         */
        Rapor::insert([
            // Winton
            // Tingkat 10 2023/2024
            // Ganjil
            [
                // 1
                'siswa_id'          => 2,
                'siswa_rombel_id'   => 10,
                'tahun_akademik_id' => 1,
                'semester_id'       => 1,
                'wali_rombel_id'    => 1,
                'jenis_rapor'       => 'PTS',
                'sikap_spiritual'   => 'Sangat Baik',
                'sikap_sosial'      => 'Baik',
                'deskripsi_sikap'   => 'Sangat menghargai waktu dan disiplin setiap waktu',
                'status'            => 'final',
                'tanggal_terbit'    => '2021-08-24',
                'catatan_wali'      => 'Pertahankan'
            ],
            // Genap
            [
                // 2
                'siswa_id'          => 2,
                'siswa_rombel_id'   => 10,
                'tahun_akademik_id' => 1,
                'semester_id'       => 2,
                'wali_rombel_id'    => 1,
                'jenis_rapor'       => 'PAS',
                'sikap_spiritual'   => null,
                'sikap_sosial'      => null,
                'deskripsi_sikap'   => null,
                'status'            => 'final',
                'tanggal_terbit'    => '2022-03-27',
                'catatan_wali'      => null
            ],
            // Tingkat 11 2024/2025
            // Ganjil
            [
                // 3
                'siswa_id'          => 2,
                'siswa_rombel_id'   => 3,
                'tahun_akademik_id' => 2,
                'semester_id'       => 3,
                'wali_rombel_id'    => 2,
                'jenis_rapor'       => 'PTS',
                'sikap_spiritual'   => 'Baik',
                'sikap_sosial'      => 'Baik',
                'deskripsi_sikap'   => 'Disiplin waktu dan bertanggung jawab',
                'status'            => 'draft',
                'tanggal_terbit'    => '2022-08-24',
                'catatan_wali'      => 'Pertahankan'
            ],    
            // ---------------------------------------------
            // Sanita
            [
                // 4
                'siswa_id'          => 3,
                'siswa_rombel_id'   => 11,
                'tahun_akademik_id' => 1,
                'semester_id'       => 1,
                'wali_rombel_id'    => 1,
                'jenis_rapor'       => 'PTS',
                'sikap_spiritual'   => 'Cukup',
                'sikap_sosial'      => 'Kurang',
                'deskripsi_sikap'   => 'Sering bolos jam pelajaran',
                'status'            => 'final',
                'tanggal_terbit'    => '2021-08-24',
                'catatan_wali'      => 'Kembangkan lagi sikap tanggung jawab dan disipilinnya'
            ],
            [
                // 5
                'siswa_id'          => 3,
                'siswa_rombel_id'   => 11,
                'tahun_akademik_id' => 1,
                'semester_id'       => 2,
                'wali_rombel_id'    => 1,
                'jenis_rapor'       => 'PAS',
                'sikap_spiritual'   => null,
                'sikap_sosial'      => null,
                'deskripsi_sikap'   => null,
                'status'            => 'final',
                'tanggal_terbit'    => '2022-03-27',
                'catatan_wali'      => null
            ],
            // Tingkat 11 tahun 2024/2025
            [
                // 6
                'siswa_id'          => 3,
                'siswa_rombel_id'   => 7,
                'tahun_akademik_id' => 2,
                'semester_id'       => 3,
                'wali_rombel_id'    => 5,
                'jenis_rapor'       => 'PTS',
                'sikap_spiritual'   => 'Baik',
                'sikap_sosial'      => 'Baik',
                'deskripsi_sikap'   => 'Disiplin waktu dan bertanggung jawab',
                'status'            => 'draft',
                'tanggal_terbit'    => '2022-08-24',
                'catatan_wali'      => 'Pertahankan'
            ],      

            // ---------------------------------------------
            // Bagas
            [
                // 7
                'siswa_id'          => 1,
                'siswa_rombel_id'   => 9,
                'tahun_akademik_id' => 1,
                'semester_id'       => 1,
                'wali_rombel_id'    => 3,
                'jenis_rapor'       => 'PTS',
                'sikap_spiritual'   => 'Cukup',
                'sikap_sosial'      => 'Cukup',
                'deskripsi_sikap'   => 'Suka menunda pekerjaan rumah',
                'status'            => 'final',
                'tanggal_terbit'    => '2021-08-24',
                'catatan_wali'      => 'Kembangkan lagi sikap tanggung jawab dan disipilinnya'
            ],
            [
                // 8
                'siswa_id'          => 1,
                'siswa_rombel_id'   => 9,
                'tahun_akademik_id' => 1,
                'semester_id'       => 2,
                'wali_rombel_id'    => 3,
                'jenis_rapor'       => 'PAS',
                'sikap_spiritual'   => null,
                'sikap_sosial'      => null,
                'deskripsi_sikap'   => null,
                'status'            => 'final',
                'tanggal_terbit'    => '2022-03-27',
                'catatan_wali'      => null
            ],
            [
                // 9
                'siswa_id'          => 1,
                'siswa_rombel_id'   => 2,
                'tahun_akademik_id' => 2,
                'semester_id'       => 3,
                'wali_rombel_id'    => 2,
                'jenis_rapor'       => 'PTS',
                'sikap_spiritual'   => 'Baik',
                'sikap_sosial'      => 'Baik',
                'deskripsi_sikap'   => 'Disiplin waktu dan bertanggung jawab',
                'status'            => 'draft',
                'tanggal_terbit'    => '2022-08-24',
                'catatan_wali'      => 'Pertahankan'
            ],        

            // ---------------------------------------------
            // Yuli
            [
                // 10
                'siswa_id'          => 5,
                'siswa_rombel_id'   => 13,
                'tahun_akademik_id' => 1,
                'semester_id'       => 1,
                'wali_rombel_id'    => 6,
                'jenis_rapor'       => 'PTS',
                'sikap_spiritual'   => 'Cukup',
                'sikap_sosial'      => 'Cukup',
                'deskripsi_sikap'   => 'Suka menunda pekerjaan rumah',
                'status'            => 'final',
                'tanggal_terbit'    => '2021-08-24',
                'catatan_wali'      => 'Kembangkan lagi sikap tanggung jawab dan disipilinnya'
            ],
            [
                // 11
                'siswa_id'          => 5,
                'siswa_rombel_id'   => 13,
                'tahun_akademik_id' => 1,
                'semester_id'       => 2,
                'wali_rombel_id'    => 6,
                'jenis_rapor'       => 'PAS',
                'sikap_spiritual'   => null,
                'sikap_sosial'      => null,
                'deskripsi_sikap'   => null,
                'status'            => 'final',
                'tanggal_terbit'    => '2022-03-27',
                'catatan_wali'      => null
            ],
            [
                // 12
                'siswa_id'          => 5,
                'siswa_rombel_id'   => 5,
                'tahun_akademik_id' => 2,
                'semester_id'       => 3,
                'wali_rombel_id'    => 4,
                'jenis_rapor'       => 'PTS',
                'sikap_spiritual'   => 'Baik',
                'sikap_sosial'      => 'Baik',
                'deskripsi_sikap'   => 'Disiplin waktu dan bertanggung jawab',
                'status'            => 'draft',
                'tanggal_terbit'    => '2022-08-24',
                'catatan_wali'      => 'Pertahankan'
            ],  

            // ---------------------------------------------
            // Devi
            [
                // 13
                'siswa_id'          => 8,
                'siswa_rombel_id'   => 1,
                'tahun_akademik_id' => 2,
                'semester_id'       => 3,
                'wali_rombel_id'    => 7,
                'jenis_rapor'       => 'PTS',
                'sikap_spiritual'   => 'Cukup',
                'sikap_sosial'      => 'Cukup',
                'deskripsi_sikap'   => 'Suka menunda pekerjaan rumah',
                'status'            => 'final',
                'tanggal_terbit'    => '2021-08-24',
                'catatan_wali'      => 'Kembangkan lagi sikap tanggung jawab dan disipilinnya'
            ],            

            // ---------------------------------------------
             // Rehan
            // Tingkat 10 2023/2024
            // Ganjil
            [
                // 14
                'siswa_id'          => 4,
                'siswa_rombel_id'   => 12,
                'tahun_akademik_id' => 1,
                'semester_id'       => 1,
                'wali_rombel_id'    => 1,
                'jenis_rapor'       => 'PTS',
                'sikap_spiritual'   => 'Sangat Baik',
                'sikap_sosial'      => 'Baik',
                'deskripsi_sikap'   => 'Sangat menghargai waktu dan disiplin setiap waktu',
                'status'            => 'final',
                'tanggal_terbit'    => '2021-08-24',
                'catatan_wali'      => 'Pertahankan'
            ],
            // Genap
            [
                // 15
                'siswa_id'          => 4,
                'siswa_rombel_id'   => 12,
                'tahun_akademik_id' => 1,
                'semester_id'       => 2,
                'wali_rombel_id'    => 1,
                'jenis_rapor'       => 'PAS',
                'sikap_spiritual'   => null,
                'sikap_sosial'      => null,
                'deskripsi_sikap'   => null,
                'status'            => 'final',
                'tanggal_terbit'    => '2022-03-27',
                'catatan_wali'      => null
            ],
            // Tingkat 11 2024/2025
            // Ganjil
            [
                // 16
                'siswa_id'          => 4,
                'siswa_rombel_id'   => 4,
                'tahun_akademik_id' => 2,
                'semester_id'       => 3,
                'wali_rombel_id'    => 2,
                'jenis_rapor'       => 'PTS',
                'sikap_spiritual'   => 'Baik',
                'sikap_sosial'      => 'Baik',
                'deskripsi_sikap'   => 'Disiplin waktu dan bertanggung jawab',
                'status'            => 'draft',
                'tanggal_terbit'    => '2022-08-24',
                'catatan_wali'      => 'Pertahankan'
            ],    
        ]);

        /**
         * 🎯 spa: C.R.U.D
         * kepsek:
         * guru: C.R.U.D
         */
        DataNilaiSiswa::insert([
            [
                // 1
                'siswa_id' => 2, // Winton
                'guru_id' => 9, // Guru MTK
                'siswa_rombel_id'   => 10, // X-B-1
                'kurikulum_mata_pelajaran_id' => 6, // MTK
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 80.50,
                'point_tugas' => 80.00,
                'point_uts' => 90.50,
                'point_uas' => 0,          
                'nilai_akhir' => 100,
                'predikat'  => 'A',
                'deskripsi' => 'Siswa memhamai aljabar dengan baik',
                'rapor_id'  => 1
            ],
            [
                // 2
                'siswa_id' => 2, // Winton
                'guru_id' => 7, // Guru Indon
                'siswa_rombel_id'   => 10,
                'kurikulum_mata_pelajaran_id' => 4, // B.Indo
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 90,
                'point_tugas' => 80,
                'point_uts' => 70,
                'point_uas' => 0,              
                'nilai_akhir' => 90,
                'predikat'  => 'A',
                'deskripsi' => 'Siswa memahami KBBI dengan baik',
                'rapor_id'  => 1
            ],
            [
                // 3
                'siswa_id' => 2, // Winton
                'guru_id' => 5, // Guru PAI
                'siswa_rombel_id'   => 10,
                'kurikulum_mata_pelajaran_id' => 2, // PAI
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'jenis_penilaian'  => 'PAS',
                'point_absensi' => 90,
                'point_tugas' => 90,
                'point_uts' => 0,
                'point_uas' => 90,              
                'nilai_akhir' => 80,
                'predikat'  => null,
                'deskripsi' => null,
                'rapor_id'  => 2
            ],
            [
                // 4
                'siswa_id' => 2, // Winton
                'guru_id' => 6, // Guru PPKn
                'siswa_rombel_id'   => 10,
                'kurikulum_mata_pelajaran_id' => 3, // PPKn
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'jenis_penilaian'  => 'PAS',
                'point_absensi' => 100,
                'point_tugas' => 80,
                'point_uts' => 0,
                'point_uas' => 90,              
                'nilai_akhir' => 80,
                'predikat'  => null,
                'deskripsi' => null,
                'rapor_id'  => 2
            ],

            // Tingkat 11
            [
                // 5
                'siswa_id' => 2, // Winton
                'guru_id' => 9, // Guru MTK
                'siswa_rombel_id'   => 3, // XI-B-1
                'kurikulum_mata_pelajaran_id' => 6, // MTK
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 90,
                'point_tugas' => 80.00,
                'point_uts' => 90.50,
                'point_uas' => 0,           
                'nilai_akhir' => 98,
                'predikat'  => 'A',
                'deskripsi' => 'Peserta memmahami aljabar dengan baik',
                'rapor_id'  => 3
            ],
            [
                // 6
                'siswa_id' => 2, // Winton
                'guru_id' => 7, // Guru Indon
                'siswa_rombel_id'   => 3,
                'kurikulum_mata_pelajaran_id' => 4, // B.Indo
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 90,
                'point_tugas' => 80,
                'point_uts' => 80,
                'point_uas' => 0,              
                'nilai_akhir' => 90,
                'predikat'  => null,
                'deskripsi' => null,
                'rapor_id'  => 3
            ],
            [
                // 7
                'siswa_id' => 2, // Winton
                'guru_id' => 9, // Guru MTK
                'siswa_rombel_id'   => 3, // XI-B-1
                'kurikulum_mata_pelajaran_id' => 6, // MTK
                'tahun_akademik_id' => 2,
                'semester_id' => 4,
                'jenis_penilaian'  => 'PAS',
                'point_absensi' => 90,
                'point_tugas' => 80.00,
                'point_uts' => 90.50,
                'point_uas' => 0,           
                'nilai_akhir' => 90,
                'predikat'  => null,
                'deskripsi' => null,
                'rapor_id'  => null
            ],
            [
                // 8
                'siswa_id' => 2, // Winton
                'guru_id' => 7, // Guru Indon
                'siswa_rombel_id'   => 3,
                'kurikulum_mata_pelajaran_id' => 4, // B.Indo
                'tahun_akademik_id' => 2,
                'semester_id' => 4,
                'jenis_penilaian'  => 'PAS',
                'point_absensi' => 90,
                'point_tugas' => 80,
                'point_uts' => 80,
                'point_uas' => 0,              
                'nilai_akhir' => 100,
                'predikat'  => 'B',
                'deskripsi' => 'Siswa memahami KBBI dengan baik',
                'rapor_id'  => null
            ],            

            // Sanita
            [
                // 9
                'siswa_id' => 3, // Sanita
                'guru_id' => 9, // Guru MTK
                'siswa_rombel_id'   => 11, // X-B11
                'kurikulum_mata_pelajaran_id' => 6, // MTK
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 60.60,
                'point_tugas' => 80.00,
                'point_uts' => 90.50,
                'point_uas' => 0,               
                'nilai_akhir' => 75,
                'predikat'  => 'B',
                'deskripsi' => 'Siswa memhami aljabar dengan baik',
                'rapor_id'  => 4
            ],
            [
                // 10
                'siswa_id' => 3, // Sanita
                'guru_id' => 7, // Guru Indon
                'siswa_rombel_id'   => 11,
                'kurikulum_mata_pelajaran_id' => 4, // B.Indo
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'jenis_penilaian'  => 'Susulan PTS',
                'point_absensi' => 60,
                'point_tugas' => 60,
                'point_uts' => 40,
                'point_uas' => 0,              
                'nilai_akhir' => 60,
                'predikat'  => 'C',
                'deskripsi' => 'Siswa kurang memahami KBBI',
                'rapor_id'  => 4
            ],
            [
                // 11
                'siswa_id' => 3, // Sanita
                'guru_id' => 5, // Guru PAI
                'siswa_rombel_id'   => 11,
                'kurikulum_mata_pelajaran_id' => 2, // PAI
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'jenis_penilaian'  => 'PAS',
                'point_absensi' => 60,
                'point_tugas' => 90,
                'point_uts' => 0,
                'point_uas' => 80,              
                'nilai_akhir' => 78,
                'predikat'  =>'B',
                'deskripsi' => 'Siswa memhami pelajaran Agama dengan baik',
                'rapor_id'  => 5
            ],
            [
                // 12
                'siswa_id' => 3, // Sanita
                'guru_id' => 6, // Guru PPKn
                'siswa_rombel_id'   => 11,
                'kurikulum_mata_pelajaran_id' => 3, // PPKn
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'jenis_penilaian'  => 'Remedial PAS',
                'point_absensi' => 60,
                'point_tugas' => 80,
                'point_uts' => 0,
                'point_uas' => 80,              
                'nilai_akhir' => 80,
                'predikat'  => null,
                'deskripsi' => null,
                'rapor_id'  => 5
            ],

            // Tahun 2024
            [
                // 13
                'siswa_id' => 3, // Sanita
                'guru_id' => 9, // Guru MTK
                'siswa_rombel_id'   => 7, // X-B-1
                'kurikulum_mata_pelajaran_id' => 6, // MTK
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 60,
                'point_tugas' => 80.00,
                'point_uts' => 90.50,
                'point_uas' => 0,               
                'nilai_akhir' => 0,
                'predikat'  => null,
                'deskripsi' => null,
                'rapor_id'  => null
            ],
            [
                // 14
                'siswa_id' => 3, // Sanita
                'guru_id' => 7, // Guru Indon
                'siswa_rombel_id'   => 7,
                'kurikulum_mata_pelajaran_id' => 4, // B.Indo
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 60,
                'point_tugas' => 80,
                'point_uts' => 80,
                'point_uas' => 0,              
                'nilai_akhir' => 0,
                'predikat'  => null,
                'deskripsi' => null,
                'rapor_id'  => null
            ],            

            // Yuli
            [
                // 15
                'siswa_id' => 5, // Yuli
                'guru_id' => 9, // Guru MTK
                'siswa_rombel_id'   => 13, // X-B-1
                'kurikulum_mata_pelajaran_id' => 6, // MTK
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 80.50,
                'point_tugas' => 80.00,
                'point_uts' => 90.50,
                'point_uas' => 0,          
                'nilai_akhir' => 80,
                'predikat'  => 'A',
                'deskripsi' => 'Siswa memahami pelajaran dengan baik',
                'rapor_id'  => 10
            ],
            [
                // 16
                'siswa_id' => 5, // Yuli
                'guru_id' => 7, // Guru Indon
                'siswa_rombel_id'   => 13,
                'kurikulum_mata_pelajaran_id' => 4, // B.Indo
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 90,
                'point_tugas' => 80,
                'point_uts' => 70,
                'point_uas' => 0,              
                'nilai_akhir' => 80,
                'predikat'  => 'A',
                'deskripsi' => 'Siswa memahami pelajaran dengan baik',
                'rapor_id'  => 10
            ],
            [
                // 17
                'siswa_id' => 5, // Yuli
                'guru_id' => 5, // Guru PAI
                'siswa_rombel_id'   => 13,
                'kurikulum_mata_pelajaran_id' => 2, // PAI
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'jenis_penilaian'  => 'PAS',
                'point_absensi' => 90,
                'point_tugas' => 90,
                'point_uts' => 0,
                'point_uas' => 80,              
                'nilai_akhir' => 90,
                'predikat'  => 'A',
                'deskripsi' => 'Siswa memahami pelajaran dengan baik',
                'rapor_id'  => 11
            ],
            [
                // 18
                'siswa_id' => 5, // Yuli
                'guru_id' => 6, // Guru PPKn
                'siswa_rombel_id'   => 13,
                'kurikulum_mata_pelajaran_id' => 3, // PPKn
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'jenis_penilaian'  => 'PAS',
                'point_absensi' => 100,
                'point_tugas' => 80,
                'point_uts' => 0,
                'point_uas' => 80,              
                'nilai_akhir' => 90,
                'predikat'  => 'A',
                'deskripsi' => 'Siswa memahami pelajaran dengan baik',
                'rapor_id'  => 11
            ],

            // Tingkat 11
            [
                // 19
                'siswa_id' => 5, // Yuli
                'guru_id' => 9, // Guru MTK
                'siswa_rombel_id'   => 5, // XI-B-1
                'kurikulum_mata_pelajaran_id' => 6, // MTK
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 80,
                'point_tugas' => 80.00,
                'point_uts' => 80.50,
                'point_uas' => 0,              
                'nilai_akhir' => 70,
                'predikat'  => null,
                'deskripsi' => null,
                'rapor_id'  => 12
            ],
            [
                // 20
                'siswa_id' => 5, // Yuli
                'guru_id' => 7, // Guru Indon
                'siswa_rombel_id'   => 5,
                'kurikulum_mata_pelajaran_id' => 4, // B.Indo
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 90,
                'point_tugas' => 80,
                'point_uts' => 70,
                'point_uas' => 0,              
                'nilai_akhir' => 80,
                'predikat'  => null,
                'deskripsi' => null,
                'rapor_id'  => 12
            ],            

            // Bagas
            [
                // 21
                'siswa_id' => 1, // Bagas
                'guru_id' => 9, // Guru MTK
                'siswa_rombel_id'   => 9, // X-A-1
                'kurikulum_mata_pelajaran_id' => 6, // MTK
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 70.50,
                'point_tugas' => 70.00,
                'point_uts' => 80.50,
                'point_uas' => 0,             
                'nilai_akhir' => 70,
                'predikat'  => null,
                'deskripsi' => null,
                'rapor_id'  => 7
            ],
            [
                // 22
                'siswa_id' => 1, // Bagas
                'guru_id' => 7, // Guru Indon
                'siswa_rombel_id'   => 9,
                'kurikulum_mata_pelajaran_id' => 4, // B.Indo
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 80,
                'point_tugas' => 80,
                'point_uts' => 70,
                'point_uas' => 0,              
                'nilai_akhir' => 80,
                'predikat'  => null,
                'deskripsi' => null,
                'rapor_id'  => 7
            ],
            [
                // 23
                'siswa_id' => 1, // Bagas
                'guru_id' => 5, // Guru PAI
                'siswa_rombel_id'   => 9,
                'kurikulum_mata_pelajaran_id' => 2, // PAI
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'jenis_penilaian'  => 'PAS',
                'point_absensi' => 90,
                'point_tugas' => 90,
                'point_uts' => 0,
                'point_uas' => 80,              
                'nilai_akhir' => 90,
                'predikat'  => null,
                'deskripsi' => null,
                'rapor_id'  => 8
            ],
            [
                // 24
                'siswa_id' => 1, // Bagas
                'guru_id' => 6, // Guru PPKn
                'siswa_rombel_id'   => 9,
                'kurikulum_mata_pelajaran_id' => 3, // PPKn
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'jenis_penilaian'  => 'PAS',
                'point_absensi' => 70,
                'point_tugas' => 80,
                'point_uts' => 0,
                'point_uas' => 80,              
                'nilai_akhir' => 80,
                'predikat'  => null,
                'deskripsi' => null,
                'rapor_id'  => 8
            ],

            // Tingkat 11
            [
                // 25
                'siswa_id' => 1, // Bagas
                'guru_id' => 7, // Guru Indon
                'siswa_rombel_id'   => 2,
                'kurikulum_mata_pelajaran_id' => 4, // B.Indo
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 80,
                'point_tugas' => 80,
                'point_uts' => 80,
                'point_uas' => 0,              
                'nilai_akhir' => 70,
                'predikat'  => null,
                'deskripsi' => null,
                'rapor_id'  => 9
            ],
            [
                // 26            
                'siswa_id' => 1, // Bagas
                'guru_id' => 9, // Guru MTK
                'siswa_rombel_id'   => 2, // XI-B-1
                'kurikulum_mata_pelajaran_id' => 6, // MTK
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 80,
                'point_tugas' => 80.00,
                'point_uts' => 90.50,
                'point_uas' => 0,               
                'nilai_akhir' => 80,
                'predikat'  => null,
                'deskripsi' => null,
                'rapor_id'  => 9
            ],            

            // Devi
            // Tingkat 12
            [
                // 27
                'siswa_id' => 8, // Devi
                'guru_id' => 9, // Guru MTK
                'siswa_rombel_id'   => 1, // XII-A-1
                'kurikulum_mata_pelajaran_id' => 6, // MTK
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 80,
                'point_tugas' => 80.00,
                'point_uts' => 70.50,
                'point_uas' => 0,             
                'nilai_akhir' => 0,
                'predikat'  => null,
                'deskripsi' => null,
                'rapor_id'  => 13
            ],
            [
                // 28
                'siswa_id' => 8, // Devi
                'guru_id' => 7, // Guru Indon
                'siswa_rombel_id'   => 1,
                'kurikulum_mata_pelajaran_id' => 4, // B.Indo
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 80,
                'point_tugas' => 80,
                'point_uts' => 80,
                'point_uas' => 0,              
                'nilai_akhir' => 0,
                'predikat'  => null,
                'deskripsi' => null,
                'rapor_id'  => 13
            ],            
            [
                // 1
                'siswa_id' => 4, // Rehan
                'guru_id' => 9, // Guru MTK
                'siswa_rombel_id'   => 12, // X-B-1
                'kurikulum_mata_pelajaran_id' => 6, // MTK
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 80.50,
                'point_tugas' => 80.00,
                'point_uts' => 90.50,
                'point_uas' => 0,          
                'nilai_akhir' => 80,
                'predikat'  => 'A',
                'deskripsi' => 'Siswa memhamai aljabar dengan baik',
                'rapor_id'  => 14
            ],
            [
                // 2
                'siswa_id' => 4, // Rehan
                'guru_id' => 7, // Guru Indon
                'siswa_rombel_id'   => 12,
                'kurikulum_mata_pelajaran_id' => 4, // B.Indo
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 90,
                'point_tugas' => 80,
                'point_uts' => 70,
                'point_uas' => 0,              
                'nilai_akhir' => 90,
                'predikat'  => 'A',
                'deskripsi' => 'Siswa memahami KBBI dengan baik',
                'rapor_id'  => 14
            ],
            [
                // 3
                'siswa_id' => 4, // Rehan
                'guru_id' => 5, // Guru PAI
                'siswa_rombel_id'   => 12,
                'kurikulum_mata_pelajaran_id' => 2, // PAI
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'jenis_penilaian'  => 'PAS',
                'point_absensi' => 90,
                'point_tugas' => 90,
                'point_uts' => 0,
                'point_uas' => 90,              
                'nilai_akhir' => 80,
                'predikat'  => null,
                'deskripsi' => null,
                'rapor_id'  => 15
            ],
            [
                // 4
                'siswa_id' => 4, // Rehan
                'guru_id' => 6, // Guru PPKn
                'siswa_rombel_id'   => 12,
                'kurikulum_mata_pelajaran_id' => 3, // PPKn
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'jenis_penilaian'  => 'PAS',
                'point_absensi' => 100,
                'point_tugas' => 80,
                'point_uts' => 0,
                'point_uas' => 90,              
                'nilai_akhir' => 80,
                'predikat'  => null,
                'deskripsi' => null,
                'rapor_id'  => 15
            ],

            // Tingkat 11
            [
                // 5
                'siswa_id' => 4, // Rehan
                'guru_id' => 9, // Guru MTK
                'siswa_rombel_id'   => 4, // XI-B-1
                'kurikulum_mata_pelajaran_id' => 6, // MTK
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 90,
                'point_tugas' => 80.00,
                'point_uts' => 90.50,
                'point_uas' => 0,           
                'nilai_akhir' => 82,
                'predikat'  => 'A',
                'deskripsi' => 'Peserta memmahami aljabar dengan baik',
                'rapor_id'  => 16
            ],
            [
                // 6
                'siswa_id' => 4, // Rehan
                'guru_id' => 7, // Guru Indon
                'siswa_rombel_id'   => 4,
                'kurikulum_mata_pelajaran_id' => 4, // B.Indo
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 90,
                'point_tugas' => 80,
                'point_uts' => 80,
                'point_uas' => 0,              
                'nilai_akhir' => 76,
                'predikat'  => null,
                'deskripsi' => null,
                'rapor_id'  => 16
            ],                 

            // Winton
            [
                // 1
                'siswa_id' => 2, // Winton
                'guru_id' => 5, // Guru Agama
                'siswa_rombel_id'   => 10, // X-B-1
                'kurikulum_mata_pelajaran_id' => 2, // Agama
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 80.50,
                'point_tugas' => 83.20,
                'point_uts' => 95.50,
                'point_uas' => 0,          
                'nilai_akhir' => 98.80,
                'predikat'  => 'A',
                'deskripsi' => 'Siswa memhamai Asmaul Husna dengan baik',
                'rapor_id'  => 1
            ],
            [
                // 1
                'siswa_id' => 2, // Winton
                'guru_id' => 6, // Guru PKN
                'siswa_rombel_id'   => 10, // X-B-1
                'kurikulum_mata_pelajaran_id' => 3, // PKN
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 99.90,
                'point_tugas' => 88.72,
                'point_uts' => 90.51,
                'point_uas' => 0,          
                'nilai_akhir' => 98.81,
                'predikat'  => 'A',
                'deskripsi' => 'Siswa memhamai Pancasila dengan baik',
                'rapor_id'  => 1
            ],
            [
                // 1
                'siswa_id' => 2, // Winton
                'guru_id' => 8, // Guru Inggris
                'siswa_rombel_id'   => 10, // X-B-1
                'kurikulum_mata_pelajaran_id' => 5, // Inggris
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 80.50,
                'point_tugas' => 80.00,
                'point_uts' => 90.50,
                'point_uas' => 0,          
                'nilai_akhir' => 78.52,
                'predikat'  => 'B',
                'deskripsi' => 'Siswa memhamai Bahasa Inggris dengan baik',
                'rapor_id'  => 1
            ],
            [
                // 1
                'siswa_id' => 2, // Winton
                'guru_id' => 10, // Guru Sejarah
                'siswa_rombel_id'   => 10, // X-B-1
                'kurikulum_mata_pelajaran_id' => 7, // Sejarah
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 80.50,
                'point_tugas' => 80.00,
                'point_uts' => 90.50,
                'point_uas' => 0,          
                'nilai_akhir' => 88.87,
                'predikat'  => 'A',
                'deskripsi' => 'Siswa memhamai Sejarah dengan baik',
                'rapor_id'  => 1
            ],
            [
                // 1
                'siswa_id' => 2, // Winton
                'guru_id' => 11, // Guru PJOK
                'siswa_rombel_id'   => 10, // X-B-1
                'kurikulum_mata_pelajaran_id' => 8, // PJOK
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 80.50,
                'point_tugas' => 80.00,
                'point_uts' => 90.50,
                'point_uas' => 0,          
                'nilai_akhir' => 99.66,
                'predikat'  => 'A',
                'deskripsi' => 'Siswa berbakat berenang',
                'rapor_id'  => 1
            ],
            [
                // 1
                'siswa_id' => 2, // Winton
                'guru_id' => 12, // Guru Seni Budaya
                'siswa_rombel_id'   => 10, // X-B-1
                'kurikulum_mata_pelajaran_id' => 9, // Seni Budaya
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 80.50,
                'point_tugas' => 80.00,
                'point_uts' => 90.50,
                'point_uas' => 0,          
                'nilai_akhir' => 77.72,
                'predikat'  => 'B',
                'deskripsi' => 'Siswa memhamai seni',
                'rapor_id'  => 1
            ],
            [
                // 1
                'siswa_id' => 2, // Winton
                'guru_id' => 13, // Guru Informatika
                'siswa_rombel_id'   => 10, // X-B-1
                'kurikulum_mata_pelajaran_id' => 10, // Informatika
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 80.50,
                'point_tugas' => 80.00,
                'point_uts' => 90.50,
                'point_uas' => 0,          
                'nilai_akhir' => 99.99,
                'predikat'  => 'A',
                'deskripsi' => 'Siswa mahir membuat program',
                'rapor_id'  => 1
            ],
            [
                // 1
                'siswa_id' => 2, // Winton
                'guru_id' => 15, // Guru P5
                'siswa_rombel_id'   => 10, // X-B-1
                'kurikulum_mata_pelajaran_id' => 11, // Projek P5
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 80.50,
                'point_tugas' => 80.00,
                'point_uts' => 90.50,
                'point_uas' => 0,          
                'nilai_akhir' => 80,
                'predikat'  => 'A',
                'deskripsi' => 'Siswa disiplin dan santun',
                'rapor_id'  => 1
            ],
            [
                // 1
                'siswa_id' => 2, // Winton
                'guru_id' => 16, // Guru Fisika
                'siswa_rombel_id'   => 10, // X-B-1
                'kurikulum_mata_pelajaran_id' => 32, // Fisika
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 80.50,
                'point_tugas' => 80.00,
                'point_uts' => 90.50,
                'point_uas' => 0,          
                'nilai_akhir' => 88.88,
                'predikat'  => 'B',
                'deskripsi' => 'Siswa memhamai fisika dengan baik',
                'rapor_id'  => 1
            ],
            [
                // 1
                'siswa_id' => 2, // Winton
                'guru_id' => 17, // Guru Kimia
                'siswa_rombel_id'   => 10, // X-B-1
                'kurikulum_mata_pelajaran_id' => 33, // Kimia
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 80.50,
                'point_tugas' => 80.00,
                'point_uts' => 90.50,
                'point_uas' => 0,          
                'nilai_akhir' => 88.88,
                'predikat'  => 'B',
                'deskripsi' => 'Siswa memhamai fisika dengan baik',
                'rapor_id'  => 1
            ],
            [
                // 1
                'siswa_id' => 2, // Winton
                'guru_id' => 19, // Guru Sosiologi
                'siswa_rombel_id'   => 10, // X-B-1
                'kurikulum_mata_pelajaran_id' => 42, // Sosiologi
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 80.50,
                'point_tugas' => 80.00,
                'point_uts' => 90.50,
                'point_uas' => 0,          
                'nilai_akhir' => 87.87,
                'predikat'  => 'B',
                'deskripsi' => 'Siswa memhamai sosiologi dengan baik',
                'rapor_id'  => 1
            ],
            [
                // 1
                'siswa_id' => 2, // Winton
                'guru_id' => 21, // Guru Jerman
                'siswa_rombel_id'   => 10, // X-B-1
                'kurikulum_mata_pelajaran_id' => 54, // Jerman
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 80.50,
                'point_tugas' => 80.00,
                'point_uts' => 90.50,
                'point_uas' => 0,          
                'nilai_akhir' => 97.80,
                'predikat'  => 'B',
                'deskripsi' => 'Siswa memhamai bahasa Jerman dengan baik',
                'rapor_id'  => 1
            ],            
            [
                // 1
                'siswa_id' => 2, // Winton
                'guru_id' => 18, // Guru Eknomi
                'siswa_rombel_id'   => 10, // X-B-1
                'kurikulum_mata_pelajaran_id' => 40, // Eknomi
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 80.50,
                'point_tugas' => 80.00,
                'point_uts' => 90.50,
                'point_uas' => 0,          
                'nilai_akhir' => 98.90,
                'predikat'  => 'A',
                'deskripsi' => 'Siswa memhamai eknomi makro dengan baik',
                'rapor_id'  => 1
            ],
            [
                // 1
                'siswa_id' => 2, // Winton
                'guru_id' => 20, // Guru Jepang
                'siswa_rombel_id'   => 10, // X-B-1
                'kurikulum_mata_pelajaran_id' => 50, // Bahaasa Jepang
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'jenis_penilaian'  => 'PTS',
                'point_absensi' => 80.50,
                'point_tugas' => 80.00,
                'point_uts' => 90.50,
                'point_uas' => 0,          
                'nilai_akhir' => 87.60,
                'predikat'  => 'A',
                'deskripsi' => 'Siswa memhamai kanji dengan baik',
                'rapor_id'  => 1
            ],
        ]);        

        /**
         * 🎯 SPA: C.R.U.D
         */
        // rapor_nilai_siswa

        /**
         * 🎯 SPA: C.R.U.D
         */
        // projek_p5

        /**
         * 🎯 SPA: C.R.U.D
         */
        // data_nilai_p5

        /**
         * 🎯 SPA: C.R.U.D
         */
        // rapor

        /** 
         * 🎯 SPA: C.R.U.D
         * tu: C.R.U.D
         * */ 
        DataBerkas::insert([
            [
                'nama_berkas' => 'Bayaran SPP Budi',
                'berkas' => 'berkas-budi.jpg',
                'hari' => '2023-08-24', // 2023
                'tahun_akademik_id' => 1, // 2023
                'semester_id' => 1 // Ganjil
            ],
            [
                'nama_berkas' => 'Bayaran SPP Winton Almundarisna',
                'berkas' => 'berkas-winton.jpg',
                'hari' => '2023-05-15', // 2023
                'tahun_akademik_id' => 1, // 2023
                'semester_id' => 1 // Ganjil
            ],
            [
                'nama_berkas' => 'Bayaran SPP Bagas',
                'berkas' => 'berkas-bagas.jpg',
                'hari' => '2024-02-25', // 2023
                'tahun_akademik_id' => 1, // 2023
                'semester_id' => 2 // Genap
            ],
            [
                'nama_berkas' => 'Bayaran SPP Sanita',
                'berkas' => 'berkas-sanita.jpg',
                'hari' => '2024-07-13', // 2024
                'tahun_akademik_id' => 2, // 2024
                'semester_id' => 3 // Ganjil
            ],
        ]);

        /**
         * SPA: C.R.U.D
         * tu: C.R.U.D
         * Kepsek: GET, SHOW
         *  */ 
        Keuangan::insert([
            [
                'nama_akun' => 'TU',
                'debit' => 0, // nambah
                'kredit' => 20000, // ngurang
                'keterangan' => 'Beli ATK',
                'tahun_akademik_id' => 1
            ],
            [
                'nama_akun' => 'TU',
                'debit' => 50000, // nambah
                'kredit' => 20000, // ngurang
                'keterangan' => 'Beli Galon Minum',
                'tahun_akademik_id' => 1
            ],
            [
                'nama_akun' => 'Rina',
                'debit' => 50000,
                'kredit' => 0,
                'keterangan' => 'Bayaran SPP',
                'tahun_akademik_id' => 2
            ],
        ]);


        // Pertemuan
        Pertemuan::insert([
            // 1
            [
                'jadwal_pelajaran_id' => 2, // Indo | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 1,
                'judul' => 'Memahami Penulisan KBBI',
                'tanggal'   => '2023-05-01',
                'jenis' => 'normal'
            ],
            // 2
            [
                'jadwal_pelajaran_id' => 2, // Indo | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 2,
                'judul' => 'Menulis sesuai KBBI',
                'tanggal'   => '2023-05-08',
                'jenis' => 'normal'
            ],
            // 3
            [
                'jadwal_pelajaran_id' => 2, // Indo | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 3,
                'judul' => 'Membuat berita acara sesuai KBBI',
                'tanggal'   => '2023-05-15',
                'jenis' => 'normal'
            ],
            // 4
            [
                'jadwal_pelajaran_id' => 2, // Indo | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 4,
                'judul' => 'Menulis Teks Wawancara',
                'tanggal'   => '2023-05-22',
                'jenis' => 'normal'
            ],
            // 5
            [
                'jadwal_pelajaran_id' => 2, // Indo | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 5,
                'judul' => 'Praktik Wawancara',
                'tanggal'   => '2023-05-29',
                'jenis' => 'normal'
            ],
            // 6
            [
                'jadwal_pelajaran_id' => 2, // Indo | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 6,
                'judul' => 'Menganalisis Kalimat Efektif',
                'tanggal'   => '2023-06-05',
                'jenis' => 'normal'
            ],
            // 7
            [
                'jadwal_pelajaran_id' => 2, // Indo | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 7,
                'judul' => 'Menulis Kalimat Efektif',
                'tanggal'   => '2023-06-12',
                'jenis' => 'normal'
            ],
            // 8 (UTS)
            [
                'jadwal_pelajaran_id' => 2, // Indo | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 8,
                'judul' => 'UTS',
                'tanggal'   => '2023-06-19',
                'jenis' => 'uts'
            ],
            // 9
            [
                'jadwal_pelajaran_id' => 2, // Indo | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 9,
                'judul' => 'Kalimat Tersirat',
                'tanggal'   => '2023-06-26',
                'jenis' => 'normal'
            ],
            // 10
            [
                'jadwal_pelajaran_id' => 2, // Indo | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 10,
                'judul' => 'Kalimat Tersurat',
                'tanggal'   => '2023-07-03',
                'jenis' => 'normal'
            ],
            // 11
            [
                'jadwal_pelajaran_id' => 2, // Indo | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 11,
                'judul' => 'Majas Hiperbola',
                'tanggal'   => '2023-07-10',
                'jenis' => 'normal'
            ],
            // 12
            [
                'jadwal_pelajaran_id' => 2, // Indo | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 12,
                'judul' => 'Majas Metafora',
                'tanggal'   => '2023-07-17',
                'jenis' => 'normal'
            ],
            // 13
            [
                'jadwal_pelajaran_id' => 2, // Indo | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 13,
                'judul' => 'Majas Sarkasme',
                'tanggal'   => '2023-07-24',
                'jenis' => 'normal'
            ],
            // 14
            [
                'jadwal_pelajaran_id' => 2, // Indo | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 14,
                'judul' => 'Majas Ironi',
                'tanggal'   => '2023-07-31',
                'jenis' => 'normal'
            ],
            // 15
            [
                'jadwal_pelajaran_id' => 2, // Indo | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 15,
                'judul' => 'Majas Retorika',
                'tanggal'   => '2023-08-07',
                'jenis' => 'normal'
            ],
            // 16 (UAS)
            [
                'jadwal_pelajaran_id' => 2, // Indo | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 16,
                'judul' => 'UAS',
                'tanggal'   => '2023-08-14',
                'jenis' => 'uas'
            ],

            // Genap
            // 17
            [
                'jadwal_pelajaran_id' => 12, // Indo | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 1,
                'judul' => 'Membuat Cerita Fiksi',
                'tanggal'   => '2024-01-01',
                'jenis' => 'normal'
            ],
            // 18
            [
                'jadwal_pelajaran_id' => 12, // Indo | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 2,
                'judul' => 'Presentasi Cerita Fiksi',
                'tanggal'   => '2024-01-08',
                'jenis' => 'normal'
            ],
            // 19
            [
                'jadwal_pelajaran_id' => 12, // Indo | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 3,
                'judul' => 'Membuat berita acara sesuai KBBI',
                'tanggal'   => '2024-01-15',
                'jenis' => 'normal'
            ],
            // 20
            [
                'jadwal_pelajaran_id' => 12, // Indo | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 4,
                'judul' => 'Menulis Teks Wawancara',
                'tanggal'   => '2024-01-22',
                'jenis' => 'normal'
            ],
            // 21
            [
                'jadwal_pelajaran_id' => 12, // Indo | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 5,
                'judul' => 'Praktik Wawancara',
                'tanggal'   => '2024-02-05',
                'jenis' => 'normal'
            ],
            // 22
            [
                'jadwal_pelajaran_id' => 12, // Indo | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 6,
                'judul' => 'Menganalisis Kalimat Efektif',
                'tanggal'   => '2024-02-12',
                'jenis' => 'normal'
            ],
            // 23
            [
                'jadwal_pelajaran_id' => 12, // Indo | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 7,
                'judul' => 'Menulis Kalimat Efektif',
                'tanggal'   => '2024-02-19',
                'jenis' => 'normal'
            ],
            // 24 (UTS)
            [
                'jadwal_pelajaran_id' => 12, // Indo | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 8,
                'judul' => 'UTS',
                'tanggal'   => '2024-02-26',
                'jenis' => 'uts'
            ],
            //25
            [
                'jadwal_pelajaran_id' => 12, // Indo | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 9,
                'judul' => 'Kalimat Tersirat',
                'tanggal'   => '2024-03-04',
                'jenis' => 'normal'
            ],
            // 26
            [
                'jadwal_pelajaran_id' => 12, // Indo | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 10,
                'judul' => 'Kalimat Tersurat',
                'tanggal'   => '2024-03-11',
                'jenis' => 'normal'
            ],
            // 27
            [
                'jadwal_pelajaran_id' => 12, // Indo | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 11,
                'judul' => 'Majas Hiperbola',
                'tanggal'   => '2024-03-18',
                'jenis' => 'normal'
            ],
            // 28
            [
                'jadwal_pelajaran_id' => 12, // Indo | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 12,
                'judul' => 'Majas Metafora',
                'tanggal'   => '2024-03-25',
                'jenis' => 'normal'
            ],
            // 29
            [
                'jadwal_pelajaran_id' => 12, // Indo | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 13,
                'judul' => 'Majas Sarkasme',
                'tanggal'   => '2024-04-01',
                'jenis' => 'normal'
            ],
            // 30
            [
                'jadwal_pelajaran_id' => 12, // Indo | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 14,
                'judul' => 'Majas Ironi',
                'tanggal'   => '2024-04-08',
                'jenis' => 'normal'
            ],
            // 31
            [
                'jadwal_pelajaran_id' => 12, // Indo | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 15,
                'judul' => 'Majas Retorika',
                'tanggal'   => '2024-04-15',
                'jenis' => 'normal'
            ],
            // 32 (UAS)
            [
                'jadwal_pelajaran_id' => 12, // Indo | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 16,
                'judul' => 'UAS',
                'tanggal'   => '2024-04-22',
                'jenis' => 'uas'
            ],

            // MTK
            // 33 (1)
            [
                'jadwal_pelajaran_id' => 1, // MTK | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 1,
                'judul' => 'Bilangan Bulat dan Operasinya',
                'tanggal'   => '2023-05-01',
                'jenis' => 'normal'
            ],
            // 34 (2)
            [
                'jadwal_pelajaran_id' => 1, // MTK | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 2,
                'judul' => 'Bilangan Pecahan dan Desimal',
                'tanggal'   => '2023-05-08',
                'jenis' => 'normal'
            ],
            // 35 (3)
            [
                'jadwal_pelajaran_id' => 1, // MTK | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 3,
                'judul' => 'Faktor, Kelipatan, dan Bilangan Prima',
                'tanggal'   => '2023-05-15',
                'jenis' => 'normal'
            ],
            // 36 (4)
            [
                'jadwal_pelajaran_id' => 1, // MTK | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 4,
                'judul' => 'Perbandingan dan Skala',
                'tanggal'   => '2023-05-22',
                'jenis' => 'normal'
            ],
            // 37 (5)
            [
                'jadwal_pelajaran_id' => 1, // MTK | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 5,
                'judul' => 'Persamaan Linear Satu Variabel',
                'tanggal'   => '2023-05-29',
                'jenis' => 'normal'
            ],
            // 38 (6)
            [
                'jadwal_pelajaran_id' => 1, // MTK | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 6,
                'judul' => 'Pertidaksamaan Linear Satu Variabel',
                'tanggal'   => '2023-06-05',
                'jenis' => 'normal'
            ],
            // 39 (7)
            [
                'jadwal_pelajaran_id' => 1, // MTK | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 7,
                'judul' => 'Sistem Persamaan Linear Dua Variabel',
                'tanggal'   => '2023-06-12',
                'jenis' => 'normal'
            ],
            // 40 (8) (UTS)
            [
                'jadwal_pelajaran_id' => 1, // MTK | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 8,
                'judul' => 'UTS',
                'tanggal'   => '2023-06-19',
                'jenis' => 'uts'
            ],
            // 41 (9)
            [
                'jadwal_pelajaran_id' => 1, // MTK | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 9,
                'judul' => 'Fungsi dan Grafik Linear',
                'tanggal'   => '2023-06-26',
                'jenis' => 'normal'
            ],
            // 42 (10)
            [
                'jadwal_pelajaran_id' => 1, // MTK | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 10,
                'judul' => 'Bangun Datar: Segitiga dan Segiempat',
                'tanggal'   => '2023-07-03',
                'jenis' => 'normal'
            ],
            // 43 (11)
            [
                'jadwal_pelajaran_id' => 1, // MTK | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 11,
                'judul' => 'Lingkaran: Unsur dan Keliling',
                'tanggal'   => '2023-07-10',
                'jenis' => 'normal'
            ],
            // 44 (12)
            [
                'jadwal_pelajaran_id' => 1, // MTK | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 12,
                'judul' => 'Luas Bangun Datar',
                'tanggal'   => '2023-07-17',
                'jenis' => 'normal'
            ],
            // 45 (13)
            [
                'jadwal_pelajaran_id' => 1, // MTK | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 13,
                'judul' => 'Bangun Ruang: Kubus dan Balok',
                'tanggal'   => '2023-07-24',
                'jenis' => 'normal'
            ],
            // 46 (14)
            [
                'jadwal_pelajaran_id' => 1, // MTK | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 14,
                'judul' => 'Bangun Ruang: Prisma dan Limas',
                'tanggal'   => '2023-07-31',
                'jenis' => 'normal'
            ],
            // 47 (15)
            [
                'jadwal_pelajaran_id' => 1, // MTK | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 15,
                'judul' => 'Bangun Ruang: Tabung, Kerucut, dan Bola',
                'tanggal'   => '2023-08-07',
                'jenis' => 'normal'
            ],
            // 48 (16) (UAS)
            [
                'jadwal_pelajaran_id' => 1, // MTK | 2023 (Ganjil) | X-B-1
                'pertemuan_ke'  => 16,
                'judul' => 'UAS',
                'tanggal'   => '2023-08-14',
                'jenis' => 'uas'
            ],

            // Genap
            // 49 (1)
            [
                'jadwal_pelajaran_id' => 11, // MTK | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 1,
                'judul' => 'Statistika: Data, Tabel, dan Diagram',
                'tanggal'   => '2024-01-01',
                'jenis' => 'normal'
            ],
            // 50 (2)
            [
                'jadwal_pelajaran_id' => 11, // MTK | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 2,
                'judul' => 'Ukuran Pemusatan Data (Mean, Median, Modus)',
                'tanggal'   => '2024-01-08',
                'jenis' => 'normal'
            ],
            // 51 (3)
            [
                'jadwal_pelajaran_id' => 11, // MTK | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 3,
                'judul' => 'Peluang dan Percobaan Sederhana',
                'tanggal'   => '2024-01-15',
                'jenis' => 'normal'
            ],
            // 52 (4)
            [
                'jadwal_pelajaran_id' => 11, // MTK | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 4,
                'judul' => 'Barisan Aritmetika',
                'tanggal'   => '2024-01-22',
                'jenis' => 'normal'
            ],
            // 53 (5)
            [
                'jadwal_pelajaran_id' => 11, // MTK | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 5,
                'judul' => 'Deret Aritmetika',
                'tanggal'   => '2024-02-05',
                'jenis' => 'normal'
            ],
            // 54 (6)
            [
                'jadwal_pelajaran_id' => 11, // MTK | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 6,
                'judul' => 'Barisan Geometri',
                'tanggal'   => '2024-02-12',
                'jenis' => 'normal'
            ],
            // 55 (7)
            [
                'jadwal_pelajaran_id' => 11, // MTK | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 7,
                'judul' => 'Deret Geometri',
                'tanggal'   => '2024-02-19',
                'jenis' => 'normal'
            ],
            // 56 (8) (UTS)
            [
                'jadwal_pelajaran_id' => 11, // MTK | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 8,
                'judul' => 'UTS',
                'tanggal'   => '2024-02-26',
                'jenis' => 'uts'
            ],
            // 57 (9)
            [
                'jadwal_pelajaran_id' => 11, // MTK | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 9,
                'judul' => 'Persamaan Kuadrat',
                'tanggal'   => '2024-03-04',
                'jenis' => 'normal'
            ],
            // 58 (10)
            [
                'jadwal_pelajaran_id' => 11, // MTK | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 10,
                'judul' => 'Fungsi Kuadrat dan Grafiknya',
                'tanggal'   => '2024-03-11',
                'jenis' => 'normal'
            ],
            // 59 (11)
            [
                'jadwal_pelajaran_id' => 11, // MTK | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 11,
                'judul' => 'Trigonometri Dasar: Perbandingan Sudut pada Segitiga',
                'tanggal'   => '2024-03-18',
                'jenis' => 'normal'
            ],
            // 60 (12)
            [
                'jadwal_pelajaran_id' => 11, // MTK | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 12,
                'judul' => 'Identitas Trigonometri Sederhana',
                'tanggal'   => '2024-03-25',
                'jenis' => 'normal'
            ],
            // 61 (13)
            [
                'jadwal_pelajaran_id' => 11, // MTK | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 13,
                'judul' => 'Logaritma dan Eksponen',
                'tanggal'   => '2024-04-01',
                'jenis' => 'normal'
            ],
            // 62 (14)
            [
                'jadwal_pelajaran_id' => 11, // MTK | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 14,
                'judul' => 'Limit Fungsi Aljabar',
                'tanggal'   => '2024-04-08',
                'jenis' => 'normal'
            ],
            // 63 (15)
            [
                'jadwal_pelajaran_id' => 11, // MTK | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 15,
                'judul' => 'Turunan Fungsi Aljabar',
                'tanggal'   => '2024-04-15',
                'jenis' => 'normal'
            ],
            // 64 (16) (UAS)
            [
                'jadwal_pelajaran_id' => 11, // MTK | 2024 (Genap) | X-B-1
                'pertemuan_ke'  => 16,
                'judul' => 'UAS',
                'tanggal'   => '2024-04-22',
                'jenis' => 'uas'
            ],
        ]);            

        // Jurnal KBM
        JurnalKbm::insert([
            // 1
            [
                'pertemuan_id' => 1, // Indon || 2023 (Ganjil) || X-B-1
                'uraian_kegiatan' => 'Penjelasan konsep dan latihan soal',
                'metode' => 'Diskusi Kelompok',
                'catatan' => 'Sebagian siswa belum paham materi Bahasa Indonesia'
            ],
            // 2
            [
                'pertemuan_id' => 2, // Indon || 2023 (Ganjil) || X-B-1
                'uraian_kegiatan' => 'Quis Harian',
                'metode' => 'Online Aplikasi',
                'catatan' => 'Semua siswa mengikuti kuis Bahasa Indonesia dengan tertib'
            ],
            // 3
            [
                'pertemuan_id' => 8, // Indon || 2023 (Ganjil) || X-B-1
                'uraian_kegiatan' => 'UTS',
                'metode' => 'Soal CBT',
                'catatan' => 'UTS Bahasa Indonesia dilakukan secara online dengan soal CBT',
            ],
            // 4
            [
                'pertemuan_id' => 16, // Indon || 2023 (Ganjil) || X-B-1
                'uraian_kegiatan' => 'UAS',
                'metode' => 'Tatap Muka',
                'catatan' => 'UAS Bahasa Indonesia dilakukan secara offline dengan kertas selembar',
            ],
            // 5
            // Genap
            [
                'pertemuan_id' => 17, // Indon || 2024 (Genap) || X-B-1
                'uraian_kegiatan' => 'Menulis Materi dan Mengerjakan Soal',
                'metode' => 'Tatap Muka',
                'catatan' => 'Kelas mapel Bahasa Indonesia dalam kondisi tertib'
            ],
            // 6
            [
                'pertemuan_id' => 18, // Indon || 2024 (Genap) || X-B-1
                'uraian_kegiatan' => 'Quis Harian',
                'metode' => 'Manual',
                'catatan' => 'Siswa belum sepenuhnya memahami materi Bahasa Indonesia'
            ],
            // 7
            [
                'pertemuan_id' => 24, // Indon || 2024 (Genap) || X-B-1
                'uraian_kegiatan' => 'UTS',
                'metode' => 'Online',
                'catatan' => 'Materi PDF Bahasa Indonesia tidak bisa dibuka',
            ],
            // 8
            [
                'pertemuan_id' => 32, // Indon || 2024 (Genap) || X-B-1
                'uraian_kegiatan' => 'UAS',
                'metode' => 'Online',
                'catatan' => 'UAS Bahasa Indonesia dilakukan melalui SIAKAD',
            ],

            // MTK Ganjil
            // 9
            [
                'pertemuan_id' => 33, // MTK || 2023 (Ganjil) || X-B-1
                'uraian_kegiatan' => 'Penjelasan konsep dan latihan soal',
                'metode' => 'Belajar Mandiri',
                'catatan' => 'Seluruh siswa memahami materi matematika dengan baik'
            ],
            // 10
            [
                'pertemuan_id' => 34, // MTK || 2023 (Ganjil) || X-B-1
                'uraian_kegiatan' => 'Quis Harian',
                'metode' => 'Online Aplikasi',
                'catatan' => 'Semua siswa mengikuti kuis matematika dengan tertib'
            ],
            // 11
            [
                'pertemuan_id' => 40, // MTK || 2023 (Ganjil) || X-B-1
                'uraian_kegiatan' => 'UTS',
                'metode' => 'Soal CBT',
                'catatan' => 'UTS matematika dilakukan secara online dengan soal CBT',
            ],
            // 12
            [
                'pertemuan_id' => 48, // MTK || 2023 (Ganjil) || X-B-1
                'uraian_kegiatan' => 'UAS',
                'metode' => 'Tatap Muka',
                'catatan' => 'UAS matematika dilakukan secara offline dengan kertas selembar',
            ],
            // Genap
            // 13
            [
                'pertemuan_id' => 49, // MTK || 2024 (Genap) || X-B-1
                'uraian_kegiatan' => 'Menulis Materi dan Mengerjakan Soal',
                'metode' => 'Tatap Muka',
                'catatan' => 'Kelas mapel matematika dalam kondisi tertib'
            ],
            // 14
            [
                'pertemuan_id' => 50, // MTK || 2024 (Genap) || X-B-1
                'uraian_kegiatan' => 'Quis Harian',
                'metode' => 'Manual',
                'catatan' => 'Siswa belum sepenuhnya memahami materi matematika'
            ],
            // 15
            [
                'pertemuan_id' => 56, // MTK || 2024 (Genap) || X-B-1
                'uraian_kegiatan' => 'UTS',
                'metode' => 'Online',
                'catatan' => 'Materi PDF matematika tidak bisa dibuka',
            ],
            // 16
            [
                'pertemuan_id' => 64, // MTK || 2024 (Genap) || X-B-1
                'uraian_kegiatan' => 'UAS',
                'metode' => 'Online',
                'catatan' => 'UAS matematika dilakukan melalui SIAKAD',
            ],
        ]);

        Materi::insert([
            // 1
            [
                'pertemuan_id' => 1,
                'judul' => 'Memahami Penulisan KBBI',
                'deskripsi' => 'Memahami cara penulisan yang benar sesuai KBBI',
                'file' => 'materi_satu.pdf',
                'link_video' => 'www.youtube.com'
            ],
            // 2
            [
                'pertemuan_id' => 2,
                'judul' => 'Menulis Sesuai KBBI',
                'deskripsi' => 'Membuat tulisan sesuai KBBI',
                'file' => 'materi_dua.pdf',
                'link_video' => 'www.youtube.com'
            ],
            // 3
            [
                'pertemuan_id' => 8,
                'judul' => 'UTS',
                'deskripsi' => 'UTS',
                'file' => 'materi_uts.pdf',
                'link_video' => ''
            ],
            // 4
            [
                'pertemuan_id' => 16,
                'judul' => 'UAS',
                'deskripsi' => 'UAS',
                'file' => 'materi_uas.pdf',
                'link_video' => ''
            ],
            // 5
            [
                'pertemuan_id' => 17,
                'judul' => 'Cerita Fiksi',
                'deskripsi' => 'Belajar Cerita Fiksi',
                'file' => 'materi_satu_genap.pdf',
                'link_video' => ''
            ],
            // 6
            [
                'pertemuan_id' => 18,
                'judul' => 'Presentasi Cerita Fiksi',
                'deskripsi' => 'Presentasi Cerita Fiksi',
                'file' => 'materi_dua_genap.pdf',
                'link_video' => ''
            ],
            // 7
            [
                'pertemuan_id' => 24,
                'judul' => 'UTS',
                'deskripsi' => 'UTS',
                'file' => 'uts_genap.pdf',
                'link_video' => ''
            ],
            // 8
            [
                'pertemuan_id' => 32,
                'judul' => 'UAS',
                'deskripsi' => 'UAS',
                'file' => 'uas_genap.pdf',
                'link_video' => ''
            ],

            // MTK
            // 9
            [
                'pertemuan_id' => 33,
                'judul' => 'Materi Bilangan Bulat dan Operasinya',
                'deskripsi' => 'Memahami bilangan bulat dan operasinya',
                'file' => 'materi_satu.pdf',
                'link_video' => 'www.youtube.com'
            ],
            // 10
            [
                'pertemuan_id' => 34,
                'judul' => 'Materi Bilangan Pecahan dan Desimal',
                'deskripsi' => 'Memahami bilangan pecahan dan desimal',
                'file' => 'materi_dua.pdf',
                'link_video' => 'www.youtube.com'
            ],
            // 11
            [
                'pertemuan_id' => 40,
                'judul' => 'UTS',
                'deskripsi' => 'UTS',
                'file' => 'materi_uts.pdf',
                'link_video' => ''
            ],
            // 12
            [
                'pertemuan_id' => 48,
                'judul' => 'UAS',
                'deskripsi' => 'UAS',
                'file' => 'materi_uas.pdf',
                'link_video' => ''
            ],
            // 13
            [
                'pertemuan_id' => 49,
                'judul' => 'Materi Statitiska',
                'deskripsi' => 'Belajar Statistika',
                'file' => 'materi_statistika.pdf',
                'link_video' => ''
            ],
            // 14
            [
                'pertemuan_id' => 50,
                'judul' => 'Materi Mean, Median, Modus',
                'deskripsi' => 'Belajar Mean, Median dan Modus',
                'file' => 'materi_dua_genap.pdf',
                'link_video' => ''
            ],
            // 15
            [
                'pertemuan_id' => 56,
                'judul' => 'UTS',
                'deskripsi' => 'UTS',
                'file' => 'uts_genap.pdf',
                'link_video' => ''
            ],
            // 16
            [
                'pertemuan_id' => 64,
                'judul' => 'UAS',
                'deskripsi' => 'UAS',
                'file' => 'uas_genap.pdf',
                'link_video' => ''
            ],
        ]);

        ForumDiskusi::insert([
            // 1
            [
                'pertemuan_id'  => 1,
                'judul'         => 'Diskusi KBBI Pertemuan Satu',
                'deskripsi'     => 'Tanyakan apa yang kalian tidak mengerti disini',
                'guru_id'       => 7
            ],
            // 2
            [
                'pertemuan_id'  => 2,
                'judul'         => 'Diskusi Pertemuan Dua',
                'deskripsi'     => '',
                'guru_id'       => 7
            ],
            // 3
            [
                'pertemuan_id'  => 9,
                'judul'         => 'Diskusi Pertemuan Sembilan',
                'deskripsi'     => '',
                'guru_id'       => 7
            ],
            // Genap
            // 4
            [
                'pertemuan_id'  => 17,
                'judul'         => 'Diskusi Pertemuan Satu Genap',
                'deskripsi'     => 'Diskusikan pembahasan soal minggu lalu disini',
                'guru_id'       => 7
            ],
            // 5
            [
                'pertemuan_id'  => 25,
                'judul'         => 'Diskusi Pertemuan Sembilan',
                'deskripsi'     => '',
                'guru_id'       => 7
            ],
            // 6
            [
                'pertemuan_id'  => 31,
                'judul'         => 'Diskusi Pertemuan Lima Belas',
                'deskripsi'     => 'Diskusi terakhir sebelum uas',
                'guru_id'       => 7
            ],

            // Matematika
            // 7
            [
                'pertemuan_id'  => 33,
                'judul'         => 'Diskusi Matematika Pertemuan Satu',
                'deskripsi'     => 'Tanyakan apa yang kalian tidak mengerti disini',
                'guru_id'       => 9
            ],
            // 8
            [
                'pertemuan_id'  => 34,
                'judul'         => 'Diskusi Pertemuan Dua',
                'deskripsi'     => '',
                'guru_id'       => 9
            ],
            // 9
            [
                'pertemuan_id'  => 41,
                'judul'         => 'Diskusi Pertemuan Sembilan',
                'deskripsi'     => '',
                'guru_id'       => 9
            ],
            // Genap
            // 10
            [
                'pertemuan_id'  => 49,
                'judul'         => 'Diskusi Pertemuan Satu Genap',
                'deskripsi'     => 'Diskusikan pembahasan soal minggu lalu disini',
                'guru_id'       => 9
            ],
            // 11
            [
                'pertemuan_id'  => 57,
                'judul'         => 'Diskusi Pertemuan Sembilan Genap',
                'deskripsi'     => '',
                'guru_id'       => 9
            ],
            // 12
            [
                'pertemuan_id'  => 63,
                'judul'         => 'Diskusi Pertemuan Lima Belas',
                'deskripsi'     => 'Diskusi matematika terakhir sebelum uas',
                'guru_id'       => 9
            ],
        ]);      
        
        ForumKomentar::insert([
            [
                'forum_diskusi_id'  => 4,
                'commentable_id'   => 7, // id yang komen
                'commentable_type' => Kepegawaian::class,
                'komentar'  => 'Murid murid, apakah ada pertanyaan ?',
                // 'created_at' => now()->subDays(rand(1,30)),
                // 'updated_at' => now()->subDays(rand(1,30)),
                'created_at' => '2026-04-08 09:16:09'
            ],
            [
                'forum_diskusi_id'  => 4,
                'commentable_id'   => 2,
                'commentable_type' => Siswa::class,
                'komentar'  => 'Saya tidak mengerti halaman 17, bisa jelaskan ?',
                'created_at' => '2026-04-08 09:17:05'
            ],
            [
                'forum_diskusi_id'  => 4,
                'commentable_id'   => 1,
                'commentable_type' => Siswa::class,
                'komentar'  => 'Sama Bu, saya juga ga ngerti halaman 17',
                'created_at' => '2026-04-08 09:17:05'
            ],
            [
                'forum_diskusi_id'  => 4,
                'commentable_id'   => 7,
                'commentable_type' => Kepegawaian::class,
                'komentar'  => 'Jadi itu nanti kamu cari di kamus KBBI, apakah setiap kata ,dalam surat resmi itu sudah baku atau belum, kalau belum maka tandai dan perbaiki',
                'created_at' => '2026-04-08 09:17:20'
            ],
            [
                'forum_diskusi_id'  => 4,
                'commentable_id'   => 2,
                'commentable_type' => Siswa::class,
                'komentar'  => 'Owalah, baik Bu, terimakasih atas jawabannya',
                'created_at' => '2026-04-08 09:17:30'
            ]            
        ]);

        Tugas::insert([
            // Indo Ganjil
            // 1
            [
                'pertemuan_id' => 1,
                'judul' => 'Tugas Harian Indo Pertemuan Satu Ganjil',
                'tipe_tugas'  => 'manual',
                'deskripsi' => 'Menguji kemampuan penulisan bahasa Indonesia sesuai KBBI',
                'file_soal' => 'tugas_indo_satu.pdf',
                'deadline'  => '2023-05-23'
            ],
            // 2
            [
                'pertemuan_id' => 2,
                'judul' => 'Tugas Harian Indo Pertemuan Dua Ganjil',
                'tipe_tugas'  => 'manual',
                'deskripsi' => 'Membuat surat resmi sesuai dengan kaidah KBBI',
                'file_soal' => 'tugas_indo_dua.pdf',
                'deadline'  => '2023-06-01'
            ],
            // 3
            [
                'pertemuan_id' => 8,
                'judul' => 'UTS',
                'tipe_tugas'  => 'manual',
                'deskripsi' => 'Kerjakan UTS berikut lalu kumpulkan dengan di scan format nama_kelas.pdf',
                'file_soal' => 'tugas_indo_uts.pdf',
                'deadline'  => '2023-07-01 00:00'
            ],
            // 4
            [
                'pertemuan_id' => 16,
                'judul' => 'UAS',
                'tipe_tugas'  => 'cbt',
                'deskripsi' => 'Kerjakan UAS pada link berikut',
                'file_soal' => 'www.youtube.com',
                'deadline'  => '2023-12-01 00:00'
            ],

            // Indo Genap
            // 5
            [
                'pertemuan_id' => 17,
                'judul' => 'Tugas Harian Indo Pertemuan Satu Genap',
                'tipe_tugas'  => 'manual',
                'deskripsi' => 'Buatlah satu cerita fiksi original milikmu, lalu scan dan kumpulkan',
                'file_soal' => null,
                'deadline'  => '2024-01-05'
            ],
            // 6
            [
                'pertemuan_id' => 18,
                'judul' => 'Tugas Harian Indo Pertemuan Dua Genap',
                'tipe_tugas'  => 'manual',
                'deskripsi' => 'Buatlah file presentasi dan kumpulkan disini',
                'file_soal' => 'tugas_indo_dua_genap.pdf',
                'deadline'  => '2024-01-11'
            ],
            // 7
            [
                'pertemuan_id' => 24,
                'judul' => 'UTS',
                'tipe_tugas'  => 'manual',
                'deskripsi' => 'Kerjakan UTS berikut lalu kumpulkan dengan di scan format nama_kelas.pdf',
                'file_soal' => 'tugas_indo_uts_genap.pdf',
                'deadline'  => '2024-03-20 00:00'
            ],
            // 8
            [
                'pertemuan_id' => 32,
                'judul' => 'UAS',
                'tipe_tugas'  => 'cbt',
                'deskripsi' => 'Kerjakan UAS pada link berikut',
                'file_soal' => 'www.youtube.com',
                'deadline'  => '2024-05-01 00:00'
            ],


            // MTK Ganjil
            // 9
            [
                'pertemuan_id' => 33,
                'judul' => 'Tugas Harian MTK Pertemuan Satu Ganjil',
                'tipe_tugas'  => 'manual',
                'deskripsi' => 'Kerjakan soal halaman 12 pada file pdf berikut',
                'file_soal' => 'tugas_mtk_satu.pdf',
                'deadline'  => '2023-05-23'
            ],
            // 10
            [
                'pertemuan_id' => 34,
                'judul' => 'Tugas Harian MTK Pertemuan Dua Ganjil',
                'tipe_tugas'  => 'manual',
                'deskripsi' => 'Kerjakan soal halaman 20 dan 31 pada file ini',
                'file_soal' => 'tugas_mtk_dua.pdf',
                'deadline'  => '2023-06-01'
            ],
            // 11
            [
                'pertemuan_id' => 40,
                'judul' => 'UTS',
                'tipe_tugas'  => 'manual',
                'deskripsi' => 'Kerjakan UTS berikut lalu kumpulkan dengan di scan format nama_kelas.pdf',
                'file_soal' => 'tugas_mtk_uts.pdf',
                'deadline'  => '2023-07-01 23:00:00'
            ],
            // 12
            [
                'pertemuan_id' => 48,
                'judul' => 'UAS',
                'tipe_tugas'  => 'cbt',
                'deskripsi' => 'Kerjakan UAS pada link berikut',
                'file_soal' => 'www.youtube.com',
                'deadline'  => '2023-12-01 09:00:00'
            ],

            // MTK Genap
            // 13
            [
                'pertemuan_id' => 49,
                'judul' => 'Tugas Harian MTK Pertemuan Satu Genap',
                'tipe_tugas'  => 'manual',
                'deskripsi' => 'Buatlah ppt presentasi pertemuan minggu lalu',
                'file_soal' => null,
                'deadline'  => '2024-01-05'
            ],
            // 14
            [
                'pertemuan_id' => 50,
                'judul' => 'Tugas Harian MTK Pertemuan Dua Genap',
                'tipe_tugas'  => 'manual',
                'deskripsi' => 'Kerjakan halaman 20',
                'file_soal' => 'tugas_indo_dua_genap.pdf',
                'deadline'  => '2024-01-11'
            ],
            // 15
            [
                'pertemuan_id' => 56,
                'judul' => 'UTS',
                'tipe_tugas'  => 'manual',
                'deskripsi' => 'Kerjakan UTS berikut lalu kumpulkan dengan di scan format nama_kelas.pdf',
                'file_soal' => 'tugas_mtk_uts_genap.pdf',
                'deadline'  => '2024-03-20 00:00:00'
            ],
            // 16
            [
                'pertemuan_id' => 64,
                'judul' => 'UAS',
                'tipe_tugas'  => 'cbt',
                'deskripsi' => 'Kerjakan UAS pada link berikut',
                'file_soal' => 'www.youtube.com',
                'deadline'  => '2024-05-01 21:30:00'
            ],
        ]);

        TugasPengumpulan::insert([
            // 1
            [
                'tugas_id' => 1, // P1 | Indo | Manual
                'siswa_id' => 1,
                'file_jawaban' => 'bagas_indo_p1.pdf',
                'jawaban_cbt' => null,
                'nilai' => 87.30,
                'waktu_mulai' => null,
                'waktu_kumpul' => '2023-05-22'
            ],
            // 2
            [
                'tugas_id' => 1, // P1 | Indo | Manual
                'siswa_id' => 2,
                'file_jawaban' => 'winton_indonesia_p1.pdf',
                'jawaban_cbt' => null,
                'nilai' => 88,
                'waktu_mulai' => null,
                'waktu_kumpul' => '2023-05-21'
            ],
            // 3
            [
                'tugas_id' => 3, // UTS | Indo | Manual
                'siswa_id' => 1,
                'file_jawaban' => 'bagas_uts_ganjil.pdf',
                'jawaban_cbt' => null,
                'nilai' => null,
                'waktu_mulai' => null,
                'waktu_kumpul' => '2023-07-01 09:30:00'
            ],
            // 4
            [
                'tugas_id' => 3, // UTS | Indo | Manual
                'siswa_id' => 2,
                'file_jawaban' => 'winton_uts_ganjil.pdf',
                'jawaban_cbt' => null,
                'nilai' => null,
                'waktu_mulai' => null,
                'waktu_kumpul' => '2023-07-01 09:25:00'
            ],    
            // 5
            [
                'tugas_id' => 8, // UAS | Indo | CBT
                'siswa_id' => 1,
                'file_jawaban' => null,
                'jawaban_cbt' =>  json_encode ([
                    1 => 'A',
                    2 => 'C',
                    3 => 'B',
                    4 => 'Menurut saya itu benar karna buah jatuh ke arah bawah',
                    5 => 'Karena Belanda menaikkan pajak'
                ]),
                'nilai' => null,
                'waktu_mulai' => '2023-07-01 09:00:00',
                'waktu_kumpul' => '2023-07-01 09:30:00',            
            ],
            // 6
            [
                'tugas_id' => 8, // UAS | Indo | CBT
                'siswa_id' => 2,
                'file_jawaban' => null,
                'jawaban_cbt' =>  json_encode ([
                    1 => 'A',
                    2 => 'A',
                    3 => 'B',
                    4 => 'Menurut saya itu salah karna benda jatuh dalam posisi berputar',
                    5 => 'Karena Belanda menaikkan pajak yang tinggi sehingga masyarakat tidak mampu membayarnya'
                ]),
                'nilai' => 98,
                'waktu_mulai' => '2023-07-01 09:00:00',
                'waktu_kumpul' => '2023-07-01 09:25:00',               
            ],

            // MTK
            // 7
            [
                'tugas_id' => 9, // P1 | MTK | Manual
                'siswa_id' => 1,
                'file_jawaban' => 'bagas_mtk_p1.pdf',
                'jawaban_cbt' => null,
                'nilai' => 85,
                'waktu_mulai' => null,
                'waktu_kumpul' => '2023-05-22'
            ],
            // 8
            [
                'tugas_id' => 9, // P1 | MTK | Manual
                'siswa_id' => 2,
                'file_jawaban' => 'winton_mtk_p1.pdf',
                'jawaban_cbt' => null,
                'nilai' => 97.50,
                'waktu_mulai' => null,
                'waktu_kumpul' => '2023-05-21'
            ],
            // 9
            [
                'tugas_id' => 11, // UTS | MTK | Manual
                'siswa_id' => 1,
                'file_jawaban' => 'bagas_uts_ganjil.pdf',
                'jawaban_cbt' => null,
                'nilai' => null,
                'waktu_mulai' => null,
                'waktu_kumpul' => '2023-07-01 09:30:00'
            ],
            // 10
            [
                'tugas_id' => 11, // UTS | MTK | Manual
                'siswa_id' => 2,
                'file_jawaban' => 'winton_uts_ganjil.pdf',
                'jawaban_cbt' => null,
                'nilai' => null,
                'waktu_mulai' => null,
                'waktu_kumpul' => '2023-07-01 09:25:00'
            ],    
            // 11
            [
                'tugas_id' => 12, // UAS | MTK | CBT
                'siswa_id' => 1,
                'file_jawaban' => null,
                'jawaban_cbt' =>  json_encode ([
                    1 => 'D',
                    2 => 'A',
                    3 => 'C',
                    4 => 'Benda bergerak berlawanan dengan jarum jam',
                    5 => 'Benda tembus pandang karna memantulkan cahaya'
                ]),
                'nilai' => 78,
                'waktu_mulai' => '2023-07-01 09:00:00',
                'waktu_kumpul' => '2023-07-01 09:30:00',                
            ],
            // 12
            [
                'tugas_id' => 8, // UAS | MTK | CBT
                'siswa_id' => 2,
                'file_jawaban' => null,
                'jawaban_cbt' =>  json_encode ([
                    1 => 'C',
                    2 => 'D',
                    3 => 'C',
                    4 => 'Benda akan bergerak lurus searah jarum jam',
                    5 => 'Tidak bisa, karena benda tidak tembus pandang'
                ]),
                'nilai' => 80,
                'waktu_mulai' => '2023-07-01 09:00:00',
                'waktu_kumpul' => '2023-07-01 09:25:00',                
            ],
        ]);
    }
}

