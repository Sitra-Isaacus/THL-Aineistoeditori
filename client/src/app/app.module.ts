import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, Http } from '@angular/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DatepickerModule } from 'ngx-bootstrap/datepicker';
import { DatePipe } from '@angular/common';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { environment } from "../environments/environment";

// utils
import { NodeUtils } from "./utils/node-utils";

// services
import { DataSetService } from "./services/data-set.service";
import { DatasetService } from "./services2/dataset.service";
import { RoleService } from "./services/role.service";
import { PersonService } from "./services/person.service";
import { PersonInRoleService } from "./services/person-in-role.service";
import { PopulationService } from "./services/population.service";
import { OrganizationService } from "./services/organization.service";
import { OrganizationUnitService } from "./services/organization-unit.service";
import { InstanceVariableService } from './services/instance-variable.service';
import { UsageConditionService } from "./services/usage-condition.service";
import { LifecyclePhaseService } from "./services/lifecycle-phase.service";

// common components
import { IsoDatePicker } from "./views/common/iso-datepicker.component";
import { LifecyclePhaseComponent } from "./views/common/lifecycle-phase.component";
import { LangPipe } from "./utils/lang.pipe";
import { OrganizationComponent } from "./views/common/organization.component";
import { OrganizationUnitComponent } from "./views/common/organization-unit.component";
import { PersonComponent } from "./views/common/person.component";
import { PersonInRoleComponent } from "./views/common/person-in-role.component";
import { PropertyValueComponent } from './views/common/property-value.component';
import { PopulationComponent } from "./views/common/population.component";

// catalog components (few renamed to avoid name clash with editor)
import { DatasetComponent } from './views/catalog/dataset/dataset.component';
import { DatasetListComponent } from './views/catalog/dataset/dataset-list.component';

// editor components
import { DataSetListComponent as EditorDataSetListComponent } from './views/editor/data-set/data-set-list.component';
import { DataSetComponent as EditorDataSetComponent } from './views/editor/data-set/data-set.component';
import { DataSetEditComponent } from "./views/editor/data-set/data-set-edit.component";
import { InstanceVariableEditComponent } from "./views/editor/data-set/instance-variable-edit.component";

export function TranslateHttpLoaderFactory(http: Http) {
  return new TranslateHttpLoader(http, environment.contextPath + '/assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        AppComponent,
        DatasetComponent,
        DatasetListComponent,
        EditorDataSetListComponent,
        EditorDataSetComponent,
        DataSetEditComponent,
        InstanceVariableEditComponent,
        IsoDatePicker,
        LangPipe,
        OrganizationComponent,
        OrganizationUnitComponent,
        PersonComponent,
        PersonInRoleComponent,
        PopulationComponent,
        PropertyValueComponent,
        LifecyclePhaseComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AppRoutingModule,
        DatepickerModule.forRoot(),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: TranslateHttpLoaderFactory,
                deps: [Http]
            }
        })
    ],
    providers: [
        DataSetService,
        DatasetService,
        InstanceVariableService,
        NodeUtils,
        OrganizationService,
        OrganizationUnitService,
        PersonService,
        PersonInRoleService,
        PopulationService,
        RoleService,
        UsageConditionService,
        LifecyclePhaseService,
        DatePipe
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule { }
