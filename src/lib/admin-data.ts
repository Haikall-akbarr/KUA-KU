
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
