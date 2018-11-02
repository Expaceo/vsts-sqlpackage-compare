import path = require('path');
import tl = require('azure-pipelines-task-lib/task');

async function run() {
    try {
        console.log("running with node version : ", process.version);
        let cmd = "";
        var action = tl.getInput("action");
        if (action == "script")
            cmd += " /a:script";
        else if (action == "report")
            cmd += " /a:DeployReport"

        if (tl.getInput("sourceType") == "dacpac") {
            cmd += " /SourceFile:" + tl.getInput("sourceDacpac");
        }
        else {
            cmd += " /SourceConnectionString:" + tl.getInput("sourceConnectionString");
        }

        if (tl.getInput("targetType") == "dacpac") {
            cmd += " /TargetFile:" + tl.getInput("targetDacpac");
            cmd += " /TargetDatabaseName:" + tl.getInput("targetDatabaseName");
        }
        else {
            cmd += " /TargetConnectionString:" + tl.getInput("targetConnectionString");
        }        
        cmd += " /OutputPath:" + tl.getInput("outputPath");

        cmd += " /p:DropObjectsNotInSource=" + tl.getInput("dropObjectsNotInSource");

        let excluded = getExcludedObjectsTypes();

        if (excluded.length > 0)
            cmd += " /p:ExcludeObjectTypes=\"" + excluded.join(";") + "\"";
        
        console.log(tl.getInput("sqlPackage") + " " + cmd);
        let ret = await tl.exec(tl.getInput("sqlPackage"), cmd);
        console.log("return code : " + ret)
        tl.setResult(tl.TaskResult.Succeeded, "" , true);
    }
    catch (err) {
        tl.error(err.message);
        tl.setResult(tl.TaskResult.Failed, err.message, true);
    }
}

