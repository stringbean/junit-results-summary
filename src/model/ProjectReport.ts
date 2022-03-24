import { TestSummary } from './TestSummary';

import { isBefore } from 'date-fns';

export function appendReport(target: ProjectReport, report: ProjectReport): void {
  // add test suites
  target.suites.push(...report.suites);

  // take the older start time
  if (isBefore(target.summary.skipped, report.summary.startTime)) {
    target.summary.startTime = report.summary.startTime;
  }

  // add duration
  target.summary.duration += report.summary.duration;

  // increment counters
  target.summary.tests += report.summary.tests;
  target.summary.passed += report.summary.passed;
  target.summary.failed += report.summary.failed;
  target.summary.skipped += report.summary.skipped;
}

export interface ProjectReport {
  name: string;

  summary: TestSummary;
  suites: TestSummary[];
}
