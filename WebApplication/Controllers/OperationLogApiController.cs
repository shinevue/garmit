using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.DomainObject;
using garmit.Service.OperationLog;
using garmit.Core;
using garmit.Web.Models;
using garmit.Web.Accessor;
using garmit.Web.Filter;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// オペレーションログ画面のAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/operationLog")]
    public class OperationLogApiController : ApiController
    {
        /// <summary>
        /// オペレーションログサービス
        /// </summary>
        public IOperationLogService OperationLogService { get; set; }
        
        public OperationLogApiController()
        {
            OperationLogService = ServiceManager.GetService<IOperationLogService>("OperationLogService");
        }

        /// <summary>
        /// 初期データ取得
        /// </summary>
        /// <returns>LookUpの入ったデータ</returns>
        [Route("getLookUp")]
        public LookUp GetInitialInfo()
        {
            OperationLogInfo info = new OperationLogInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = OperationLogService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.LookUp;
        }

        /// <summary>
        /// オペレーションログを取得
        /// </summary>
        /// <param name="condition"></param>
        /// <returns></returns>
        [Route("getOperationLog")]
        public OperationLogInfo PostGetOperationLog(LookUp condition)
        {
            OperationLogInfo info = new OperationLogInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = OperationLogService.GetOperationLogs(session, condition);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info;
        }

        #region ダッシュボード

        /// <summary>
        /// ダッシュボード用オペレーションログを取得
        /// </summary>
        /// <returns>ダッシュボード用オペレーションログ一覧</returns>
        [Route("getDashboardOperationLog")]
        public SearchResult GetDashboardOperationLogs()
        {
            SearchResult result = new SearchResult();
            Session session = SessionAccessor.GetSession();

            try
            {
                result = OperationLogService.GetDashboardOperationLogs(session);
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
