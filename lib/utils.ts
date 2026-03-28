export const formatHN = (hnValue: any) => {
  if (hnValue === null || hnValue === undefined) return '';
  let cleaned = String(hnValue).trim();
  if (cleaned.toLowerCase() === 'nan') return '';
  if (cleaned.includes('.')) cleaned = cleaned.split('.')[0];
  return cleaned;
};

export const getDaysInMonth = (monthYearStr: string) => {
  if (!monthYearStr) return 31;
  const [year, month] = monthYearStr.split('-');
  return new Date(parseInt(year), parseInt(month), 0).getDate();
};