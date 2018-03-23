import {
  Component, Input, EventEmitter, Output, OnInit,
  ViewChild, AfterContentChecked
} from '@angular/core'
import { NgForm } from '@angular/forms'

import { Dataset } from '../../../model2/dataset'
import { EditorInstanceVariableService } from '../../../services-editor/editor-instance-variable.service'
import { PapaParseService } from 'ngx-papaparse';
import { Study } from '../../../model2/study'
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'instance-variables-import-modal',
  templateUrl: './instance-variables-import-modal.component.html'
})
export class InstanceVariablesImportModalComponent implements OnInit, AfterContentChecked {

  @Input() study: Study
  @Input() dataset: Dataset

  @ViewChild('importForm') importForm: NgForm
  currentForm: NgForm
  formErrors: any = {
    'file': [],
    'encoding': []
  }

  file: File
  overwrite: boolean = false
  encoding: string
  showPreview: boolean = false
  csvJSON: Object

  importInProgress: boolean = false
  importHasFailed: boolean = false

  parseOptions: Object = {
      header: true,
      preview: 25,
      skipEmptyLines: true
  }

  @Output() onImport: EventEmitter<void> = new EventEmitter<void>()
  @Output() onCancel: EventEmitter<void> = new EventEmitter<void>()

  constructor(
    private instanceVariableService: EditorInstanceVariableService,
    private papaParseService: PapaParseService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    if (navigator && navigator.platform && navigator.platform.indexOf('Mac') > -1) {
      this.encoding = 'MacRoman'
    }
    else {
      this.encoding = "ISO-8859-15"
    }
  }

  ngAfterContentChecked(): void {
    if (this.importForm) {
      if (this.importForm !== this.currentForm) {
        this.currentForm = this.importForm
        this.currentForm.valueChanges.subscribe(data => this.validate(data))
      }
    }
  }

  private validate(data?: any): void {
    if (this.importInProgress || this.importHasFailed) {
      for (const field in this.formErrors) {
        this.formErrors[field] = []
        const control = this.currentForm.form.get(field)
        if (control && control.invalid) {
          for (const key in control.errors) {
            this.formErrors[field] = [ ...this.formErrors[field], 'errors.form.' + key ]
          }
        }
      }

      if (!this.file) {
        this.formErrors.file = [ 'errors.form.required' ]
      }
    }
  }

  doUpdateFile(event: any): void {
    const files: FileList = event.target.files

    if (files && files.length > 0) {
      this.file = files[0]
    }
    else {
      this.file = null
    }
    this.showPreview = false

    this.validate()
  }

  doImport(): void {
    this.importInProgress = true

    this.validate()

    if (this.currentForm.invalid || this.formErrors.file.length) {
      this.importInProgress = false
      this.importHasFailed = true
      return
    }

    this.instanceVariableService.importInstanceVariablesAsCsv(this.study.id, this.dataset.id, this.file, this.encoding, this.overwrite)
      .finally(() => {
        this.importInProgress = false
      })
      .subscribe(result => {
        this.importInProgress = false
        this.importHasFailed = false
        this.onImport.emit()
      })
  }

  doCancel(): void {
    this.showPreview = false
    this.file = null
    this.onCancel.emit()
  }

  showWarning(): void {
    this.translateService.get('importInstanceVariablesModal.overwrite.warningQuestion')
      .subscribe((message: string) => {
        if (confirm(message)) {
          this.doImport()
      }})
  }

  importButtonClick(): void {
    if (this.overwrite) {
      this.showWarning()
    } else {
      this.doImport()
    }
  }

  doPreview(): void {
    this.showPreview = !this.showPreview

    if (this.showPreview) {
      const reader: FileReader = new FileReader()
      reader.readAsText(this.file, this.encoding)

      reader.onload = () => {
        const csvString: string = reader.result.replace(/^.*/, function(m) {
            return m.replace(/\./g, '_')
        })

        this.csvJSON = this.papaParseService.parse(csvString, this.parseOptions).data
      }
    }
  }
}
