import TFS_Build_Contracts = require("TFS/Build/Contracts");
import RestClient = require("TFS/Build/RestClient");
import Controls = require("VSS/Controls");
import Combos = require("VSS/Controls/Combos");
import JSZip = require("jszip");
import BuildContracts = require("TFS/Build/Contracts");

export interface IDeployReportWidgetSettings{
    buildDefinition: string;
    artifactName:string;
    reportFileName: string;
    excludePR: boolean;
}

export class DeployReportWidgetConfiguration {
	private widgetConfigurationContext = null;
    private buildsCombo: Combos.Combo = null;
    private artifactsCombo: Combos.Combo = null;
    private filesCombo: Combos.Combo = null;

    private artifactNameDropDown = $(".artifact-name-container");
    private reportFileNameDropDown = $(".report-name-container");
    private excludePRCheckbox = $(".exclude-pr");
    private buildDefinitionDropDown = $(".build-definition-container");
    
    private currentSettings: IDeployReportWidgetSettings = {
        buildDefinition: null,
        excludePR: false,
        artifactName: null,
        reportFileName: null
    }

    constructor(public WidgetHelpers) {
    }

    public async  load(widgetSettings, widgetConfigurationContext) {
		this.widgetConfigurationContext = widgetConfigurationContext;

		this.currentSettings = JSON.parse(widgetSettings.customSettings.data);

		const context = VSS.getWebContext();
		const buildClient = RestClient.getClient();

		const defs: TFS_Build_Contracts.BuildDefinitionReference[] =
			await buildClient.getDefinitions(
				context.project.id,
				undefined,
				undefined,
				undefined,
				undefined,
				TFS_Build_Contracts.DefinitionQueryOrder.DefinitionNameAscending);

		const names = (defs as any).map((value) => value.name);
		const dropOptions: Combos.IComboDropOptions = {
			maxRowCount: 4,
		};
       
        this.buildsCombo = Controls.create(Combos.Combo, this.buildDefinitionDropDown, {
			dropOptions,
			source: names,
			type: "list",
            value: this.currentSettings.buildDefinition,
            change: () => {
                this.getCustomSettings();
                this.currentSettings.artifactName = null;
                this.currentSettings.reportFileName = null;
                this.loadArtifacts();
            }
        });

        this.excludePRCheckbox.prop("checked", this.currentSettings.excludePR);
        this.excludePRCheckbox.change(() => {
            this.widgetConfigurationContext.notify(this.WidgetHelpers.WidgetEvent.ConfigurationChange, 
                this.WidgetHelpers.WidgetEvent.Args(this.getCustomSettings()));
        });
        this.loadArtifacts();
        this.loadFiles();
		return this.WidgetHelpers.WidgetStatusHelper.Success();
    }

    private async loadArtifacts() {
        const cli = RestClient.getClient();
        const context = VSS.getWebContext();


        let definitions = await cli.getDefinitions(context.project.name);
        const buildDef = definitions.filter(d => d.name == this.buildsCombo.getText())[0];
        if (!buildDef)
            return;
        var builds = await cli.getBuilds(context.project.name, [buildDef.id], null, null,null,null,null,null,null,BuildContracts.BuildResult.Succeeded,null,null,1,null,1,null, BuildContracts.BuildQueryOrder.StartTimeDescending);
        if (!builds || !builds.length)
            return;
        let artifacts = await cli.getArtifacts(builds[0].id, context.project.name);
        if (!artifacts)
            return;
        if (!this.artifactsCombo) {
            const options: Combos.IComboOptions = {
                
            };
            this.artifactsCombo = Controls.create(Combos.Combo, this.artifactNameDropDown, {
                source: artifacts.map(a => a.name),
                type: "list",
                value: this.currentSettings.artifactName,
                change: () => {
                    this.getCustomSettings();
                    this.currentSettings.reportFileName = null;
                    this.loadFiles();
                }
            });
        }
        else 
            this.artifactsCombo.setSource(artifacts.map(a => a.name));
    }

    private async loadFiles() {
        const context = VSS.getWebContext();
        const cli = RestClient.getClient();
        const definitions = await cli.getDefinitions(context.project.name);
        const buildDef = definitions.filter(d => d.name == this.buildsCombo.getText())[0];
        const builds = await cli.getBuilds(context.project.name, [buildDef.id], null, null,null,null,null,null,null,BuildContracts.BuildResult.Succeeded,null,null,1,null,1,null, BuildContracts.BuildQueryOrder.StartTimeDescending);
        
        const files = await cli.getArtifactContentZip(builds[0].id, this.currentSettings.artifactName)
                .then(JSZip.loadAsync).then(jzip => jzip.files);
        const names = Object.keys(files).map(k => files[k].name);
        if (!this.filesCombo) {
            this.filesCombo = Controls.create(Combos.Combo, this.reportFileNameDropDown, {
                source: names,
                type: "list",
                value: this.currentSettings.reportFileName,
                change: () => {
                    this.widgetConfigurationContext.notify(this.WidgetHelpers.WidgetEvent.ConfigurationChange, 
                        this.WidgetHelpers.WidgetEvent.Args(this.getCustomSettings()));
                }
            });
        }
        else 
            this.filesCombo.setSource(names);
    }

	public onSave() {
		return this.WidgetHelpers.WidgetConfigurationSave.Valid(this.getCustomSettings());
    }
    
    public getCustomSettings() {
		this.currentSettings = {
            buildDefinition: this.buildsCombo ? this.buildsCombo.getText() : null,
            artifactName: this.artifactsCombo ? this.artifactsCombo.getText() : null,
            reportFileName: this.filesCombo ? this.filesCombo.getText() : null,
            excludePR: this.excludePRCheckbox.prop("checked")
		};
		return { data: JSON.stringify(this.currentSettings) };
	}
}

VSS.require(["TFS/Dashboards/WidgetHelpers"], (WidgetHelpers) => {
	WidgetHelpers.IncludeWidgetConfigurationStyles();
	VSS.register("deployreport-widget-configuration",
		() => {
			const deployReportConfig = new DeployReportWidgetConfiguration(WidgetHelpers);
			return deployReportConfig;
		});
	VSS.notifyLoadSucceeded();
});