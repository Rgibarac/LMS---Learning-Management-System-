
export interface Term {
  id?: number;
  name: string;
  startDate: string;       
  endDate: string;        
  enrollmentStart?: string;
  enrollmentEnd?: string;
  active?: boolean;
  description?: string;
}