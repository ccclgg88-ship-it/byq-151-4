import dayjs from 'dayjs';
import type { ContractRecord, ContractStatus } from '@/types/employee';

export function formatDate(date: string, format: string = 'YYYY-MM-DD'): string {
  if (!date) return '-';
  return dayjs(date).format(format);
}

export function formatDateCN(date: string): string {
  if (!date) return '-';
  return dayjs(date).format('YYYY年MM月DD日');
}

export function getDaysUntil(endDate: string): number {
  return dayjs(endDate).diff(dayjs(), 'day');
}

export function computeContractStatus(contract: ContractRecord): {
  status: ContractStatus;
  daysLeft: number;
} {
  const daysLeft = getDaysUntil(contract.endDate);
  let status: ContractStatus = contract.status;

  if (status === '已解除') {
    return { status, daysLeft };
  }

  if (daysLeft <= 0) {
    status = '已过期';
  } else if (daysLeft <= 30) {
    status = '即将到期';
  } else {
    status = '生效中';
  }

  return { status, daysLeft };
}

export function getDateRangeLabel(start: string, end: string): string {
  return `${formatDateCN(start)} ~ ${formatDateCN(end)}`;
}

export function getRelativeDateLabel(date: string): string {
  const diffDay = dayjs().diff(dayjs(date), 'day');
  if (diffDay === 0) return '今天';
  if (diffDay === 1) return '昨天';
  if (diffDay < 30) return `${diffDay} 天前`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)} 个月前`;
  return `${Math.floor(diffDay / 365)} 年前`;
}

export function todayStr(): string {
  return dayjs().format('YYYY-MM-DD');
}

export function addYears(dateStr: string, years: number): string {
  return dayjs(dateStr).add(years, 'year').format('YYYY-MM-DD');
}
