export interface Visitor {
  id: string;
  tc_no?: string | null;
  first_name: string;
  last_name: string;
  title?: string | null;
  phone?: string | null;
  is_foreign: boolean | null;
  is_external: boolean | null;
  created_at: string | null;
}

export interface VisitorFormData {
  firstName: string;
  lastName: string;
  tcNo: string;
  title?: string;
  phone?: string;
  isExternal: boolean;
  isForeign: boolean;
  visitPurpose: string;
  visitedPersonId: string;
  unitId: string;
  entryDate: Date;
  entryTime: Date;
}

export interface VisitorUpdateData {
  first_name?: string;
  last_name?: string;
  title?: string | null;
  phone?: string | null;
  is_foreign?: boolean;
  is_external?: boolean;
  tc_no?: string | null;
}

export type VisitorStatus = 'success' | 'pending' | 'cancelled' | 'blocked' | 'deleted';

export interface VisitorData {
  id: string;
  visitorName: string;
  visitorTitle: string;
  hostName: string;
  hostTitle: string;
  date: string;
  time: string;
  subject: string;
  status: VisitorStatus;
  isInternal: boolean;
  createdBy?: string;
  visitedPersonId?: string;
  hostDepartmentId?: string;
}
