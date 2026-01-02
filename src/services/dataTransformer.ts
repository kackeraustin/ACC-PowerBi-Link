import { logger } from '../utils/logger';

export interface PowerBIRecord {
  [key: string]: string | number | boolean | Date | null;
}

export class DataTransformer {
  public static transformIssues(issues: any[]): PowerBIRecord[] {
    return issues.map(issue => ({
      issueId: issue.id || '',
      title: issue.title || issue.attributes?.title || '',
      status: issue.status || issue.attributes?.status || '',
      priority: issue.priority || issue.attributes?.priority || '',
      assignedTo: issue.assignedTo || issue.attributes?.assignedTo || null,
      assignedToName: issue.attributes?.assignedToName || null,
      dueDate: issue.dueDate || issue.attributes?.dueDate || null,
      createdAt: issue.createdAt || issue.attributes?.createdAt || '',
      createdBy: issue.createdBy || issue.attributes?.createdBy || '',
      updatedAt: issue.attributes?.updatedAt || null,
      issueType: issue.attributes?.issueType || '',
      location: issue.attributes?.location || null,
      rootCause: issue.attributes?.rootCause || null,
      description: issue.attributes?.description || ''
    }));
  }

  public static transformAssets(assets: any[]): PowerBIRecord[] {
    return assets.map(asset => ({
      assetId: asset.id || '',
      name: asset.name || asset.attributes?.name || '',
      category: asset.category || asset.attributes?.category || '',
      status: asset.status || asset.attributes?.status || '',
      location: asset.location || asset.attributes?.location || null,
      manufacturer: asset.attributes?.manufacturer || null,
      model: asset.attributes?.model || null,
      serialNumber: asset.attributes?.serialNumber || null,
      installDate: asset.attributes?.installDate || null,
      warrantyExpiration: asset.attributes?.warrantyExpiration || null,
      barcode: asset.attributes?.barcode || null
    }));
  }

  public static transformCostData(costItems: any[]): PowerBIRecord[] {
    return costItems.map(item => ({
      costItemId: item.id || '',
      name: item.name || item.attributes?.name || '',
      budgeted: item.budgeted || item.attributes?.budgetedAmount || 0,
      actual: item.actual || item.attributes?.actualAmount || 0,
      variance: item.variance ||
        ((item.budgeted || 0) - (item.actual || 0)) ||
        ((item.attributes?.budgetedAmount || 0) - (item.attributes?.actualAmount || 0)) || 0,
      committed: item.attributes?.committedAmount || 0,
      costCode: item.attributes?.costCode || null,
      category: item.attributes?.category || null,
      description: item.attributes?.description || ''
    }));
  }

  public static transformForms(forms: any[]): PowerBIRecord[] {
    return forms.map(form => ({
      formId: form.id || '',
      title: form.title || form.attributes?.title || '',
      status: form.status || form.attributes?.status || '',
      type: form.type || form.attributes?.formType || '',
      createdAt: form.createdAt || form.attributes?.createdAt || '',
      createdBy: form.createdBy || form.attributes?.createdBy || '',
      updatedAt: form.attributes?.updatedAt || null,
      location: form.attributes?.location || null,
      assignedTo: form.attributes?.assignedTo || null
    }));
  }

  public static transformLocations(locations: any[]): PowerBIRecord[] {
    return locations.map(location => ({
      locationId: location.id || '',
      name: location.name || location.attributes?.name || '',
      parentId: location.parentId || location.attributes?.parentId || null,
      type: location.type || location.attributes?.locationType || '',
      barcode: location.attributes?.barcode || null,
      level: location.attributes?.level || 0,
      path: location.attributes?.path || ''
    }));
  }

  public static transformProjects(projects: any[]): PowerBIRecord[] {
    return projects.map(project => ({
      projectId: project.id || '',
      projectName: project.attributes?.name || '',
      status: project.attributes?.status || '',
      type: project.type || '',
      startDate: project.attributes?.startDate || null,
      endDate: project.attributes?.endDate || null,
      createdAt: project.attributes?.createdAt || null,
      jobNumber: project.attributes?.jobNumber || null,
      addressLine1: project.attributes?.addressLine1 || null,
      city: project.attributes?.city || null,
      stateOrProvince: project.attributes?.stateOrProvince || null,
      postalCode: project.attributes?.postalCode || null,
      country: project.attributes?.country || null
    }));
  }

  public static transformHubs(hubs: any[]): PowerBIRecord[] {
    return hubs.map(hub => ({
      hubId: hub.id || '',
      hubName: hub.attributes?.name || '',
      region: hub.attributes?.region || '',
      type: hub.type || ''
    }));
  }

  public static flattenData(data: any): PowerBIRecord[] {
    try {
      if (Array.isArray(data)) {
        return data;
      }

      if (typeof data === 'object' && data !== null) {
        return [data];
      }

      logger.warn('Unexpected data format for flattening', { data });
      return [];
    } catch (error) {
      logger.error('Error flattening data', { error });
      return [];
    }
  }
}
