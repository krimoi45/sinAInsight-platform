export interface Resource {
  id: string;
  clientRef: string;
  clientName: string;
  clientCode: string;
  name: string;
  alias?: string;
  probe?: string;
  cycle: number;
  validityPeriod?: string;
  url?: string;
  scenarioContent?: string;
  scenarioName?: string;
  scenarioExt?: string;
  scenarioNbretry?: number;
  scenarioTimeout?: number;
  poolName?: string;
  process?: string;
  applicationSource?: string;
  tz?: string;
  queueName?: string;
  indicatorGroupRef?: string;
  arborescence?: string;
  prevLevel?: number;
  level?: number;
  reason?: string;
  scenarioOccur?: number;
  scenarioLog?: string;
  dontcheck?: number;
  nextcheck?: number;
  lastControl?: number;
  lastChange?: number;
  diffCycle?: number;
  lockHostname?: string;
  lockPseudoRandom?: string;
  jobId?: string;
  elapsed?: number;
  scenarioHtml?: string;
  scenarioImg?: string;
  
  // Champs calculés côté client
  status?: 'ok' | 'error' | 'warning' | 'disabled' | 'unknown';
}