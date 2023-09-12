using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.DomainObject;
using garmit.Core;
using garmit.Web.Models;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using garmit.Service.Incident;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// インシデントログ画面のAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/IncidentLog")]
    public class IncidentLogApiController : ApiController
    {
        /// <summary>
        /// インシデントサービス
        /// </summary>
        public IIncidentService IncidentService { get; set; }

        public IncidentLogApiController()
        {
            IncidentService = ServiceManager.GetService<IIncidentService>("IncidentService");
        }
        
        /// <summary>
        /// マスタデータを取得する
        /// </summary>
        /// <returns></returns>
        [Route("getLookUp")]
        public LookUp GetLookUp()
        {
            IncidentInfo info = new IncidentInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = IncidentService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.LookUp;
        }

        /// <summary>
        /// 発生中アラームを取得する
        /// </summary>
        /// <returns></returns>
        [Route("getAlarmSummary")]
        public IncidentInfo GetAlarmSummary()
        {
            IncidentInfo info = new IncidentInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = IncidentService.GetAlarmSummary(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info;
        }

        /// <summary>
        /// レイアウトのロケーション配下のアラームを取得する
        /// ※発生中アラームのみ
        /// </summary>
        /// <param name="layoutId"></param>
        /// <returns></returns>
        [HttpPost] 
        [Route("getByLayout")]
        public IncidentInfo GetIncidentLog(Layout selectLayout)
        {
            IncidentInfo info = new IncidentInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = IncidentService.GetLayoutAlarms(session, selectLayout);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info;
        }

        /// <summary>
        /// 検索条件に該当するアラーム／接点状態変化ログを取得する
        /// </summary>
        /// <param name="lookUp"></param>
        /// <returns></returns>
        [Route("getIncidents")]
        public IncidentInfo PostGetIncidents(LookUp lookUp)
        {
            IncidentInfo info = new IncidentInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = IncidentService.GetIncidents(session, lookUp);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info;
        }

        /// <summary>
        /// アラームを確認状態にする
        /// </summary>
        /// <param name="alarmIds"></param>
        /// <returns></returns>
        [Route("confirmAlarms")]
        public RequestResult PostConfirmAlarms(IEnumerable<int> alarmIds)
        {
            IncidentInfo info = new IncidentInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = IncidentService.ConfirmAlarms(session, alarmIds);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// アラームを削除する
        /// </summary>
        /// <param name="alarmIds"></param>
        /// <returns></returns>
        [Route("deleteAlarms")]
        public RequestResult PostDeleteAlarms(IEnumerable<int> alarmIds)
        {
            IncidentInfo info = new IncidentInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = IncidentService.DeleteAlarms(session, alarmIds);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        #region ダッシュボード

        /// <summary>
        /// ダッシュボード用アラーム履歴一覧取得
        /// </summary>
        /// <returns></returns>
        [Route("getDashboardIncidentLog")]
        public SearchResult GetDashboardIncidents()
        {
            SearchResult result = new SearchResult();
            Session session = SessionAccessor.GetSession();

            try
            {
                result = IncidentService.GetDashboardIncidentLogs(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return result;
        }

        #endregion
        
    }
}
