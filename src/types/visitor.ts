export interface Visitor {
  id: string;
  tc_no: string;
  first_name: string;
  last_name: string;
  title?: string;
  phone?: string;
  is_foreign: boolean;
  is_external: boolean;
  created_at: string;
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
