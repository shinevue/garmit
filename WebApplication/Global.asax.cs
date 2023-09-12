using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.Web.SessionState;
using garmit.Core;
using garmit.DataSource.RdbDataSource;
using garmit.Model.Sample;
using garmit.Model.Login;
using garmit.Service.Login;
using garmit.Model.Logout;
using garmit.Service.Logout;
using garmit.Model.Template;
using garmit.Service.Template;
using garmit.Model.Rack;
using garmit.Service.Rack;
using garmit.Model.Point;
using garmit.Service.Point;
using garmit.Model.ValueData;
using garmit.Service.RealTimeData;
using garmit.Service.TrendGraph;
using garmit.Model.Unit;
using garmit.Service.Unit;
using garmit.Model.OperationLog;
using garmit.Service.OperationLog;
using garmit.Model.LoginUser;
using garmit.Service.LoginUser;
using garmit.Model.System;
using garmit.Service.System;
using garmit.Model.Authority;
using garmit.Model.ColumnOrder;
using garmit.Service.ColumnOrder;
using garmit.Model.Location;
using garmit.Service.Location;
using garmit.Model.LookUp;
using garmit.Model.Egroup;
using garmit.Service.Egroup;
using garmit.Model.Datagate;
using garmit.Service.Datagate;
using garmit.Model.ExtendedData;
using garmit.Model.FloorMap;
using garmit.Model.Incident;
using garmit.Service.Incident;
using garmit.Model.Menu;
using garmit.Service.Report;
using garmit.Service.FloorMap;
using garmit.Model.NetworkPath;
using garmit.Service.NetworkPath;
using garmit.Service.ExtendedData;
using garmit.Service.Authentication;
using garmit.Service.Menu;
using garmit.Model.UnitImage;
using garmit.Service.UnitImage;
using garmit.Service.RackCapacity;
using garmit.Model.RackCapacity;
using garmit.Model.Enterprise;
using garmit.Service.Enterprise;
using garmit.Service.MaintenanceSchedule;
using garmit.Model.MaintenanceSchedule;
using garmit.Model.Tag;
using garmit.Service.Tag;
using garmit.Model.UnitType;
using garmit.Service.UnitType;
using garmit.Model.Export;
using garmit.Service.Export;
using garmit.Service.Import;
using garmit.Model.AssetCondition;
using garmit.Model.MailTemplate;
using garmit.Service.MailTemplate;
using garmit.Service.EgroupMap;
using garmit.Model.Function;
using garmit.Model.Report;
using garmit.Model.Consumer;
using garmit.Service.Consumer;
using garmit.Model.ControlCommand;
using garmit.Model.ControlHist;
using garmit.Service.ControlCommand;
using garmit.Model.StandbyCommand;
using garmit.Model.DemandSet;
using garmit.Service.DemandSet;
using garmit.Service.DemandGraph;
using garmit.Model.DemandData;
using garmit.Service.ControlSchedule;
using garmit.Model.ControlSchedule;
using garmit.Service.ControlHist;
using garmit.Service.DemandSummaryService;
using garmit.Model.ERack;
using garmit.Service.ERackSet;
using garmit.Service.ElectricLockMapService;
using garmit.Service.ERackOperationService;
using garmit.Service.UnlockPurposeService;
using garmit.Model.EmbeddedReport;
using garmit.Service.EmbeddedReport;
using garmit.Model.DataEmbeddedReport;
using garmit.Service.DataEmbeddedReport;
using garmit.Model.ElockOpLog;
using garmit.Service.ElockOpLog;
using garmit.Model.Patchboard;
using garmit.Service.Patchboard;
using garmit.Model.Line;
using garmit.Model.Project;
using garmit.Model.LineHist;
using garmit.Service.LineHist;
using garmit.Service.Project;
using garmit.Service.Line;
using garmit.Service.Dashboard;
using garmit.Model.Dashboard;
using garmit.Model.SearchCondition;
using garmit.Service.SearchCondition;
using garmit.Model.ICCard;
using garmit.Model.ICTerminal;
using garmit.Service.ICCard;
using garmit.Service.ICCardReadHist;
using garmit.Service.ICTerminal;

