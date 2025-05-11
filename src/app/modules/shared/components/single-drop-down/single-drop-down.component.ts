import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'Charger-single-drop-down',
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        NgxMatSelectSearchModule,
    ],
    templateUrl: './single-drop-down.component.html',
    styleUrl: './single-drop-down.component.scss',
})
export class SingleDropDownComponent
    implements OnInit, AfterViewInit, OnDestroy
{
    @Input() items: any[];
    @Input() isRequired: boolean;
    @Input() title: string = 'Please select';
    @Input() hideLable: boolean = false;
    @Input() selectedOption: string = 'Please select';
    @Output() optionSelected = new EventEmitter<any>();
    /** list of options */
    protected options: any[];

    /** control for the selected option */
    public optionCtrl: FormControl = new FormControl();

    /** control for the MatSelect filter keyword */
    public optionFilterCtrl: FormControl = new FormControl();

    /** list of options filtered by search keyword */
    public filteredOptions: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

    @ViewChild('singleSelect') singleSelect: MatSelect;

    /** Subject that emits when the component has been destroyed. */
    protected _onDestroy = new Subject<void>();

    constructor() {}

    ngOnInit() {
        this.listenSearchFieldValueChanges();
    }

    ngOnChanges(): void {
        if (this.items) {
            this.options = this.items;
            this.filteredOptions.next(this.options.slice());
        }
        if (this.selectedOption) {
            this.optionCtrl.setValue(this.selectedOption);
        }
    }

    ngAfterViewInit() {
        this.setInitialValue();
    }

    ngOnDestroy() {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    listenToOptionChanges() {
        this.options = this.items;
        this.filteredOptions.next(this.options.slice());
    }

    listenSearchFieldValueChanges() {
        this.optionFilterCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterOptions();
            });
    }

    onOptionSelected(event: any) {
        this.optionSelected.emit({
            value: event.value,
            name: this.title,
        });
    }

    clear() {
        this.optionCtrl.setValue(null);
    }

    /**
     * Sets the initial value after the filteredOptions are loaded initially
     */
    protected setInitialValue() {
        this.filteredOptions
            .pipe(take(1), takeUntil(this._onDestroy))
            .subscribe(() => {
                // setting the compareWith property to a comparison function
                // triggers initializing the selection according to the initial value of
                // the form control (i.e. _initializeSelection())
                // this needs to be done after the filteredOptions are loaded initially
                // and after the mat-option elements are available
                this.singleSelect.compareWith = (a: any, b: any) =>
                    a && b && a.id === b.id;
            });
    }

    protected filterOptions() {
        if (!this.options) {
            return;
        }
        // get the search keyword
        let search = this.optionFilterCtrl.value;
        if (!search) {
            this.filteredOptions.next(this.options.slice());
            return;
        } else {
            search = search.toLowerCase();
        }
        // filter the options
        this.filteredOptions.next(
            this.options.filter(
                (option) => option.name.toLowerCase().indexOf(search) > -1
            )
        );
    }
}