function getExcludedObjectsTypes() {
    let ExcludeObjectTypes = [];
    if (!tl.getBoolInput("Aggregates"))
        ExcludeObjectTypes.push("Aggregates");
    if (!tl.getBoolInput("ApplicationRoles"))
        ExcludeObjectTypes.push("ApplicationRoles");
    if (!tl.getBoolInput("Assemblies"))
        ExcludeObjectTypes.push("Assemblies");
    if (!tl.getBoolInput("AsymmetricKeys"))
        ExcludeObjectTypes.push("AsymmetricKeys");
    if (!tl.getBoolInput("BrokerPriorities"))
        ExcludeObjectTypes.push("BrokerPriorities");
    if (!tl.getBoolInput("Certificates"))
        ExcludeObjectTypes.push("Certificates");
    if (!tl.getBoolInput("ColumnEncryptionKeys"))
        ExcludeObjectTypes.push("ColumnEncryptionKeys");
    if (!tl.getBoolInput("ColumnMasterKeys"))
        ExcludeObjectTypes.push("ColumnMasterKeys");
    if (!tl.getBoolInput("Contracts"))
        ExcludeObjectTypes.push("Contracts");
    if (!tl.getBoolInput("DatabaseRoles"))
        ExcludeObjectTypes.push("DatabaseRoles");
    if (!tl.getBoolInput("DatabaseTriggers"))
        ExcludeObjectTypes.push("DatabaseTriggers");
    if (!tl.getBoolInput("Defaults"))
        ExcludeObjectTypes.push("Defaults");
    if (!tl.getBoolInput("ExtendedProperties"))
        ExcludeObjectTypes.push("ExtendedProperties");
    if (!tl.getBoolInput("ExternalDataSources"))
        ExcludeObjectTypes.push("ExternalDataSources");
    if (!tl.getBoolInput("ExternalFileFormats"))
        ExcludeObjectTypes.push("ExternalFileFormats");
    if (!tl.getBoolInput("ExternalTables"))
        ExcludeObjectTypes.push("ExternalTables");
    if (!tl.getBoolInput("Filegroups"))
        ExcludeObjectTypes.push("Filegroups");
    if (!tl.getBoolInput("FileTables"))
        ExcludeObjectTypes.push("FileTables");
    if (!tl.getBoolInput("FullTextCatalogs"))
        ExcludeObjectTypes.push("FullTextCatalogs");
    if (!tl.getBoolInput("FullTextStoplists"))
        ExcludeObjectTypes.push("FullTextStoplists");
    if (!tl.getBoolInput("MessageTypes"))
        ExcludeObjectTypes.push("MessageTypes");
    if (!tl.getBoolInput("PartitionFunctions"))
        ExcludeObjectTypes.push("PartitionFunctions");
    if (!tl.getBoolInput("PartitionSchemes"))
        ExcludeObjectTypes.push("PartitionSchemes");
    if (!tl.getBoolInput("Permissions"))
        ExcludeObjectTypes.push("Permissions");
    if (!tl.getBoolInput("Queues"))
        ExcludeObjectTypes.push("Queues");
    if (!tl.getBoolInput("RemoteServiceBindings"))
        ExcludeObjectTypes.push("RemoteServiceBindings");
    if (!tl.getBoolInput("RoleMembership"))
        ExcludeObjectTypes.push("RoleMembership");
    if (!tl.getBoolInput("Rules"))
        ExcludeObjectTypes.push("Rules");
    if (!tl.getBoolInput("ScalarValuedFunctions"))
        ExcludeObjectTypes.push("ScalarValuedFunctions");
    if (!tl.getBoolInput("SearchPropertyLists"))
        ExcludeObjectTypes.push("SearchPropertyLists");
    if (!tl.getBoolInput("SecurityPolicies"))
        ExcludeObjectTypes.push("SecurityPolicies");
    if (!tl.getBoolInput("Sequences"))
        ExcludeObjectTypes.push("Sequences");
    if (!tl.getBoolInput("Services"))
        ExcludeObjectTypes.push("Services");
    if (!tl.getBoolInput("Signatures"))
        ExcludeObjectTypes.push("Signatures");
    if (!tl.getBoolInput("StoredProcedures"))
        ExcludeObjectTypes.push("StoredProcedures");
    if (!tl.getBoolInput("SymmetricKeys"))
        ExcludeObjectTypes.push("SymmetricKeys");
    if (!tl.getBoolInput("Synonyms"))
        ExcludeObjectTypes.push("Synonyms");
    if (!tl.getBoolInput("Tables"))
        ExcludeObjectTypes.push("Tables");
    if (!tl.getBoolInput("TableValuedFunctions"))
        ExcludeObjectTypes.push("TableValuedFunctions");
    if (!tl.getBoolInput("UserDefinedDataTypes"))
        ExcludeObjectTypes.push("UserDefinedDataTypes");
    if (!tl.getBoolInput("UserDefinedTableTypes"))
        ExcludeObjectTypes.push("UserDefinedTableTypes");
    if (!tl.getBoolInput("ClrUserDefinedTypes"))
        ExcludeObjectTypes.push("ClrUserDefinedTypes");
    if (!tl.getBoolInput("Users"))
        ExcludeObjectTypes.push("Users");
    if (!tl.getBoolInput("Views"))
        ExcludeObjectTypes.push("Views");
    if (!tl.getBoolInput("XmlSchemaCollections"))
        ExcludeObjectTypes.push("XmlSchemaCollections");
    if (!tl.getBoolInput("Audits"))
        ExcludeObjectTypes.push("Audits");
    if (!tl.getBoolInput("Credentials"))
        ExcludeObjectTypes.push("Credentials");
    if (!tl.getBoolInput("CryptographicProviders"))
        ExcludeObjectTypes.push("CryptographicProviders");
    if (!tl.getBoolInput("DatabaseAuditSpecifications"))
        ExcludeObjectTypes.push("DatabaseAuditSpecifications");
    if (!tl.getBoolInput("DatabaseScopedCredentials"))
        ExcludeObjectTypes.push("DatabaseScopedCredentials");
    if (!tl.getBoolInput("Endpoints"))
        ExcludeObjectTypes.push("Endpoints");
    if (!tl.getBoolInput("ErrorMessages"))
        ExcludeObjectTypes.push("ErrorMessages");
    if (!tl.getBoolInput("EventNotifications"))
        ExcludeObjectTypes.push("EventNotifications");
    if (!tl.getBoolInput("EventSessions"))
        ExcludeObjectTypes.push("EventSessions");
    if (!tl.getBoolInput("LinkedServerLogins"))
        ExcludeObjectTypes.push("LinkedServerLogins");
    if (!tl.getBoolInput("LinkedServers"))
        ExcludeObjectTypes.push("LinkedServers");
    if (!tl.getBoolInput("Logins"))
        ExcludeObjectTypes.push("Logins");
    if (!tl.getBoolInput("Routes"))
        ExcludeObjectTypes.push("Routes");
    if (!tl.getBoolInput("ServerAuditSpecifications"))
        ExcludeObjectTypes.push("ServerAuditSpecifications");
    if (!tl.getBoolInput("ServerRoleMembership"))
        ExcludeObjectTypes.push("ServerRoleMembership");
    if (!tl.getBoolInput("ServerRoles"))
        ExcludeObjectTypes.push("ServerRoles");
    if (!tl.getBoolInput("ServerTriggers"))
        ExcludeObjectTypes.push("ServerTriggers");
    return ExcludeObjectTypes;
}
console.log("SQLPackage Diff starting");
run();