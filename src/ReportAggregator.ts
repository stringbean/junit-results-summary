import * as io from '@actions/io';
import * as path from 'path';
import { appendReport, ProjectReport } from './model/ProjectReport';
import { promises as fsPromises } from 'fs';

const SUMMARY_FILENAME = 'project-summary.json';
const HTML_FILENAME = 'test-report.html';

export interface GeneratedReport {
  report: ProjectReport;
  basedir: string;
  files: string[];
}

export class ReportAggregator {
  private readonly tmpDir: string;
  private readonly targetDir: string;

  private readonly output: GeneratedReport;

  constructor(tmpDir: string, projectName: string) {
    this.tmpDir = tmpDir;
    this.targetDir = path.join(tmpDir, 'aggregate-report');

    this.output = {
      report: {
        name: projectName,
        summary: {
          startTime: new Date(),
          duration: 0,
          tests: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
        },
        suites: [],
      },
      basedir: this.targetDir,
      files: [],
    };
  }

  async addProject(name: string): Promise<void> {
    await io.mkdirP(this.targetDir);

    // load summary & combine add it to the summary
    const projectSummary = await this.loadProjectReport(name);

    appendReport(this.output.report, projectSummary);

    // copy html report & add to list of files
    const projectReportFile = await this.copyProjectReport(name);
    this.output.files.push(projectReportFile);
  }

  async finaliseReport(): Promise<GeneratedReport> {
    const summaryFile = path.join(this.targetDir, SUMMARY_FILENAME);
    this.output.files.push(summaryFile);

    await fsPromises.writeFile(summaryFile, JSON.stringify(this.output.report));

    // TODO generate summary html
    return this.output;
  }

  async loadProjectReport(name: string): Promise<ProjectReport> {
    const summaryFile = await this.getReportPath(name, SUMMARY_FILENAME);
    const data = await fsPromises.readFile(summaryFile, { encoding: 'utf-8' });
    return JSON.parse(data);
  }

  async copyProjectReport(name: string): Promise<string> {
    const reportFile = await this.getReportPath(name, HTML_FILENAME);
    const targetFile = path.join(this.targetDir, `${name}-report.html`);

    await io.cp(reportFile, targetFile);
    return targetFile;
  }

  private async getReportPath(projectName: string, reportName: string): Promise<string> {
    const reportFile = path.join(this.tmpDir, projectName, reportName);
    const reportStat = await fsPromises.stat(reportFile);

    if (!reportStat.isFile()) {
      throw new Error(`Cannot locate ${reportName} for ${projectName} project`);
    }

    return reportFile;
  }
}
