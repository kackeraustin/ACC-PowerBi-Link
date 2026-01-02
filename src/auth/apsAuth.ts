import axios from 'axios';
import { config } from '../config/config';
import { logger } from '../utils/logger';

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export class APSAuthService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  public async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    await this.authenticate();
    return this.accessToken!;
  }

  private async authenticate(): Promise<void> {
    try {
      logger.info('Authenticating with Autodesk Platform Services...');

      const response = await axios.post<TokenResponse>(
        config.aps.tokenUrl,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: config.aps.clientId,
          client_secret: config.aps.clientSecret,
          scope: config.aps.scope
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;

      logger.info('Successfully authenticated with APS');
    } catch (error) {
      logger.error('Failed to authenticate with APS', { error });
      throw new Error('Authentication failed');
    }
  }

  public getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: config.aps.clientId,
      response_type: 'code',
      redirect_uri: config.aps.callbackUrl,
      scope: config.aps.scope,
      state
    });

    return `${config.aps.authUrl}?${params.toString()}`;
  }

  public async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    try {
      const response = await axios.post<TokenResponse>(
        config.aps.tokenUrl,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: config.aps.clientId,
          client_secret: config.aps.clientSecret,
          redirect_uri: config.aps.callbackUrl
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to exchange code for token', { error });
      throw new Error('Token exchange failed');
    }
  }

  public async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const response = await axios.post<TokenResponse>(
        config.aps.tokenUrl,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: config.aps.clientId,
          client_secret: config.aps.clientSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to refresh access token', { error });
      throw new Error('Token refresh failed');
    }
  }
}
