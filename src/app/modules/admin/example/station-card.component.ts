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
    return Object.values(this.station.charging_points)
      .flatMap((cp: any) => Array.isArray(cp.connectors) ? cp.connectors : [])
      .filter((c: any) => c && typeof c === 'object')
      .length;
  }

  get powerRange(): string {
    if (this.station?.power_range) return this.station.power_range;
    if (!this.station?.charging_points) return '';
    const powers = Object.values(this.station.charging_points)
      .flatMap((cp: any) => Array.isArray(cp.connectors) ? cp.connectors : [])
      .filter((c: any) => c && typeof c === 'object' && c.charge_power)
      .map((c: any) => c.charge_power);
    if (!powers.length) return '';
    const min = Math.min(...powers);
    const max = Math.max(...powers);
    return min === max ? `${min} KW` : `${min}-${max} KW`;
  }

  onCardClick() {
    this.cardClick.emit(this.station);
  }
} 