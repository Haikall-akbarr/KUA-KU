
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Administrator' | 'Kepala KUA' | 'Staff KUA' | 'Penghulu' | 'Calon Pengantin';
  createdAt: string;
};

export const users: User[] = [
  {
    id: "usr_001",
    name: "Dr. H. Ahmad Fauzan, M.Ag.",
    email: "kepala.kua@example.com",
    role: "Kepala KUA",
    createdAt: "2023-01-15T09:30:00Z",
  },
  {
    id: "usr_002",
    name: "Siti Aminah, S.Kom.",
    email: "staff.kua@example.com",
    role: "Staff KUA",
    createdAt: "2023-02-20T14:00:00Z",
  },
  {
    id: "usr_003",
    name: "Ust. Muhammad Ridwan, S.Ag.",
    email: "penghulu1@example.com",
    role: "Penghulu",
    createdAt: "2023-03-10T11:00:00Z",
  },
  {
    id: "usr_004",
    name: "Budi Santoso",
    email: "budi.santoso@example.com",
    role: "Calon Pengantin",
    createdAt: "2024-05-01T10:00:00Z",
  },
  {
    id: "usr_005",
    name: "Citra Lestari",
    email: "citra.lestari@example.com",
    role: "Calon Pengantin",
    createdAt: "2024-05-01T10:05:00Z",
  },
  {
    id: "usr_006",
    name: "Admin Sistem",
    email: "admin@example.com",
    role: "Administrator",
    createdAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "usr_007",
    name: "Hasan Basri, S.H.I",
    email: "penghulu2@example.com",
    role: "Penghulu",
    createdAt: "2023-08-11T13:20:00Z",
  },
    {
    id: "usr_008",
    name: "Rina Marlina",
    email: "rina.marlina@example.com",
    role: "Staff KUA",
    createdAt: "2023-09-01T09:00:00Z",
  },
];


export type MarriageRegistration = {
  id: string;
  groomName: string;
  brideName: string;
  registrationDate: string;
  weddingDate: string;
  weddingTime?: string;
  weddingLocation?: string;
  status: "Menunggu Verifikasi" | "Disetujui" | "Ditolak" | "Selesai";
  penghulu?: string | null;
};

export const marriageRegistrations: MarriageRegistration[] = [
  {
    id: "reg_001",
    groomName: "Budi Santoso",
    brideName: "Citra Lestari",
    registrationDate: "2024-05-01T10:05:00Z",
    weddingDate: "2024-06-15T10:00:00Z",
    status: "Menunggu Verifikasi",
  },
  {
    id: "reg_002",
    groomName: "Andi Wijaya",
    brideName: "Dewi Anggraini",
    registrationDate: "2024-04-28T14:30:00Z",
    weddingDate: "2024-06-20T09:00:00Z",
    status: "Disetujui",
    penghulu: "Ust. Muhammad Ridwan, S.Ag.",
  },
  {
    id: "reg_003",
    groomName: "Eko Prasetyo",
    brideName: "Fitriani",
    registrationDate: "2024-04-25T11:00:00Z",
    weddingDate: "2024-05-30T15:00:00Z",
    status: "Selesai",
    penghulu: "Hasan Basri, S.H.I",
  },
  {
    id: "reg_004",
    groomName: "Rian Hidayat",
    brideName: "Maya Sari",
    registrationDate: "2024-05-02T09:00:00Z",
    weddingDate: "2024-06-22T10:00:00Z",
    status: "Menunggu Verifikasi",
  },
  {
    id: "reg_005",
    groomName: "Fajar Nugraha",
    brideName: "Lina Marlina",
    registrationDate: "2024-04-20T16:00:00Z",
    weddingDate: "2024-05-25T11:00:00Z",
    status: "Ditolak",
  },
];

export type GuidanceSession = {
    id: string;
    sessionDate: string;
    participants: number;
    maxCapacity: number;
    status: "Akan Datang" | "Selesai" | "Dibatalkan";
}

export const guidanceSessions: GuidanceSession[] = [
    {
        id: "bim_001",
        sessionDate: "2024-06-12T09:00:00Z",
        participants: 18,
        maxCapacity: 20,
        status: "Akan Datang",
    },
    {
        id: "bim_002",
        sessionDate: "2024-06-05T09:00:00Z",
        participants: 20,
        maxCapacity: 20,
        status: "Selesai",
    },
    {
        id: "bim_003",
        sessionDate: "2024-05-29T09:00:00Z",
        participants: 15,
        maxCapacity: 20,
        status: "Selesai",
    }
]

export type ScheduleEvent = {
    id: string;
    title: string;
    type: "Akad Nikah" | "Bimbingan Perkawinan";
    startTime: string;
    endTime: string;
    penghulu?: string;
};

export const scheduleEvents: ScheduleEvent[] = [
    {
        id: 'sch_001',
        title: 'Akad: Andi & Dewi',
        type: 'Akad Nikah',
        startTime: '2024-06-20T09:00:00Z',
        endTime: '2024-06-20T10:00:00Z',
        penghulu: 'Ust. Muhammad Ridwan, S.Ag.'
    },
    {
        id: 'sch_002',
        title: 'Bimbingan Perkawinan Juni Sesi 2',
        type: 'Bimbingan Perkawinan',
        startTime: '2024-06-12T09:00:00Z',
        endTime: '2024-06-12T11:00:00Z',
    },
    {
        id: 'sch_003',
        title: 'Akad: Rian & Maya',
        type: 'Akad Nikah',
        startTime: '2024-06-22T10:00:00Z',
        endTime: '2024-06-22T11:00:00Z',
        penghulu: 'Hasan Basri, S.H.I'
    }
];
