export interface AppliedYear {
  id?: number;
  year: number;                  
  requiredEcts: number;          
  studyProgramId: number;
  userId: number;           

  studyProgramName?: string;
  userFullName?: string;
}