namespace garmit.Web
{
	public class MvcApplication : System.Web.HttpApplication
	{
		/// <summary>
		/// アプリケーションの起動時に設定
		/// </summary>
		protected void Application_Start()
		{
            MvcHandler.DisableMvcResponseHeader = true;                     //HTTPレスポンスヘッダからX-AspNetMvc-Versionを削除

            AreaRegistration.RegisterAllAreas();							//エリア（区分）を登録する
			GlobalConfiguration.Configure(WebApiConfig.Register);			//WebAPIに対する設定
			FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);		//全コントローラに適用するFilter。WebAPIの設定とは関係なし。
			RouteConfig.RegisterRoutes(RouteTable.Routes);					//コントローラのルートを登録
			BundleConfig.RegisterBundles(BundleTable.Bundles);				//JavaScript、cssのミニファイ、結合を行うための設定

			//参照が循環するプロパティがある場合の処理方法を指定
			GlobalConfiguration.Configuration.Formatters.JsonFormatter.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
            
            //garmitで利用するコンポーネントを定義する
            RegisterComponents();
		}
        
        /// <summary>
        /// 認証時に実行する
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        protected void Application_AuthenticateRequest(object sender, EventArgs e)
        {
            if (IsNeedSessionApiRequest())
            {
                HttpContext.Current.SetSessionStateBehavior(SessionStateBehavior.Required); //WebAPIでSessionStateを有効にする
            }
            else
            {
                HttpContext.Current.SetSessionStateBehavior(SessionStateBehavior.ReadOnly);
            }
        }

        /// <summary>
        /// HTTPヘッダがクライアントに送信されるときに実行する
        /// </summary>
        protected void Application_PreSendRequestHeaders()
        {
            //HTTPレスポンスヘッダ削除する
            Response.Headers.Remove("Server");
        }

        /// <summary>
        /// garmitで利用するモジュールを定義する。
        /// garmitでは、Dependency Injectionのアプローチを利用して、モジュールごとの依存関係を解決します。
        /// </summary>
        private void RegisterComponents()
		{
			RegisterDataSources();
			RegisterModels();
			RegisterServices();
		}

		/// <summary>
		/// データソースを定義する。
		/// </summary>
		private void RegisterDataSources()
		{
			DataSourceManager.GetInstance().RegisterDataSource("RdbDataSource", new RdbDataSource());
		}

