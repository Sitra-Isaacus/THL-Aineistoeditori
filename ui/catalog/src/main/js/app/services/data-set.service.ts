import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from "rxjs";
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'

import { DataSet } from '../model/data-set';
import { Organization } from '../model/organization';
import { InstanceVariable } from '../model/instance-variable';
import { Population } from "../model/population";

@Injectable()
export class DataSetService {
    constructor(
        private _http: Http
    ) {}

    getAllDataSets(): Observable<DataSet[]> {
        return this._http.get('../metadata-api/datasets?max=-1')
            .map(response => response.json() as DataSet[]);
    }

    getDataSet(datasetId: String): Observable<DataSet> {
        return this._http.get('../metadata-api/datasets/' + datasetId)
            .map(response => response.json() as DataSet);
    }

    getDataSetOwners(datasetId: String): Observable<Organization[]> {
        return this._http.get('../metadata-api/datasets/' + datasetId + '/owners')
            .map(response => response.json() as Organization[]);
    }

  getDataSetPopulations(datasetId: String): Observable<Population[]> {
    return this._http.get('../metadata-api/datasets/' + datasetId + '/populations')
      .map(response => response.json() as Population[]);
  }

  getDataSetInstanceVariables(datasetId: String): Observable<InstanceVariable[]> {
        return this._http.get('../metadata-api/datasets/' + datasetId + '/instanceVariables')
            .map(response => response.json() as InstanceVariable[]);
    }

}
