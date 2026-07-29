export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'Active' | 'Inactive';
  joinDate: string;
}

export interface TeamMemberFromDB extends TeamMember {
  _id: string;
  userId?: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'Sudheendra Gururaj M P',
    role: 'Practice Head - ADM / RPA',
    email: 'sudheendra.gururaj@ahanait.com',
    status: 'Active',
    joinDate: '—',
  },
  {
    id: '2',
    name: 'Bodheesh V C',
    role: 'Team Lead',
    email: 'bodheesh.vc@ahanait.com',
    status: 'Active',
    joinDate: '—',
  },
  {
    id: '3',
    name: 'Ketan Dasa Naik',
    role: 'System Administrator · Infrastructure',
    email: 'ketan.naik@ahanait.com',
    status: 'Active',
    joinDate: '—',
  },
  {
    id: '4',
    name: 'Bindushree A C',
    role: 'Software Engineer',
    email: 'bindushree.ac@ahanait.com',
    status: 'Active',
    joinDate: '—',
  },
  {
    id: '5',
    name: 'Ankit Raj',
    role: 'Software Engineer',
    email: 'ankit.raj@ahanait.com',
    status: 'Active',
    joinDate: '—',
  },
  {
    id: '6',
    name: 'Rajarshi Dasgupta',
    role: 'IT Support Engineer',
    email: 'rajarshi.dasgupta@ahanait.com',
    status: 'Active',
    joinDate: '—',
  },
  {
    id: '7',
    name: 'Ranjitha K R',
    role: 'Associate Software Engineer',
    email: 'ranjitha.kr@ahanait.com',
    status: 'Active',
    joinDate: '—',
  },
  {
    id: '8',
    name: 'Suhas G S',
    role: 'Associate Software Engineer',
    email: 'suhas.gs@ahanait.com',
    status: 'Active',
    joinDate: '—',
  },
  {
    id: '9',
    name: 'Gautam Gaurav',
    role: 'Associate Software Engineer',
    email: 'gautam.gaurav@ahanait.com',
    status: 'Active',
    joinDate: '—',
  },
];

export async function getTeamMembers(): Promise<TeamMemberFromDB[]> {
  try {
    const res = await fetch('/api/team-members');
    const json = await res.json();
    if (res.ok && json.success) {
      return (json.data.members || []).map((m: any) => ({
        ...m,
        id: m._id,
      }));
    }
    throw new Error(json.error || 'Failed to load team members');
  } catch (error) {
    console.warn('Falling back to static team list:', error);
    return TEAM_MEMBERS.map((m) => ({ ...m, _id: m.id, userId: undefined }));
  }
}
