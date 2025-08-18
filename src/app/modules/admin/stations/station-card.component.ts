import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-station-card',
  standalone: true,
  templateUrl: './station-card.component.html',
  styleUrls: ['./station-card.component.scss'],
  imports: [NgClass]
})
export class StationCardComponent {
  @Input() station: any;
  @Input() selected: boolean = false;
  @Output() cardClick = new EventEmitter<any>();

  get connectors(): number {
    if (this.station?.connectors) return this.station.connectors;
    if (!this.station?.charging_points) return 0;
    
    // Count all connectors from all charging points
    let totalConnectors = 0;
    Object.values(this.station.charging_points).forEach((cp: any) => {
      if (cp.connectors && typeof cp.connectors === 'object') {
        totalConnectors += Object.keys(cp.connectors).length;
      }
    });
    return totalConnectors;
  }

  get powerRange(): string {
    if (this.station?.power_range) return this.station.power_range;
    if (!this.station?.charging_points) return '';
    
    // Collect all charge powers from all connectors
    const powers: number[] = [];
    Object.values(this.station.charging_points).forEach((cp: any) => {
      if (cp.connectors && typeof cp.connectors === 'object') {
        Object.values(cp.connectors).forEach((connector: any) => {
          if (connector.charge_power) {
            powers.push(parseInt(connector.charge_power));
          }
        });
      }
    });
    
    if (!powers.length) return '';
    const min = Math.min(...powers);
    const max = Math.max(...powers);
    return min === max ? `${min} KW` : `${min}-${max} KW`;
  }

  get connectorTypes(): any[] {
    if (!this.station?.charging_points) return [];
    
    const types = new Set<string>();
    Object.values(this.station.charging_points).forEach((cp: any) => {
      if (cp.connectors && typeof cp.connectors === 'object') {
        Object.values(cp.connectors).forEach((connector: any) => {
          if (connector.connector_type) {
            types.add(connector.connector_type);
          }
        });
      }
    });
    
    return Array.from(types).map(type => ({
      name: type,
      icon: this.getConnectorIcon(type)
    }));
  }

  private getConnectorIcon(connectorType: string): string {
    // Map connector types to their icons
    const iconMap: { [key: string]: string } = {
      'CCS Combo 2': '/megaplug/icons/ccs-combo.svg',
      'CHAdeMO': '/megaplug/icons/chademo.svg',
      'Type 2': '/megaplug/icons/type2.svg',
      'Type 1': '/megaplug/icons/type1.svg'
    };
    
    return iconMap[connectorType] || '/megaplug/icons/connector.svg';
  }

  onCardClick() {
    this.cardClick.emit(this.station);
  }
} 