export interface IServerGroup
{
	id: string;
	name: string;
	servers: string[];
}

export interface IServerGroupStatus
{
	id: string;
	name: string;
	servers: IServerStatus[];
}

export interface IServerStatus
{
	name: string;
	status: string;
	build: string;
	running: boolean;
}

export interface IReleaseInfo
{
	LocalEnv: IReleaseInfoLocalEnvironmentSection;
	BuildInfo: IReleaseInfoBuildInfoSection;
	releaseInfo: IReleaseInfoReleaseInfoSection;
}

export interface IReleaseInfoBuildInfoSection
{
	BUILD_REQUESTEDFOR: string;
	BUILD_SOURCEBRANCHNAME: string;
	BUILD_PROJECTNAME: string;
	BUILD_BUILDNUMBER: string;
	BUILD_SOURCEBRANCH: string;
	BUILD_PROJECTID: string;
	BUILD_BUILDID: string;
	BUILD_DEFINITIONNAME: string;
}

export interface IReleaseInfoLocalEnvironmentSection
{
	RELEASE_ENVIRONMENTNAME: string;
	MACHINENAME: string;
}

export interface IReleaseInfoReleaseInfoSection
{
	RELEASE_DEFINITIONID: string;
	RELEASE_REASON: string;
	RELEASE_DEPLOYMENT_STARTTIME: string;
	RELEASE_REQUESTEDFOR: string;
	RELEASE_DEFINITIONNAME: string;
	RELEASE_DEFINITIONENVIRONMENTID: string;
	RELEASE_RELEASENAME: string;
	RELEASE_RELEASEID: string;
	RELEASE_DEPLOYMENT_REQUESTEDFOR: string;
	RELEASE_ENVIRONMENTNAME: string;
}