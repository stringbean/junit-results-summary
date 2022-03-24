import * as core from '@actions/core';
import { promises as fsPromises } from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as artifact from '@actions/artifact';

const REPORT_PREFIX = 'test-report-';

async function run() {
  const tmpDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'junit-results-summary-'));

  const reportFiles = await fetchReports(tmpDir);

  console.log('downloaded', reportFiles);
}

async function fetchReports(tmpDir: string): Promise<string[]> {
  const artifactClient = artifact.create();
  const artifacts = await artifactClient.downloadAllArtifacts(tmpDir);

  return artifacts
    .map((artifact) => artifact.artifactName)
    .filter((name) => name.startsWith(REPORT_PREFIX));
}

run().catch((error) => {
  core.error('Unexpected error while processing JUnit results');
  core.debug(error);
  core.setFailed(error);
});
