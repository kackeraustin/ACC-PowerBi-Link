import axios, { AxiosInstance } from 'axios';
import { APSAuthService } from '../auth/apsAuth';
import { config } from '../config/config';
import { logger } from '../utils/logger';

export interface Hub {
  id: string;
  type: string;
  attributes: {
    name: string;
    region: string;
  };
}

export interface Project {
  id: string;
  type: string;
  attributes: {
    name: string;
    status?: string;
  };
}

export interface Issue {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
  createdBy: string;
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  status: string;
  location?: string;
}

export interface CostItem {
  id: string;
  name: string;
  budgeted: number;
  actual: number;
  variance: number;
}

export class ACCClient {
  private authService: APSAuthService;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.authService = new APSAuthService();
    this.axiosInstance = axios.create({
      baseURL: config.acc.apiBaseUrl
    });
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.authService.getAccessToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  public async getHubs(): Promise<Hub[]> {
    try {
      logger.info('Fetching hubs...');
      const headers = await this.getAuthHeaders();

      const response = await this.axiosInstance.get('/project/v1/hubs', { headers });

      logger.info(`Retrieved ${response.data.data.length} hubs`);
      return response.data.data;
    } catch (error) {
      logger.error('Failed to fetch hubs', { error });
      throw error;
    }
  }

  public async getProjects(hubId: string): Promise<Project[]> {
    try {
      logger.info(`Fetching projects for hub ${hubId}...`);
      const headers = await this.getAuthHeaders();

      const response = await this.axiosInstance.get(
        `/project/v1/hubs/${hubId}/projects`,
        { headers }
      );

      logger.info(`Retrieved ${response.data.data.length} projects`);
      return response.data.data;
    } catch (error) {
      logger.error('Failed to fetch projects', { error });
      throw error;
    }
  }

  public async getIssues(projectId: string, containerId: string): Promise<Issue[]> {
    try {
      logger.info(`Fetching issues for project ${projectId}...`);
      const headers = await this.getAuthHeaders();

      const response = await this.axiosInstance.get(
        `${config.acc.issuesEndpoint}/containers/${containerId}/issues`,
        {
          headers,
          params: { 'filter[projectId]': projectId }
        }
      );

      logger.info(`Retrieved ${response.data.results?.length || 0} issues`);
      return response.data.results || [];
    } catch (error) {
      logger.error('Failed to fetch issues', { error });
      throw error;
    }
  }

  public async getAssets(projectId: string): Promise<Asset[]> {
    try {
      logger.info(`Fetching assets for project ${projectId}...`);
      const headers = await this.getAuthHeaders();

      const response = await this.axiosInstance.get(
        `${config.acc.assetsEndpoint}/projects/${projectId}/assets`,
        { headers }
      );

      logger.info(`Retrieved ${response.data.results?.length || 0} assets`);
      return response.data.results || [];
    } catch (error) {
      logger.error('Failed to fetch assets', { error });
      throw error;
    }
  }

  public async getCostData(projectId: string): Promise<CostItem[]> {
    try {
      logger.info(`Fetching cost data for project ${projectId}...`);
      const headers = await this.getAuthHeaders();

      const response = await this.axiosInstance.get(
        `${config.acc.costEndpoint}/projects/${projectId}/budgets`,
        { headers }
      );

      logger.info(`Retrieved ${response.data.results?.length || 0} cost items`);
      return response.data.results || [];
    } catch (error) {
      logger.error('Failed to fetch cost data', { error });
      throw error;
    }
  }

  public async getForms(projectId: string): Promise<any[]> {
    try {
      logger.info(`Fetching forms for project ${projectId}...`);
      const headers = await this.getAuthHeaders();

      const response = await this.axiosInstance.get(
        `${config.acc.formsEndpoint}/projects/${projectId}/forms`,
        { headers }
      );

      logger.info(`Retrieved ${response.data.results?.length || 0} forms`);
      return response.data.results || [];
    } catch (error) {
      logger.error('Failed to fetch forms', { error });
      throw error;
    }
  }

  public async getLocations(projectId: string): Promise<any[]> {
    try {
      logger.info(`Fetching locations for project ${projectId}...`);
      const headers = await this.getAuthHeaders();

      const response = await this.axiosInstance.get(
        `${config.acc.locationsEndpoint}/projects/${projectId}/trees`,
        { headers }
      );

      logger.info(`Retrieved ${response.data.results?.length || 0} locations`);
      return response.data.results || [];
    } catch (error) {
      logger.error('Failed to fetch locations', { error });
      throw error;
    }
  }

  public async getAllProjectData(hubId: string, projectId: string, containerId: string) {
    try {
      logger.info(`Fetching all data for project ${projectId}...`);

      const [issues, assets, costData, forms, locations] = await Promise.allSettled([
        this.getIssues(projectId, containerId),
        this.getAssets(projectId),
        this.getCostData(projectId),
        this.getForms(projectId),
        this.getLocations(projectId)
      ]);

      return {
        projectId,
        issues: issues.status === 'fulfilled' ? issues.value : [],
        assets: assets.status === 'fulfilled' ? assets.value : [],
        costData: costData.status === 'fulfilled' ? costData.value : [],
        forms: forms.status === 'fulfilled' ? forms.value : [],
        locations: locations.status === 'fulfilled' ? locations.value : []
      };
    } catch (error) {
      logger.error('Failed to fetch all project data', { error });
      throw error;
    }
  }
}
