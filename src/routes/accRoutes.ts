import { Router, Request, Response } from 'express';
import { ACCClient } from '../services/accClient';
import { DataTransformer } from '../services/dataTransformer';
import { cacheService } from '../services/cacheService';
import { logger } from '../utils/logger';

const router = Router();
const accClient = new ACCClient();

router.get('/hubs', async (req: Request, res: Response) => {
  try {
    const cacheKey = 'hubs';
    const cached = cacheService.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const hubs = await accClient.getHubs();
    const transformed = DataTransformer.transformHubs(hubs);

    cacheService.set(cacheKey, transformed);
    res.json(transformed);
  } catch (error) {
    logger.error('Error fetching hubs', { error });
    res.status(500).json({ error: 'Failed to fetch hubs' });
  }
});

router.get('/hubs/:hubId/projects', async (req: Request, res: Response) => {
  try {
    const { hubId } = req.params;
    const cacheKey = `projects:${hubId}`;
    const cached = cacheService.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const projects = await accClient.getProjects(hubId);
    const transformed = DataTransformer.transformProjects(projects);

    cacheService.set(cacheKey, transformed);
    res.json(transformed);
  } catch (error) {
    logger.error('Error fetching projects', { error });
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.get('/projects/:projectId/issues', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { containerId } = req.query;

    if (!containerId) {
      return res.status(400).json({ error: 'containerId query parameter is required' });
    }

    const cacheKey = `issues:${projectId}:${containerId}`;
    const cached = cacheService.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const issues = await accClient.getIssues(projectId, containerId as string);
    const transformed = DataTransformer.transformIssues(issues);

    cacheService.set(cacheKey, transformed);
    res.json(transformed);
  } catch (error) {
    logger.error('Error fetching issues', { error });
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

router.get('/projects/:projectId/assets', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const cacheKey = `assets:${projectId}`;
    const cached = cacheService.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const assets = await accClient.getAssets(projectId);
    const transformed = DataTransformer.transformAssets(assets);

    cacheService.set(cacheKey, transformed);
    res.json(transformed);
  } catch (error) {
    logger.error('Error fetching assets', { error });
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

router.get('/projects/:projectId/cost', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const cacheKey = `cost:${projectId}`;
    const cached = cacheService.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const costData = await accClient.getCostData(projectId);
    const transformed = DataTransformer.transformCostData(costData);

    cacheService.set(cacheKey, transformed);
    res.json(transformed);
  } catch (error) {
    logger.error('Error fetching cost data', { error });
    res.status(500).json({ error: 'Failed to fetch cost data' });
  }
});

router.get('/projects/:projectId/forms', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const cacheKey = `forms:${projectId}`;
    const cached = cacheService.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const forms = await accClient.getForms(projectId);
    const transformed = DataTransformer.transformForms(forms);

    cacheService.set(cacheKey, transformed);
    res.json(transformed);
  } catch (error) {
    logger.error('Error fetching forms', { error });
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

router.get('/projects/:projectId/locations', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const cacheKey = `locations:${projectId}`;
    const cached = cacheService.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const locations = await accClient.getLocations(projectId);
    const transformed = DataTransformer.transformLocations(locations);

    cacheService.set(cacheKey, transformed);
    res.json(transformed);
  } catch (error) {
    logger.error('Error fetching locations', { error });
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

router.get('/projects/:projectId/all', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { hubId, containerId } = req.query;

    if (!hubId || !containerId) {
      return res.status(400).json({ error: 'hubId and containerId query parameters are required' });
    }

    const cacheKey = `all:${projectId}:${containerId}`;
    const cached = cacheService.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const allData = await accClient.getAllProjectData(
      hubId as string,
      projectId,
      containerId as string
    );

    const transformed = {
      projectId: allData.projectId,
      issues: DataTransformer.transformIssues(allData.issues),
      assets: DataTransformer.transformAssets(allData.assets),
      costData: DataTransformer.transformCostData(allData.costData),
      forms: DataTransformer.transformForms(allData.forms),
      locations: DataTransformer.transformLocations(allData.locations)
    };

    cacheService.set(cacheKey, transformed, 1800);
    res.json(transformed);
  } catch (error) {
    logger.error('Error fetching all project data', { error });
    res.status(500).json({ error: 'Failed to fetch all project data' });
  }
});

router.post('/cache/clear', async (req: Request, res: Response) => {
  try {
    cacheService.flush();
    res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    logger.error('Error clearing cache', { error });
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

router.get('/cache/stats', async (req: Request, res: Response) => {
  try {
    const stats = cacheService.getStats();
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching cache stats', { error });
    res.status(500).json({ error: 'Failed to fetch cache stats' });
  }
});

export default router;