		/// <summary>
		/// ドメインモデルを定義する。
		/// 基礎のDomainModelから先に登録すること。
		/// </summary>
		private void RegisterModels()
		{
            //DomainObject、Infrastructure、Utillityのみ
            DomainModelManager.GetInstance().RegisterModel("AssetConditionModel", new AssetConditionModel());

            //RdbDataSourceのみ参照
            DomainModelManager.GetInstance().RegisterModel("EgroupModel", new EgroupModel());
			DomainModelManager.GetInstance().RegisterModel("LocationModel", new LocationModel());
			DomainModelManager.GetInstance().RegisterModel("ColumnOrderModel", new ColumnOrderModel());
			DomainModelManager.GetInstance().RegisterModel("SystemModel", new SystemModel());
			DomainModelManager.GetInstance().RegisterModel("NetworkPathModel", new NetworkPathModel());
			DomainModelManager.GetInstance().RegisterModel("MenuModel", new MenuModel());
			DomainModelManager.GetInstance().RegisterModel("UnitImageModel", new UnitImageModel());
			DomainModelManager.GetInstance().RegisterModel("UnitModel", new UnitModel());
			DomainModelManager.GetInstance().RegisterModel("MaintenanceScheduleModel", new MaintenanceScheduleModel());
			DomainModelManager.GetInstance().RegisterModel("TagModel", new TagModel());
			DomainModelManager.GetInstance().RegisterModel("UnitTypeModel", new UnitTypeModel());
			DomainModelManager.GetInstance().RegisterModel("ExportModel", new ExportModel());
            DomainModelManager.GetInstance().RegisterModel("MailTemplateModel", new MailTemplateModel());
            DomainModelManager.GetInstance().RegisterModel("FunctionModel", new FunctionModel());
            DomainModelManager.GetInstance().RegisterModel("ReportModel", new ReportModel());
            DomainModelManager.GetInstance().RegisterModel("ControlHistModel", new ControlHistModel());
            DomainModelManager.GetInstance().RegisterModel("StandbyCommandModel", new StandbyCommandModel());
            DomainModelManager.GetInstance().RegisterModel("DemandSetModel", new DemandSetModel());
            DomainModelManager.GetInstance().RegisterModel("ControlScheduleModel", new ControlScheduleModel());
            DomainModelManager.GetInstance().RegisterModel("DemandDataModel", new DemandDataModel());
            DomainModelManager.GetInstance().RegisterModel("ElockOpLogModel", new ElockOpLogModel());
            DomainModelManager.GetInstance().RegisterModel("PatchboardModel", new PatchboardModel());
            DomainModelManager.GetInstance().RegisterModel("ProjectModel", new ProjectModel());
            DomainModelManager.GetInstance().RegisterModel("LineHistModel", new LineHistModel());
            DomainModelManager.GetInstance().RegisterModel("DashboardModel", new DashboardModel());
            DomainModelManager.GetInstance().RegisterModel("SearchConditionModel", new SearchConditionModel());
            DomainModelManager.GetInstance().RegisterModel("ICTerminalModel", new ICTerminalModel());

            //その他Modelを参照
            DomainModelManager.GetInstance().RegisterModel("AuthorityModel", new AuthorityModel());
            DomainModelManager.GetInstance().RegisterModel("LoginUserModel", new LoginUserModel());
            DomainModelManager.GetInstance().RegisterModel("LineModel", new LineModel());
            DomainModelManager.GetInstance().RegisterModel("IncidentModel", new IncidentModel());
            DomainModelManager.GetInstance().RegisterModel("DatagateModel", new DatagateModel());
			DomainModelManager.GetInstance().RegisterModel("EnterpriseModel", new EnterpriseModel());
			DomainModelManager.GetInstance().RegisterModel("ExtendedDataModel", new ExtendedDataModel());
			DomainModelManager.GetInstance().RegisterModel("LoginModel", new LoginModel());
			DomainModelManager.GetInstance().RegisterModel("LogoutModel", new LogoutModel());
			DomainModelManager.GetInstance().RegisterModel("TemplateModel", new TemplateModel());
			DomainModelManager.GetInstance().RegisterModel("ValueDataModel", new ValueDataModel());

            DomainModelManager.GetInstance().RegisterModel("ControlCommandModel", new ControlCommandModel());
            DomainModelManager.GetInstance().RegisterModel("OperationLogModel", new OperationLogModel());
			DomainModelManager.GetInstance().RegisterModel("PointModel", new PointModel());
			DomainModelManager.GetInstance().RegisterModel("RackModel", new RackModel());
            DomainModelManager.GetInstance().RegisterModel("ERackModel", new ERackModel());
            DomainModelManager.GetInstance().RegisterModel("EmbeddedReportModel", new EmbeddedReportModel());
            DomainModelManager.GetInstance().RegisterModel("DataEmbeddedReportModel", new DataEmbeddedReportModel());
            DomainModelManager.GetInstance().RegisterModel("ICCardModel", new ICCardModel());

            DomainModelManager.GetInstance().RegisterModel("FloorMapModel", new FloorMapModel());
			DomainModelManager.GetInstance().RegisterModel("RackCapacityModel", new RackCapacityModel());
            DomainModelManager.GetInstance().RegisterModel("ConsumerModel", new ConsumerModel());

            DomainModelManager.GetInstance().RegisterModel("LookUpModel", new LookUpModel());
		}

