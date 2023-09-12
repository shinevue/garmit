using garmit.Core;
using garmit.DomainObject;
using garmit.Service.Dashboard;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace garmit.Web.Controllers
{

    /// <summary>
    /// ダッシュボードAPIコントローラー
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/dashboard")]
    public class DashboardApiController : ApiController
    {
        /// <summary>
        /// ダッシュボードサービス
        /// </summary>
        public IDashboardService DashboardService { get; set; }

        public DashboardApiController()
        {
            DashboardService = ServiceManager.GetService<IDashboardService>("DashboardService");
        }

        #region ダッシュボード表示

        /// <summary>
        /// ダッシュボード情報取得(初期表示)
        /// </summary>
        /// <returns>ダッシュボード情報</returns>
        [Route("getDashboardInfo")]
        public DashboardInfo GetDashboardInfo()
        {
            DashboardInfo info = new DashboardInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = DashboardService.GetDashboardInfo(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info;
        }

        /// <summary>
        /// ダッシュボードスケジュール取得
        /// </summary>
        /// <returns>ダッシュボードスケジュール一覧</returns>
        [Route("getSchedules")]
        public IEnumerable<DashboardSchedule> GetDashboardSchedules()
        {
            IEnumerable<DashboardSchedule> schedules = new List<DashboardSchedule>();
            Session session = SessionAccessor.GetSession();

            try
            {
                schedules = DashboardService.GetSchedules(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return schedules;
        }

        #endregion

        #region ダッシュボード表示/編集（共通）

        /// <summary>
        /// ダッシュボードお知らせ一覧取得
        /// </summary>
        /// <returns>ダッシュボードお知らせ一覧</returns>
        [Route("getInformations")]
        public IEnumerable<DashboardInformation> GetDashboardInformations()
        {
            IEnumerable<DashboardInformation> informations = new List<DashboardInformation>();
            Session session = SessionAccessor.GetSession();

            try
            {
                informations = DashboardService.GetInformations(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return informations;
        }

        #endregion

        #region ダッシュボード編集

        #region 取得

        /// <summary>
        /// ダッシュボード編集情報取得(初期表示)
        /// </summary>
        /// <returns>ダッシュボード編集情報</returns>
        [Route("getDashboardEditInfo")]
        public DashboardEditInfo GetDashboardEditInfo()
        {
            DashboardEditInfo info = new DashboardEditInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = DashboardService.GetDashboardEditInfo(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info;
        }

        /// <summary>
        /// ダッシュボードの表示設定情報一覧を取得する
        /// </summary>
        /// <returns>表示設定一覧</returns>
        [Route("getDispSettings")]
        public IEnumerable<DashboardDispSetting> GetDashboardDispSettings()
        {
            IEnumerable<DashboardDispSetting> settings = new List<DashboardDispSetting>();
            Session session = SessionAccessor.GetSession();

            try
            {
                settings = DashboardService.GetDispSettings(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return settings;
        }

        /// <summary>
        /// ダッシュボードのナビゲーション設定一覧取得
        /// </summary>
        /// <returns>ナビゲーション設定一覧</returns>
        [Route("getNavigationSettings")]
        public IEnumerable<DashboardNavigationSetting> GetDashboardNavigationSettings()
        {
            IEnumerable<DashboardNavigationSetting> settings = new List<DashboardNavigationSetting>();
            Session session = SessionAccessor.GetSession();

            try
            {
                settings = DashboardService.GetNavigationSettings(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return settings;
        }

        /// <summary>
        /// ダッシュボードのオペレーションログ設定情報取得
        /// </summary>
        /// <returns>オペレーションログ設定情報</returns>
        [Route("getOperationLogSetting")]
        public DashboardOperationLogSetting GetDashboardOperationLogSetting()
        {
            DashboardOperationLogSetting setting = new DashboardOperationLogSetting();
            Session session = SessionAccessor.GetSession();

            try
            {
                setting = DashboardService.GetOperationLogSetting(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return setting;
        }

        /// <summary>
        /// ダッシュボードの外部リンク一覧取得
        /// </summary>
        /// <returns>外部リンク一覧</returns>
        [Route("getLinks")]
        public IEnumerable<DashboardLink> GetDashboardLinks()
        {
            IEnumerable<DashboardLink> links = new List<DashboardLink>();
            Session session = SessionAccessor.GetSession();

            try
            {
                links = DashboardService.GetLinks(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return links;
        }

        #endregion

        #region 保存
        
        /// <summary>
        /// ダッシュボードの表示設定保存
        /// </summary>
        /// <param name="dispSettings"表示設定情報></param>
        /// <returns>保存結果</returns>
        [Route("setDispSettings")]
        public RequestResult PostSetDashboardDispSettings(IEnumerable<DashboardDispSetting> dispSettings)
        {
            RequestResult result = new RequestResult();
            Session session = SessionAccessor.GetSession();

            try
            {
                result = DashboardService.SetDispSettings(session, dispSettings);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return GetErrorRequestResult(session.CultureInfo, "DispSetting");
            }

            return result;
        }

        /// <summary>
        /// ダッシュボードのお知らせ一括保存
        /// </summary>
        /// <param name="informations"お知らせ一覧></param>
        /// <returns>保存結果</returns>
        [Route("setInformations")]
        public RequestResult PostSetDashboardInformations(IEnumerable<DashboardInformation> informations)
        {
            RequestResult result = new RequestResult();
            Session session = SessionAccessor.GetSession();

            try
            {
                result = DashboardService.SetInformations(session, informations);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return GetErrorRequestResult(session.CultureInfo, "Informations");
            }

            return result;
        }

        /// <summary>
        /// ダッシュボードのナビゲーション一括保存
        /// </summary>
        /// <param name="navigationSettings">ナビゲーション設定一覧</param>
        /// <returns>保存結果</returns>
        [Route("setNavigations")]
        public RequestResult PostSetDashboardNavigationSettings(IEnumerable<DashboardNavigationSetting> navigationSettings)
        {
            RequestResult result = new RequestResult();
            Session session = SessionAccessor.GetSession();

            try
            {
                result = DashboardService.SetNavigations(session, navigationSettings);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return GetErrorRequestResult(session.CultureInfo, "Navigations");
            }

            return result;
        }

        /// <summary>
        /// ダッシュボードのオペレーションログ設定情報保存
        /// </summary>
        /// <param name="operationLogSetting">オペレーションログ設定情報</param>
        /// <returns>保存結果</returns>
        [Route("setOperationLogSetting")]
        public RequestResult PostSetDashboardOperationLogSetting(DashboardOperationLogSetting operationLogSetting)
        {
            RequestResult result = new RequestResult();
            Session session = SessionAccessor.GetSession();

            try
            {
                result = DashboardService.SetOperationLogSetting(session, operationLogSetting);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return GetErrorRequestResult(session.CultureInfo, "OperationLogSetting");
            }

            return result;
        }

        /// <summary>
        /// ダッシュボードの外部リンク一括保存
        /// </summary>
        /// <param name="navigationSettings">ナビゲーション設定一覧</param>
        /// <returns>保存結果</returns>
        [Route("setLinks")]
        public RequestResult PostSetDashboardLinks(IEnumerable<DashboardLink> links)
        {
            RequestResult result = new RequestResult();
            Session session = SessionAccessor.GetSession();

            try
            {
                result = DashboardService.SetLinks(session, links);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return GetErrorRequestResult(session.CultureInfo, "Links");
            }

            return result;
        }

        #endregion

        #endregion

        #region private

        /// <summary>
        /// エラーリクエスト結果を取得する
        /// </summary>
        /// <param name="cultureInfo">カルチャ情報</param>
        /// <returns>リクエスト結果</returns>
        private RequestResult GetErrorRequestResult(CultureInfo cultureInfo, string type)
        {
            return new RequestResult
            {
                IsSuccess = false,
                Message = MessageUtil.GetMessage("Dashboard_" + type + "RegisterError", cultureInfo)
            };
        }

        #endregion
        
    }
}
