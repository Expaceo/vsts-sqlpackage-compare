import RestClient = require("TFS/Build/RestClient");

import BuildContracts = require("TFS/Build/Contracts");
import JSZip = require("jszip");
import { IDeployReportWidgetSettings } from "./DeployReportWidgetConfiguration";
import Controls = require("VSS/Controls");
import Grids = require("VSS/Controls/Grids");


export class DeployReportWidget {
    private grid: Grids.Grid = null;

    constructor(public WidgetHelpers) { }

    public async load(widgetSettings) {
        this.initGrid();
		await this.loadData(widgetSettings);
		return this.WidgetHelpers.WidgetStatusHelper.Success();
	}

	public async reload(widgetSettings) {
		await this.loadData(widgetSettings);
		return this.WidgetHelpers.WidgetStatusHelper.Success();
	}

    private async loadData(widgetSettings) {
        try {
            const context = VSS.getWebContext();
            const cli = RestClient.getClient();
            const settings = JSON.parse(widgetSettings.customSettings.data) as IDeployReportWidgetSettings;
            if (!settings.buildDefinition || !settings.reportFileName || !settings.artifactName) {
                $(".grid-container").text("Widget not configured");
                return;
            }
            let definitions = await cli.getDefinitions(context.project.name);
            const buildDef = definitions.filter(d => d.name == settings.buildDefinition)[0];
            let buildReason =  BuildContracts.BuildReason.All;
            if (settings.excludePR)
                buildReason = buildReason ^ BuildContracts.BuildReason.PullRequest;
            var builds = await cli.getBuilds(context.project.name, [buildDef.id], null, null,null,null,null,buildReason,null,BuildContracts.BuildResult.Succeeded,null,null,10,null,10,null, BuildContracts.BuildQueryOrder.StartTimeDescending);
            console.log(builds);
            var content = await cli.getArtifactContentZip(builds[0].id, settings.artifactName)
                .then(JSZip.loadAsync).then(jzip => jzip.file(settings.reportFileName).async("text"));

            $(".subtitle").html(`Artifact from build <a target="_top" href="${context.host.uri}/${context.project.name}/_build/results?buildId=${builds[0].id}">${builds[0].id}</a>`);
            var x = $(content)[1];
            this.updateGridSource($(x));
        }
        catch(e) {
            console.error(e);
            $(".grid-container").text(e);
        }
    }
    
    private initGrid(){
        let options: Grids.IGridOptions  = {
            height: "100%",
            width: "100%",
            columns: [
                {text: 'Operation', index: 'operation'},
                {text: 'Type', index: 'type'},
                {text: 'Name', index: 'name', width: 230}
            ]
        }
        this.grid = Controls.create(Grids.Grid, $(".grid-container"), options);
    }

    private updateGridSource(content: JQuery)
    {
        let items: Grids.IGridHierarchyItem[] = [];
        content.find("operation").each((i, e) => {
            items.push(
            {
                operation: $(e).attr("Name"), 
                type: $(e).find("Item").length + " elements",
                children: $.makeArray($(e).find("Item").map((j, c) => ({ type: $(c).attr("Type"), name: $(c).attr("Value")})))
            })
        });
        var gridSource = new Grids.GridHierarchySource(items);
        this.grid.setDataSource(gridSource);
        let alerts = [];
        $(".alert-container").empty();
        content.find("Alerts Issue").each((i, e) => {alerts.push($(e).attr("Value"))});
        if (alerts.length > 0) {
            //$(".alert-container").append("<h3>Alerts</h3>");
            let alertList = $(".alert-container").append("<ul></ul>");
            alerts.forEach(a => alertList.append(`<li>${a}</li>`));
        }
    }
}


VSS.require(["TFS/Dashboards/WidgetHelpers"], function (WidgetHelpers) {
    WidgetHelpers.IncludeWidgetStyles();
    VSS.register("deployreport-widget", () => {
        let widget = new DeployReportWidget(WidgetHelpers);
        return widget;
    });
    VSS.notifyLoadSucceeded();
});