		/// <summary>
		/// サービスを定義する
		/// 基礎のServiceから先に登録すること。
		/// </summary>
		private void RegisterServices()
		{
			ServiceManager.GetInstance().RegisterService("LoginService", new LoginService());
			ServiceManager.GetInstance().RegisterService("LogoutService", new LogoutService());
			ServiceManager.GetInstance().RegisterService("TemplateService", new TemplateService());
			ServiceManager.GetInstance().RegisterService("RackService", new RackService());
			ServiceManager.GetInstance().RegisterService("PointService", new PointService());
			ServiceManager.GetInstance().RegisterService("RealTimeDataService", new RealTimeDataService());
			ServiceManager.GetInstance().RegisterService("TrendGraphService", new TrendGraphService());
			ServiceManager.GetInstance().RegisterService("LoginUserService", new LoginUserService());
			ServiceManager.GetInstance().RegisterService("SystemService", new SystemService());
			ServiceManager.GetInstance().RegisterService("ReportService", new ReportService());
			ServiceManager.GetInstance().RegisterService("FloorMapService", new FloorMapService());
			ServiceManager.GetInstance().RegisterService("RackCapacityService", new RackCapacityService());
			ServiceManager.GetInstance().RegisterService("NetworkPathService", new NetworkPathService());
			ServiceManager.GetInstance().RegisterService("ExtendedDataService", new ExtendedDataService());
			ServiceManager.GetInstance().RegisterService("AuthenticationService", new AuthenticationService());
			ServiceManager.GetInstance().RegisterService("MenuService", new MenuService());
			ServiceManager.GetInstance().RegisterService("LocationService", new LocationService());
			ServiceManager.GetInstance().RegisterService("UnitImageService", new UnitImageService());
			ServiceManager.GetInstance().RegisterService("IncidentService", new IncidentService());
			ServiceManager.GetInstance().RegisterService("UnitService", new UnitService());
			ServiceManager.GetInstance().RegisterService("MaintenanceScheduleService", new MaintenanceScheduleService());
			ServiceManager.GetInstance().RegisterService("ColumnOrderService", new ColumnOrderService());
			ServiceManager.GetInstance().RegisterService("TagService", new TagService());
			ServiceManager.GetInstance().RegisterService("DatagateService", new DatagateService());
			ServiceManager.GetInstance().RegisterService("UnitTypeService", new UnitTypeService());
			ServiceManager.GetInstance().RegisterService("OperationLogService", new OperationLogService());
			ServiceManager.GetInstance().RegisterService("ExportService", new ExportService());
			ServiceManager.GetInstance().RegisterService("ImportService", new ImportService());
			ServiceManager.GetInstance().RegisterService("EgroupService", new EgroupService());
            ServiceManager.GetInstance().RegisterService("EgroupMapService", new EgroupMapService());
            ServiceManager.GetInstance().RegisterService("EnterpriseService", new EnterpriseService());
            ServiceManager.GetInstance().RegisterService("MailTemplateService", new MailTemplateService());
            ServiceManager.GetInstance().RegisterService("ConsumerService", new ConsumerService());
            ServiceManager.GetInstance().RegisterService("ControlCommandService", new ControlCommandService());
            ServiceManager.GetInstance().RegisterService("DemandSetService", new DemandSetService());
            ServiceManager.GetInstance().RegisterService("DemandGraphService", new DemandGraphService());
            ServiceManager.GetInstance().RegisterService("ControlScheduleService", new ControlScheduleService());
            ServiceManager.GetInstance().RegisterService("ControlHistService", new ControlHistService());
            ServiceManager.GetInstance().RegisterService("DemandSummaryService", new DemandSummaryService());
            ServiceManager.GetInstance().RegisterService("ERackSetService", new ERackSetService());
            ServiceManager.GetInstance().RegisterService("ElectricLockMapService", new ElectricLockMapService());
            ServiceManager.GetInstance().RegisterService("ERackOperationService", new ERackOperationService());
            ServiceManager.GetInstance().RegisterService("UnlockPurposeService", new UnlockPurposeService());
            ServiceManager.GetInstance().RegisterService("EmbeddedReportService", new EmbeddedReportService());
            ServiceManager.GetInstance().RegisterService("DataEmbeddedReportService", new DataEmbeddedReportService());
            ServiceManager.GetInstance().RegisterService("ElockOpLogService", new ElockOpLogService());
            ServiceManager.GetInstance().RegisterService("PatchboardService", new PatchboardService());
            ServiceManager.GetInstance().RegisterService("LineHistService", new LineHistService());
            ServiceManager.GetInstance().RegisterService("ProjectService", new ProjectService());
            ServiceManager.GetInstance().RegisterService("LineService", new LineService());
            ServiceManager.GetInstance().RegisterService("DashboardService", new DashboardService());
            ServiceManager.GetInstance().RegisterService("SearchConditionService", new SearchConditionService());
            ServiceManager.GetInstance().RegisterService("ICCardService", new ICCardService());
            ServiceManager.GetInstance().RegisterService("ICCardReadHistService", new ICCardReadHistService());
            ServiceManager.GetInstance().RegisterService("ICTerminalService", new ICTerminalService());
        }

        private bool IsNeedSessionApiRequest()
        {
            return HttpContext.Current.Request.AppRelativeCurrentExecutionFilePath.StartsWith(@"~/api/login");
        }

    }
}
