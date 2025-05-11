import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class EnvironmentService {
    get apiUrl(): string {
        return environment.apiUrl;
    }

    get appName(): string {
        return environment.appName;
    }

    get version(): string {
        return environment.version;
    }

    get defaultLanguage(): string {
        return environment.defaultLanguage;
    }

    get supportedLanguages(): string[] {
        return environment.supportedLanguages;
    }

    get isProduction(): boolean {
        return environment.production;
    }

    get themeConfig(): any {
        return environment.theme;
    }
} 