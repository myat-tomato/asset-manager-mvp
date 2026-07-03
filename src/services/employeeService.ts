import { gasRequest } from './gasApi';

export type Employee = {
  employeeNo: string;
  name: string;
  position: string;
  displayName: string;
  koreanName: string;
  englishName: string;
  furigana: string;
  status: string;
  nationality: string;
  startDate: string;
  endDate: string;
};

export function getEmployeeList() {
  return gasRequest<Employee[]>('getEmployeeList');
}