import { RAW_CSV_DATA } from '../constants';
import { SalesRecord, KPIMetrics } from '../types';

export const parseCurrency = (val: any): number => {
  if (typeof val === 'number') return val;
  if (val === undefined || val === null) return 0;
  
  const str = String(val);
  
  const clean = str.replace(/[\s\u00A0"']/g, '');
  if (!clean) return 0;
  
  const dotIndex = clean.indexOf('.');
  const commaIndex = clean.indexOf(',');
  
  let normalized = clean;
  
  if (commaIndex > -1 && dotIndex === -1) {
    normalized = clean.replace(',', '.');
  } 

  if (normalized.match(/^-?\d+(\.\d+)?$/)) {
    return parseFloat(normalized);
  }
  
  return parseFloat(clean.replace(/[,.]/g, '.')) || parseInt(clean.replace(/\D/g, ''), 10) || 0;
};

export const parseFloatCustom = (val: any): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return parseFloat(String(val).replace(/,/g, '.').replace(/["'\s%]/g, '')) || 0;
};

export const getProcessedData = (): SalesRecord[] => {
  const lines = RAW_CSV_DATA.trim().split('\n');
  const data: SalesRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

    if (parts.length >= 6) {
      const source = parts[0].trim();
      
      if (!source || source.startsWith('Качественные') || source.startsWith('Не указано') || source.startsWith('Общее')) {
        continue;
      }
      
      const leads = parseCurrency(parts[1]);
      const successful = parseCurrency(parts[2]);
      const efficiency = parseFloatCustom(parts[3]);
      const revenue = parseCurrency(parts[4]);
      const avgCheck = parseCurrency(parts[5]);

      if (source && source !== ',,,,,') {
        data.push({
          source,
          leads,
          successful,
          efficiency,
          revenue,
          avgCheck
        });
      }
    }
  }

  return data.sort((a, b) => b.revenue - a.revenue);
};

const HEADER_MAP = {
  source: ['источник', 'source', 'channel', 'канал', 'канал продаж', 'name', 'utm source', 'название', 'наименование', 'компания', 'utm_source'],
  leads: ['кол-во лидов', 'количество лидов', 'leads', 'total leads', 'лиды', 'заявки', 'обращения', 'клиенты', 'посетители', 'трафик', 'клиентов'],
  successful: ['кол-во успешных', 'количество успешных', 'successful', 'deals', 'сделки', 'успешные', 'продажи (шт)', 'количество продаж', 'orders', 'продан', 'сделок', 'покупок', 'заказы'],
  revenue: ['сумма продаж', 'revenue', 'sales', 'выручка', 'продажи', 'сумма', 'оборот', 'total revenue', 'деньги', 'оплата', 'бюджет', 'итого'],
  efficiency: ['эффективность %', 'эффективность', 'efficiency', 'conversion', 'конверсия', 'cr', 'конверсия %', 'conv.', 'ctr'],
  avgCheck: ['средний чек', 'avg check', 'aov', 'average order value', 'ср. чек', 'средний']
};

export const processUploadedData = (rows: any[][]): SalesRecord[] => {
  // Усиленная проверка входных данных
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    console.warn("processUploadedData: Invalid or empty rows");
    return [];
  }

  // Фильтруем невалидные строки сразу
  const validRows = rows.filter(row => 
    row && Array.isArray(row) && row.length > 0
  );

  if (validRows.length === 0) {
    console.warn("processUploadedData: No valid rows after filtering");
    return [];
  }

  // 0. Normalize delimiters: Handle CSVs that were parsed into single strings
  let processedRows = validRows;
  
  const firstRealRow = validRows[0];
  
  if (firstRealRow && firstRealRow.length === 1 && typeof firstRealRow[0] === 'string') {
    const str = firstRealRow[0];
    const delimiter = str.includes(';') ? ';' : (str.includes('\t') ? '\t' : null);
    
    if (delimiter) {
      processedRows = validRows.map(r => {
        if (!r || !Array.isArray(r) || r.length === 0) return [];
        
        if (r.length === 1 && typeof r[0] === 'string') {
          return r[0].split(delimiter).map((c: string) => 
            c.replace(/^"|"$/g, '').trim()
          );
        }
        return r;
      }).filter(r => r && r.length > 0);
    }
  }

  // Проверка после нормализации
  if (!processedRows || processedRows.length === 0) {
    console.warn("processUploadedData: No rows after normalization");
    return [];
  }

  // 1. Find the header row by scanning first 20 rows
  let headerRowIndex = -1;
  let columnMap: Record<string, number> = {
    source: -1,
    leads: -1,
    successful: -1,
    revenue: -1,
    efficiency: -1,
    avgCheck: -1
  };

  const limit = Math.min(processedRows.length, 20);
  
  for (let i = 0; i < limit; i++) {
    const row = processedRows[i];
    
    if (!row || !Array.isArray(row) || row.length === 0) continue;
    
    const rowStr = row.map(c => {
      if (c === null || c === undefined) return '';
      return String(c).toLowerCase().trim();
    });
    
    const findIndex = (synonyms: string[]) => 
      rowStr.findIndex(cell => 
        synonyms.some(s => cell === s || (cell.length > s.length && cell.includes(s)))
      );
    
    const sourceIdx = findIndex(HEADER_MAP.source);
    const leadsIdx = findIndex(HEADER_MAP.leads);
    const revenueIdx = findIndex(HEADER_MAP.revenue);
    const successfulIdx = findIndex(HEADER_MAP.successful);

    if (sourceIdx !== -1 && (leadsIdx !== -1 || revenueIdx !== -1 || successfulIdx !== -1)) {
      headerRowIndex = i;
      columnMap = {
        source: sourceIdx,
        leads: leadsIdx,
        successful: successfulIdx,
        revenue: revenueIdx,
        efficiency: findIndex(HEADER_MAP.efficiency),
        avgCheck: findIndex(HEADER_MAP.avgCheck)
      };
      console.log("Header found at index", i, columnMap);
      break;
    }
  }

  if (headerRowIndex === -1) {
    console.warn("Could not find a valid header row.");
    return [];
  }

  // 2. Process data rows
  const data: SalesRecord[] = [];
  
  for (let i = headerRowIndex + 1; i < processedRows.length; i++) {
    const row = processedRows[i];
    
    if (!row || !Array.isArray(row) || row.length === 0) continue;

    const getValue = (idx: number): any => {
      if (idx === -1) return null;
      if (idx >= row.length) return null;
      const val = row[idx];
      return val !== undefined ? val : null;
    };

    const sourceVal = getValue(columnMap.source);
    if (sourceVal === null || sourceVal === undefined) continue;
    
    const sourceStr = String(sourceVal).trim();
    if (!sourceStr) continue;

    const lowerSource = sourceStr.toLowerCase();
    if (['total', 'итог', 'общее', 'всего', 'среднее'].some(s => lowerSource.startsWith(s))) continue;

    const leads = parseCurrency(getValue(columnMap.leads));
    const successful = parseCurrency(getValue(columnMap.successful));
    const revenue = parseCurrency(getValue(columnMap.revenue));
    
    let efficiency = parseFloatCustom(getValue(columnMap.efficiency));
    if (!efficiency && leads > 0) {
      efficiency = (successful / leads) * 100;
    }

    let avgCheck = parseCurrency(getValue(columnMap.avgCheck));
    if (!avgCheck && successful > 0) {
      avgCheck = revenue / successful;
    }

    if (leads === 0 && successful === 0 && revenue === 0 && efficiency === 0) continue;

    data.push({
      source: sourceStr,
      leads,
      successful,
      efficiency,
      revenue,
      avgCheck
    });
  }

  console.log("Processed records:", data.length);
  return data.sort((a, b) => b.revenue - a.revenue);
};

export const calculateKPIs = (data: SalesRecord[]): KPIMetrics => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      totalRevenue: 0,
      totalLeads: 0,
      totalSuccessful: 0,
      avgEfficiency: 0,
      avgCheckGlobal: 0
    };
  }

  const totalRevenue = data.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  const totalLeads = data.reduce((acc, curr) => acc + (curr.leads || 0), 0);
  const totalSuccessful = data.reduce((acc, curr) => acc + (curr.successful || 0), 0);
  
  const avgEfficiency = totalLeads > 0 ? (totalSuccessful / totalLeads) * 100 : 0;
  const avgCheckGlobal = totalSuccessful > 0 ? totalRevenue / totalSuccessful : 0;

  return {
    totalRevenue,
    totalLeads,
    totalSuccessful,
    avgEfficiency,
    avgCheckGlobal
  };
};

export const formatCurrency = (value: number) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0 ₸';
  }
  return new Intl.NumberFormat('ru-KZ', {
    style: 'currency',
    currency: 'KZT',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  return new Intl.NumberFormat('ru-KZ').format(value);
};