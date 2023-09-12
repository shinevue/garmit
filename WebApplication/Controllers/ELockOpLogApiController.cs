using garmit.Core;
using garmit.DomainObject;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using garmit.Web.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.Service.ElockOpLog;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// 電気錠ログAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/eLockOpLog")]
    public class ELockOpLogApiController : ApiController
    {
        ///// <summary>
        ///// 電気錠ログサービス
        ///// </summary>
        public IElockOpLogService ELockOpLogService { get; set; }

        /// <summary>
        /// コンストラクタ
        /// </summary>
        public ELockOpLogApiController()
        {
            ELockOpLogService = ServiceManager.GetService<IElockOpLogService>("ElockOpLogService");
        }

        /// <summary>
		/// 初期表示情報取得
		/// </summary>
		/// <returns></returns>
		[Route("")]
        public LookUp GetLookUp()
        {
            LookUp lookUp = new LookUp();
            Session session = SessionAccessor.GetSession();
            try
            {
                lookUp = ELockOpLogService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                lookUp = null;
            }
            return lookUp;
        }

        /// <summary>
        /// 電気錠ログ検索
        /// </summary>
        /// <param name="param">検索条件</param>
        /// <returns></returns>
        [Route("search")]
        public SearchResult SearchELockOpLogs(ELockOpLogQueryParameter param)
        {
            SearchResult result = new SearchResult();
            Session session = SessionAccessor.GetSession();            
            try
            {
                result = ELockOpLogService.SearchELockOpLogs(session, param.LookUp, param.IsUnlockSearch, param.IsLockSearch, param.ICCardCondition, param.IsCardOperation);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                result = null;
            }
            return result;
        }

    }
}
