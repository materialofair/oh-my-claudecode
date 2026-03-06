import { describe, it, expect, beforeEach } from 'vitest';
import { CacheManager, getCachedAnalysis, setCachedAnalysis } from '../../../src/testing/performance/cache-manager';

describe('Cache Manager', () => {
  let cacheManager: CacheManager;

  beforeEach(() => {
    cacheManager = new CacheManager({ ttl: 3600 });
  });

  it('should cache tech stack detection results', async () => {
    const projectPath = '/test/project';
    const techStack = { language: 'typescript', framework: 'react', testRunner: 'vitest' };

    await cacheManager.set(`techstack:${projectPath}`, techStack);
    const cached = await cacheManager.get(`techstack:${projectPath}`);

    expect(cached).toEqual(techStack);
  });

  it('should invalidate cache after TTL', async () => {
    const cacheWithShortTTL = new CacheManager({ ttl: 1 }); // 1 second
    await cacheWithShortTTL.set('test-key', 'test-value');

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 1100));

    const cached = await cacheWithShortTTL.get('test-key');
    expect(cached).toBeNull();
  });

  it('should cache coverage analysis results', async () => {
    const coverageData = { totalCoverage: 75, lineCoverage: 80 };
    await setCachedAnalysis('coverage:project1', coverageData);

    const cached = await getCachedAnalysis('coverage:project1');
    expect(cached).toEqual(coverageData);
  });
});
