import { Http } from '@angular/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'

import { environment as env } from '../../environments/environment'

import { DatasetType } from '../model2/dataset-type'

@Injectable()
export class DatasetTypeService3 {

  constructor(
    private http: Http
  ) { }

  getAll(): Observable<DatasetType[]> {
    return this.http.get(env.contextPath + '/api/v3/datasetTypes')
      .map(response => response.json() as DatasetType[])
  }

}
