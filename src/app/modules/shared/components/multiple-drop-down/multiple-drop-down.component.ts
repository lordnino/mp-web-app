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
    selector: 'Charger-multiple-drop-down',
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
    templateUrl: './multiple-drop-down.component.html',
    styleUrl: './multiple-drop-down.component.scss',
})
export class MultipleDropDownComponent
    implements OnInit, AfterViewInit, OnDestroy
{
    @Input() items: any[];
    @Input() isRequired: boolean;
    @Input() title: string = 'Please select';
    @Input() selectedOption: any[];
    @Output() optionSelected = new EventEmitter<any>();
    /** list of options */
    protected options: any[];

    /** control for the selected bank for multi-selection */
    public optionMultiCtrl: FormControl = new FormControl();

    /** control for the MatSelect filter keyword multi-selection */
    public optionMultiFilterCtrl: FormControl = new FormControl();

    /** list of options filtered by search keyword */
    public filteredOptionsMulti: ReplaySubject<any[]> = new ReplaySubject<
        any[]
    >(1);

    @ViewChild('multiSelect') multiSelect: MatSelect;

    /** Subject that emits when the component has been destroyed. */
    protected _onDestroy = new Subject<void>();

    constructor() {}

    ngOnInit() {
        // set initial selection
        // this.optionMultiCtrl.setValue([
        //     this.options[10],
        //     this.options[11],
        //     this.options[12],
        // ]);
        this.listenSearchFieldValueChanges();
    }

    ngAfterViewInit() {
        this.setInitialValue();
    }

    ngOnDestroy() {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    ngOnChanges(): void {
        if (this.items) {
            this.options = this.items;
            this.filteredOptionsMulti.next(this.options.slice());
        }
        if (this.selectedOption) {
            this.optionMultiCtrl.setValue(this.selectedOption);
        }
    }

    listenToOptionChanges() {
        this.options = this.items;
        this.filteredOptionsMulti.next(this.options.slice());
    }

    listenSearchFieldValueChanges() {
        this.optionMultiFilterCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterBanksMulti();
            });
    }

    onOptionSelected(event: any) {
        this.optionSelected.emit({
            value: event.value,
            name: this.title,
        });
    }

    clear() {
        this.optionMultiCtrl.setValue([]);
    }

    /**
     * Sets the initial value after the filteredOptions are loaded initially
     */
    protected setInitialValue() {
        this.filteredOptionsMulti
            .pipe(take(1), takeUntil(this._onDestroy))
            .subscribe(() => {
                // setting the compareWith property to a comparison function
                // triggers initializing the selection according to the initial value of
                // the form control (i.e. _initializeSelection())
                // this needs to be done after the filteredBanks are loaded initially
                // and after the mat-option elements are available
                this.multiSelect.compareWith = (a: any, b: any) =>
                    a && b && a.id === b.id;
            });
    }

    protected filterBanksMulti() {
        if (!this.options) {
            return;
        }
        // get the search keyword
        let search = this.optionMultiFilterCtrl.value;
        if (!search) {
            this.filteredOptionsMulti.next(this.options.slice());
            return;
        } else {
            search = search.toLowerCase();
        }
        // filter the options
        this.filteredOptionsMulti.next(
            this.options.filter(
                (option) => option.name.toLowerCase().indexOf(search) > -1
            )
        );
    }
}
